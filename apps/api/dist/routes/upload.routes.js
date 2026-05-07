import { Router } from "express";
import multer from "multer";
import { cloudinary } from "../config/cloudinary.js";
import { requireAdmin } from "../middlewares/auth.middleware.js";
export const uploadRoutes = Router();
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith("image/")) {
            return callback(new Error("Solo se permiten imágenes"));
        }
        callback(null, true);
    },
});
function uploadToCloudinary(buffer) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({
            folder: "meraly-store/products",
            resource_type: "image",
        }, (error, result) => {
            if (error || !result) {
                reject(error || new Error("Error al subir imagen"));
                return;
            }
            resolve(result.secure_url);
        });
        stream.end(buffer);
    });
}
uploadRoutes.post("/image", requireAdmin, upload.single("image"), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "La imagen es obligatoria",
            });
        }
        const imageUrl = await uploadToCloudinary(req.file.buffer);
        res.status(201).json({
            imageUrl,
        });
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=upload.routes.js.map