import { validateWithdrawalAmount, calculateDividendPayoutDate, calculateInvestorProfits } from "../lib/utils";

describe("validateWithdrawalAmount", () => {
  const balance = 100;
  it("returns error if balance is zero", () => {
    expect(validateWithdrawalAmount(50, 0)).toBe("No funds available to withdraw.");
  });
  it("returns error if amount is null", () => {
    expect(validateWithdrawalAmount(null, balance)).toBe("Please enter a valid amount to withdraw.");
  });
  it("returns error if amount is less than or equal to zero", () => {
    expect(validateWithdrawalAmount(0, balance)).toBe("Please enter a valid amount to withdraw.");
    expect(validateWithdrawalAmount(-10, balance)).toBe("Please enter a valid amount to withdraw.");
  });
  it("returns error if amount exceeds balance", () => {
    expect(validateWithdrawalAmount(150, balance)).toBe("Withdrawal amount exceeds available balance.");
  });
  it("returns null if amount is valid", () => {
    expect(validateWithdrawalAmount(50, balance)).toBeNull();
  });
  it("returns null if amount equals balance", () => {
    expect(validateWithdrawalAmount(100, balance)).toBeNull();
  });
});

describe("calculateDividendPayoutDate", () => {
  it("calculates next quarterly payout date", () => {
    const endDate = new Date("2026-01-15"); 
    const nextPayout = calculateDividendPayoutDate("quarterly", endDate);
    expect(nextPayout.getFullYear()).toBe(2026);
    expect(nextPayout.getMonth()).toBe(3);  
    expect(nextPayout.getDate()).toBe(15);
  });
  it("calculates next yearly payout date", () => {
    const endDate = new Date("2026-01-15");
    const nextPayout = calculateDividendPayoutDate("yearly", endDate);
    expect(nextPayout.getFullYear()).toBe(2027);
    expect(nextPayout.getMonth()).toBe(0);  
    expect(nextPayout.getDate()).toBe(15);
  });
});

describe("calculateInvestorProfits", () => {  
  it("calculates correct profit for investor", () => {
    const shares = 100;
    const totalShares = 1000;
    const profitAmount = 5000;
    const profitSharePercent = 20; 
    const profit = calculateInvestorProfits(shares, totalShares, profitAmount, profitSharePercent);
    expect(profit).toBe(100); 
  });

  it("returns zero profit if investor has no shares", () => {
    const shares = 0;
    const totalShares = 1000;
    const profitAmount = 5000;
    const profitSharePercent = 20; 
    const profit = calculateInvestorProfits(shares, totalShares, profitAmount, profitSharePercent);
    expect(profit).toBe(0); 
  }); 
  it("returns zero profit if total shares is zero", () => {
    const shares = 100;
    const totalShares = 0;
    const profitAmount = 5000;
    const profitSharePercent = 20; 
    const profit = calculateInvestorProfits(shares, totalShares, profitAmount, profitSharePercent);
    expect(profit).toBe(0); 
  }); 
});