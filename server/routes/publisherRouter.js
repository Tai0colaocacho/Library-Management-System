import express from 'express';
import { createPublisher, deletePublisher, getAllPublishers, updatePublisher } from '../controllers/publisherController.js';
import { isAuthenticated, isAuthorized } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/all', getAllPublishers);
router.post('/add', isAuthenticated, isAuthorized('Admin'), createPublisher);
router.put('/update/:id', isAuthenticated, isAuthorized('Admin'), updatePublisher);
router.delete('/delete/:id', isAuthenticated, isAuthorized('Admin'), deletePublisher);

export default router;