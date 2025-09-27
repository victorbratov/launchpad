-- foreign key InvestorAccounts -> TheBank
ALTER TABLE "InvestorAccounts"
ADD CONSTRAINT "InvestorAccounts_InvBankACNumber_fkey"
FOREIGN KEY ("InvBankACNumber")
REFERENCES "TheBank"("BankAccountNumber");

--  foreign key  BusinessAccount -> TheBank
ALTER TABLE "BusinessAccount"
ADD CONSTRAINT "BusinessAccount_BusBankAcc_fkey"
FOREIGN KEY ("BusBankAcc")
REFERENCES "TheBank"("BankAccountNumber");
