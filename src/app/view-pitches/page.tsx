"use client"
import React from "react";
import { useEffect, useState } from "react";
import { mockData } from "../components/Card/mockData";
import Card from "../components/Card";

/**
 * Page where an investor can discover available pitches
 * @returns Discover pitches page
 */
export default function DiscoverPitches() {
    const [data, setData] = useState<Array<{
        title: string;
        elevatorPitch: string;
        targetFunding: number;
        currentFunding: number;
        profitShare: number;
    }>>([]);

    useEffect(() => {
        setData(mockData);
    }, []);

    return (
        <div className="font-mono grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
            <header>
                <div className="w-full items-center text-4xl">
                    <h1>Launchpad</h1>
                </div>
            </header>
            <main className="font-sans flex flex-row grid grid-cols-1 md:grid-cols-3 gap-[32px] row-start-2 items-center sm:items-start">
                 {data.map((data, index) => (
                    <Card
                        key={index}
                        title={data.title}
                        elevatorPitch={data.elevatorPitch}
                        targetFunding={data.targetFunding}
                        currentFunding={data.currentFunding}
                        profitShare={data.profitShare}
                    />
                ))}
               
            </main>
            
        </div>
    );
}
