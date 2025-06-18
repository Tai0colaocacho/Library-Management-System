import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { User } from "../models/userModel.js";
import bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import { Notification } from "../models/notificationModel.js";


export const getAllUsers = catchAsyncErrors(async (req, res, next) => {
    
    const users = await User.find({}); 
    res.status(200).json({
        success: true,
        users,
    });
});


export const getUserDetailsForAdmin = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json({
        success: true,
        user,
        
    });
});



export const createStaffOrMember = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password, role, is_active, nationalId, phoneNumber, address, dateOfBirth } = req.body;

    if (!name || !email || !password || !role) {
        return next(new ErrorHandler("Please provide name, email, password, and role.", 400));
    }
    if (!['Admin', 'Librarian', 'Member'].includes(role)) {
        return next(new ErrorHandler("Invalid role specified.", 400));
    }

    let user = await User.findOne({ email });
    if (user) {
        return next(new ErrorHandler("User with this email already exists.", 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    
    let avatarData = {};
    if (req.files && req.files.avatar) {
        const { avatar } = req.files;
        const allowedFormats = ['image/png', 'image/jpeg', 'image/webp'];
        if (!allowedFormats.includes(avatar.mimetype)) {
            return next(new ErrorHandler("Avatar file format not supported.", 400));
        }
        try {
            const cloudinaryResponse = await cloudinary.uploader.upload(
                avatar.tempFilePath, { folder: "LIBRARY_USER_AVATARS" }
            );
            avatarData = {
                public_id: cloudinaryResponse.public_id,
                url: cloudinaryResponse.secure_url,
            };
        } catch (uploadError) {
            console.error("Cloudinary upload error:", uploadError);
            return next(new ErrorHandler("Failed to upload avatar.", 500));
        }
    }


    user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        is_active: is_active !== undefined ? is_active : true,
        nationalId, 
        phoneNumber,
        address,
        dateOfBirth,
        avatar: avatarData.url ? avatarData : undefined,
        accountVerified: true,
    });

    const welcomeMessage = `Welcome to the library, <b>${user.name}</b>! Your account has been successfully created and is ready for use.`;
    await Notification.create({
        recipient_id: user._id,
        message_content: welcomeMessage,
        type: 'ACCOUNT_UPDATE'
    });

    res.status(201).json({
        success: true,
        message: `${role} account created successfully.`,
        user,
    });
});


export const updateUserAccountByAdmin = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.params;
    const { name, email, role, is_active, permissions, nationalId, phoneNumber, address, dateOfBirth, gender } = req.body;

    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
        return next(new ErrorHandler("User not found.", 404));
    }

    
    if (req.user._id.toString() === userId && (is_active === false || (role && role !== req.user.role))) {
       return next(new ErrorHandler("Admin cannot deactivate or change their own role.", 403));
    }


    if (name) userToUpdate.name = name;
    if (email && email !== userToUpdate.email) {
        const emailExists = await User.findOne({ email, _id: { $ne: userId } });
        if (emailExists) {
            return next(new ErrorHandler("Email already in use by another account.", 400));
        }
        userToUpdate.email = email;
    }
    if (nationalId) userToUpdate.nationalId = nationalId;
    if (phoneNumber) userToUpdate.phoneNumber = phoneNumber;
    if (address) userToUpdate.address = address;
    if (dateOfBirth) userToUpdate.dateOfBirth = dateOfBirth;
    if (gender) userToUpdate.gender = gender;
    if (role && ['Admin', 'Librarian', 'Member'].includes(role)) {
        userToUpdate.role = role;
    }
    if (is_active !== undefined) {
        userToUpdate.is_active = is_active;
    }
    if (permissions && Array.isArray(permissions)) { 
        userToUpdate.permissions = permissions;
    }

    
    if (req.files && req.files.avatar) {
        const { avatar } = req.files;
         const allowedFormats = ['image/png', 'image/jpeg', 'image/webp'];
        if (!allowedFormats.includes(avatar.mimetype)) {
            return next(new ErrorHandler("Avatar file format not supported.", 400));
        }
         
        if (userToUpdate.avatar && userToUpdate.avatar.public_id) {
            await cloudinary.uploader.destroy(userToUpdate.avatar.public_id);
        }
        try {
            const cloudinaryResponse = await cloudinary.uploader.upload(
                avatar.tempFilePath, { folder: "LIBRARY_USER_AVATARS" }
            );
            userToUpdate.avatar = {
                public_id: cloudinaryResponse.public_id,
                url: cloudinaryResponse.secure_url,
            };
        } catch (uploadError) {
             console.error("Cloudinary upload error:", uploadError);
            return next(new ErrorHandler("Failed to upload new avatar.", 500));
        }
    }


    await userToUpdate.save();

    const adminUpdater = req.user;
    const memberMessage = `Your account was just updated by an administrator (<b>${adminUpdater.name}</b>). Please review your profile information.`;
    await Notification.create({
        recipient_id: userToUpdate._id,
        message_content: memberMessage,
        type: 'ACCOUNT_UPDATE',
    });

    res.status(200).json({
        success: true,
        message: "User account updated successfully.",
        user: userToUpdate,
    });
});

