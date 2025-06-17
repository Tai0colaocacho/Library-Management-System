import cron from 'node-cron';
import { Borrowing } from '../models/borrowingModel.js';
import { Book } from '../models/bookModel.js';
import { User } from '../models/userModel.js';
import { Settings } from '../models/settingsModel.js';
import { sendEmail } from '../utils/sendEmail.js'; 
import { Notification } from '../models/notificationModel.js'; 
import { generateDueDateReminderEmailTemplate, generatePickupReminderEmailTemplate, generateOverdueNoticeEmailTemplate, generateReservationCancelledEmailTemplate } from '../utils/emailTemplates.js'; 


async function createNotification(userId, type, messageContent, relatedLink = null) {
    try {
        await Notification.create({
            recipient_id: userId,
            type: type,
            message_content: messageContent,
            related_link: relatedLink 
        });
    } catch (error) {
        console.error(`Error creating notification for user ${userId}, type ${type}:`, error);
    }
}

const handleOverdueBooks = async () => {
    try {
        const settings = await Settings.getSettings();
        if (!settings) {
            console.error("Scheduled Task: Settings not found, cannot process overdue books.");
            return;
        }

        const now = new Date();
        const overdueBorrowings = await Borrowing.find({
            status: 'Borrowed', 
            due_date: { $lt: now },
        }).populate('user.id', 'email name'); 

        for (const borrowing of overdueBorrowings) {
            borrowing.status = 'Overdue'; 
            
            await borrowing.save();
            
            if (borrowing.user && borrowing.user.id && !borrowing.notifiedOverdue) { 
                const bookDetails = await Book.findById(borrowing.book).select('title');
                const messageContent = `Your borrowed book "${bookDetails ? bookDetails.title : 'A book'}" is now overdue. Please return it as soon as possible to avoid further fines.`;

                await createNotification(borrowing.user.id._id, 'OVERDUE_NOTICE', messageContent, `/my-borrowings`);

                if (borrowing.user.id.email) {
                     const emailMessage = generateOverdueNoticeEmailTemplate(borrowing.user.id.name, bookDetails ? bookDetails.title : 'A book', borrowing.due_date);
                     await sendEmail({
                        email: borrowing.user.id.email,
                        subject: "LibHub - Overdue Book Notice",
                        message: emailMessage
                    });
                }
                borrowing.notifiedOverdue = true; 
                await borrowing.save();
            }
        }
        if (overdueBorrowings.length > 0) {
            console.log(`Scheduled Task: Processed ${overdueBorrowings.length} overdue books.`);
        }
    } catch (error) {
        console.error("Error in handleOverdueBooks scheduled task:", error);
    }
};

const handleExpiredReservations = async () => {
    try {
        const now = new Date();
        const expiredReservations = await Borrowing.find({
            status: 'Reserved',
            pickup_due_date: { $lt: now },
        }).populate('user.id', 'email name'); 

        for (const reservation of expiredReservations) {
            reservation.status = 'Cancelled'; 
            await reservation.save();

            
            const book = await Book.findById(reservation.book);
            if (book) {
                const copy = book.copies.id(reservation.copy_id);
                if (copy && copy.status === 'Reserved') { 
                    copy.status = 'Available';
                    await book.save();
                }
            }
            
             if (reservation.user && reservation.user.id) {
                const bookDetails = await Book.findById(reservation.book).select('title');
                const messageContent = `Your reservation for "<span class="math-inline">\{bookDetails ? bookDetails\.title \: 'a book'\}" has been cancelled as it was not picked up by the due date \(</span>{new Date(reservation.pickup_due_date).toLocaleDateString()}).`;

                await createNotification(reservation.user.id._id, 'RESERVATION_CANCELLED_EXPIRED', messageContent, `/my-borrowings`);

                if (reservation.user.id.email) {
                     const emailMessage = generateReservationCancelledEmailTemplate(reservation.user.id.name, bookDetails ? bookDetails.title : 'A book', new Date(reservation.pickup_due_date));
                     await sendEmail({
                        email: reservation.user.id.email,
                        subject: "LibHub - Reservation Cancelled",
                        message: emailMessage
                    });
                }
            }
        }
        if (expiredReservations.length > 0) {
            console.log(`Scheduled Task: Cancelled ${expiredReservations.length} expired reservations.`);
        }
    } catch (error) {
        console.error("Error in handleExpiredReservations scheduled task:", error);
    }
};


const sendReminders = async () => {
    try {
        const settings = await Settings.getSettings();
        if (!settings) return;

        const now = new Date();
        const reminderLeadTimeDays = 2; 
        
        const upcomingDueBorrowings = await Borrowing.find({
            status: 'Borrowed',
            notifiedReturnReminder: { $ne: true }, 
            due_date: {
                $gt: now, 
                $lte: new Date(now.getTime() + reminderLeadTimeDays * 24 * 60 * 60 * 1000) 
            }
        }).populate('user.id', 'email name').populate('book', 'title');

        for (const borrowing of upcomingDueBorrowings) {
            if (borrowing.user && borrowing.user.id) {
                const messageContent = `Reminder: Your borrowed book "${borrowing.book.title}" is due on ${new Date(borrowing.due_date).toLocaleDateString()}.`;
                await createNotification(borrowing.user.id._id, 'RETURN_REMINDER', messageContent, `/my-borrowings`);
                 if (borrowing.user.id.email) {
                    const emailMessage = generateDueDateReminderEmailTemplate(borrowing.user.id.name, borrowing.book.title, borrowing.due_date);
                    await sendEmail({
                        email: borrowing.user.id.email,
                        subject: `LibHub - Book Return Reminder: ${borrowing.book.title}`,
                        message: emailMessage
                    });
                }
                borrowing.notifiedReturnReminder = true;
                await borrowing.save();
            }
        }
         if (upcomingDueBorrowings.length > 0) {
            console.log(`Scheduled Task: Sent ${upcomingDueBorrowings.length} due date reminders.`);
        }


        
        const pickupReminderLeadTimeHours = 24; 
        const upcomingPickups = await Borrowing.find({
            status: 'Reserved',
            notifiedPickupReminder: { $ne: true },
            pickup_due_date: {
                $gt: now,
                $lte: new Date(now.getTime() + pickupReminderLeadTimeHours * 60 * 60 * 1000)
            }
        }).populate('user.id', 'email name').populate('book', 'title');

        for (const reservation of upcomingPickups) {
             if (reservation.user && reservation.user.id) {
                const messageContent = `Reminder: Please pick up your reserved book "${reservation.book.title}" by ${new Date(reservation.pickup_due_date).toLocaleString()}.`;
                await createNotification(reservation.user.id._id, 'PICKUP_REMINDER', messageContent, `/my-borrowings`);

                if (reservation.user.id.email) {
                    const emailMessage = generatePickupReminderEmailTemplate(reservation.user.id.name, reservation.book.title, reservation.pickup_due_date);
                     await sendEmail({
                        email: reservation.user.id.email,
                        subject: `LibHub - Book Pickup Reminder: ${reservation.book.title}`,
                        message: emailMessage
                    });
                }
                reservation.notifiedPickupReminder = true;
                await reservation.save();
            }
        }
        if (upcomingPickups.length > 0) {
            console.log(`Scheduled Task: Sent ${upcomingPickups.length} pickup reminders.`);
        }

    } catch (error) {
        console.error("Error in sendReminders scheduled task:", error);
    }
};



export const handleScheduledTasks = () => {
    
    cron.schedule('0 1 * * *', () => { 
        console.log('Running daily scheduled tasks: Overdue Books and Expired Reservations...');
        handleOverdueBooks();
        handleExpiredReservations();
    });

    
    cron.schedule('0 9 * * *', () => { 
        console.log('Running daily reminder tasks...');
        sendReminders();
    });

    
    
    
    console.log("Scheduled tasks (overdue checks, expired reservations, reminders) have been set up.");
};