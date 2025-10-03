import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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
