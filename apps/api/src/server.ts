import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { productRoutes } from "./routes/product.routes.js";
import { categoryRoutes } from "./routes/category.routes.js";
import { orderRoutes } from "./routes/order.routes.js";
import { authRoutes } from "./routes/auth.routes.js";
import { uploadRoutes } from "./routes/upload.routes.js";

import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();


const allowedOrigins = [
  "http://localhost:3000",
  "https://e-commerce-meraly-store.vercel.app",
];


app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("No permitido por CORS"));
      }
    },
    credentials: true,
  })
);


app.use(helmet());


app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 300,
    message: {
      message: "Demasiadas solicitudes, intenta más tarde.",
    },
  })
);


app.use(express.json());


app.use("/auth", authRoutes);
app.use("/uploads", uploadRoutes);
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
app.use("/orders", orderRoutes);


app.use(errorHandler);

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`API running on port ${port}`);
});