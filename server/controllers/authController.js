import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { User } from "../models/userModel.js";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendVerificationCode } from "../utils/sendVerificationCode.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateForgotPasswordEmailTemplate} from "../utils/emailTemplates.js";
import { Settings } from "../models/settingsModel.js";


// FR-AUTH-01: Đăng ký tài khoản Member [cite: 26]
export const register = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password, confirmPassword } = req.body; 
    const settings = await Settings.getSettings(); 

    if (!name || !email || !password || !confirmPassword) { // [cite: 27]
        return next(new ErrorHandler("Please enter all fields.", 400));
    }
    if (password !== confirmPassword) {
        return next(new ErrorHandler("Passwords do not match.", 400));
    }

    const isRegisteredAndVerified = await User.findOne({ email, accountVerified: true });
    if (isRegisteredAndVerified) {
        return next(new ErrorHandler("User with this email already registered and verified.", 400)); 
    }

    if (settings) {
        if (password.length < settings.password_min_length) {
            return next(new ErrorHandler(`Password must be at least ${settings.password_min_length} characters long.`, 400));
        }
    } else {
         if (password.length < 8) {
            return next(new ErrorHandler("Password must be at least 8 characters long.", 400));
        }
    }


    await User.deleteMany({ email, accountVerified: false });


    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "Member",
        is_active: false,
    });

    const verificationCode = user.generateVerificationCode();
    await user.save();

    await sendVerificationCode(verificationCode, email, name, res, next); 

});

export const verifyOTP = catchAsyncErrors(async (req, res, next) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return next(new ErrorHandler("Email and OTP are required.", 400));
    }

    const user = await User.findOne({
        email,
        accountVerified: false, 
        verificationCode: Number(otp),
        verificationCodeExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(new ErrorHandler("Invalid or expired OTP.", 400));
    }

    user.accountVerified = true;
    user.is_active = true; 
    user.verificationCode = undefined; 
    user.verificationCodeExpire = undefined;
    await user.save({ validateModifiedOnly: true });

    sendToken(user, 200, "Account verified successfully. You can now login.", res);
});

export const login = catchAsyncErrors(async (req, res, next) => {
    const { emailOrUsername, password } = req.body; 
    if (!emailOrUsername || !password) {
        return next(new ErrorHandler("Please enter email/username and password.", 400));
    }

    const user = await User.findOne({
        $or: [{ email: emailOrUsername }, { username: emailOrUsername }], 
        accountVerified: true,
    }).select("+password");

    if (!user) {
        return next(new ErrorHandler("Invalid email/username or password.", 401));
    }

    if (!user.is_active) {
        return next(new ErrorHandler("Your account is inactive. Please contact an administrator.", 403)); 
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email/username or password.", 401));
    }

    sendToken(user, 200, "User logged in successfully.", res); 
});

export const logout = catchAsyncErrors(async (req, res, next) => {
    res.status(200).cookie("token", "", {
        expires: new Date(Date.now()),
        httpOnly: true,
    }).json({
        success: true,
        message: "Logged out successfully."
    });
});

export const getUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user._id); 
    if (!user) { 
        return next(new ErrorHandler("User not found.", 404));
    }
    res.status(200).json({
        success: true,
        user,
    });
});

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
    if (!req.body.email) { // [cite: 48]
        return next(new ErrorHandler("Email is required.", 400));
    }
    const user = await User.findOne({
        email: req.body.email,
        accountVerified: true,
        is_active: true,      
    });
    if (!user) {
        return res.status(200).json({
             success: true, 
             message: `If an account with email ${req.body.email} exists, a password reset link has been sent.`,
        });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `<span class="math-inline">\{process\.env\.FRONTEND\_URL\}/password/reset/</span>{resetToken}`;
    const message = generateForgotPasswordEmailTemplate(resetPasswordUrl, user.name); 

    try {
        await sendEmail({ email: user.email, subject: "LibHub - Password Reset Request", message });
        res.status(200).json({
            success: true,
            message: `Password reset link sent to ${user.email}. Please check your inbox.`,
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        console.error("Forgot Password Email Error:", error);
        return next(new ErrorHandler("Failed to send password reset email. Please try again later.", 500));
    }
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body; 

    if (!password || !confirmPassword) {
        return next(new ErrorHandler("Password and confirm password are required.", 400));
    }
    if (password !== confirmPassword) {
        return next(new ErrorHandler("Passwords do not match.", 400));
    }

    const settings = await Settings.getSettings();
    if (settings) {
         if (password.length < settings.password_min_length) {
            return next(new ErrorHandler(`Password must be at least ${settings.password_min_length} characters long.`, 400));
        }
    } else {
        if (password.length < 8) {
            return next(new ErrorHandler("Password must be at least 8 characters long.", 400));
        }
    }


    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(new ErrorHandler("Password reset token is invalid or has expired.", 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined; 
    user.resetPasswordExpire = undefined;
    // user.is_active = true; 
    // user.accountVerified = true;

    await user.save();

    sendToken(user, 200, "Password reset successfully. You are now logged in.", res);
});

export const updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user._id).select("+password"); 
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const settings = await Settings.getSettings();

    if (!currentPassword || !newPassword || !confirmPassword) {
        return next(new ErrorHandler("Please enter all password fields.", 400));
    }

    const isPasswordMatched = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Incorrect current password.", 400));
    }

    if (newPassword !== confirmPassword) {
        return next(new ErrorHandler("New password and confirm new password do not match.", 400));
    }

    if (settings) {
         if (newPassword.length < settings.password_min_length) {
            return next(new ErrorHandler(`New password must be at least ${settings.password_min_length} characters long.`, 400));
        }
    } else {
         if (newPassword.length < 8) {
            return next(new ErrorHandler("New password must be at least 8 characters long.", 400));
        }
    }

    if (currentPassword === newPassword) {
        return next(new ErrorHandler("New password cannot be the same as the current password.", 400));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Password updated successfully.",
    });
});

export const updateMyProfile = catchAsyncErrors(async (req, res, next) => {
    const { name, email } = req.body; 
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found.", 404));
    }

    if (name) user.name = name;

    if (email && email !== user.email) {
        const emailExists = await User.findOne({ email, _id: { $ne: userId } });
        if (emailExists) {
            return next(new ErrorHandler("This email is already in use by another account.", 400));
        }
        user.email = email;
        user.accountVerified = false;
    }

    if (req.files && req.files.avatar) {
        const { avatar } = req.files;
         const allowedFormats = ['image/png', 'image/jpeg', 'image/webp'];
        if (!allowedFormats.includes(avatar.mimetype)) {
            return next(new ErrorHandler("Avatar file format not supported.", 400));
        }
        if (user.avatar && user.avatar.public_id) {
            await cloudinary.uploader.destroy(user.avatar.public_id);
        }
        try {
            const cloudinaryResponse = await cloudinary.uploader.upload(
                avatar.tempFilePath, { folder: "LIBRARY_USER_AVATARS" }
            );
            user.avatar = {
                public_id: cloudinaryResponse.public_id,
                url: cloudinaryResponse.secure_url,
            };
        } catch (uploadError) {
             console.error("Cloudinary upload error:", uploadError);
            return next(new ErrorHandler("Failed to upload new avatar.", 500));
        }
    }


    await user.save();

    res.status(200).json({
        success: true,
        message: "Profile updated successfully.",
        user,
    });
});