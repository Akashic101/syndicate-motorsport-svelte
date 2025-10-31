/**
 * Utility functions for handling Supabase Storage image URLs
 */

import {
	PUBLIC_SUPABASE_STORAGE_BASE_URL,
	PUBLIC_SUPABASE_STORAGE_BUCKET_NAME
} from '$env/static/public';

/**
 * Converts a local image path to a Supabase Storage URL
 * @param localPath - Local image path (e.g., "/images/championships/logo.png")
 * @returns Supabase Storage URL or null if path is invalid
 */
export function getSupabaseImageUrl(localPath: string | null | undefined): string | null {
	if (!localPath) {
		return null;
	}

	// Extract filename from path (e.g., "/images/championships/logo.png" -> "logo.png")
	const filename = localPath.split('/').pop();
	if (!filename) {
		return null;
	}

	// Construct Supabase Storage public URL
	// Bucket name encoding handled via encodeURIComponent
	const bucketNameEncoded = encodeURIComponent(PUBLIC_SUPABASE_STORAGE_BUCKET_NAME);
	return `${PUBLIC_SUPABASE_STORAGE_BASE_URL}/${bucketNameEncoded}/${filename}`;
}
