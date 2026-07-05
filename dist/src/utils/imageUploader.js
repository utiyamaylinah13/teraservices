import { supabase } from "../lib/supabase.js";
import { randomUUID } from "crypto";
export const uploadImages = async (file) => {
    if (!supabase) {
        throw new Error("Supabase belum dikonfigurasi. Pastikan SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SECRET_KEY tersedia.");
    }
    const ext = file.originalname.split(".").pop();
    const fileName = `${randomUUID()}.${ext}`;
    console.log("Mengunggah ke bucket photos-profiles dengan nama file:", fileName);
    const { data, error } = await supabase.storage
        .from("photos-profiles")
        .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
    });
    if (error) {
        console.error("Supabase upload error:", error);
        throw new Error(`Supabase upload gagal: ${error.message}`);
    }
    const { data: publicData } = supabase.storage
        .from("photos-profiles")
        .getPublicUrl(fileName);
    if (!publicData || !publicData.publicUrl) {
        throw new Error("Gagal mendapatkan public URL dari Supabase");
    }
    console.log("Upload berhasil. Public URL:", publicData.publicUrl);
    return publicData.publicUrl;
};
//# sourceMappingURL=imageUploader.js.map