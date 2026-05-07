import rateLimit from "express-rate-limit";
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        message: "Demasiados intentos de login, intenta más tarde.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
//# sourceMappingURL=rate-limit.middleware.js.map