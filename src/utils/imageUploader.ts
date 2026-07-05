import { supabase } from "../lib/supabase.js";
import { randomUUID } from "crypto";

export const uploadImages = async (
    file: Express.Multer.File
): Promise<string> => {
    if (!supabase) {
        throw new Error(
            "Supabase belum dikonfigurasi. Pastikan SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SECRET_KEY tersedia."
        );
    }

    const ext = file.originalname.split(".").pop();
    const fileName = `${randomUUID()}.${ext}`;

    const { error } = await supabase.storage
        .from("photos-profiles")
        .upload(fileName, file.buffer, {
            contentType: file.mimetype,
        });

    if (error) throw error;

    const { data } = supabase.storage
        .from("photos-profiles")
        .getPublicUrl(fileName);

    if (!data || !data.publicUrl) {
        throw new Error("Gagal mendapatkan public URL dari Supabase");
    }

    return data.publicUrl;
};