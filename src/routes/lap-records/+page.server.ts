import type { PageServerLoad } from "../$types";
import { getAllLapRecords, type LapRecord } from '$lib/lapRecords';

export const load: PageServerLoad = async () => {
    try {
        const lapRecords = await getAllLapRecords();
        return { lapRecords };
    } catch (error) {
        console.error('Error loading lap records:', error);
        return { lapRecords: [] as LapRecord[] };
    }
};


