import type { PageServerLoad } from './$types';
import { getDriverByGUID } from '$lib/db';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
    const { DriverGUID } = params;
    
    const driver = await getDriverByGUID(DriverGUID);
    
    if (!driver) {
        throw error(404, 'Driver not found');
    }
    
    console.log(driver)
    return {
        driver
    };
};