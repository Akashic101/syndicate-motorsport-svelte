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

	const driver = await getDriverByGUID(driverGUID);

	if (!driver) {
		throw error(404, 'Driver not found');
	}

	return {
		driver
	};
};
