import app from "./app.js";
import "dotenv/config";
import { connectMongoDB } from "./lib/mongoose.js";

connectMongoDB();

if (process.env.NODE_ENV !== "production") {
  app.listen(Number(process.env.PORT || 3000), "0.0.0.0", () => {
    console.log(`Server TeraParent berjalan di http://localhost:${process.env.PORT || 3000}`);
  });
}

export default app;