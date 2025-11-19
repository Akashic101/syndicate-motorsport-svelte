/**
 * Utility functions for handling Supabase Storage image URLs
 */

import { PUBLIC_SUPABASE_STORAGE_BUCKET_NAME } from '$env/static/public';

/**
 * Converts a local image path to a Supabase Storage URL
 * @param localPath - Local image path (e.g., "/images/championships/logo.png")
 * @returns Supabase Storage URL or null if path is invalid
 */
export function getSupabaseImageUrl(localPath: string | null | undefined): string | null {
	if (!localPath) return null;

	// If the path is already an absolute URL, return it as-is
	if (/^https?:\/\//i.test(localPath)) {
		return localPath;
	}

	const sanitizedPath = localPath.replace(/^\/+/, '');
	if (!sanitizedPath) return null;

	const pathSegments = sanitizedPath.split('/').filter(Boolean);
	if (pathSegments.length === 0) return null;

	let bucket = PUBLIC_SUPABASE_STORAGE_BUCKET_NAME;

	// If the path already starts with the bucket name, strip it from the object key.
	if (pathSegments[0] === bucket) {
		pathSegments.shift();
	}

	// Allow overriding the bucket using a "bucket::path" convention if needed.
	if (sanitizedPath.includes('::')) {
		const [bucketPart, ...rest] = sanitizedPath.split('::');
		if (bucketPart && rest.length) {
			bucket = bucketPart;
			pathSegments.length = 0;
			pathSegments.push(...rest.join('::').split('/').filter(Boolean));
		}
	}

	if (pathSegments.length === 0) return null;

	let objectSegments = [...pathSegments];

	// If we're using the default bucket and no override was provided,
	// most of our assets live at the bucket root, so keep only the filename.
	if (!sanitizedPath.includes('::') && bucket === PUBLIC_SUPABASE_STORAGE_BUCKET_NAME) {
		objectSegments = [pathSegments[pathSegments.length - 1]];
	}

	const bucketNameEncoded = encodeURIComponent(bucket);
	const objectKey = encodeURIComponent(objectSegments.join('/'));

	return `/api/storage-image?bucket=${bucketNameEncoded}&key=${objectKey}`;
}
