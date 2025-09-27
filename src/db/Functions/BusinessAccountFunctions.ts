import { PgNumeric } from "drizzle-orm/pg-core";


import { db } from "../../db";
import { BusinessAccount } from "../schema";
import { eq,sql} from "drizzle-orm";


//        +++ display all business accounts +++

export async function DisplayAllBusinessAccs() {
  const allAccounts = await db.select().from(BusinessAccount);

  console.log(allAccounts);
}


export async function CreateBusiness({businessEmail, businessName, BusinessAccountID, BankAccountNumber, wallet}: {businessEmail: string; businessName: string; BusinessAccountID:string; BankAccountNumber: string; wallet:string;} ){
  const userBeingInserted = await db.insert(BusinessAccount).values({

  BusEmail: businessEmail,
  BusName: businessName,
  BusAccountID: BusinessAccountID,
  BusBankAcc: BankAccountNumber,
  BusWallet: wallet

  });
}

export async function SubtractWallet(BankID: string, amount: number){

    return await db
    .update(BusinessAccount)
    .set({BusWallet: sql`${BusinessAccount.BusWallet} - ${amount}`,})
    .where(eq(BusinessAccount.BusBankAcc, BankID))
    .returning();
}


export async function AddWallet(BankID: string, amount: number){

    return await db
    .update(BusinessAccount)
    .set({BusWallet: sql`${BusinessAccount.BusWallet} + ${amount}`,})
    .where(eq(BusinessAccount.BusBankAcc, BankID))
    .returning();
}