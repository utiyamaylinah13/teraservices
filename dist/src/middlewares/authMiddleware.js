import { verifyToken } from "../utils/jwt.js";
import { errorResponse } from "../utils/response.js";
export const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return errorResponse(res, "Token tidak ditemukan", 401);
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            return errorResponse(res, "Token tidak valid", 401);
        }
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    }
    catch {
        return errorResponse(res, "Token tidak valid atau sudah expired", 401);
    }
};
//# sourceMappingURL=authMiddleware.js.map