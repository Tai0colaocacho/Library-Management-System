import mongoose from 'mongoose';

const copySchema = new mongoose.Schema({
    status: {
        type: String,
        required: true,
        enum: ['Available', 'Reserved', 'Borrowed', 'Maintenance'],
        default: 'Available'
    },
    location: {
        type: String,
        trim: true
    }
});

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    isbn: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    authors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Author' 
    }],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category' 
    },
    publisher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Publisher' 
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: [true, "Please enter the price of the book."],
        min: [0, "Price cannot be negative."]
    },
    publication_date: { 
        type: Date,
    },
    page_count: { 
        type: Number,
    },
    coverImage: {
        public_id: { type: String },
        url: { type: String }
    },
    borrowCount: {
        type: Number,
        default: 0
    },
    copies: [copySchema] 
},
{
    timestamps: true,
});

export const Book = mongoose.model('Book', bookSchema);