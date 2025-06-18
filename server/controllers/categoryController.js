import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { Category } from "../models/categoryModel.js";

export const createCategory = catchAsyncErrors(async (req, res, next) => {
    const { name, description } = req.body;
    if (!name) {
        return next(new ErrorHandler("Category name is required.", 400));
    }
    const category = await Category.create({ name, description });
    res.status(201).json({
        success: true,
        message: "Category created successfully.",
        category,
    });
});

export const getAllCategories = catchAsyncErrors(async (req, res, next) => {
    const categories = await Category.find();
    res.status(200).json({
        success: true,
        categories,
    });
});

export const updateCategory = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const { name, description } = req.body;
    let category = await Category.findById(id);
    if (!category) {
        return next(new ErrorHandler("Category not found.", 404));
    }
    category.name = name || category.name;
    category.description = description || category.description;
    await category.save();
    res.status(200).json({
        success: true,
        message: "Category updated successfully.",
        category,
    });
});

export const deleteCategory = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
        return next(new ErrorHandler("Category not found.", 404));
    }
    const booksUsingCategory = await Book.countDocuments({ category: id });
    if (booksUsingCategory > 0) {
        return next(new ErrorHandler("Cannot delete category. It is currently in use by some books.", 400));
    }
    await category.deleteOne();
    res.status(200).json({
        success: true,
        message: "Category deleted successfully.",
    });
});