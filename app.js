import express from "express";
const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
app.use(cors());
import "dotenv/config";
app.use(express.json());
app.use(cookieParser());
import userRoutes from "./routes/user.routes.js";
import { connectToDb } from "./config/dbConfig.js";
connectToDb();
app.use("/user", userRoutes);
app.listen(3000, () => {
  console.log("server is running on port 3000");
});
