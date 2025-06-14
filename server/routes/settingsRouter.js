import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { isAuthenticated, isAuthorized } from '../middlewares/authMiddleware.js';

const router = express.Router();


router.get('/', isAuthenticated, isAuthorized("Admin"), getSettings);
router.put('/update', isAuthenticated, isAuthorized("Admin"), updateSettings);

export default router;