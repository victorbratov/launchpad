import { NextResponse } from "next/server";
import { getAllPitches, getTotalPitchMoney } from "@/app/pitches/_actions";

export async function GET() {
  try {
    // get all pitches query 
    const pitches = await getAllPitches();
    
    // get investment totals for all pitches at once
    const investments = await getTotalPitchMoney();

    console.log("[API] Fetched pitches:", pitches);
    console.log("[API] Fetched investments:", investments);

    return NextResponse.json({
      pitches: pitches,
      investments: investments
    });
  } catch (error) {
    console.error("[API] Error fetching data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}