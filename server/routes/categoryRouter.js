import express from "express";
import { createCategory, deleteCategory, getAllCategories, updateCategory } from "../controllers/categoryController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/all", getAllCategories);
router.post("/add", isAuthenticated, isAuthorized("Admin"), createCategory);
router.put("/update/:id", isAuthenticated, isAuthorized("Admin"), updateCategory);
router.delete("/delete/:id", isAuthenticated, isAuthorized("Admin"), deleteCategory);

export default router;