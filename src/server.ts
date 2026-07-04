import app from "./app.js";
import "dotenv/config";
import { connectMongoDB } from "./lib/mongoose.js";

connectMongoDB();

app.listen(Number(process.env.PORT), "0.0.0.0", () => {
  console.log(`Server TeraParent berjalan di http://localhost:${process.env.PORT}`);
});