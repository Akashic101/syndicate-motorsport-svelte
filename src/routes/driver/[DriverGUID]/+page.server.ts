import type { PageServerLoad } from './$types';
import { getDriverByGUID } from '$lib/drivers';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
    const { DriverGUID } = params;
    
    // Convert string to number for Supabase query
    const driverGUID = parseInt(DriverGUID);
    if (isNaN(driverGUID)) {
        throw error(400, 'Invalid driver GUID');
    }
    
    const driver = await getDriverByGUID(driverGUID);
    
    if (!driver) {
        throw error(404, 'Driver not found');
    }
    
    console.log(driver)
    return {
        driver
    };
};