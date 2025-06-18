import express from 'express';
import {
    reserveBook,
    confirmPickup,
    returnBook,
    renewBook,
    getMyBorrowingHistory,
    cancelReservation,
    getAllBorrowings,
    reportBookLostOrDamaged,
    directBorrow
} from "../controllers/borrowController.js";
import { isAuthenticated, isAuthorized } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/reserve', isAuthenticated, isAuthorized("Member"), reserveBook);
router.get('/my-history', isAuthenticated, isAuthorized("Member"), getMyBorrowingHistory); 
router.put('/reservations/:borrowingId/cancel', isAuthenticated, isAuthorized("Member", "Admin", "Librarian"), cancelReservation);

router.put('/admin/pickup/:borrowingId/confirm', isAuthenticated, isAuthorized("Admin", "Librarian"), confirmPickup); 
router.put('/admin/return/:borrowingId', isAuthenticated, isAuthorized("Admin", "Librarian"), returnBook); 
router.put('/admin/renew/:borrowingId', isAuthenticated, isAuthorized("Admin", "Librarian"), renewBook); 
router.get('/admin/all', isAuthenticated, isAuthorized("Admin", "Librarian"), getAllBorrowings);
router.put('/admin/report-lost-or-damaged/:borrowingId', isAuthenticated, isAuthorized("Admin", "Librarian"), reportBookLostOrDamaged);
router.post('/admin/direct-borrow', isAuthenticated, isAuthorized("Admin", "Librarian"), directBorrow);

export default router;