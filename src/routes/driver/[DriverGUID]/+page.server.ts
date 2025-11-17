import type { PageServerLoad } from './$types';
import { getDriverByGUID } from '$lib/drivers';
import { error } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';
import { getAllTrackAliases, createTrackAliasObject } from '$lib/trackAliases';

/**
 * Get Steam avatar URL from Steam ID64
 * Uses Steam's public profile page to extract avatar URL
 */
async function getSteamAvatar(steamId64: string | null): Promise<string | null> {
	if (!steamId64 || !/^\d{17}$/.test(steamId64)) {
		return null;
	}

	try {
		// Try Steam's XML endpoint first
		const response = await fetch(`https://steamcommunity.com/profiles/${steamId64}/?xml=1`, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
			}
		});

		if (response.ok) {
			const text = await response.text();
			// Parse XML to get avatar URL
			const avatarMatch = text.match(/<avatarFull><!\[CDATA\[(.*?)\]\]><\/avatarFull>/);
			if (avatarMatch && avatarMatch[1]) {
				return avatarMatch[1];
			}
		}

		// Fallback: Try to get from profile page HTML
		const htmlResponse = await fetch(`https://steamcommunity.com/profiles/${steamId64}`, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
			}
		});

		if (htmlResponse.ok) {
			const html = await htmlResponse.text();
			// Look for avatar in the page
			const avatarMatch = html.match(/playerAvatarAutoSizeInner.*?src="([^"]+)"/);
			if (avatarMatch && avatarMatch[1]) {
				return avatarMatch[1];
			}
		}

		return null;
	} catch (err) {
		console.error('Error fetching Steam avatar:', err);
		return null;
	}
}

export const load: PageServerLoad = async ({ params }) => {
	const { DriverGUID } = params;

	// Keep GUID as string since it's too large for safe integer conversion
	const driverGUID = DriverGUID;

	if (!driverGUID || driverGUID.trim() === '') {
		throw error(400, 'Invalid driver GUID');
	}

	try {
		const driver = await getDriverByGUID(driverGUID);

		if (!driver) {
			console.error(`[+page.server] Driver not found for GUID: ${driverGUID}`);
			throw error(404, 'Driver not found');
		}

		// Get Steam avatar if driver_guid is a Steam ID64
		const steamAvatar = await getSteamAvatar(driver.driver_guid);

		// Get elo_changes data for this driver
		const { data: elo_changes, error: elo_error } = await supabase
			.from('elo_changes')
			.select('*')
			.eq('driver_guid', driverGUID)
			.order('date', { ascending: true });

		if (elo_error) {
			console.error('Error fetching elo_changes:', elo_error);
		}

		// Get track aliases for proper track name display
		const trackAliases = await getAllTrackAliases();
		const trackAliasMap = createTrackAliasObject(trackAliases);

		return {
			driver,
			steamAvatar,
			elo_changes: elo_changes || [],
			trackAliasMap
		};
	} catch (err) {
		console.error(`[+page.server] Error loading driver ${driverGUID}:`, err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Failed to load driver data');
	}
};
