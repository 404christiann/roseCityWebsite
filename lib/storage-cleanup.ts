import { createClient } from "@/lib/supabase-browser";

type StorageUrlOptions = {
  bucket: string;
  allowedPrefixes?: string[];
};

export function storagePathFromPublicUrl(
  url: string | null | undefined,
  { bucket, allowedPrefixes }: StorageUrlOptions,
): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const marker = `/storage/v1/object/public/${bucket}/`;
    const markerIndex = parsed.pathname.indexOf(marker);
    if (markerIndex === -1) return null;

    const path = decodeURIComponent(parsed.pathname.slice(markerIndex + marker.length));
    if (!allowedPrefixes || allowedPrefixes.length === 0) return path;
    return allowedPrefixes.some((prefix) => path.startsWith(prefix)) ? path : null;
  } catch {
    return null;
  }
}

export async function deleteStorageUrls(
  bucket: string,
  urls: Array<string | null | undefined>,
  allowedPrefixes?: string[],
): Promise<void> {
  const paths = urls
    .map((url) => storagePathFromPublicUrl(url, { bucket, allowedPrefixes }))
    .filter((path): path is string => Boolean(path));

  await deleteStoragePaths(bucket, paths);
}

export async function deleteStoragePaths(bucket: string, paths: string[]): Promise<void> {
  const uniquePaths = Array.from(new Set(paths)).filter(Boolean);
  if (uniquePaths.length === 0) return;

  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).remove(uniquePaths);
  if (error) throw new Error(error.message);
}
