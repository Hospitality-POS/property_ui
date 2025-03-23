import moment from 'moment';

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number | string | undefined | null): string => {
    if (amount === undefined || amount === null || isNaN(Number(amount))) {
        return '0';
    }
    return `${parseFloat(amount.toString()).toLocaleString()}`;
};

/**
 * Format a date string
 * @param dateString - The date to format
 * @returns Formatted date string
 */
export const formatDate = (dateString: string | Date | undefined | null): string => {
    if (!dateString) return '';
    return moment(dateString).format('DD MMM YYYY');
};

/**
 * Calculate days until due or days overdue
 * @param dueDate - The due date
 * @returns Object with days until due and days overdue
 */
export const calculateDueDays = (dueDate: string | Date | undefined | null): {
    daysUntilDue: number;
    daysOverdue: number;
} => {
    if (!dueDate) {
        return { daysUntilDue: 0, daysOverdue: 0 };
    }

    const today = moment().startOf('day');
    const due = moment(dueDate).startOf('day');
    const diff = due.diff(today, 'days');

    return {
        daysUntilDue: diff > 0 ? diff : 0,
        daysOverdue: diff < 0 ? Math.abs(diff) : 0
    };
};

/**
 * Format payment status with color
 * @param status - The payment status
 * @returns Object with status text and color
 */
export const formatPaymentStatus = (status: string): { text: string; color: string } => {
    switch (status.toLowerCase()) {
        case 'paid':
            return { text: 'PAID', color: 'green' };
        case 'partial':
            return { text: 'PARTIAL', color: 'orange' };
        case 'overdue':
            return { text: 'OVERDUE', color: 'red' };
        case 'due':
            return { text: 'DUE', color: 'blue' };
        default:
            return { text: status.toUpperCase(), color: 'default' };
    }
};

/**
 * Format payment type
 * @param type - The payment type
 * @returns Formatted payment type
 */
export const formatPaymentType = (type: string): string => {
    switch (type.toLowerCase()) {
        case 'deposit':
            return 'Deposit';
        case 'installment':
            return 'Installment';
        case 'final':
            return 'Final Payment';
        default:
            return type.charAt(0).toUpperCase() + type.slice(1);
    }
};

/**
 * Calculate payment progress percentage
 * @param paidAmount - Amount already paid
 * @param totalAmount - Total payment amount
 * @returns Progress percentage
 */
export const calculatePaymentProgress = (paidAmount: number, totalAmount: number): number => {
    if (totalAmount <= 0) return 0;
    const progress = (paidAmount / totalAmount) * 100;
    return Math.min(100, Math.max(0, progress));
};