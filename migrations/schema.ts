import { pgTable, foreignKey, serial, text, numeric, timestamp, integer, varchar } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const businessPitchs = pgTable("BusinessPitchs", {
	busPitchId: serial("BusPitchID").primaryKey().notNull(),
	busAccountId: text("BusAccountID").notNull(),
	statusOfPitch: text().notNull(),
	productTitle: text("ProductTitle").notNull(),
	elevatorPitch: text("ElevatorPitch").notNull(),
	detailedPitch: text("DetailedPitch").notNull(),
	suportingMedia: text("SuportingMedia"),
	targetInvAmount: numeric("TargetInvAmount", { precision: 15, scale:  2 }).notNull(),
	investmentStart: timestamp("InvestmentStart", { mode: 'string' }).notNull(),
	investmentEnd: timestamp("InvestmentEnd", { mode: 'string' }).notNull(),
	invProfShare: integer("InvProfShare").notNull(),
	pricePerShare: numeric({ precision: 12, scale:  2 }).notNull(),
	bronseTierMulti: numeric({ precision: 10, scale:  2 }).notNull(),
	bronseInvMax: integer().notNull(),
	silverTierMulti: numeric({ precision: 10, scale:  2 }).notNull(),
	silverInvMax: integer().notNull(),
	goldTierMulti: numeric({ precision: 10, scale:  2 }).notNull(),
	goldTierMax: integer().notNull(),
	dividEndPayout: timestamp({ mode: 'string' }).notNull(),
	dividEndPayoutPeriod: text("DividEndPayoutPeriod").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.busAccountId],
			foreignColumns: [businessAccount.busAccountId],
			name: "BusniessPitchs_BusAccountID_BusinessAccount_BusAccountID_fk"
		}),
]);

export const businessAccount = pgTable("BusinessAccount", {
	busEmail: varchar("BusEmail", { length: 50 }).notNull(),
	busName: varchar("BusName", { length: 100 }).notNull(),
	busAccountId: text("BusAccountID").primaryKey().notNull(),
	busBankAcc: varchar("BusBankAcc", { length: 34 }).notNull(),
	busWallet: numeric("BusWallet", { precision: 15, scale:  2 }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.busBankAcc],
			foreignColumns: [theBank.bankAccountNumber],
			name: "BusinessAccount_BusBankAcc_TheBank_BankAccountNumber_fk"
		}),
]);

export const investorAccounts = pgTable("InvestorAccounts", {
	invEmail: varchar("InvEmail", { length: 50 }).notNull(),
	invName: varchar("InvName", { length: 100 }).notNull(),
	invBankAcNumber: varchar("InvBankACNumber", { length: 34 }).notNull(),
	investorId: text("InvestorID").primaryKey().notNull(),
	invWallet: numeric("InvWallet", { precision: 15, scale:  2 }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.invBankAcNumber],
			foreignColumns: [theBank.bankAccountNumber],
			name: "InvestorAccounts_InvBankACNumber_TheBank_BankAccountNumber_fk"
		}),
]);

export const investmentLedger = pgTable("InvestmentLedger", {
	investorId: text("InvestorID").notNull(),
	busPitchId: integer("BusPitchID").notNull(),
	tierOfInvestment: varchar("TierOfInvestment", { length: 10 }).notNull(),
	amountInvested: numeric("AmountInvested").notNull(),
	shares: integer("Shares"),
}, (table) => [
	foreignKey({
			columns: [table.investorId],
			foreignColumns: [investorAccounts.investorId],
			name: "InvestmentLedger_InvestorID_InvestorAccounts_InvestorID_fk"
		}),
	foreignKey({
			columns: [table.busPitchId],
			foreignColumns: [businessPitchs.busPitchId],
			name: "InvestmentLedger_BusPitchID_BusniessPitchs_BusPitchID_fk"
		}),
]);

export const dividendPayouts = pgTable("DividendPayouts", {
	busPitchId: integer("BusPitchID").notNull(),
	investorId: text("InvestorID").notNull(),
	busAccountId: text("BusAccountID").notNull(),
	dividendAmount: numeric("DividendAmount").notNull(),
	dataPayedOut: timestamp("DataPayedOut", { mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.busPitchId],
			foreignColumns: [businessPitchs.busPitchId],
			name: "DividendPayouts_BusPitchID_BusniessPitchs_BusPitchID_fk"
		}),
	foreignKey({
			columns: [table.investorId],
			foreignColumns: [investorAccounts.investorId],
			name: "DividendPayouts_InvestorID_InvestorAccounts_InvestorID_fk"
		}),
	foreignKey({
			columns: [table.busAccountId],
			foreignColumns: [businessAccount.busAccountId],
			name: "DividendPayouts_BusAccountID_BusinessAccount_BusAccountID_fk"
		}),
]);

export const theBank = pgTable("TheBank", {
	bankAccountNumber: varchar("BankAccountNumber", { length: 34 }).primaryKey().notNull(),
	ballance: numeric("Ballance", { precision: 10, scale:  2 }).notNull(),
});
