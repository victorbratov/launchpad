CREATE TABLE "BusinessAccount" (
	"BusEmail" varchar(50) NOT NULL,
	"BusName" varchar(100) NOT NULL,
	"BusAccountID" text PRIMARY KEY NOT NULL,
	"BusBankAcc" varchar(34) NOT NULL,
	"BusWallet" numeric(15, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "BusniessPitchs" (
	"BusPitchID" serial PRIMARY KEY NOT NULL,
	"BusAccountID" text NOT NULL,
	"statusOfPitch" text NOT NULL,
	"ProductTitle" text NOT NULL,
	"ElevatorPitch" text NOT NULL,
	"DetailedPitch" text NOT NULL,
	"SuportingMedia" text,
	"TargetInvAmount" numeric(15, 2) NOT NULL,
	"InvestmentStart" timestamp NOT NULL,
	"InvestmentEnd" timestamp NOT NULL,
	"InvProfShare" integer NOT NULL,
	"pricePerShare" numeric(12, 2) NOT NULL,
	"bronseTierMulti" numeric(10, 2) NOT NULL,
	"bronseInvMax" integer NOT NULL,
	"silverTierMulti" numeric(10, 2) NOT NULL,
	"silverInvMax" integer NOT NULL,
	"goldTierMulti" numeric(10, 2) NOT NULL,
	"goldTierMax" integer NOT NULL,
	"dividEndPayout" timestamp NOT NULL,
	"DividEndPayoutPeriod" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "InvestmentLedger" (
	"InvestorID" text NOT NULL,
	"BusPitchID" integer NOT NULL,
	"TierOfInvestment" varchar(10) NOT NULL,
	"AmountInvested" numeric NOT NULL,
	"Shares" integer
);
--> statement-breakpoint
CREATE TABLE "InvestorAccounts" (
	"InvEmail" varchar(50) NOT NULL,
	"InvName" varchar(100) NOT NULL,
	"InvBankACNumber" varchar(34) NOT NULL,
	"InvestorID" text PRIMARY KEY NOT NULL,
	"InvWallet" numeric(15, 2) NOT NULL
);
--> statement-breakpoint
DROP TABLE "products" CASCADE;--> statement-breakpoint
ALTER TABLE "BusniessPitchs" ADD CONSTRAINT "BusniessPitchs_BusAccountID_BusinessAccount_BusAccountID_fk" FOREIGN KEY ("BusAccountID") REFERENCES "public"."BusinessAccount"("BusAccountID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "InvestmentLedger" ADD CONSTRAINT "InvestmentLedger_InvestorID_InvestorAccounts_InvestorID_fk" FOREIGN KEY ("InvestorID") REFERENCES "public"."InvestorAccounts"("InvestorID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "InvestmentLedger" ADD CONSTRAINT "InvestmentLedger_BusPitchID_BusniessPitchs_BusPitchID_fk" FOREIGN KEY ("BusPitchID") REFERENCES "public"."BusniessPitchs"("BusPitchID") ON DELETE no action ON UPDATE no action;