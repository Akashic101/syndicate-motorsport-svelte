import type { PageServerLoad } from "../$types";
import { getLapRecords, type LapRecordRow } from '$lib/lapRecords';

export const load: PageServerLoad = async () => {
    try {
        const lapRecords = await getLapRecords();
        return { lapRecords };
    } catch (error) {
        console.error('Error loading lap records:', error);
        return { lapRecords: [] as LapRecordRow[] };
    }
};


