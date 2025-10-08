import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { BusinessPitch } from "@/db/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Function to validate a withdrawal amount
 * @param amount The amount to withdraw
 * @param balance The balance to withdraw from
 * @returns An error message if the withdrawal is invalid, otherwise null
 */
export function validateWithdrawalAmount(amount: number | null, balance: number): string | null {
  if (balance === 0) {
    return "No funds available to withdraw.";
  }
  if (amount === null || amount <= 0) {
    return "Please enter a valid amount to withdraw.";
  }
  if (amount > balance) {
    return "Withdrawal amount exceeds available balance."
  }
  return null;
}

/**
 * Determine whether a certain date has been reached or passed
 * @param {Date | null} date - The date to check
 * @returns {boolean} True or false, depending on whether the date has been reached
 */
export function hasDateBeenReached(date: Date | null): boolean {
  if (date) {
    if (new Date().getFullYear() >= date.getFullYear() &&
      new Date().getMonth() >= date.getMonth() &&
      new Date().getDate() >= date.getDate()) {
      return true;
    }
  }
  return false;
}

/**
 * Calculates the next dividend payout date based on the given period and end date.
 * @param period Payout period - "quarterly" or "yearly"
 * @param end end date of the pitch
 * @returns {Date} The next payout date
 */
export function calculateDividendPayoutDate(period: string, end: Date): Date {
  const payout = new Date(end);
  if (period === "quarterly") {
    payout.setMonth(payout.getMonth() + 3);
  } else if (period === "yearly") {
    payout.setFullYear(payout.getFullYear() + 1);
  }
  return payout;
}


/**
 * Calculate the profit for an investor based on their shares, total shares, profit amount and profit share percentage
 * @param shares number of shares allocated to the investor
 * @param totalShares total number of shares for the pitch
 * @param profitAmount total profit share to be distributed
 * @param profitSharePercent percentage of profit share for the investor
 * @returns calculated profit for the investor
 */
export function calculateInvestorProfits(shares: number, totalShares: number, profitAmount: number, profitSharePercent: number): number {
   if (totalShares === 0 || shares === 0) return 0;
  const profitPerShare = profitAmount / totalShares;
  const investorProfit = shares * profitPerShare;
  return Math.floor(investorProfit*100)/100;
}
