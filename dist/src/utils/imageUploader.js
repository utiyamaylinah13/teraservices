import fs from "fs";
/**
 * Mengunggah file gambar lokal ke ImgBB secara permanen dan gratis.
 * @param filePath Path file gambar di lokal server
 * @returns URL gambar publik dari ImgBB
 */
export const uploadToImgBB = async (filePath) => {
    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
        throw new Error("IMGBB_API_KEY tidak ditemukan di environment variables");
    }
    // Baca file lokal dan ubah ke base64
    const fileBuffer = fs.readFileSync(filePath);
    const base64Image = fileBuffer.toString("base64");
    const formData = new FormData();
    formData.append("image", base64Image);
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData,
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`ImgBB upload failed: ${errText}`);
    }
    const result = (await response.json());
    if (result.success && result.data && result.data.url) {
        return result.data.url;
    }
    else {
        throw new Error("Gagal mendapatkan URL gambar dari ImgBB");
    }
};
//# sourceMappingURL=imageUploader.js.map