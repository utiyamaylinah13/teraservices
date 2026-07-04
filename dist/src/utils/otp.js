import bcrypt from "bcryptjs";
// import { ENV } from "../lib/env.js";
import "dotenv/config";
export const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
export const hashOtp = async (otp) => {
    return bcrypt.hash(otp, Number(process.env.BCRYPT_SALT_ROUNDS));
};
export const compareOtp = async (otp, hashedOtp) => {
    return bcrypt.compare(otp, hashedOtp);
};
export const getOtpExpiredAt = () => {
    return new Date(Date.now() + Number(process.env.OTP_EXPIRES_MINUTES) * 60 * 1000);
};
//# sourceMappingURL=otp.js.map