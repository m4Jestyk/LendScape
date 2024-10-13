import express from "express";
import { connectDB } from "./db/db.js";
import userRouter from "./routes/user.js";
import itemRouter from "./routes/item.js";
import cookieParser from "cookie-parser";

const app = express();
const PORT = 3000;

connectDB();

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/items", itemRouter);

app.listen(PORT, () => {
    console.log(`Server is running on PORT:${PORT}`);
}) 