import { parseStringPromise } from "xml2js";

export async function fetchAllMedia(instanceId: string): Promise<string[]> {
  const bucketUrl = process.env.NEXT_PUBLIC_BUCKET_URL!;
  const endpoint = `${bucketUrl}?list-type=2&prefix=${instanceId}/`;

  const res = await fetch(endpoint);

  if (!res.ok) {
    throw new Error(`Failed to list objects for ${instanceId}: ${res.statusText}`);
  }

  const xmlText = await res.text();
  const parsed = await parseStringPromise(xmlText);

  const contents = parsed?.ListBucketResult?.Contents ?? [];
  const keys: string[] = contents
    .map((item: any) => item.Key?.[0]) // eslint-ignore-line @typescript-eslint/no-explicit-any
    .filter((key: string) => key && !key.endsWith("/"));

  const urls = keys.map((key) => `${bucketUrl}/${key}`);

  const featured = urls.find((url) => url.includes(`${instanceId}/featured/`));
  const others = urls.filter((url) => !url.includes(`${instanceId}/featured/`));

  return featured ? [featured, ...others] : others;
}

export async function fetchFeaturedMedia(instanceId: string): Promise<string | null> {
  const bucketUrl = process.env.NEXT_PUBLIC_BUCKET_URL!;
  const endpoint = `${bucketUrl}?list-type=2&prefix=${instanceId}/featured/`;

  const res = await fetch(endpoint);

  if (!res.ok) {
    throw new Error(`Failed to fetch featured object for ${instanceId}: ${res.statusText}`);
  }

  const xmlText = await res.text();
  const parsed = await parseStringPromise(xmlText);

  const contents = parsed?.ListBucketResult?.Contents ?? [];
  const key = contents.find((item: any) => item.Key?.[0] && !item.Key[0].endsWith("/"))?.Key?.[0]; // eslint-ignore-line @typescript-eslint/no-explicit-any

  return key ? `${bucketUrl}/${key}` : null;
}
