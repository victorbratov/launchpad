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
 * Determine whether it is time to declare profits or not
 * @param {BusinessPitch | null} pitch - The business pitch to check
 * @returns {boolean} True or false, depending on whether the profit period has been reached
 */
export function profitPeriodReached(pitch: BusinessPitch | null): boolean {
  if (pitch && pitch.next_payout_date) {
    if (new Date().getFullYear() >= pitch.next_payout_date.getFullYear() &&
      new Date().getMonth() >= pitch.next_payout_date.getMonth() &&
      new Date().getDate() >= pitch.next_payout_date.getDate()) {
        console.log("Profit period reached: true");
      return true;
    }
  }
  return false;
}