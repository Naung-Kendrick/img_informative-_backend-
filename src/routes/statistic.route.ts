import express from "express";
import {
    createStatistic,
    getAllStatistics,
    getStatisticById,
    updateStatistic,
    deleteStatistic
} from "../controllers/statistic.controller";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth";

const router = express.Router();

router.get("/", getAllStatistics);
router.get("/:id", getStatisticById);

// Admin-only routes
router.post("/create", isAuthenticated, authorizeRoles([1, 2, 3]), createStatistic);
router.put("/:id", isAuthenticated, authorizeRoles([1, 2, 3]), updateStatistic);
router.delete("/:id", isAuthenticated, authorizeRoles([1, 2, 3]), deleteStatistic);

export default router;
