import jwt, { SignOptions } from "jsonwebtoken";
import "dotenv/config";

export type JwtPayload = {
  id: number;
  email: string;
};

export const generateToken = (payload: JwtPayload) => {
  const options: SignOptions = {
    expiresIn: process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, process.env.JWT_SECRET as string, options);
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
};