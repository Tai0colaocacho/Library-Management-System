import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { Settings } from "../models/settingsModel.js";
import { User } from "../models/userModel.js";
import { Notification } from "../models/notificationModel.js";

export const getSettings = catchAsyncErrors(async (req, res, next) => {
    const settings = await Settings.getSettings(); 
    if (!settings) {
        
        return next(new ErrorHandler("Settings not found. Please initialize system settings.", 500));
    }
    res.status(200).json({
        success: true,
        settings,
    });
});

export const updateSettings = catchAsyncErrors(async (req, res, next) => {
    const currentSettings = await Settings.getSettings();
    if (!currentSettings) {
        return next(new ErrorHandler("Settings not found. Cannot update.", 500));
    }

    const oldSettings = currentSettings.toObject();
    const updatedSettings = await Settings.findByIdAndUpdate(currentSettings._id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    const generalChanges = [];
    const passwordPolicyChanges = [];

    const generalKeys = ['library_name', 'loan_period_days', 'max_books_per_user', 'fine_per_day', 'grace_period_days', 'pickup_time_limit_hours', 'lost_book_fee_multiplier'];
    const passwordKeys = ['password_min_length', 'password_requires_special_char'];

    generalKeys.forEach(key => {
        if (oldSettings[key] != updatedSettings[key]) {
            generalChanges.push(`'${key.replace(/_/g, ' ')}' from '${oldSettings[key]}' to '${updatedSettings[key]}'`);
        }
    });

    passwordKeys.forEach(key => {
        if (oldSettings[key] != updatedSettings[key]) {
            passwordPolicyChanges.push(`'${key.replace(/_/g, ' ')}' from '${oldSettings[key]}' to '${updatedSettings[key]}'`);
        }
    });

    const usersToNotify = await User.find({ role: { $in: ['Member', 'Librarian'] } }, '_id');

    if (generalChanges.length > 0 && usersToNotify.length > 0) {
        const messageContent = `The library's general policy has been updated. Changes: ${generalChanges.join(', ')}.`;
        const notifications = usersToNotify.map(user => ({
            recipient_id: user._id,
            message_content: messageContent,
            type: 'POLICY_CHANGE_ADMIN',
        }));
        await Notification.insertMany(notifications);
    }

    if (passwordPolicyChanges.length > 0 && usersToNotify.length > 0) {
        const messageContent = `The library's password policy has changed. These new rules will apply the next time you change or reset your password. Changes: ${passwordPolicyChanges.join(', ')}.`;
        const notifications = usersToNotify.map(user => ({
            recipient_id: user._id,
            message_content: messageContent,
            type: 'ACCOUNT_UPDATE',
        }));
        await Notification.insertMany(notifications);
    }

    res.status(200).json({
        success: true,
        message: "Settings updated successfully.",
        settings: updatedSettings,
    });
});