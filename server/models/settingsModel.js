import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    library_name: {
        type: String,
        default: "LibHub Library"
    },
    loan_period_days: { // Thời hạn mượn sách (ngày)
        type: Number,
        default: 7 // e.g., 7 days
    },
    max_books_per_user: { // Số sách tối đa/thành viên (tính cả giữ chỗ)
        type: Number,
        default: 5
    },
    fine_per_day: { // Mức phạt/ngày quá hạn
        type: Number,
        default: 0.5 // e.g., $0.50 per day
    },
    grace_period_days: { // Thời gian ân hạn (ngày) sau ngày đáo hạn mà không bị phạt
        type: Number,
        default: 0
    },
    pickup_time_limit_hours: { // Thời hạn đến nhận sách sau khi đặt (giờ)
        type: Number,
        default: 24 // e.g., 24 hours
    },
    lost_book_fee_multiplier: { // Hệ số nhân với giá sách để tính phí thay thế
        type: Number,
        default: 1.5, // Mặc định là 150%
        min: 0
    },
    password_min_length: {
        type: Number,
        default: 8
    },
    password_requires_special_char: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });

settingsSchema.statics.getSettings = async function() {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

export const Settings = mongoose.model('Settings', settingsSchema);