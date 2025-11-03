import type { PageServerLoad } from '../$types';
import { getAllLapRecords, type LapRecord } from '$lib/lapRecords';
import { getAllTrackAliases, createTrackAliasObject } from '$lib/trackAliases';
import { getAllCarAliases, createCarAliasObject } from '$lib/carAliases';

export const load: PageServerLoad = async () => {
	try {
		const [lapRecords, trackAliases, carAliases] = await Promise.all([
			getAllLapRecords(),
			getAllTrackAliases(),
			getAllCarAliases()
		]);

		const trackAliasMap = createTrackAliasObject(trackAliases);
		const carAliasMap = createCarAliasObject(carAliases);

		return { lapRecords, trackAliasMap, carAliasMap };
	} catch (error) {
		console.error('Error loading lap records:', error);
		return { lapRecords: [] as LapRecord[], trackAliasMap: {}, carAliasMap: {} };
	}
};
