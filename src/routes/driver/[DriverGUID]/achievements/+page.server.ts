import type { PageServerLoad } from './$types';
import { getDriverByGUID } from '$lib/drivers';
import { error } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';

export const load: PageServerLoad = async ({ params }) => {
	const { DriverGUID } = params;

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

		// Fetch all achievements from the achievements table
		const { data: allAchievements, error: allAchievementsError } = await supabase
			.from('achievements')
			.select('*')
			.order('category', { ascending: true })
			.order('subcategory', { ascending: true })
			.order('threshold', { ascending: true });

		if (allAchievementsError) {
			console.error('Error fetching all achievements:', allAchievementsError);
		}

		// Fetch driver's unlocked achievements
		const { data: driverAchievements, error: achievementsError } = await supabase
			.from('driver_achievements')
			.select(
				`
				id,
				unlocked_at,
				achievements (
					id,
					key,
					name,
					description,
					category,
					subcategory,
					threshold,
					icon_url
				)
			`
			)
			.eq('driver_guid', driverGUID)
			.order('unlocked_at', { ascending: false });

		if (achievementsError) {
			console.error('Error fetching driver achievements:', achievementsError);
		}

		// Type definitions for Supabase query results
		type AchievementRow = {
			id: number;
			key: string | null;
			name: string | null;
			description: string | null;
			category: string | null;
			subcategory: string | null;
			threshold: number | null;
			icon_url: string | null;
		};

		type DriverAchievementRow = {
			id: number;
			unlocked_at: string;
			achievements: AchievementRow | null;
		};

		// Transform unlocked achievements
		const unlockedAchievements =
			(driverAchievements as DriverAchievementRow[] | null)
				?.filter((da) => da.achievements !== null)
				.map((da) => ({
					id: da.achievements!.id,
					key: da.achievements!.key,
					name: da.achievements!.name,
					description: da.achievements!.description,
					category: da.achievements!.category,
					subcategory: da.achievements!.subcategory,
					threshold: da.achievements!.threshold,
					icon_url: da.achievements!.icon_url,
					unlocked_at: da.unlocked_at
				})) || [];

		// Create a set of unlocked achievement IDs for quick lookup
		const unlockedIds = new Set(unlockedAchievements.map((a) => a.id));

		// Separate all achievements into unlocked and locked
		const achievements = ((allAchievements as AchievementRow[] | null) || []).map((achievement) => {
			const isUnlocked = unlockedIds.has(achievement.id);
			const unlockedData = unlockedAchievements.find((a) => a.id === achievement.id);

			return {
				id: achievement.id,
				key: achievement.key,
				name: achievement.name,
				description: achievement.description,
				category: achievement.category,
				subcategory: achievement.subcategory,
				threshold: achievement.threshold,
				icon_url: achievement.icon_url,
				unlocked: isUnlocked,
				unlocked_at: unlockedData?.unlocked_at || null
			};
		});

		return {
			driver,
			achievements
		};
	} catch (err) {
		console.error(`[+page.server] Error loading achievements for driver ${driverGUID}:`, err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Failed to load achievements data');
	}
};
