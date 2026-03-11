import express from 'express';
import { createReport, getAllReports, markAsRead, updateReportStatus, deleteReport } from '../controllers/report.controller';
import { authorizeRoles, isAuthenticated } from '../middlewares/auth';
import { spamLimiter } from '../middlewares/rateLimiter';

const reportRouter = express.Router();

// Allow public reporting or authenticated user reporting
reportRouter.post('/', spamLimiter, createReport);


// Only Staff (1), Admin (2), and Root Admin (3) can view and manage reports
reportRouter.get('/', isAuthenticated, authorizeRoles([1, 2, 3]), getAllReports);
reportRouter.patch('/:id/read', isAuthenticated, authorizeRoles([1, 2, 3]), markAsRead);
reportRouter.patch('/:id/status', isAuthenticated, authorizeRoles([1, 2, 3]), updateReportStatus);
reportRouter.delete('/:id', isAuthenticated, authorizeRoles([1, 2, 3]), deleteReport);

export default reportRouter;
