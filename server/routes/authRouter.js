import express from 'express';
import { forgotPassword, getUser, login, logout, register, resetPassword, updatePassword, verifyOTP } from '../controllers/authController.js'
import { isAuthenticated } from '../middlewares/authMiddleware.js';
const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.get('/logout', isAuthenticated ,logout);
router.get('/me', isAuthenticated, getUser);
router.post('/password/forgot', isAuthenticated, forgotPassword);
router.put('/password/reset/:token', isAuthenticated, resetPassword);
router.put('/password/update', isAuthenticated, updatePassword);
export default router;