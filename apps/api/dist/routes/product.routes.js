import { Router } from "express";
import { prisma } from "../prisma.js";
import { requireAdmin } from "../middlewares/auth.middleware.js";
import { z } from "zod";
export const productRoutes = Router();
const productSchema = z.object({
    name: z.string().min(2),
    description: z.string().min(5),
    price: z.number().positive(),
    imageUrl: z.string().url(),
    stock: z.number().int().min(0),
    categoryId: z.string().uuid(),
    isActive: z.boolean().optional()
});
// 🧠 helper para limpiar undefined
function cleanObject(obj) {
    return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));
}
// 🟢 GET PUBLIC
productRoutes.get("/", async (req, res, next) => {
    try {
        const { search, categoryId, page = "1", limit = "12" } = req.query;
        // 👇 arregla string | string[]
        const safeSearch = Array.isArray(search) ? search[0] : search;
        const safeCategoryId = Array.isArray(categoryId) ? categoryId[0] : categoryId;
        const where = {
            isActive: true,
            category: {
                isActive: true
            }
        };
        if (safeCategoryId) {
            where.categoryId = String(safeCategoryId);
        }
        if (safeSearch) {
            where.name = {
                contains: String(safeSearch),
                mode: "insensitive"
            };
        }
        const products = await prisma.product.findMany({
            where,
            include: { category: true },
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
            orderBy: { createdAt: "desc" }
        });
        res.json(products);
    }
    catch (err) {
        next(err);
    }
});
// 🟢 GET ADMIN
productRoutes.get("/admin", requireAdmin, async (req, res, next) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
        const searchRaw = req.query.search;
        const statusRaw = req.query.status;
        const search = Array.isArray(searchRaw) ? searchRaw[0] : searchRaw || "";
        const status = Array.isArray(statusRaw) ? statusRaw[0] : statusRaw || "all";
        const where = {};
        if (search) {
            where.name = {
                contains: search,
                mode: "insensitive"
            };
        }
        if (status === "active") {
            where.isActive = true;
        }
        if (status === "inactive") {
            where.isActive = false;
        }
        const [products, total] = await prisma.$transaction([
            prisma.product.findMany({
                where,
                include: { category: true },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: "desc" }
            }),
            prisma.product.count({ where })
        ]);
        res.json({
            data: products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (err) {
        next(err);
    }
});
// 🟢 GET ONE
productRoutes.get("/:id", async (req, res, next) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: req.params.id },
            include: { category: true }
        });
        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        res.json(product);
    }
    catch (err) {
        next(err);
    }
});
// 🟢 CREATE
productRoutes.post("/", requireAdmin, async (req, res, next) => {
    try {
        const data = productSchema.parse(req.body);
        const product = await prisma.product.create({
            data: {
                ...data,
                isActive: data.isActive ?? true // 👈 FIX
            }
        });
        res.status(201).json(product);
    }
    catch (err) {
        next(err);
    }
});
productRoutes.put("/:id", requireAdmin, async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id;
        if (!id) {
            return res.status(400).json({ message: "ID inválido" });
        }
        const data = productSchema.partial().parse(req.body);
        const cleanData = cleanObject(data);
        const product = await prisma.product.update({
            where: { id },
            data: cleanData
        });
        res.json(product);
    }
    catch (err) {
        next(err);
    }
});
productRoutes.delete("/:id", requireAdmin, async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id;
        if (!id) {
            return res.status(400).json({ message: "ID inválido" });
        }
        await prisma.product.update({
            where: { id },
            data: { isActive: false }
        });
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
});
//# sourceMappingURL=product.routes.js.map