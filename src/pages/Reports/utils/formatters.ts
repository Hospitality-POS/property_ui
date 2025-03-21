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
    // return `KES ${parseFloat(amount.toString()).toLocaleString()}`;
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