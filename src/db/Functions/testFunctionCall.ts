
import { InvestorAccounts } from "@/db/schema";
import { db } from "../../db";
//import { BusinessAccount } from "../../schema";

import {DisplayAllInvestors, CreateInvestor, getInvBankNumber} from "./InvestorAccountsFunctions"

// CreateInvestor({
//     email: "drizzler@yahoo", 
//     Name: "drizzler", 
//     investorID: "drizzelnumbers", 
//     BankNumber: "1029934", 
//     wallet: "192837.2"}
// )






async function main() {

  DisplayAllInvestors();  

  const bankNumber = await getInvBankNumber({ InvID: "drizzelnumbers" });
  console.log("Bank number:", bankNumber);
}

main();

