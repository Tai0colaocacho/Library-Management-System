import express from 'express';
import {
    getMyNotifications,
    markNotificationAsRead,
    markAllMyNotificationsAsRead
} from '../controllers/notificationController.js';
import { isAuthenticated, isAuthorized } from '../middlewares/authMiddleware.js';

const router = express.Router();


router.get('/my-notifications', isAuthenticated, getMyNotifications);
router.put('/my-notifications/:notificationId/mark-read', isAuthenticated, markNotificationAsRead);
router.put('/my-notifications/mark-all-read', isAuthenticated, markAllMyNotificationsAsRead);



export default router;