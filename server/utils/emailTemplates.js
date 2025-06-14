export function generateVerificationOtpEmailTemplate(otpCode, userName = "User") { 
    return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9; color: #333;">
    <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #0056b3;">LibHub Library Management</h1>
    </div>
    <h2 style="color: #333; text-align: center;">Verify Your Email Address</h2>
    <p style="font-size: 16px;">Dear ${userName},</p>
    <p style="font-size: 16px;">Thank you for registering with LibHub. To complete your registration, please use the following verification code:</p>
    <div style="text-align: center; margin: 30px 0;">
        <span style="display: inline-block; font-size: 28px; font-weight: bold; color: #fff; padding: 12px 25px; border-radius: 5px; background-color: #007bff; letter-spacing: 2px;">
            ${otpCode}
        </span>
    </div>
    <p style="font-size: 16px;">This code is valid for <strong>5 minutes</strong>. Please do not share this code with anyone.</p>
    <p style="font-size: 16px;">If you did not request this email, please ignore it.</p>
    <footer style="margin-top: 30px; text-align: center; font-size: 14px; color: #777;">
        <p>Thank you,<br>The LibHub Team</p>
        <p style="font-size: 12px; color: #aaa;">This is an automated message. Please do not reply to this email.</p>
    </footer>
</div>`;
}

export function generateForgotPasswordEmailTemplate(resetPasswordUrl, userName = "User") { 
    return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9; color: #333;">
    <div style="text-align: center; margin-bottom: 20px;">
         <h1 style="color: #0056b3;">LibHub Library Management</h1>
    </div>
    <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
    <p style="font-size: 16px;">Dear <span class="math-inline">\{userName\},</p\>
    <p style="font-size: 16px;">We received a request to reset your password for your LibHub account. Please click the button below to proceed:</p>
    <div style="text-align: center; margin: 30px 0;">
        <a href="{resetPasswordUrl}"
            style="display: inline-block; font-size: 16px; font-weight: bold; color: #fff; text-decoration: none; padding: 12px 25px; border-radius: 5px; background-color: #007bff;">
            Reset Password
        </a>
    </div>
    <p style="font-size: 16px;">This link is valid for <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
    <p style="font-size: 16px;">If the button above doesn't work, copy and paste the following URL into your browser:</p>
    <p style="font-size: 14px; color: #007bff; word-wrap: break-word;"><a href="${resetPasswordUrl}" style="color: #007bff;">${resetPasswordUrl}</a></p>
    <footer style="margin-top: 30px; text-align: center; font-size: 14px; color: #777;">
        Thank you,<br>The LibHub Team
        <p style="font-size: 12px; color: #aaa;">This is an automated message. Please do not reply to this email.</p>
    </footer>
</div>`;
}



export function generatePickupReminderEmailTemplate(userName, bookTitle, pickupDueDate) {
    return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9; color: #333;">
        <h2 style="color: #0056b3;">LibHub - Book Pickup Reminder</h2>
        <p>Dear <span class="math-inline">\{userName\},</p\>
<p>This is a friendly reminder to pick up your reserved book, "<strong>{bookTitle}</strong>".</p>
<p>Please pick it up by: <strong>${new Date(pickupDueDate).toLocaleString()}</strong>.</p>
<p>If you no longer need the book, please cancel your reservation through your account.</p>
<p>Thank you,<br>The LibHub Team</p>
</div>`;
}

export function generateDueDateReminderEmailTemplate(userName, bookTitle, dueDate) {
     return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9; color: #333;">
        <h2 style="color: #0056b3;">LibHub - Book Return Reminder</h2>
        <p>Dear <span class="math-inline">\{userName\},</p\>
<p>This is a friendly reminder that your borrowed book, "<strong>{bookTitle}</strong>", is due for return on <strong>${new Date(dueDate).toLocaleDateString()}</strong>.</p>
<p>Please ensure to return it on time to avoid any overdue fines. You may also be eligible to renew it via your account or at the library.</p>
<p>Thank you,<br>The LibHub Team</p>
</div>`;
}

export function generateOverdueNoticeEmailTemplate(userName, bookTitle, dueDate) {
    return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9; color: #333;">
        <h2 style="color: #dc3545;">LibHub - Overdue Book Notice</h2>
        <p>Dear <span class="math-inline">\{userName\},</p\>
<p>This is to inform you that your borrowed book, "<strong>{bookTitle}</strong>", was due on <strong>${new Date(dueDate).toLocaleDateString()}</strong> and is now overdue.</p>
<p>Please return the book as soon as possible to avoid further fines. Fines may be accumulating daily.</p>
<p>Thank you,<br>The LibHub Team</p>
</div>`;
}

export function generateReservationCancelledEmailTemplate(userName, bookTitle, pickupDueDate) {
    return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9; color: #333;">
        <h2 style="color: #ffc107;">LibHub - Reservation Cancelled</h2>
        <p>Dear <span class="math-inline">\{userName\},</p\>
<p>Your reservation for the book "<strong>{bookTitle}</strong>" has been cancelled because it was not picked up by the due date of <strong>${new Date(pickupDueDate).toLocaleString()}</strong>.</p>
<p>The book is now available for other members. If you still need the book, please make a new reservation if copies are available.</p>
<p>Thank you,<br>The LibHub Team</p>
</div>`;
}