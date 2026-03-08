import express from "express";
import { getContactInfo, updateContactInfo } from "../controllers/contactInfo.controller";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth";

const router = express.Router();

// Public route to fetch footer/contact page info
router.get("/", getContactInfo);

// Admin only route to update
router.put("/update", isAuthenticated, authorizeRoles([1, 2, 3]), updateContactInfo);

export default router;
