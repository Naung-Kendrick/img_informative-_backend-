import express from "express";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth";
import { createComment, getCommentsByNewsId, deleteComment } from "../controllers/comment.controller";

const commentRouter = express.Router();

// Public: Anyone can read comments matching a news post id
commentRouter.get('/:newsId', getCommentsByNewsId);

// Protected: Only Logged in Users can POST a comment
commentRouter.post('/:newsId', isAuthenticated, createComment);

// Protected: Only Root Admin (3) can delete a comment
commentRouter.delete('/:commentId', isAuthenticated, authorizeRoles([3]), deleteComment);

export default commentRouter;
