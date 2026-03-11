import express from "express";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth";
import { createComment, getCommentsByNewsId, deleteComment, updateComment } from "../controllers/comment.controller";

const commentRouter = express.Router();

// Public: Anyone can read comments matching a news post id
commentRouter.get('/:newsId', getCommentsByNewsId);

// Protected: Only Logged in Users can POST a comment
commentRouter.post('/:newsId', isAuthenticated, createComment);

// Protected: Edit Comment (Author only checked in controller)
commentRouter.patch('/:commentId', isAuthenticated, updateComment);

// Protected: Delete Comment (Author or Admin checked in controller)
commentRouter.delete('/:commentId', isAuthenticated, deleteComment);

export default commentRouter;
