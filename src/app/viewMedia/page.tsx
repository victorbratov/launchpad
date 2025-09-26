"use client";
import { JSX } from "react";
import { S3Client } from "@aws-sdk/client-s3";
import { useEffect, useState } from "react";
import Image from "next/image";
import { fetchMedia } from "./s3Service";

/**
 * Test page to display media files
 * @returns {JSX.Element} The ViewMedia component
 * 
 * Note: This is a test page to display media files from S3 bucket.
 * In the future, this will be integrated into the detailed pitch page.
 *
*/
export default function ViewMedia() {
    const [pitchID, setPitchID] = useState("pitch2"); // this will come from the database in the future
    const BUCKET_URL = "https://launchpad-media-storage.s3.us-east-1.amazonaws.com/";
    const [images, setImages] = useState<string[]>([]);

    useEffect(() => {
        fetchMedia(pitchID).then(setImages);
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
                                data-testId="video"
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
            </main>
        </div>
    );
}
