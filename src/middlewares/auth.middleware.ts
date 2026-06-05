import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt.js";
import { errorResponse } from "../utils/response.js";

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
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
  } catch {
    return errorResponse(res, "Token tidak valid atau sudah expired", 401);
  }
};