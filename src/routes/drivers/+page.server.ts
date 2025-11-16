import type { PageServerLoad } from './$types';
import { getAllDrivers, type DriverOverview } from '$lib/drivers';

export const load: PageServerLoad = async () => {
	try {
		let drivers: DriverOverview[] = await getAllDrivers();

		// Remove HTML from Driver column, keep only the link text
		drivers = drivers.map((d) => ({
			...d,
			driver: d.driver ? d.driver.replace(/<[^>]*>/g, '') : d.driver // remove all HTML tags
		}));
		return { drivers };
	} catch (err) {
		console.error('Error loading drivers from Supabase:', err);
		return { drivers: [] as DriverOverview[] };
	}
};

// Export type for frontend
export type DriverData = DriverOverview;
