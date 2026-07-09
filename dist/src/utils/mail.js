import nodemailer from "nodemailer";
import "dotenv/config";
const mailHost = process.env.MAIL_HOST;
const mailPort = Number(process.env.MAIL_PORT);
const mailSecure = process.env.MAIL_SECURE === "true" || false;
const mailUser = process.env.MAIL_USER;
const mailPass = process.env.MAIL_PASS;
const mailFrom = process.env.MAIL_FROM;
const transporter = nodemailer.createTransport({
    host: mailHost,
    port: mailPort,
    secure: mailSecure,
    auth: {
        user: mailUser,
        pass: mailPass,
    },
});
export const sendOtpEmail = async (to, otp, type) => {
    const subject = type === "VERIFY_EMAIL"
        ? "Kode Verifikasi Akun TeraParent"
        : "Kode Reset Password TeraParent";
    const title = type === "VERIFY_EMAIL"
        ? "Verifikasi Akun TeraParent"
        : "Reset Password TeraParent";
    const description = type === "VERIFY_EMAIL"
        ? "Gunakan kode OTP berikut untuk memverifikasi akun TeraParent Anda."
        : "Gunakan kode OTP berikut untuk mereset password akun TeraParent Anda.";
    await transporter.sendMail({
        from: mailFrom,
        to,
        subject,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #235A43; margin-bottom: 8px;">${title}</h2>

        <p style="font-size: 15px; color: #374151;">
          ${description}
        </p>

        <div style="margin: 24px 0; padding: 16px; background: #f3f4f6; border-radius: 10px; text-align: center;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827;">
            ${otp}
          </span>
        </div>

        <p style="font-size: 14px; color: #6b7280;">
          Kode ini berlaku selama ${process.env.OTP_EXPIRES_MINUTES} menit.
        </p>

        <p style="font-size: 14px; color: #6b7280;">
          Jika Anda tidak melakukan permintaan ini, abaikan email ini.
        </p>
      </div>
    `,
    });
};
//# sourceMappingURL=mail.js.map