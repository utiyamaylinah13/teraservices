import multer from "multer";
import path from "path";
import fs from "fs";
// Tentukan direktori upload: gunakan /tmp jika berjalan di Vercel (read-only filesystem)
const isVercel = process.env.VERCEL === "1";
const uploadDir = isVercel ? "/tmp" : "./uploads/profile-photos";
// Konfigurasi Storage
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        try {
            // Buat folder secara lazy saat upload terjadi (bukan saat inisialisasi modul)
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        }
        catch (err) {
            cb(err, uploadDir);
        }
    },
    filename: (_req, file, cb) => {
        // Memberikan nama unik menggunakan timestamp
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `profile-${uniqueSuffix}${ext}`);
    },
});
// Filter File (Hanya menerima gambar)
const fileFilter = (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
        return cb(null, true);
    }
    cb(new Error("Hanya file gambar (jpg, jpeg, png, webp) yang diperbolehkan!"));
};
// Batasan ukuran (misal maksimal 2MB)
export const uploadProfile = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});
//# sourceMappingURL=uploadMiddleware.js.map