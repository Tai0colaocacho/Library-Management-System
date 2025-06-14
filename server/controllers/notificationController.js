import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { Notification } from "../models/notificationModel.js";


export const getMyNotifications = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { recipient_id: userId };
    if (status && ['read', 'unread'].includes(status)) {
        query.status = status;
    }

    const notifications = await Notification.find(query)
        .sort({ created_at: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const count = await Notification.countDocuments(query);

    res.status(200).json({
        success: true,
        notifications,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        totalNotifications: count
    });
});


export const markNotificationAsRead = catchAsyncErrors(async (req, res, next) => {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({ _id: notificationId, recipient_id: userId });

    if (!notification) {
        return next(new ErrorHandler("Notification not found or you're not authorized.", 404));
    }

    if (notification.status === 'read') {
        return res.status(200).json({
            success: true,
            message: "Notification already marked as read.",
            notification
        });
    }

    notification.status = 'read';
    await notification.save();

    res.status(200).json({
        success: true,
        message: "Notification marked as read.",
        notification
    });
});


export const markAllMyNotificationsAsRead = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user._id;

    const result = await Notification.updateMany(
        { recipient_id: userId, status: 'unread' },
        { $set: { status: 'read' } }
    );

    res.status(200).json({
        success: true,
        message: `${result.modifiedCount} notifications marked as read.`,
        modifiedCount: result.modifiedCount
    });
});