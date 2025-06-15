import express from "express";
import {
    addBook, getAllBooks, getBookDetails, deleteBook, updateBook, deleteBookCover,
    addBookCopy, updateBookCopyStatus,
    addAuthor, getAllAuthors,
    addCategory, getAllCategories,
    addPublisher, getAllPublishers
} from "../controllers/bookController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();


router.post('/admin/add', isAuthenticated, isAuthorized("Admin", "Librarian"), addBook);
router.get('/all', isAuthenticated, getAllBooks);
router.get('/:id', isAuthenticated, getBookDetails);
router.put('/admin/update/:id', isAuthenticated, isAuthorized("Admin", "Librarian"), updateBook); 
router.delete('/admin/delete/:id', isAuthenticated, isAuthorized("Admin"), deleteBook);
router.delete('/admin/:id/cover', isAuthenticated, isAuthorized("Admin", "Librarian"), deleteBookCover);


router.post('/admin/:bookId/copies/add', isAuthenticated, isAuthorized("Admin", "Librarian"), addBookCopy);
router.put('/admin/:bookId/copies/:copyId/status', isAuthenticated, isAuthorized("Admin", "Librarian"), updateBookCopyStatus);


router.post('/admin/authors/add', isAuthenticated, isAuthorized("Admin", "Librarian"), addAuthor);
router.get('/authors/all', isAuthenticated, getAllAuthors);


router.post('/admin/categories/add', isAuthenticated, isAuthorized("Admin", "Librarian"), addCategory);
router.get('/categories/all', isAuthenticated, getAllCategories);


router.post('/admin/publishers/add', isAuthenticated, isAuthorized("Admin", "Librarian"), addPublisher);
router.get('/publishers/all', isAuthenticated, getAllPublishers);

export default router;