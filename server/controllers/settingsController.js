import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { Settings } from "../models/settingsModel.js";


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

    
    const allowedUpdates = [
        'library_name', 'loan_period_days', 'max_books_per_user', 
        'fine_per_day', 'grace_period_days', 'pickup_time_limit_hours',
        'password_min_length', 'password_requires_special_char' 
    ];

    for (const key in req.body) {
        if (allowedUpdates.includes(key) && req.body[key] !== undefined) {
            
            if (['loan_period_days', 'max_books_per_user', 'fine_per_day', 'grace_period_days', 'pickup_time_limit_hours', 'password_min_length'].includes(key)) {
                if (isNaN(parseFloat(req.body[key])) || parseFloat(req.body[key]) < 0) {
                    return next(new ErrorHandler(`Invalid value for ${key}. Must be a non-negative number.`, 400));
                }
                 currentSettings[key] = parseFloat(req.body[key]);
            } else if (['password_requires_special_char'].includes(key)) {
                 if (typeof req.body[key] !== 'boolean') {
                    return next(new ErrorHandler(`Invalid value for ${key}. Must be true or false.`, 400));
                }
                currentSettings[key] = req.body[key];
            }
            else {
                currentSettings[key] = req.body[key];
            }
        }
    }

    const updatedSettings = await currentSettings.save(); 

    res.status(200).json({
        success: true,
        message: "Settings updated successfully.",
        settings: updatedSettings,
    });
});