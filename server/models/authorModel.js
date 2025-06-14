import mongoose from 'mongoose';

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true 
    },
    biography: {
        type: String,
        trim: true
    }
    
}, { timestamps: true });

export const Author = mongoose.model('Author', authorSchema);