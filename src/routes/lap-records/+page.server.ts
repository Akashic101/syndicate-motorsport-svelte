import type { PageServerLoad } from '../$types';
import { getAllLapRecords, type LapRecord } from '$lib/lapRecords';
import { getAllTrackAliases, createTrackAliasObject } from '$lib/trackAliases';

export const load: PageServerLoad = async () => {
	try {
		const [lapRecords, trackAliases] = await Promise.all([
			getAllLapRecords(),
			getAllTrackAliases()
		]);

		const trackAliasMap = createTrackAliasObject(trackAliases);

		return { lapRecords, trackAliasMap };
	} catch (error) {
		console.error('Error loading lap records:', error);
		return { lapRecords: [] as LapRecord[], trackAliasMap: {} };
	}
};
