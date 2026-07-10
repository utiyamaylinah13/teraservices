import { Request, Response } from "express";
import Article from "../models/Article.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const getAllArticles = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const kategori = req.query.kategori as string | undefined;

    const filter: Record<string, unknown> = {};
    if (kategori) {
      filter.kategori = { $regex: new RegExp(kategori, "i") };
    }

    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      Article.find(filter)
        .sort({ tanggalPublikasi: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(filter),
    ]);

    return successResponse(res, "Daftar artikel berhasil diambil", {
      articles,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET ALL ARTICLES ERROR:", error);
    return errorResponse(res, "Terjadi kesalahan server", 500);
  }
};

// GET /api/articles/:id — Ambil satu artikel berdasarkan ID
export const getArticleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id).lean();

    if (!article) {
      return errorResponse(res, "Artikel tidak ditemukan", 404);
    }

    return successResponse(res, "Artikel berhasil diambil", article);
  } catch (error) {
    console.error("GET ARTICLE BY ID ERROR:", error);
    return errorResponse(res, "Terjadi kesalahan server", 500);
  }
};

export const getArticlesByKategori = async (req: Request, res: Response) => {
  try {
    const { kategori } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const skip = (page - 1) * limit;

    const filter = {kategori: kategori};

    const [articles, total] = await Promise.all([
      Article.find(filter)
        .sort({ tanggalPublikasi: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(filter),
    ]);

    return successResponse(
      res,
      `Artikel dengan kategori "${kategori}" berhasil diambil`,
      {
        articles,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      }
    );
  } catch (error) {
    console.error("GET ARTICLES BY KATEGORI ERROR:", error);
    return errorResponse(res, "Terjadi kesalahan server", 500);
  }
};
