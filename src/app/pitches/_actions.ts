"use server";

import {db} from "../../db"
import { BusinessPitchs } from "@/db/schema";
import {showAllBusinessPitches, getTotalMoneyInvested} from "../../db/Functions/BusinessPitchsFunctions";

export async function getAllPitches() {
const pitches = await showAllBusinessPitches();
    return pitches
}

export async function getTotalPitchMoney() {
    const investmentData = await getTotalMoneyInvested();
    return investmentData;
}