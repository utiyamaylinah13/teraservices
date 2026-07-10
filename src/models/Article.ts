import mongoose, { Schema, Document } from "mongoose";

export interface IArticle extends Document {
  judul: string;
  isi: string;
  kategori: string;
  tanggalPublikasi: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const ArticleSchema = new Schema<IArticle>(
  {
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
  },
  {
    timestamps: true,
    collection: "articles",
  }
);

const Article = mongoose.model<IArticle>("Article", ArticleSchema);

export default Article;
