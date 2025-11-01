import type { PageServerLoad } from './$types';
import { getAllRaceSessions, type RaceSession } from '$lib/races';

export const load: PageServerLoad = async () => {
	try {
		let races: RaceSession[] = await getAllRaceSessions();
		return { races };
	} catch (err) {
		console.error('Error loading races from Supabase:', err);
		return { races: [] as RaceSession[] };
	}
};

// Export type for frontend
export type RaceData = RaceSession;

