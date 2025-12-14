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

		// Fetch start_elo from drivers table if not present in driver_data
		let start_elo = driver.start_elo;
		if (start_elo === null || start_elo === undefined) {
			const { data: driverData, error: driverError } = await supabase
				.from('drivers')
				.select('start_elo')
				.eq('driver_guid', driverGUID)
				.single();

			if (!driverError && driverData) {
				start_elo = driverData.start_elo;
			}
		}

		// Merge start_elo into driver object
		const driverWithStartElo = {
			...driver,
			start_elo: start_elo ?? 1500
		};

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

		// Get total count of all achievements
		const { count: totalAchievementsCount, error: totalCountError } = await supabase
			.from('achievements')
			.select('*', { count: 'exact', head: true });

		if (totalCountError) {
			console.error('Error fetching total achievements count:', totalCountError);
		}

		// Get total driver count for percentage calculation
		const { count: totalDriversCount, error: totalDriversError } = await supabase
			.from('drivers')
			.select('*', { count: 'exact', head: true });

		if (totalDriversError) {
			console.error('Error fetching total drivers count:', totalDriversError);
		}

		// Get driver achievements
		const { data: driverAchievements, error: achievementsError } = await supabase
			.from('driver_achievements')
			.select('id, unlocked_at, achievement_id, achievements(*)')
			.eq('driver_guid', driverGUID)
			.order('unlocked_at', { ascending: false });

		if (achievementsError) {
			console.error('Error fetching driver achievements:', achievementsError);
		}

		// Get unlock counts for all achievements from rarest_achievements view
		const { data: allRarestAchievements, error: allRarestError } = await supabase
			.from('rarest_achievements')
			.select('id, unlocked_count');

		if (allRarestError) {
			console.error('Error fetching all rarest achievements:', allRarestError);
		}

		// Create a map of achievement_id -> unlocked_count
		const unlockedCountMap = new Map(
			allRarestAchievements?.map((ra: any) => [ra.id, ra.unlocked_count]) || []
		);

		// Transform achievements data and deduplicate by achievement.id
		// (in case there are duplicate entries in driver_achievements)
		const achievementsMap = new Map<number, any>();
		driverAchievements
			?.filter(
				(da) =>
					da.achievements && typeof da.achievements === 'object' && !Array.isArray(da.achievements)
			)
			.forEach((da) => {
				const achievement = da.achievements as any;
				const achievementId = achievement.id;

				// Only add if we haven't seen this achievement ID before
				// If duplicate, keep the one with the earliest unlocked_at timestamp
				if (!achievementsMap.has(achievementId)) {
					const unlocked_count = unlockedCountMap.get(achievementId) || 0;
					const percentage = Math.min(
						totalDriversCount && totalDriversCount > 0
							? (unlocked_count / totalDriversCount) * 100
							: 0,
						100
					);
					achievementsMap.set(achievementId, {
						id: achievement.id,
						key: achievement.key,
						name: achievement.name,
						description: achievement.description,
						category: achievement.category,
						threshold: achievement.threshold,
						icon_url: achievement.icon_url,
						unlocked_at: da.unlocked_at,
						unlocked_count,
						percentage
					});
				} else {
					// If duplicate exists, keep the one with the earliest unlocked_at
					const existing = achievementsMap.get(achievementId);
					const existingDate = existing.unlocked_at
						? new Date(existing.unlocked_at).getTime()
						: Infinity;
					const newDate = da.unlocked_at ? new Date(da.unlocked_at).getTime() : Infinity;
					if (newDate < existingDate) {
						const unlocked_count = unlockedCountMap.get(achievementId) || 0;
						const percentage = Math.min(
							totalDriversCount && totalDriversCount > 0
								? (unlocked_count / totalDriversCount) * 100
								: 0,
							100
						);
						achievementsMap.set(achievementId, {
							id: achievement.id,
							key: achievement.key,
							name: achievement.name,
							description: achievement.description,
							category: achievement.category,
							threshold: achievement.threshold,
							icon_url: achievement.icon_url,
							unlocked_at: da.unlocked_at,
							unlocked_count,
							percentage
						});
					}
				}
			});

		const achievements = Array.from(achievementsMap.values());

		// Get rarest achievements for this driver
		// The rarest_achievements view shows all achievements ordered by rarity
		// We need to join with driver_achievements to get only achievements this driver has unlocked
		const { data: rarestAchievements, error: rarestError } = await supabase
			.from('rarest_achievements')
			.select(
				`
				id,
				key,
				name,
				category,
				subcategory,
				unlocked_count,
				driver_achievements!inner (
					unlocked_at,
					driver_guid
				)
			`
			)
			.eq('driver_achievements.driver_guid', driverGUID)
			.order('unlocked_count', { ascending: true })
			.limit(4);

		if (rarestError) {
			console.error('Error fetching rarest achievements:', rarestError);
		}

		// Get full achievement details including description, threshold, and icon_url
		// by joining with the achievements table
		const rarest_achievement_ids =
			rarestAchievements?.map((ra: any) => ra.id).filter((id: any) => id != null) || [];

		let rarest_achievements_full: any[] = [];

		if (rarest_achievement_ids.length > 0) {
			const { data: fullAchievements, error: fullError } = await supabase
				.from('achievements')
				.select('*')
				.in('id', rarest_achievement_ids);

			if (fullError) {
				console.error('Error fetching full rarest achievement details:', fullError);
			}

			// Get unlocked_at timestamps for these achievements
			const { data: driverRarestAchievements, error: driverRarestError } = await supabase
				.from('driver_achievements')
				.select('achievement_id, unlocked_at')
				.eq('driver_guid', driverGUID)
				.in('achievement_id', rarest_achievement_ids);

			if (driverRarestError) {
				console.error('Error fetching driver rarest achievements:', driverRarestError);
			}

			// Create a map of achievement_id -> unlocked_at
			const unlockedAtMap = new Map(
				driverRarestAchievements?.map((dra: any) => [dra.achievement_id, dra.unlocked_at]) || []
			);

			// Create a map of achievement_id -> unlocked_count from rarestAchievements
			const rarestUnlockedCountMap = new Map(
				rarestAchievements?.map((ra: any) => [ra.id, ra.unlocked_count]) || []
			);

			// Transform to match the same structure as regular achievements
			rarest_achievements_full =
				fullAchievements
					?.map((achievement: any) => {
						const unlocked_count = rarestUnlockedCountMap.get(achievement.id) || 0;
						const percentage = Math.min(
							totalDriversCount && totalDriversCount > 0
								? (unlocked_count / totalDriversCount) * 100
								: 0,
							100
						);
						return {
							id: achievement.id,
							key: achievement.key,
							name: achievement.name,
							description: achievement.description,
							category: achievement.category,
							threshold: achievement.threshold,
							icon_url: achievement.icon_url,
							unlocked_at: unlockedAtMap.get(achievement.id) || null,
							unlocked_count,
							percentage
						};
					})
					.filter((ra: any) => ra.id != null)
					// Sort by unlocked_count ascending (rarest first)
					.sort((a: any, b: any) => (a.unlocked_count || 0) - (b.unlocked_count || 0)) || [];
		}

		const rarest_achievements = rarest_achievements_full;

		return {
			driver: driverWithStartElo,
			steamAvatar,
			elo_changes: elo_changes || [],
			trackAliasMap,
			achievements,
			rarest_achievements,
			totalAchievementsCount: totalAchievementsCount || 0
		};
	} catch (err) {
		console.error(`[+page.server] Error loading driver ${driverGUID}:`, err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Failed to load driver data');
	}
};
