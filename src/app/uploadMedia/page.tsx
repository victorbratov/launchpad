'use client';
import { Group, Text } from '@mantine/core';
import { useState } from 'react';
import { IconUpload, IconPhoto, IconX } from '@tabler/icons-react';
import { Dropzone, DropzoneProps, IMAGE_MIME_TYPE } from '@mantine/dropzone';

/**
 * Page to allow users to upload media to their pitch
 * @returns {JSX.Element} The UploadMedia component
 * 
 * Note: This is a test page to allow users to upload media files to S3 bucket.
 * In the future, this will be integrated into the create pitch page.
 */

export default function UploadMedia() {
    const [status, setStatus] = useState("idle"); // To track upload status

    const uploadMedia = async (file: File) => {
        const pitchID = "pitch2"; // This will be dynamic in the future, based on pitch id
        const BUCKET_URL = "https://launchpad-media-storage.s3.us-east-1.amazonaws.com/";
        

        setStatus("processing");
        // upload file to S3 bucket
        const response = await fetch(`${BUCKET_URL}${pitchID}/${file.name}`, {
            method: 'PUT',
            headers: {
                'Content-Type': file.type,
            },
            body: file,
        });
        if (response.ok) {
            setStatus("success");
        } else {
            setStatus("failed");
        }
    };

    return (
        <div className="font-mono grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
            <header>
                <div className="w-full items-center text-4xl">
                    <h1>Launchpad</h1>
                </div>
            </header>
            <main className="flex flex-col gap-[32px] row-start-2 items-center">
                <div className="flex flex-col gap-[32px] row-start-2 items-center">
                    <h1 className="text-center">Upload Media</h1>
                    <p className="w-1/2 text-center">This page allows users to upload media files to their pitch</p>
                </div>
                <div className="flex gap-4 items-center flex-col sm:flex-row">
                    <Dropzone
                        onDrop={(files) => files.forEach(file => uploadMedia(file))}
                        onReject={(files) => setStatus("failed")}
                        maxSize={100 * 1024 ** 2} // 100mb currently but can be changed
                        accept={{
                            'image/*': [], // All images
                            'video/*': [], // all videos
                        }}
                        styles={{ root: { width: 300, height: 220, borderWidth: 1, borderStyle: 'solid', padding: '2rem', backgroundColor: "#ababab", color: "#000000"} }}
                        data-testid="dropzone"
                    >
                        <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
                            <Dropzone.Accept>
                                <IconUpload size={52} color="green" stroke={1.5} />
                            </Dropzone.Accept>
                            <Dropzone.Reject>
                                <IconX size={52} color="red" stroke={1.5} />
                            </Dropzone.Reject>
                            <Dropzone.Idle>
                                <IconPhoto size={52} color="#000000" stroke={1.5} />
                               {status=="processing" && <Text size="sm" inline>Uploading...</Text>} 
                               {status=="success" &&
                               <>
                                <Text size="sm" data-testid="success" style={{color: "green"}} inline>Upload successful!</Text>
                                <Text size="sm" inline>Drag images or videos here or click to select files</Text>
                                </>
                               }
                               {status=="failed" && 
                                <>
                                <Text size="sm" data-testid="fail" style={{color: "red"}} >Error uploading file</Text>
                                <Text size="sm" inline>Drag images or videos here or click to select files</Text>
                                </>
                                }
                                {status=="idle" && <Text size="sm" inline>Drag images or videos here or click to select files</Text>}
                                
                            </Dropzone.Idle>

                            <div>
                                
                            </div>
                        </Group>
                    </Dropzone>
                    
                </div>
            </main>
        </div>
    );
}
