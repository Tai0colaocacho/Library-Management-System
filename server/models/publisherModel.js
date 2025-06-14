import mongoose from 'mongoose';

const publisherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true 
    },
    address: {
        type: String,
        trim: true
    },
    contact_email: {
        type: String,
        trim: true,
        lowercase: true
    }
}, { timestamps: true });

export const Publisher = mongoose.model('Publisher', publisherSchema);