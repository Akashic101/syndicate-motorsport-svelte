import type { PageServerLoad } from './$types';
import { getDriverByGUID } from '$lib/drivers';
import { error } from '@sveltejs/kit';

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

		return {
			driver
		};
	} catch (err) {
		console.error(`[+page.server] Error loading driver ${driverGUID}:`, err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Failed to load driver data');
	}
};
