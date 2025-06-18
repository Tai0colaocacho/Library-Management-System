import express from 'express';
import {
    getAllUsers,
    createStaffOrMember,
    updateUserAccountByAdmin,
    getUserDetailsForAdmin
} from "../controllers/userController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();


router.get('/admin/all', isAuthenticated, isAuthorized("Admin", "Librarian"), getAllUsers);
router.post('/admin/add', isAuthenticated, isAuthorized("Admin", "Librarian"), createStaffOrMember); 
router.put('/admin/update/:userId', isAuthenticated, isAuthorized("Admin"), updateUserAccountByAdmin); 
router.get('/admin/details/:userId', isAuthenticated, isAuthorized("Admin", "Librarian"), getUserDetailsForAdmin); 

export default router;