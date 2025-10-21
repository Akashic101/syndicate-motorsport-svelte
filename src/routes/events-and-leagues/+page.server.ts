import type { PageServerLoad } from './$types';
import { getAllChampionships } from '$lib/championships';

export const load: PageServerLoad = async () => {
    try {
        // Get all championships
        const championships = await getAllChampionships();
        
        return {
            championships
        };
        
    } catch (error) {
        console.error('Error loading events and leagues data:', error);
        return {
            championships: [],
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};
