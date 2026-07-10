import express from "express";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { childRouter } from "./routes/childRoutes.js";
import { screningRoutes } from "./routes/screeningRoutes.js";
import { activityRoutes } from "./routes/activityRoutes.js";
import { grafikRoutes } from "./routes/grafikRoutes.js";
import { userRoutes } from "./routes/userRoutes.js";
import { articleRoutes } from "./routes/articleRoutes.js";
const app = express();
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.get("/", (_req, res) => {
    res.json({
        success: true,
        message: "API TeraParent berjalan dengan baik"
    });
});
app.use("/api/auth", authRoutes);
app.use("/api/child", childRouter);
app.use("/api/screening", screningRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/grafik", grafikRoutes);
app.use("/api/users", userRoutes);
app.use("/api/articles", articleRoutes);
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: "Endpoint tidak ditemukan"
    });
});
export default app;
//# sourceMappingURL=app.js.map