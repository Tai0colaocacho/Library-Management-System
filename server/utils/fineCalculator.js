/**
 * Calculates the fine for a late return.
 * @param {Date} dueDate - The date the book was due.
 * @param {Date} returnDate - The actual date the book was returned.
 * @param {number} finePerDay - The fine amount per day overdue.
 * @param {number} gracePeriodDays - Number of days after due date before fines start.
 * @returns {number} The calculated fine amount.
 */
export const calculateFine = (dueDate, returnDate, finePerDay, gracePeriodDays = 0) => { 
    if (!(dueDate instanceof Date) || !(returnDate instanceof Date)) {
        throw new Error("Invalid date objects provided for fine calculation.");
    }
    if (typeof finePerDay !== 'number' || finePerDay < 0) {
        throw new Error("Invalid finePerDay value.");
    }
    if (typeof gracePeriodDays !== 'number' || gracePeriodDays < 0) {
        throw new Error("Invalid gracePeriodDays value.");
    }

    const dueDateTime = dueDate.getTime();
    const returnDateTime = returnDate.getTime();

    if (returnDateTime <= dueDateTime) {
        return 0; 
    }

    
    const effectiveDueDate = new Date(dueDate);
    effectiveDueDate.setDate(effectiveDueDate.getDate() + gracePeriodDays); 
    const effectiveDueDateTime = effectiveDueDate.getTime();

    if (returnDateTime <= effectiveDueDateTime) {
        return 0; 
    }

    
    const diffTime = returnDateTime - effectiveDueDateTime; 
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays * finePerDay; 
};