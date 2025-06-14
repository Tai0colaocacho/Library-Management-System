import mongoose from "mongoose";

const borrowingSchema = new mongoose.Schema({
    user: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        }
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true
    },
    copy_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Reserved', 'Borrowed', 'Returned', 'Overdue', 'Cancelled'],
        default: 'Reserved',
    },
    reservation_date: { 
        type: Date,
        default: Date.now,
    },
    pickup_due_date: { 
        type: Date,
    },
    borrow_date: { 
        type: Date,
    },
    due_date: { 
        type: Date,
    },
    return_date: { 
        type: Date,
        default: null,
    },
    fine: { 
        type: Number,
        default: 0
    },
    replacement_fee: { 
        type: Number,
        default: 0
    },
    notified: {
        type: Boolean,
        default: false
    },
},
{
    timestamps: true 
});

export const Borrowing = mongoose.model("Borrowing", borrowingSchema);