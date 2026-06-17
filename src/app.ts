import express, { Application, Request, Response } from "express";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { childRouter } from "./routes/childRoutes.js";
import screeningRouter from "./routes/screeningRoutes.js";

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "API TeraParent berjalan dengan baik"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/child", childRouter);
app.use("/api/screening", screeningRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan"
  });
});

export default app;