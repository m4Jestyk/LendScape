import express from "express";
import { createUser, deleteProfile, getProfile, login, logout, updateProfile } from "../controllers/user.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/new", createUser);

router.post("/login", login);

router.post("/logout", logout);

router.get("/:query", getProfile);

router.put("/update/:id", isAuthenticated, updateProfile);

router.delete("/delete/:id", isAuthenticated, deleteProfile);

export default router;