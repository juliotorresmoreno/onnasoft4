
export interface ImageLike {
    src?: string;
    previewUrl?: string;
    url?: string;
    alt?: string;
    width?: number;
    height?: number;
    meta?: { storageKey?: string };
}

export function getImageUrl(
    image: ImageLike | string | null | undefined,
): string | undefined {
    if (!image) return undefined;
    if (typeof image === "string") return image;
    if (image.src) return image.src;
    if (!image.meta?.storageKey) return undefined;
    return "/_emdash/api/media/file/" + image.meta.storageKey;
}