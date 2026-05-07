import "dotenv/config";
import express from "express";
import cors from "cors";
import { productRoutes } from "./routes/product.routes.js";
import { categoryRoutes } from "./routes/category.routes.js";
import { orderRoutes } from "./routes/order.routes.js";
import { authRoutes } from "./routes/auth.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { uploadRoutes } from "./routes/upload.routes.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/uploads", uploadRoutes);
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
app.use("/orders", orderRoutes);

app.use(errorHandler);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API running on port ${port}`));

app.use(helmet());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: {
      message: "Demasiadas solicitudes, intenta más tarde.",
    },
  })
);