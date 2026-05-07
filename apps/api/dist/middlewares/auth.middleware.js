import jwt from "jsonwebtoken";
export function requireAdmin(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token requerido" });
    }
    try {
        const token = header.replace("Bearer ", "");
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        next();
    }
    catch {
        res.status(401).json({ message: "Token inválido" });
    }
}
//# sourceMappingURL=auth.middleware.js.map