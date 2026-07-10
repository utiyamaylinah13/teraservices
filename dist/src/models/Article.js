import mongoose, { Schema } from "mongoose";
const ArticleSchema = new Schema({
    judul: {
        type: String,
        required: [true, "Judul artikel wajib diisi"],
        trim: true,
    },
    isi: {
        type: String,
        required: [true, "Isi artikel wajib diisi"],
    },
    kategori: {
        type: String,
        required: [true, "Kategori artikel wajib diisi"],
        trim: true,
    },
    tanggalPublikasi: {
        type: Date,
        required: [true, "Tanggal publikasi wajib diisi"],
    },
}, {
    timestamps: true,
    collection: "articles",
});
const Article = mongoose.model("Article", ArticleSchema);
export default Article;
//# sourceMappingURL=Article.js.map