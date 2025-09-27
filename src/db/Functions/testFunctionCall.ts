
import { InvestorAccounts } from "@/db/schema";
import { db } from "../../db";
//import { BusinessAccount } from "../../schema";

import {DisplayAllInvestors, CreateInvestor, getInvBankNumber} from "./InvestorAccountsFunctions"

import {DisplayAllBusinessAccs, CreateBusiness, SubtractWallet, AddWallet} from "./BusinessAccountFunctions"

// CreateInvestor({
//     email: "drizzler@yahoo", 
//     Name: "drizzler", 
//     investorID: "drizzelnumbers", 
//     BankNumber: "1029934", 
//     wallet: "192837.2"}
// )






async function main() {

  //   +++  Investor test calls  +++

  //DisplayAllInvestors();  

  //const bankNumber = await getInvBankNumber({ InvID: "drizzelnumbers" });
  //console.log("Bank number:", bankNumber);




  const subt = await SubtractWallet("66687654", 0)

  const addt = await AddWallet("66618271", 1301.00)

  // const newBusiness = await CreateBusiness({ 
  //   businessEmail : "amazon@yahoo" , 
  //   businessName : "amazon prime" , 
  //   BusinessAccountID : "019029983",
  //   BankAccountNumber : "01928128",
  //   wallet : "18727287.21"})

  const y = await DisplayAllBusinessAccs();




}

main();

