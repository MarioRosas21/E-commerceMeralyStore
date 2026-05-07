export function errorHandler(err, req, res, next) {
    console.error(err);
    res.status(err.status || 500).json({
        message: err.message || "Error interno del servidor"
    });
}
//# sourceMappingURL=error.middleware.js.map