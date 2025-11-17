/**
 * Get Steam avatar URL for a user
 * @param steamId64 Steam ID64 (17-digit number as string)
 * @param size Avatar size: 'small', 'medium', 'full', or 'large' (default: 'full')
 * @returns Steam CDN URL for the avatar, or null if invalid
 */
export function getSteamAvatarURL(
	steamId64: string | null,
	size: 'small' | 'medium' | 'full' | 'large' = 'full'
): string | null {
	if (!steamId64) return null;

	// Validate Steam ID64 format (should be 17 digits)
	if (!/^\d{17}$/.test(steamId64)) {
		return null;
	}

	// Steam avatar sizes mapping
	const sizeMap = {
		small: '',
		medium: '_medium',
		full: '_full',
		large: '_full' // Steam uses _full for large avatars
	};

	// Note: To get the actual avatar, we need the avatar hash from Steam API
	// For now, we'll use a placeholder that can be replaced with actual API call
	// The format is: https://avatars.steamstatic.com/{avatar_hash}{size}.jpg

	// Since we don't have the avatar hash, we'll need to fetch it from Steam API
	// This is a placeholder - you'll need to implement the API call server-side
	return null;
}

/**
 * Get Steam profile URL
 * @param steamId64 Steam ID64
 * @returns Steam community profile URL
 */
export function getSteamProfileURL(steamId64: string | null): string | null {
	if (!steamId64 || !/^\d{17}$/.test(steamId64)) return null;
	return `https://steamcommunity.com/profiles/${steamId64}`;
}
