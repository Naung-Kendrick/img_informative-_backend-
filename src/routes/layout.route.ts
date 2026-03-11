import express from "express";
import { getLayout, updateLayout } from "../controllers/layout.controller";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth";

const layoutRouter = express.Router();

layoutRouter.get("/", getLayout);
layoutRouter.put("/", isAuthenticated, authorizeRoles([2, 3]), updateLayout);

export default layoutRouter;
