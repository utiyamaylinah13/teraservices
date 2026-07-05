import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {

  const allowedTypes = /jpeg|jpg|png|webp/;

  const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
  );

  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
      return cb(null, true);
  }

  cb(new Error("Hanya file jpg, jpeg, png, webp yang diperbolehkan"));
};

export const uploadProfile = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
});