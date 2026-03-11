import express from 'express';
import { createFaq, getAllFaqs, getFaqById, updateFaq, deleteFaq } from '../controllers/faq.controller';
import { authorizeRoles, isAuthenticated } from '../middlewares/auth';

const faqRouter = express.Router();

faqRouter.get('/', getAllFaqs);
faqRouter.get('/:id', getFaqById);
faqRouter.post('/', isAuthenticated, authorizeRoles([1, 2, 3]), createFaq);
faqRouter.patch('/:id', isAuthenticated, authorizeRoles([1, 2, 3]), updateFaq);
faqRouter.delete('/:id', isAuthenticated, authorizeRoles([1, 2, 3]), deleteFaq);

export default faqRouter;
