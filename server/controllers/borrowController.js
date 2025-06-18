import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { Book } from "../models/bookModel.js";
import { Borrowing } from "../models/borrowingModel.js"; 
import { User } from "../models/userModel.js";
import { Settings } from "../models/settingsModel.js";
// import { calculateFine } from "../utils/fineCalculator.js"; 

const calculateFineForReturn = (dueDate, returnDate, finePerDay, gracePeriodDays = 0) => {
    if (returnDate <= dueDate) return 0;

    const graceDueDate = new Date(dueDate);
    graceDueDate.setDate(graceDueDate.getDate() + gracePeriodDays);

    if (returnDate <= graceDueDate) return 0;

    const diffTime = Math.abs(returnDate - graceDueDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * finePerDay;
};

export const reserveBook = catchAsyncErrors(async (req, res, next) => {
    const memberId = req.user._id; 
    const { bookId } = req.body;

    if (!bookId) {
        return next(new ErrorHandler("Book ID is required to reserve.", 400));
    }

    const member = await User.findById(memberId);
    const book = await Book.findById(bookId);
    const settings = await Settings.getSettings();

    if (!member) return next(new ErrorHandler("Member not found.", 404));
    if (!book) return next(new ErrorHandler("Book not found.", 404));
    if (!settings) return next(new ErrorHandler("System settings not found.", 500));

    if (!member.is_active) {
        return next(new ErrorHandler("Your account is inactive. Please contact support.", 403));
    }

    if (!member.nationalId || !member.phoneNumber) {
        return next(new ErrorHandler(
            "Vui lòng hoàn thiện hồ sơ của bạn (bao gồm Số CCCD và Số điện thoại) trước khi mượn sách.",
            403 
        ));
    }

    const existingBorrowsAndReservations = await Borrowing.countDocuments({
        "user.id": memberId,
        status: { $in: ['Reserved', 'Borrowed', 'Overdue'] }
    });
    if (existingBorrowsAndReservations >= settings.max_books_per_user) {
        return next(new ErrorHandler(`You have reached the maximum limit of ${settings.max_books_per_user} borrowed/reserved books.`, 400));
    }

    const overdueBooksCount = await Borrowing.countDocuments({
        "user.id": memberId,
        status: 'Overdue'
    });
    if (settings.preventReservationOnOverdue && overdueBooksCount > 0) { 
         return next(new ErrorHandler("You have overdue books. Please return them before reserving new ones.", 403));
    }

    const availableCopy = book.copies.find(copy => copy.status === 'Available');
    if (!availableCopy) {
        return next(new ErrorHandler("No available copies of this book to reserve.", 400));
    }

    const reservation_date = new Date();
    const pickup_due_date = new Date(reservation_date.getTime() + settings.pickup_time_limit_hours * 60 * 60 * 1000); 
    const newReservation = await Borrowing.create({
        user: {
            id: member._id,
            name: member.name,
            email: member.email,
        },
        book: book._id,
        copy_id: availableCopy._id, 
        status: 'Reserved',
        reservation_date: reservation_date,
        pickup_due_date: pickup_due_date,
    });

    availableCopy.status = 'Reserved';
    await book.save();

    res.status(201).json({
        success: true,
        message: `Book '${book.title}' reserved successfully. Please pick it up by ${pickup_due_date.toLocaleString()}.`, // [cite: 94]
        reservation: newReservation,
    });
});

export const confirmPickup = catchAsyncErrors(async (req, res, next) => {
    const { borrowingId } = req.params;

    const reservation = await Borrowing.findById(borrowingId);
    const settings = await Settings.getSettings();

    if (!reservation) return next(new ErrorHandler("Reservation not found.", 404));
    if (!settings) return next(new ErrorHandler("System settings not found.", 500));

    if (reservation.status !== 'Reserved') {
        return next(new ErrorHandler("This item is not in 'Reserved' status.", 400));
    }

    if (new Date() > new Date(reservation.pickup_due_date)) {
        const book = await Book.findById(reservation.book);
        if (book) {
            const copy = book.copies.id(reservation.copy_id);
            if (copy) {
                copy.status = 'Available'; 
                await book.save();
            }
        }
        reservation.status = 'Cancelled';
        await reservation.save();
        return next(new ErrorHandler("Pickup due date has passed. Reservation is cancelled.", 400));
    }

    const borrow_date = new Date();
    const due_date = new Date(borrow_date.getTime() + settings.loan_period_days * 24 * 60 * 60 * 1000); 

    reservation.status = 'Borrowed'; 
    reservation.borrow_date = borrow_date; 
    reservation.due_date = due_date;
    await reservation.save();

    const book = await Book.findById(reservation.book);
    if (!book) {
        return next(new ErrorHandler("Associated book not found. Data inconsistency.", 500));
    }
    const copy = book.copies.id(reservation.copy_id);
    if (!copy) {
        return next(new ErrorHandler("Associated book copy not found. Data inconsistency.", 500));
    }
    copy.status = 'Borrowed'; 
    await book.save();


    res.status(200).json({
        success: true,
        message: "Book pickup confirmed. Loan period started.",
        borrowing: reservation,
    });
});

export const returnBook = catchAsyncErrors(async (req, res, next) => {
    const { borrowingId } = req.params;
    const librarianId = req.user._id; 

    const borrowing = await Borrowing.findById(borrowingId);
    const settings = await Settings.getSettings();

    if (!borrowing) return next(new ErrorHandler("Borrowing record not found.", 404));
    if (!settings) return next(new ErrorHandler("System settings not found.", 500));

    if (borrowing.status !== 'Borrowed' && borrowing.status !== 'Overdue') {
        return next(new ErrorHandler("This book is not currently in 'Borrowed' or 'Overdue' status.", 400));
    }

    const return_date = new Date();
    borrowing.return_date = return_date; 
    borrowing.status = 'Returned'; 

    const fineAmount = calculateFineForReturn(
        new Date(borrowing.due_date),
        return_date,
        settings.fine_per_day,
        settings.grace_period_days
    );
    borrowing.fine = fineAmount;

    await borrowing.save();

    const book = await Book.findById(borrowing.book);
    if (book) {
        const copy = book.copies.id(borrowing.copy_id);
        if (copy) {
            copy.status = 'Available';
            await book.save();
        }
    }

    let message = `Book returned successfully.`;
    if (fineAmount > 0) {
        message += ` A fine of $${fineAmount.toFixed(2)} has been applied.`;
    }

    res.status(200).json({
        success: true,
        message: message,
        borrowing,
    });
});

export const renewBook = catchAsyncErrors(async (req, res, next) => {
    const { borrowingId } = req.params;
    const settings = await Settings.getSettings();

    if (!settings) return next(new ErrorHandler("System settings not found.", 500));

    const borrowing = await Borrowing.findById(borrowingId);
    if (!borrowing) return next(new ErrorHandler("Borrowing record not found.", 404));

    if (borrowing.status !== 'Borrowed') {
        return next(new ErrorHandler("Only books currently 'Borrowed' can be renewed.", 400));
    }

    if (new Date() > new Date(borrowing.due_date)) {
        return next(new ErrorHandler("Overdue books cannot be renewed. Please return the book first.", 400));
    }

    // if (borrowing.renewal_count >= settings.max_renewals) {
    //    return next(new ErrorHandler("Maximum renewal limit reached for this book.", 400));
    // }
    const new_due_date = new Date(new Date(borrowing.due_date).getTime() + settings.loan_period_days * 24 * 60 * 60 * 1000);
    borrowing.due_date = new_due_date; 
    // borrowing.status = 'Renewed'; // Optional: or keep as 'Borrowed' [cite: 118]
    // borrowing.renewal_count = (borrowing.renewal_count || 0) + 1; // Example for tracking renewals

    await borrowing.save();

    res.status(200).json({
        success: true,
        message: `Book renewed successfully. New due date is ${new_due_date.toLocaleDateString()}.`,
        borrowing,
    });
});

export const getMyBorrowingHistory = catchAsyncErrors(async (req, res, next) => {
    const memberId = req.user._id;
    const history = await Borrowing.find({ "user.id": memberId })
        .populate('book', 'title isbn authors coverImage')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        history,
    });
});

export const cancelReservation = catchAsyncErrors(async (req, res, next) => {
    const { borrowingId } = req.params;
    const userMakingRequest = req.user;

    const reservation = await Borrowing.findById(borrowingId);
    if (!reservation) return next(new ErrorHandler("Reservation not found.", 404));

    if (reservation.status !== 'Reserved') {
        return next(new ErrorHandler("Only active reservations ('Reserved') can be cancelled.", 400));
    }

    if (reservation.user.id.toString() !== userMakingRequest._id.toString() &&
        userMakingRequest.role !== 'Admin' && userMakingRequest.role !== 'Librarian') {
        return next(new ErrorHandler("You are not authorized to cancel this reservation.", 403));
    }

    reservation.status = 'Cancelled'; 
    await reservation.save();

    const book = await Book.findById(reservation.book);
    if (book) {
        const copy = book.copies.id(reservation.copy_id);
        if (copy) {
            copy.status = 'Available';
            await book.save();
        }
    }

    res.status(200).json({
        success: true,
        message: "Reservation cancelled successfully.",
        reservation,
    });
});

export const getAllBorrowings = catchAsyncErrors(async (req, res, next) => {
    const { status, userId, bookId, page = 1, limit = 10, sortBy = "-createdAt" } = req.query;
    const query = {};

    if (status) query.status = status;
    if (userId) query['user.id'] = userId;
    if (bookId) query.book = bookId;

    const count = await Borrowing.countDocuments(query);
    const borrowings = await Borrowing.find(query)
        .populate('book', 'title isbn coverImage')
        .populate('user.id', 'name email') 
        .sort(sortBy)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

    res.status(200).json({
        success: true,
        borrowings,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        count
    });
});

export const reportBookLostOrDamaged = catchAsyncErrors(async (req, res, next) => {
    const { borrowingId } = req.params;
    const { finalStatus } = req.body;

    if (!finalStatus || !['Lost', 'Damaged'].includes(finalStatus)) {
        return next(new ErrorHandler("A final status of 'Lost' or 'Damaged' must be provided.", 400));
    }

    const borrowing = await Borrowing.findById(borrowingId).populate('book');
    if (!borrowing) {
        return next(new ErrorHandler("Borrowing record not found.", 404));
    }

    if (borrowing.status !== 'Borrowed' && borrowing.status !== 'Overdue') {
        return next(new ErrorHandler("This action is only applicable for books that are 'Borrowed' or 'Overdue'.", 400));
    }

    const settings = await Settings.getSettings();
    const book = await Book.findById(borrowing.book._id);

    if (!book) {
        return next(new ErrorHandler("Associated book not found.", 404));
    }

    const copy = book.copies.id(borrowing.copy_id);
    if (copy) {
        copy.status = finalStatus; 
        await book.save();
    }

    const returnDate = new Date();
    borrowing.return_date = returnDate;
    borrowing.status = 'Returned'; 

    const overdueFine = calculateFine(borrowing.due_date, returnDate, settings.fine_per_day, settings.grace_period_days);
    borrowing.fine = overdueFine;

    const replacementFee = book.price * settings.lost_book_fee_multiplier;
    borrowing.replacement_fee = replacementFee;

    await borrowing.save();

    const totalFee = overdueFine + replacementFee;

    res.status(200).json({
        success: true,
        message: `Book copy marked as ${finalStatus}. Total fee applied is $${totalFee.toFixed(2)} (Overdue: $${overdueFine.toFixed(2)}, Replacement: $${replacementFee.toFixed(2)}).`,
        borrowing,
    });
});