import type { PageServerLoad } from './$types';
import {
	getRaceSessionById,
	getRaceCarsBySessionId,
	getRaceLapsBySessionId,
	type RaceSession,
	type RaceCar,
	type RaceLap
} from '$lib/races';
import { getDriversByGUIDs } from '$lib/drivers';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const { raceId } = params;

	// Parse raceId as number
	const sessionId = parseInt(raceId);

	if (!raceId || isNaN(sessionId)) {
		throw error(400, 'Invalid race ID');
	}

	try {
		const race = await getRaceSessionById(sessionId);

		if (!race) {
			throw error(404, 'Race not found');
		}

		// Fetch race cars and laps in parallel
		const [cars, laps] = await Promise.all([
			getRaceCarsBySessionId(sessionId),
			getRaceLapsBySessionId(sessionId)
		]);

		// Get unique driver GUIDs from cars and laps
		const driverGUIDs = [
			...new Set([
				...cars.map((car) => car.driver_guid).filter((guid): guid is string => guid !== null),
				...laps.map((lap) => lap.driver_guid).filter((guid): guid is string => guid !== null)
			])
		];

		// Fetch driver information
		const driversMap = await getDriversByGUIDs(driverGUIDs);

		return {
			race,
			cars,
			laps,
			driversMap: Object.fromEntries(driversMap)
		};
	} catch (err) {
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		console.error('Error loading race:', err);
		throw error(500, 'Failed to load race data');
	}
};

