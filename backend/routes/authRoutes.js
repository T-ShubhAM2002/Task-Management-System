import express from "express";
import { login, signup, logout } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup); // For new user registration
router.post("/login", login);
router.post("/logout", logout); // For user logout

export default router;
