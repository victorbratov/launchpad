"use client";
import { JSX } from "react";
import { S3Client } from "@aws-sdk/client-s3";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ImageResponse } from "next/server";

/**
 * Test page to display media files
*/
export default function Page() {
    const [pitchID, setPitchID] = useState("pitch2");
    const BUCKET_URL = "https://launchpad-media-storage.s3.us-east-1.amazonaws.com/";
    const [images, setImages] = useState<string[]>([]);
    useEffect(() => {
        async function load() {

            const res = await fetch(`${BUCKET_URL}?list-type=2&prefix=${pitchID}/`);
            const data = await res.text();

            const parses = new DOMParser();
            const xml = parses.parseFromString(data, "application/xml");
            const items = xml.getElementsByTagName("Key");

            const imageKeys: string[] = [];
            for (let i = 1; i < items.length; i++) {
                const key = items[i].textContent;
                if (key) {
                    imageKeys.push(key);
                }
            }
            setImages(imageKeys);
        }
        load();
    }, []);

    return (
        <div className="font-mono grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
            <header>
                <div className="w-full items-center text-4xl">
                    <h1>Launchpad</h1>
                </div>
            </header>
            <main className="flex flex-col gap-[32px] row-start-2 items-center">

                <div className="flex flex-col gap-[32px] row-start-2 items-center">
                    <h1 className="text-center">Pitch Title</h1>
                    <p className="w-1/2 text-center">This is some information about the pitch </p>
                    <p className="w-1/2 text-center">This is some very detailed information about the pitch</p>
                </div>

                <div className="flex flex-col gap-[32px] row-start-2 items-center">
                    <h1>Supporting Media</h1>
                    {images.map((image, index) =>
                        image.includes(".mp4") ? (
                            <video
                                key={index}
                                src={`${BUCKET_URL}${image}`}
                                width={400}
                                height={300}
                                controls
                            />
                        ) : (
                            <Image
                                key={index}
                                src={`${BUCKET_URL}${image}`}
                                alt={`Media ${index + 1}`}
                                width={400}
                                height={300}
                            />
                        )
                    )}
                </div>

                <div className="flex gap-4 items-center flex-col sm:flex-row">
                    <a
                        className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
                        href="/sign-in"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Log In
                    </a>
                    <a
                        className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
                        href="/signup"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Sign Up
                    </a>
                </div>
            </main>
        </div>
    );
}
