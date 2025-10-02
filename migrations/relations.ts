import { relations } from "drizzle-orm/relations";
import { businessAccount, businessPitchs, theBank, investorAccounts, investmentLedger, dividendPayouts } from "./schema";

export const businessPitchsRelations = relations(businessPitchs, ({one, many}) => ({
	businessAccount: one(businessAccount, {
		fields: [businessPitchs.busAccountId],
		references: [businessAccount.busAccountId]
	}),
	investmentLedgers: many(investmentLedger),
	dividendPayouts: many(dividendPayouts),
}));

export const businessAccountRelations = relations(businessAccount, ({one, many}) => ({
	businessPitchs: many(businessPitchs),
	theBank: one(theBank, {
		fields: [businessAccount.busBankAcc],
		references: [theBank.bankAccountNumber]
	}),
	dividendPayouts: many(dividendPayouts),
}));

export const theBankRelations = relations(theBank, ({many}) => ({
	businessAccounts: many(businessAccount),
	investorAccounts: many(investorAccounts),
}));

export const investorAccountsRelations = relations(investorAccounts, ({one, many}) => ({
	theBank: one(theBank, {
		fields: [investorAccounts.invBankAcNumber],
		references: [theBank.bankAccountNumber]
	}),
	investmentLedgers: many(investmentLedger),
	dividendPayouts: many(dividendPayouts),
}));

export const investmentLedgerRelations = relations(investmentLedger, ({one}) => ({
	investorAccount: one(investorAccounts, {
		fields: [investmentLedger.investorId],
		references: [investorAccounts.investorId]
	}),
	businessPitch: one(businessPitchs, {
		fields: [investmentLedger.busPitchId],
		references: [businessPitchs.busPitchId]
	}),
}));

export const dividendPayoutsRelations = relations(dividendPayouts, ({one}) => ({
	businessPitch: one(businessPitchs, {
		fields: [dividendPayouts.busPitchId],
		references: [businessPitchs.busPitchId]
	}),
	investorAccount: one(investorAccounts, {
		fields: [dividendPayouts.investorId],
		references: [investorAccounts.investorId]
	}),
	businessAccount: one(businessAccount, {
		fields: [dividendPayouts.busAccountId],
		references: [businessAccount.busAccountId]
	}),
}));