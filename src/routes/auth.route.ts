import express from "express";
import { googleLogin } from "../controllers/user.controller";

const authRouter = express.Router();

authRouter.post('/google', googleLogin);

export default authRouter;
