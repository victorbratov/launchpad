/**
 * fetch list of images and videos from s3 bucket for a given ID
 * @param {string} pitchID - The ID of the pitch to fetch media for
 * @returns mediaKeys
 */
export async function fetchMedia(pitchID: string) {
    const BUCKET_URL = "https://launchpad-media-storage.s3.us-east-1.amazonaws.com/";
    const res = await fetch(`${BUCKET_URL}?list-type=2&prefix=${pitchID}/`);
    const data = await res.text();

    const parses = new DOMParser();
    const xml = parses.parseFromString(data, "application/xml");
    const items = xml.getElementsByTagName("Key");

    const mediaKeys: string[] = [];
    for (let i = 1; i < items.length; i++) {
        const key = items[i].textContent;
        if (key) {
            mediaKeys.push(key);
        }
    }
    return mediaKeys;
}

