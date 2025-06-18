import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { Author } from "../models/authorModel.js";

export const createAuthor = catchAsyncErrors(async (req, res, next) => {
    const { name, biography } = req.body;
    if (!name) return next(new ErrorHandler("Author name is required.", 400));
    const author = await Author.create({ name, biography });
    res.status(201).json({ success: true, message: "Author created.", author });
});

export const getAllAuthors = catchAsyncErrors(async (req, res, next) => {
    const authors = await Author.find();
    res.status(200).json({ success: true, authors });
});

export const updateAuthor = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const { name, biography } = req.body;
    let author = await Author.findById(id);
    if (!author) return next(new ErrorHandler("Author not found.", 404));
    author.name = name || author.name;
    author.biography = biography || author.biography;
    await author.save();
    res.status(200).json({ success: true, message: "Author updated.", author });
});

export const deleteAuthor = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const isAuthorInUse = await Author.findOne({ author: id });
    if (isAuthorInUse) {
        return next(new ErrorHandler("Cannot delete author as it is in use.", 400));
    }
    await Author.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Author deleted." });
});