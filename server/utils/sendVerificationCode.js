import { generateVerificationOtpEmailTemplate } from "./emailTemplates.js";
import { sendEmail } from "./sendEmail.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";

export async function sendVerificationCode(verificationCode, email, userName, res, next) { 
    try {
        const message = generateVerificationOtpEmailTemplate(verificationCode, userName);
        await sendEmail({ 
            email,
            subject: "LibHub - Email Verification Code",
            message,
        });
        console.log(`Verification code ${verificationCode} sent to ${email}`);

        res.status(200).json({
            success: true,
            message: `Verification code sent to ${email} successfully.`,
        });
    } catch (error) {
        console.error("Send Verification Code Error:", error);
        return next(new ErrorHandler("Failed to send verification email. Please try again later.", 500));
    }
}