import { Router } from "express";
import {
  getAllArticles,
  getArticleById,
  getArticlesByKategori,
} from "../controllers/articleController.js";

export const articleRoutes = Router();

articleRoutes.get("/", getAllArticles);
articleRoutes.get("/kategori/:kategori", getArticlesByKategori);
articleRoutes.get("/:id", getArticleById);
