import mongoose from "mongoose";

export const connectMongoDB = async (): Promise<void> => {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    console.error("❌ MONGO_URI tidak ditemukan di .env");
    return;
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB (Atlas) terhubung");
  } catch (error) {
    console.error("❌ Gagal menghubungkan ke MongoDB:", error);
  }
};
