/**
* Validates the start and end dates, checking end is not before start, and start date is not in the past
* @param start start date
* @param end end date
* @returns True or false, if the dates are valid or not
*/
export function validateDates(start: Date, end: Date) {
    if (start.getTime() >= end.getTime()) {
        return { success: false, message: 'End date must be after start date' };
    }
    if (start.getFullYear() < new Date().getFullYear() ||
        start.getMonth() < new Date().getMonth() ||
        start.getDate() < new Date().getDate()) {
        return { success: false, message: 'Start date must be today or in the future' };
    }
    return { success: true, message: '' };
}

/**
 * 
 * @param bronze bronze tier multiplier
 * @param silver silver tier multiplier
 * @param gold gold tier multiplier
 * @returns {boolean} whether the multipliers are valid or not
 */
export function validateMultipliers(bronze: string, silver: string, gold: string) {
    return !(parseFloat(bronze).toFixed(2) >= parseFloat(silver).toFixed(2) || parseFloat(silver).toFixed(2) >= parseFloat(gold).toFixed(2))
}

/**
 * Validates the maximums for each tier, that they are in the correct order
 * @param bronze bronze tier maximum
 * @param silver silver tier maximum
 * @param gold gold tier maximum
 * @returns {boolean} whether the maximums are valid or not
 */
export function validateMaxes(bronze: number, silver: number, gold: number) {
    return bronze <= silver && silver < gold;
}

/**
 * Set the status of the pitch to pending or open if the start date is today or not
 * @param startDate The date the pitch will start on
 */
export function setPitchStatus(startDate: Date) {
    if (areDatesEqual(startDate, new Date)) {
        return "Open";
    } else {
        return "Pending";
    }
}

/**
 * Check if two dates are equal
 * @param date1 first date to check
 * @param date2 second date to check
 * @returns true or false, if the dates are equal or not
 */
export function areDatesEqual(date1: Date, date2: Date) {
    if (date1.getFullYear() == date2.getFullYear() &&
        date1.getMonth() == date2.getMonth() &&
        date1.getDate() == date2.getDate()) {
        return true;
    }
    return false;
}