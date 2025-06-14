import express from 'express';
import {
    getAllUsers,
    registerNewAdmin, 
    createStaffOrMember,
    updateUserAccountByAdmin,
    getUserDetailsForAdmin
} from "../controllers/userController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();


router.get('/admin/all', isAuthenticated, isAuthorized("Admin"), getAllUsers); 
router.post('/admin/add-staff', isAuthenticated, isAuthorized("Admin"), createStaffOrMember); 
router.put('/admin/update/:userId', isAuthenticated, isAuthorized("Admin"), updateUserAccountByAdmin); 
router.get('/admin/details/:userId', isAuthenticated, isAuthorized("Admin", "Librarian"), getUserDetailsForAdmin); 


router.post("/admin/add/new-admin", isAuthenticated, isAuthorized("Admin"), registerNewAdmin);

export default router;