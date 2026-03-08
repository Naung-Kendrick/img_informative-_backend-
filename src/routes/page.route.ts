import express from "express";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth";
import {
    getPagesBySection,
    getPageById,
    createPage,
    updatePage,
    deletePage,
} from "../controllers/page.controller";

const pageRouter = express.Router();

// PUBLIC — Get all pages for a section (e.g. /pages/services, /pages/districts)
pageRouter.get('/section/:section', getPagesBySection);
pageRouter.get('/:id', getPageById);

// ADMIN ONLY — CRUD operations
pageRouter.post('/', isAuthenticated, authorizeRoles([1, 2, 3]), createPage);
pageRouter.patch('/:id', isAuthenticated, authorizeRoles([1, 2, 3]), updatePage);
pageRouter.delete('/:id', isAuthenticated, authorizeRoles([1, 2, 3]), deletePage);

export default pageRouter;
