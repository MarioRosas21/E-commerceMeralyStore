import { Router } from "express";
import { OrderStatus } from "@prisma/client";
import type { ParsedQs } from "qs";
import { prisma } from "../prisma.js";
import { requireAdmin } from "../middlewares/auth.middleware.js";
import { z } from "zod";

export const orderRoutes = Router();

const orderSchema = z.object({
  customerName: z.string().trim().min(3, "El nombre es obligatorio"),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "El pedido debe tener al menos un producto"),
});

const updateOrderStatusSchema = z.object({
  status: z.enum([
    OrderStatus.pending,
    OrderStatus.confirmed,
    OrderStatus.delivered,
    OrderStatus.cancelled,
  ]),
});

// Helper para limpiar undefined
function cleanObject(obj: any) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  );
}

// Helper para params/query seguros
function getStringValue(
  value: string | ParsedQs | (string | ParsedQs)[] | undefined
): string | undefined {
  if (Array.isArray(value)) {
    const first = value[0];

    return typeof first === "string" ? first : undefined;
  }

  return typeof value === "string" ? value : undefined;
}

/**
 * Cliente:
 * Crea un pedido desde checkout.
 * Descuenta stock solo cuando el pedido se guarda correctamente.
 */
orderRoutes.post("/", async (req, res, next) => {
  try {
    const data = orderSchema.parse(req.body);

    const order = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: {
          id: {
            in: data.items.map((item) => item.productId),
          },
          isActive: true,
          category: {
            isActive: true,
          },
        },
      });

      const total = data.items.reduce((sum, item) => {
        const product = products.find((p) => p.id === item.productId);

        if (!product) {
          throw new Error("Producto inválido o inactivo");
        }

        if (product.stock < item.quantity) {
          throw new Error(`Stock insuficiente: ${product.name}`);
        }

        return sum + Number(product.price) * item.quantity;
      }, 0);

      const createdOrder = await tx.order.create({
        data: {
          customerName: data.customerName,
          total,
          status: OrderStatus.pending,
          items: {
            create: data.items.map((item) => {
              const product = products.find(
                (p) => p.id === item.productId
              )!;

              return {
                productId: item.productId,
                quantity: item.quantity,
                price: product.price,
              };
            }),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      for (const item of data.items) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (updated.count === 0) {
          throw new Error("Stock insuficiente al confirmar pedido");
        }
      }

      return createdOrder;
    });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

/**
 * Admin:
 * Lista pedidos con filtros y paginación.
 */
orderRoutes.get("/", requireAdmin, async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);

    const status = getStringValue(req.query.status) || "all";
    const search = getStringValue(req.query.search) || "";

    const where: any = {};

    if (
      status === OrderStatus.pending ||
      status === OrderStatus.confirmed ||
      status === OrderStatus.delivered ||
      status === OrderStatus.cancelled
    ) {
      where.status = status;
    }

    if (search) {
      where.customerName = {
        contains: search,
        mode: "insensitive",
      };
    }

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Admin:
 * Detalle de pedido.
 */
orderRoutes.get("/:id", requireAdmin, async (req, res, next) => {
  try {
    const id = getStringValue(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "ID inválido",
      });
    }

    const order = await prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        message: "Pedido no encontrado",
      });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
});

/**
 * Admin:
 * Cambiar estado del pedido.
 *
 * Regla importante:
 * - Si pasa a cancelled, restaura stock.
 * - Si estaba cancelled y vuelve a pending/confirmed/delivered,
 *   descuenta stock otra vez.
 */
orderRoutes.patch("/:id/status", requireAdmin, async (req, res, next) => {
  try {
    const id = getStringValue(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "ID inválido",
      });
    }

    const data = updateOrderStatusSchema.parse(req.body);

    const cleanData = cleanObject(data);

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const currentOrder = await tx.order.findUnique({
        where: {
          id,
        },
        include: {
          items: true,
        },
      });

      if (!currentOrder) {
        throw new Error("Pedido no encontrado");
      }

      if (currentOrder.status === data.status) {
        const existingOrder = await tx.order.findUnique({
          where: {
            id,
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });

        return existingOrder;
      }

      const isCancelling =
        currentOrder.status !== OrderStatus.cancelled &&
        data.status === OrderStatus.cancelled;

      const isReactivatingFromCancelled =
        currentOrder.status === OrderStatus.cancelled &&
        data.status !== OrderStatus.cancelled;

      if (isCancelling) {
        for (const item of currentOrder.items) {
          await tx.product.update({
            where: {
              id: item.productId,
            },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      if (isReactivatingFromCancelled) {
        for (const item of currentOrder.items) {
          const updated = await tx.product.updateMany({
            where: {
              id: item.productId,
              stock: {
                gte: item.quantity,
              },
            },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });

          if (updated.count === 0) {
            throw new Error(
              "No hay stock suficiente para reactivar este pedido"
            );
          }
        }
      }

      return tx.order.update({
        where: {
          id,
        },
        data: {
          status: data.status,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });

    res.json(updatedOrder);
  } catch (err) {
    next(err);
  }
});