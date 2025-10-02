import { InvestorAccounts } from "@/db/schema";
import { db } from "../../../db";
//import { BusinessAccount } from "../../schema";

import {createBusinessPitch, getTotalMoneyInvested, showAllBusinessPitches} from "../BusinessPitchsFunctions"


async function main() {


    // create an account function 

    // const newPitch = await createBusinessPitch({
    // BusAccountID: "Clerk_A2",
    // statusOfPitch: "pending",
    // ProductTitle: "test",
    // ElevatorPitch: "A test.",
    // DetailedPitch: "test",
    // TargetInvAmount: "1232.00",
    // InvestmentStart: new Date("2025-01-01"),
    // InvestmentEnd: new Date("2025-06-30"),
    // InvProfShare: 15,
    // pricePerShare: "10.00",
    // bronseTierMulti: "1.50",
    // bronseInvMax: 5000,
    // silverTierMulti: "2.00",
    // silverInvMax: 20000,
    // goldTierMulti: "3.00",
    // goldTierMax: 50000,
    // dividEndPayout: new Date("2026-01-01"),
    // DividEndPayoutPeriod: "Quarterly",
    // });

    // console.log(newPitch)

    // const groupOfPitches = await showAllBusinessPitches();
    // console.log(groupOfPitches);

    const testGetMoneyTotal = await getTotalMoneyInvested();
    console.log(testGetMoneyTotal);




}

main();