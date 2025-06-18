import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    recipient_id: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message_content: {
        type: String,
        required: true
    },
    type: { 
        type: String,
        required: true,
        enum: [
            'RESERVATION_SUCCESS',          // Thông báo đặt giữ chỗ thành công 
            'PICKUP_REMINDER',              // Thông báo nhắc nhở nhận sách 
            'RESERVATION_CANCELLED_EXPIRED',// Khi sách đã đặt giữ chỗ bị hủy do quá hạn nhận 
            'BORROW_SUCCESS',               // Thông báo mượn sách thành công 
            'RETURN_REMINDER',              // Thông báo nhắc nhở trả sách
            'OVERDUE_NOTICE',               // Khi sách đã quá hạn trả 
            'RETURN_SUCCESS',               // Thông báo trả sách thành công 
            'ACCOUNT_UPDATE',               // Thông báo về tài khoản
            'NEW_RESERVATION_ADMIN',        // Thông báo có sách mới được đặt giữ chỗ (cho admin/librarian)
            'OVERDUE_PROCESSING_ADMIN',     // Thông báo có sách quá hạn cần xử lý (cho admin/librarian) 
            'POLICY_CHANGE_ADMIN'           // Thông báo khi thư viện thay đổi các chính sách
        ]
    },
    status: {
        type: String,
        enum: ['unread', 'read'],
        default: 'unread'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}, { timestamps: { createdAt: 'created_at', updatedAt: true } }); 

export const Notification = mongoose.model('Notification', notificationSchema);