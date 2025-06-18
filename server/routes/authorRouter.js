import express from 'express';
import { createAuthor, deleteAuthor, getAllAuthors, updateAuthor } from '../controllers/authorController.js';
import { isAuthenticated, isAuthorized } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/all', getAllAuthors);
router.post('/add', isAuthenticated, isAuthorized('Admin'), createAuthor);
router.put('/update/:id', isAuthenticated, isAuthorized('Admin'), updateAuthor);
router.delete('/delete/:id', isAuthenticated, isAuthorized('Admin'), deleteAuthor);

export default router;