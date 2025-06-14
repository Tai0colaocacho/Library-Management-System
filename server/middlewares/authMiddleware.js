import { User } from "../models/userModel.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./errorMiddlewares.js";
import jwt from 'jsonwebtoken';

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        return next(new ErrorHandler("User is not authenticated. Please login.", 401));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id);

    if (!req.user) { 
        return next(new ErrorHandler("User not found or invalid token.", 401));
    }

    
    if (!req.user.is_active) {
        return next(new ErrorHandler("Your account is currently inactive. Please contact support.", 403));
    }

    next();
});

export const isAuthorized = (...roles) => { 
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(
                `Role (${req.user.role}) is not authorized to access this resource. Allowed roles: ${roles.join(', ')}`, 403
            ));
        }
        next();
    };
};