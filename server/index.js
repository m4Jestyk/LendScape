import express from "express";
import { connectDB } from "./db/db.js";
import userRouter from "./routes/user.js";
import itemRouter from "./routes/item.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import {v2 as cloudinary} from "cloudinary";

const app = express();
const PORT = 8000;

connectDB();

// cloudinary.config({
//     cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRETKEY
// })

cloudinary.config({
    cloud_name : "djidxcwaq",
    api_key: "342524841297171",
    api_secret: "5HzUAelVGniJTeLNtmJgnInccac"
})

app.use(express.json({limit: "50mb"}));
app.use(express.urlencoded({ extended: true}));
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