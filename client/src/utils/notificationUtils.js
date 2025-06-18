export const NOTIFICATION_TYPE_DISPLAY = {
    // Member & Staff notifications
    'ACCOUNT_UPDATE': 'Account Updates',
    'POLICY_CHANGE_ADMIN': 'Policy Changes',

    // Member-specific notifications
    'RESERVATION_SUCCESS': 'Successful Reservation',
    'PICKUP_REMINDER': 'Pickup Reminder',
    'RESERVATION_CANCELLED_EXPIRED': 'Cancelled Reservation',
    'BORROW_SUCCESS': 'Successful Loan',
    'RETURN_REMINDER': 'Return Reminder',
    'OVERDUE_NOTICE': 'Overdue Notice',
    'RETURN_SUCCESS': 'Successful Return',

    // Staff-specific notifications (Admin/Librarian)
    'NEW_RESERVATION_ADMIN': 'New Reservation',
    'OVERDUE_PROCESSING_ADMIN': 'Overdue to Process',
};

const MEMBER_NOTIFICATION_TYPES = [
    'ACCOUNT_UPDATE',
    'POLICY_CHANGE_ADMIN',
    'RESERVATION_SUCCESS',
    'PICKUP_REMINDER',
    'RESERVATION_CANCELLED_EXPIRED',
    'BORROW_SUCCESS',
    'RETURN_REMINDER',
    'OVERDUE_NOTICE',
    'RETURN_SUCCESS',
];

const STAFF_NOTIFICATION_TYPES = [
    'ACCOUNT_UPDATE',
    'POLICY_CHANGE_ADMIN',
    'NEW_RESERVATION_ADMIN',
    'OVERDUE_PROCESSING_ADMIN',
];

export const getNotificationTypesForRole = (role) => {
    switch (role) {
        case 'Member':
            return MEMBER_NOTIFICATION_TYPES;
        case 'Admin':
        case 'Librarian':
            return STAFF_NOTIFICATION_TYPES;
        default:
            return [];
    }
};