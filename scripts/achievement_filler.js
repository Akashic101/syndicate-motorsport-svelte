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
		.select('id, threshold, category');

	if (achError) throw achError;

	console.log(`Loaded ${achievements.length} achievements`);

	console.log('Fetching driver data...');
	const { data: drivers, error: driverError } = await supabase
		.from('driver_data')
		.select('driver_guid, race_starts, win_count, safety_rating')
		.not('driver_guid', 'is', null);

	if (driverError) throw driverError;

	console.log(`Processing ${drivers.length} drivers`);

	for (const driver of drivers) {
		const { driver_guid, race_starts, win_count, safety_rating } = driver;

		// map categories → comparable numeric values
		const stats = {
			races: race_starts ?? 0,
			wins: win_count ?? 0,
			safety: mapSafetyRating(safety_rating)
		};

		// achievements this driver qualifies for
		const eligible = achievements.filter((a) => stats[a.category] >= a.threshold);

		if (!eligible.length) continue;

		// fetch already unlocked
		const { data: unlocked } = await supabase
			.from('driver_achievements')
			.select('achievement_id')
			.eq('driver_guid', driver_guid);

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
				console.error(`Failed for driver ${driver_guid}:`, insertError.message);
			} else {
				console.log(`Unlocked ${toInsert.length} achievements for ${driver_guid}`);
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
