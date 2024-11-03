import express from "express";
import { connectDB } from "./db/db.js";
import userRouter from "./routes/user.js";
import itemRouter from "./routes/item.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
const PORT = 8000;

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}))

app.use("/api/v1/users", userRouter);
app.use("/api/v1/items", itemRouter);

app.listen(PORT, () => {
    console.log(`Server is running on PORT:${PORT}`);
}) 