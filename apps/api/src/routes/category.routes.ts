import { Router } from "express";
import { prisma } from "../prisma.js";
import { requireAdmin } from "../middlewares/auth.middleware.js";
import { z } from "zod";
import type { ParsedQs } from "qs";

export const categoryRoutes = Router();

const createCategorySchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
});

const updateCategorySchema = z.object({
  name: z.string().trim().min(2).optional(),
  isActive: z.boolean().optional(),
});

// 🧠 Helper para limpiar undefined
function cleanObject(obj: any) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  );
}

// 🧠 Helper para params/query seguros
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
 * Público:
 * Solo devuelve categorías activas.
 * Se usa para tienda y formularios de productos.
 */
categoryRoutes.get("/", async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    res.json(categories);
  } catch (err) {
    next(err);
  }
});

/**
 * Admin:
 * Devuelve categorías activas, inactivas o todas.
 */
categoryRoutes.get("/admin", requireAdmin, async (req, res, next) => {
  try {
    const status = getStringValue(req.query.status) || "all";
    const search = getStringValue(req.query.search) || "";

    const where: any = {};

    if (status === "active") {
      where.isActive = true;
    }

    if (status === "inactive") {
      where.isActive = false;
    }

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(categories);
  } catch (err) {
    next(err);
  }
});

/**
 * Admin:
 * Obtener una categoría por ID.
 */
categoryRoutes.get("/:id", requireAdmin, async (req, res, next) => {
  try {
    const id = getStringValue(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "ID inválido",
      });
    }

    const category = await prisma.category.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      return res.status(404).json({
        message: "Categoría no encontrada",
      });
    }

    res.json(category);
  } catch (err) {
    next(err);
  }
});

/**
 * Admin:
 * Crear categoría.
 */
categoryRoutes.post("/", requireAdmin, async (req, res, next) => {
  try {
    const data = createCategorySchema.parse(req.body);

    const category = await prisma.category.create({
      data: {
        name: data.name,
      },
    });

    res.status(201).json(category);
  } catch (err: any) {
    if (err?.code === "P2002") {
      return res.status(409).json({
        message: "Ya existe una categoría con ese nombre",
      });
    }

    next(err);
  }
});

/**
 * Admin:
 * Editar categoría.
 */
categoryRoutes.put("/:id", requireAdmin, async (req, res, next) => {
  try {
    const id = getStringValue(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "ID inválido",
      });
    }

    const data = updateCategorySchema.parse(req.body);

    const cleanData = cleanObject(data);

    const category = await prisma.category.update({
      where: {
        id,
      },
      data: cleanData,
    });

    res.json(category);
  } catch (err: any) {
    if (err?.code === "P2002") {
      return res.status(409).json({
        message: "Ya existe una categoría con ese nombre",
      });
    }

    if (err?.code === "P2025") {
      return res.status(404).json({
        message: "Categoría no encontrada",
      });
    }

    next(err);
  }
});

/**
 * Admin:
 * Desactivar categoría.
 * No borra de la base de datos.
 */
categoryRoutes.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const id = getStringValue(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "ID inválido",
      });
    }

    const category = await prisma.category.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
    });

    res.json(category);
  } catch (err: any) {
    if (err?.code === "P2025") {
      return res.status(404).json({
        message: "Categoría no encontrada",
      });
    }

    next(err);
  }
});

/**
 * Admin:
 * Reactivar categoría.
 */
categoryRoutes.patch("/:id/activate", requireAdmin, async (req, res, next) => {
  try {
    const id = getStringValue(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "ID inválido",
      });
    }

    const category = await prisma.category.update({
      where: {
        id,
      },
      data: {
        isActive: true,
      },
    });

    res.json(category);
  } catch (err: any) {
    if (err?.code === "P2025") {
      return res.status(404).json({
        message: "Categoría no encontrada",
      });
    }

    next(err);
  }
});