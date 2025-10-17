import type { PageServerLoad } from './$types';
import { getAllDrivers, type DriverRow } from '$lib/db';

export const load: PageServerLoad = async () => {
    try {
        let drivers: DriverRow[] = await getAllDrivers();

        // Remove HTML from Driver column, keep only the link text
        drivers = drivers.map(d => ({
            ...d,
            Driver: d.Driver.replace(/<[^>]*>/g, '') // remove all HTML tags
        }));
        return { drivers };
    } catch (err) {
        console.error('Error loading drivers from DB:', err);
        return { drivers: [] as DriverRow[] };
    }
};

// Export type for frontend
export type DriverData = DriverRow;
