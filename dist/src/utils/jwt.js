import jwt from "jsonwebtoken";
import "dotenv/config";
export const generateToken = (payload) => {
    const options = {
        expiresIn: process.env.JWT_EXPIRES_IN,
    };
    return jwt.sign(payload, process.env.JWT_SECRET, options);
};
export const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};
//# sourceMappingURL=jwt.js.map