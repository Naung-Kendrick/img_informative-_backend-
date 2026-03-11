import express from "express";
import { googleLogin, login } from "../controllers/user.controller";
import { loginLimiter } from "../middlewares/rateLimiter";

const authRouter = express.Router();

// Public routes for Authentication
authRouter.post('/google', googleLogin);
authRouter.post('/login', loginLimiter, login);

export default authRouter;
