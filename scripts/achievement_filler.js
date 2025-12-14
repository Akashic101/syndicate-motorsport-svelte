import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
	process.env.PUBLIC_SUPABASE_URL,
	process.env.PUBLIC_SUPABASE_ANON_KEY
);

async function backfillAchievements() {
	console.log('Fetching achievements...');
	const { data: achievements, error: achError } = await supabase
		.from('achievements')
		.select('id, key, threshold, category, subcategory');

	if (achError) throw achError;
	console.log(`Loaded ${achievements.length} achievements`);

	console.log('Fetching driver data...');
	const { data: drivers, error: driverError } = await supabase
		.from('driver_data')
		.select('driver_guid, race_starts, win_count, safety_rating, driver')
		.not('driver_guid', 'is', null);

	if (driverError) throw driverError;
	console.log(`Loaded ${drivers.length} drivers`);

	console.log('Fetching lap counts from view...');
	const { data: lapCounts, error: lapError } = await supabase
		.from('driver_lap_counts')
		.select('driver_guid, total_laps_driven');

	if (lapError) throw lapError;

	const lapsByDriver = Object.fromEntries(
		lapCounts.map((r) => [r.driver_guid, r.total_laps_driven])
	);

	console.log(`Processing ${drivers.length} drivers`);

	for (const driver of drivers) {
		const { driver_guid, race_starts, win_count, safety_rating, driver: name } = driver;
		if (!name) continue;

		const statsMap = {
			races: race_starts ?? 0,
			wins: win_count ?? 0,
			safety: mapSafetyRating(safety_rating),
			laps_driven: lapsByDriver[driver_guid] ?? 0
		};

		const eligible = achievements.filter((a) => {
			if (!a.key) return false;

			// Lap record achievements
			if (a.key.startsWith('lap_records')) {
				return statsMap['laps_driven'] >= a.threshold;
			}

			// Safety rating achievements
			if (a.category === 'safety') {
				return statsMap['safety'] >= a.threshold;
			}

			// All other achievements use category mapping
			return statsMap[a.category] >= a.threshold;
		});

		if (!eligible.length) continue;

		const { data: unlocked, error: unlockError } = await supabase
			.from('driver_achievements')
			.select('achievement_id')
			.eq('driver_guid', driver_guid);

		if (unlockError) {
			console.error(`Failed to fetch unlocked achievements for ${driver_guid}`);
			continue;
		}

		const unlockedIds = new Set((unlocked ?? []).map((a) => a.achievement_id));

		const toInsert = eligible
			.filter((a) => !unlockedIds.has(a.id))
			.map((a) => ({
				driver_guid,
				achievement_id: a.id
			}));

		if (toInsert.length) {
			const { error: insertError } = await supabase.from('driver_achievements').insert(toInsert);

			if (insertError) {
				console.error(`Failed to insert achievements for ${driver_guid}:`, insertError.message);
			} else {
				console.log(`Unlocked ${toInsert.length} achievements for ${name}`);
			}
		}
	}

	console.log('Backfill complete ✅');
}

function mapSafetyRating(rating) {
	if (!rating) return 0;
	switch (rating.toUpperCase()) {
		case 'C':
			return 1;
		case 'B':
			return 2;
		case 'A':
			return 3;
		case 'S':
			return 4;
		default:
			return 0;
	}
}

backfillAchievements().catch((err) => {
	console.error(err);
	process.exit(1);
});
