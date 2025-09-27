import { pgTable, serial, varchar, integer, text, timestamp, numeric } from "drizzle-orm/pg-core"; //setting up what is needed 


        // InvestorAccounts
      
export const InvestorAccounts = pgTable("InvestorAccounts", {
  InvEmail: varchar("InvEmail", {length: 50}).notNull(),        // field for investor email
  InvName: varchar("InvName", {length: 100}).notNull(),  // investors name
  InvBankACNumber: varchar("InvBankACNumber", {length: 34}).notNull().references(() => TheBank.BankAccountNumber),     // investors bank account number
  InvestorID: text("InvestorID").notNull().primaryKey(),      // investors clerk ID 
  InvWallet: numeric("InvWallet", { precision: 15, scale: 2 }).notNull(), // timestamp
}); 


      //InvestmentLedger

export const InvestmentLedger = pgTable("InvestmentLedger", {
  InvestorID : text("InvestorID").notNull().references(() =>InvestorAccounts.InvestorID),        // field for investor email
  BusPitchID : integer("BusPitchID").notNull().references(() =>BusinessPitchs.BusPitchID),
  TierOfInvestment : varchar("TierOfInvestment", {length: 10}).notNull(),
  AmountInvested : numeric("AmountInvested").notNull(),
  shares : integer("Shares"),
});

      //Businessaccount


export const BusinessAccount = pgTable("BusinessAccount", {
  BusEmail : varchar("BusEmail", {length: 50}).notNull(),
  BusName: varchar("BusName", {length: 100}).notNull(),  
  BusAccountID: text("BusAccountID").notNull().primaryKey(),      // business clerk ID 

  BusBankAcc : varchar("BusBankAcc", {length: 34}).notNull().references(() => TheBank.BankAccountNumber),     // business bank account number
  BusWallet: numeric("BusWallet", { precision: 15, scale: 2 }).notNull(), // timestamp

  
});



      //BusniessPitchs


export const BusinessPitchs = pgTable("BusniessPitchs", {
  BusPitchID: serial("BusPitchID").primaryKey(), // auto-increment primary key
  BusAccountID: text("BusAccountID").notNull().references(() => BusinessAccount.BusAccountID ),  // reference to investor/user ID

  statusOfPitch: text("statusOfPitch").notNull(),

  ProductTitle: text("ProductTitle").notNull(),
  ElevatorPitch: text("ElevatorPitch").notNull(),
  DetailedPitch: text("DetailedPitch").notNull(),
  SuportingMedia: text("SuportingMedia"),

  TargetInvAmount: numeric("TargetInvAmount", { precision: 15, scale: 2 }).notNull(), // money
  InvestmentStart: timestamp("InvestmentStart").notNull(),
  InvestmentEnd: timestamp("InvestmentEnd").notNull(),
  InvProfShare: integer("InvProfShare").notNull(),

  pricePerShare: numeric("pricePerShare", { precision: 12, scale: 2 }).notNull(),

  bronseTierMulti: numeric("bronseTierMulti", { precision: 10, scale: 2 }).notNull(),
  bronseInvMax: integer("bronseInvMax").notNull(),

  silverTierMulti: numeric("silverTierMulti", { precision: 10, scale: 2 }).notNull(),
  silverInvMax: integer("silverInvMax").notNull(),

  goldTierMulti: numeric("goldTierMulti", { precision: 10, scale: 2 }).notNull(),
  goldTierMax: integer("goldTierMax").notNull(),

  dividEndPayout: timestamp("dividEndPayout").notNull(),
  DividEndPayoutPeriod: text("DividEndPayoutPeriod").notNull(),


});


      //TheBank#

  

export const TheBank = pgTable("TheBank", {


  BankAccountNumber : varchar("BankAccountNumber", {length: 34}).notNull().primaryKey(),     //  bank account number
  Ballance : numeric("Ballance", {precision: 10, scale: 2}).notNull(),
 
});


     //dividendPayouts
 
 
export const DividendPayouts = pgTable("DividendPayouts", {
 
  BusPitchID : integer("BusPitchID").notNull().references(() =>BusinessPitchs.BusPitchID),
  InvestorID : text("InvestorID").notNull().references(() =>InvestorAccounts.InvestorID),
  BusAccountID: text("BusAccountID").notNull().references(() => BusinessAccount.BusAccountID ),
  DividenndAmount: numeric("DividendAmount").notNull(),
  DataPayedOut: timestamp("DataPayedOut").notNull(),
 
});

