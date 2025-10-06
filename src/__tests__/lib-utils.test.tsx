import { validateWithdrawalAmount } from "../lib/utils";

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
