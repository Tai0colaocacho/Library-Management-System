import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { Book } from "../models/bookModel.js";
import { Author } from "../models/authorModel.js"; 
import { Category } from "../models/categoryModel.js"; 
import { Publisher } from "../models/publisherModel.js";
import mongoose from "mongoose";

export const addBook = catchAsyncErrors(async (req, res, next) => {
    let {
        title, isbn, authorNames, categoryName, publisherName, 
        description, publication_date, page_count,
        initialCopies 
    } = req.body;

    if (!title || !isbn || !authorNames || !categoryName || !publisherName || !description || !initialCopies || initialCopies.length === 0) {
        return next(new ErrorHandler("Please fill all required fields and provide initial copy information.", 400));
    }

    const isbnExists = await Book.findOne({ isbn });
    if (isbnExists) {
        return next(new ErrorHandler(`Book with ISBN ${isbn} already exists.`, 400));
    }

    const authorIds = [];
    if (authorNames && Array.isArray(authorNames)) {
        for (const name of authorNames) {
            let author = await Author.findOne({ name: name.trim() });
            if (!author) {
                author = await Author.create({ name: name.trim() });
            }
            authorIds.push(author._id);
        }
    } else if (authorNames) { 
        let author = await Author.findOne({ name: authorNames.trim() });
        if (!author) {
            author = await Author.create({ name: authorNames.trim() });
        }
        authorIds.push(author._id);
    }

    let category;
    if (categoryName) {
        category = await Category.findOne({ name: categoryName.trim() });
        if (!category) {
            category = await Category.create({ name: categoryName.trim() });
        }
    }

    let publisher;
    if (publisherName) {
        publisher = await Publisher.findOne({ name: publisherName.trim() });
        if (!publisher) {
            publisher = await Publisher.create({ name: publisherName.trim() });
        }
    }

    let coverImageData = {};
    if (req.files && req.files.coverImage) {
        const { coverImage } = req.files;
        const allowedFormats = ['image/png', 'image/jpeg', 'image/webp'];
        if (!allowedFormats.includes(coverImage.mimetype)) {
            return next(new ErrorHandler("Cover image file format not supported.", 400));
        }
        try {
            const cloudinaryResponse = await cloudinary.uploader.upload(
                coverImage.tempFilePath, { folder: "LIBRARY_BOOK_COVERS" }
            );
            coverImageData = {
                public_id: cloudinaryResponse.public_id,
                url: cloudinaryResponse.secure_url,
            };
        } catch (uploadError) {
            console.error("Cloudinary upload error:", uploadError);
            return next(new ErrorHandler("Failed to upload cover image.", 500));
        }
    }

    const bookCopies = initialCopies.map(copy => ({
        status: copy.status || 'Available', 
        location: copy.location || 'N/A',   
        _id: new mongoose.Types.ObjectId() 
    }));


    const book = await Book.create({
        title,
        isbn,
        authors: authorIds,
        category: category ? category._id : null,
        publisher: publisher ? publisher._id : null,
        description,
        publication_date,
        page_count,
        copies: bookCopies, 
    });

    res.status(201).json({
        success: true,
        message: "Book added successfully with copies.",
        book,
    });
});

export const addBookCopy = catchAsyncErrors(async (req, res, next) => {
    const { bookId } = req.params;
    const { location, status = 'Available' } = req.body;

    if (!location) {
        return next(new ErrorHandler("Location for the new copy is required.", 400));
    }

    const book = await Book.findById(bookId);
    if (!book) {
        return next(new ErrorHandler("Book not found.", 404));
    }

    const newCopy = {
        _id: new mongoose.Types.ObjectId(), 
        status: status,
        location: location,
    };
    book.copies.push(newCopy);
    await book.save();

    res.status(200).json({
        success: true,
        message: "New book copy added successfully.",
        book,
        newCopyId: newCopy._id
    });
});

export const updateBookCopyStatus = catchAsyncErrors(async (req, res, next) => {
    const { bookId, copyId } = req.params;
    const { status, location } = req.body;

    if (!status && !location) {
        return next(new ErrorHandler("Either status or location must be provided for update.", 400));
    }
    
    const allowedManualStatuses = ['Available', 'Maintenance', 'Lost', 'Damaged', 'Withdrawn'];
    if (status && !allowedManualStatuses.includes(status)) {
        return next(new ErrorHandler(
            `Invalid status for manual update. Allowed statuses are: ${allowedManualStatuses.join(', ')}.`, 400
        ));
    }

    const book = await Book.findById(bookId);
    if (!book) {
        return next(new ErrorHandler("Book not found.", 404));
    }

    const copy = book.copies.id(copyId);
    if (!copy) {
        return next(new ErrorHandler("Book copy not found.", 404));
    }
    
    if (copy.status === 'Borrowed' || copy.status === 'Reserved') {
        return next(new ErrorHandler(
            `Cannot update a copy that is currently '${copy.status}'. Please use the appropriate workflow (Return, Cancel Reservation, etc.).`,
            400
        ));
    }
    
    if (status) {
        copy.status = status;
    }
    if (location) {
        copy.location = location;
    }

    await book.save();

    res.status(200).json({
        success: true,
        message: "Book copy updated successfully.",
        book,
    });
});

export const getAllBooks = catchAsyncErrors(async (req, res, next) => {
    const { keyword, categoryId, authorId, publisherId, status, sortBy, page = 1, limit = 10 } = req.query;
    const query = {};

    if (keyword) {
        const keywordRegex = { $regex: keyword, $options: "i" };

        query.$or = [
            { title: keywordRegex },
            { isbn: keywordRegex },
            
            { "authors.name": keywordRegex },
            { "category.name": keywordRegex },
            { "publisher.name": keywordRegex }
        ];
    }

    if (categoryId) query.category = categoryId;
    if (authorId) query.authors = authorId; 
    if (publisherId) query.publisher = publisherId;

    if (status === 'Available') { 
        query['copies.status'] = 'Available';
    } else if (status === 'Unavailable') {

    }

    const count = await Book.countDocuments(query);
    const books = await Book.find(query)
        .populate('authors', 'name') 
        .populate('category', 'name')  
        .populate('publisher', 'name') 
        .sort(sortBy || "-createdAt") 
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

    
    const booksWithAvailability = books.map(book => {
        const availableCopiesCount = book.copies.filter(copy => copy.status === 'Available').length;
        return {
            ...book.toObject(), 
            isAvailable: availableCopiesCount > 0,
            availableCopiesCount: availableCopiesCount
        };
    });


    res.status(200).json({
        success: true,
        books: booksWithAvailability,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        count: count
    });
});


export const getBookDetails = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const book = await Book.findById(id)
        .populate('authors', 'name biography')
        .populate('category', 'name description')
        .populate('publisher', 'name address');

    if (!book) {
        return next(new ErrorHandler("Book not found.", 404));
    }

    const availableCopiesCount = book.copies.filter(copy => copy.status === 'Available').length;

    res.status(200).json({
        success: true,
        book: {
             ...book.toObject(),
            isAvailable: availableCopiesCount > 0,
            availableCopiesCount: availableCopiesCount
        }
    });
});

export const updateBook = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const {
        title, isbn, authorNames, categoryName, publisherName,
        description, publication_date, page_count
    } = req.body;

    let book = await Book.findById(id);
    if (!book) {
        return next(new ErrorHandler("Book not found.", 404));
    }

    
    if (isbn && isbn !== book.isbn) {
        const isbnExists = await Book.findOne({ isbn: isbn, _id: { $ne: id } });
        if (isbnExists) {
            return next(new ErrorHandler(`ISBN ${isbn} already exists for another book.`, 400));
        }
        book.isbn = isbn;
    }

    
    if (title) book.title = title;
    if (description) book.description = description;
    if (publication_date) book.publication_date = publication_date;
    if (page_count) book.page_count = page_count;

    
    if (authorNames && Array.isArray(authorNames)) {
        const authorIds = [];
        for (const name of authorNames) {
            let author = await Author.findOne({ name: name.trim() });
            if (!author) author = await Author.create({ name: name.trim() });
            authorIds.push(author._id);
        }
        book.authors = authorIds;
    }

    if (categoryName) {
        let category = await Category.findOne({ name: categoryName.trim() });
        if (!category) category = await Category.create({ name: categoryName.trim() });
        book.category = category._id;
    }

    if (publisherName) {
        let publisher = await Publisher.findOne({ name: publisherName.trim() });
        if (!publisher) publisher = await Publisher.create({ name: publisherName.trim() });
        book.publisher = publisher._id;
    }
    
    if (req.files && req.files.coverImage) {
        if (book.coverImage && book.coverImage.public_id) {
            await cloudinary.uploader.destroy(book.coverImage.public_id);
        }
        
        const { coverImage } = req.files;
        const allowedFormats = ['image/png', 'image/jpeg', 'image/webp'];
        if (!allowedFormats.includes(coverImage.mimetype)) {
            return next(new ErrorHandler("Cover image file format not supported.", 400));
        }
        try {
            const cloudinaryResponse = await cloudinary.uploader.upload(
                coverImage.tempFilePath, { folder: "LIBRARY_BOOK_COVERS" }
            );
            book.coverImage = {
                public_id: cloudinaryResponse.public_id,
                url: cloudinaryResponse.secure_url,
            };
        } catch (uploadError) {
            console.error("Cloudinary upload error:", uploadError);
            return next(new ErrorHandler("Failed to upload new cover image.", 500));
        }
    }

    await book.save();

    res.status(200).json({
        success: true,
        message: "Book updated successfully.",
        book
    });
});

export const deleteBook = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) {
        return next(new ErrorHandler("Book not found.", 404));
    }

    const borrowingRecordExists = await Borrowing.findOne({ book: id });

    if (borrowingRecordExists) {
        return next(new ErrorHandler(
            "Cannot delete this book because it has borrowing history. Consider archiving it instead.",
            400
        ));
    }

    await book.deleteOne();

    res.status(200).json({
        success: true,
        message: "Book deleted successfully.",
    });
});

export const deleteBookCover = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    let book = await Book.findById(id);
    if (!book) {
        return next(new ErrorHandler("Book not found.", 404));
    }

    if (!book.coverImage || !book.coverImage.public_id) {
        return next(new ErrorHandler("Book does not have a cover image to delete.", 400));
    }

    await cloudinary.uploader.destroy(book.coverImage.public_id);

    book.coverImage = undefined;
    await book.save();

    res.status(200).json({
        success: true,
        message: "Book cover image deleted successfully."
    });
});

export const addAuthor = catchAsyncErrors(async (req, res, next) => {
    const { name, biography } = req.body;
    if (!name) return next(new ErrorHandler("Author name is required.", 400));
    const author = await Author.create({ name, biography });
    res.status(201).json({ success: true, message: "Author added.", author });
});
export const getAllAuthors = catchAsyncErrors(async (req, res, next) => {
    const authors = await Author.find();
    res.status(200).json({ success: true, authors });
});



export const addCategory = catchAsyncErrors(async (req, res, next) => {
    const { name, description } = req.body;
    if (!name) return next(new ErrorHandler("Category name is required.", 400));
    const category = await Category.create({ name, description });
    res.status(201).json({ success: true, message: "Category added.", category });
});

export const getAllCategories = catchAsyncErrors(async (req, res, next) => {
    const categories = await Category.find();
    res.status(200).json({ success: true, categories });
});

export const addPublisher = catchAsyncErrors(async (req, res, next) => {
    const { name, address, contact_email } = req.body;
    if (!name) return next(new ErrorHandler("Publisher name is required.", 400));
    const publisher = await Publisher.create({ name, address, contact_email });
    res.status(201).json({ success: true, message: "Publisher added.", publisher });
});

export const getAllPublishers = catchAsyncErrors(async (req, res, next) => {
    const publishers = await Publisher.find();
    res.status(200).json({ success: true, publishers });
});