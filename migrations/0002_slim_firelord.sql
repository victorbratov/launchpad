CREATE TABLE "DividendPayouts" (
	"BusPitchID" integer NOT NULL,
	"InvestorID" text NOT NULL,
	"BusAccountID" text NOT NULL,
	"DividendAmount" numeric NOT NULL,
	"DataPayedOut" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "TheBank" (
	"BankAccountNumber" varchar(34) PRIMARY KEY NOT NULL,
	"Ballance" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "DividendPayouts" ADD CONSTRAINT "DividendPayouts_BusPitchID_BusniessPitchs_BusPitchID_fk" FOREIGN KEY ("BusPitchID") REFERENCES "public"."BusniessPitchs"("BusPitchID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "DividendPayouts" ADD CONSTRAINT "DividendPayouts_InvestorID_InvestorAccounts_InvestorID_fk" FOREIGN KEY ("InvestorID") REFERENCES "public"."InvestorAccounts"("InvestorID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "DividendPayouts" ADD CONSTRAINT "DividendPayouts_BusAccountID_BusinessAccount_BusAccountID_fk" FOREIGN KEY ("BusAccountID") REFERENCES "public"."BusinessAccount"("BusAccountID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "BusinessAccount" ADD CONSTRAINT "BusinessAccount_BusBankAcc_TheBank_BankAccountNumber_fk" FOREIGN KEY ("BusBankAcc") REFERENCES "public"."TheBank"("BankAccountNumber") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "InvestorAccounts" ADD CONSTRAINT "InvestorAccounts_InvBankACNumber_TheBank_BankAccountNumber_fk" FOREIGN KEY ("InvBankACNumber") REFERENCES "public"."TheBank"("BankAccountNumber") ON DELETE no action ON UPDATE no action;