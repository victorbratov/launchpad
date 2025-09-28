import { db } from "../../db";
import { InvestorAccounts } from "../schema";
import { eq } from "drizzle-orm";



//++++++ creating an investor account ++++++

export async function CreateInvestor({ email, Name, investorID, BankNumber, wallet }: { email: string; Name: string; investorID: string; BankNumber: string; wallet: string; }) {
  const userBeingInserted = await db.insert(InvestorAccounts).values({

    InvEmail: email,
    InvName: Name,
    InvestorID: investorID,
    InvBankACNumber: BankNumber,
    InvWallet: wallet

  });
}


export async function getInvBankNumber({ InvID, }: { InvID: string, }) {
  const banknumber = await db.select({
    InvestorEmail: InvestorAccounts.InvEmail, InvestorBankAccount: InvestorAccounts.InvBankACNumber
  }).from(InvestorAccounts).where(eq(InvestorAccounts.InvestorID, InvID))
  return banknumber
}



export async function DisplayAllInvestors() {
  const allAccounts = await db.select().from(InvestorAccounts);

  console.log(allAccounts);
}

//DisplayAllInvestors();
