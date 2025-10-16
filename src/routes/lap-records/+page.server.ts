import type { PageServerLoad } from "../$types";

export type LapRecordRow = {
    DriverGUID: string;
    TrackName: string;
    CarModel: string;
    Platform: string;
    BestLap: string;
    Driver: string;
    BestLap_Num: string;
    'Lap Time': string;
};

function parseCsv(csv: string): LapRecordRow[] {
    const lines = csv.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length <= 1) return [];

    const normalize = (s: string) => s.trim().replace(/\s+/g, '_'); // replace spaces with underscores

    const headerMap: Record<string, keyof LapRecordRow> = {
        'DriverGUID': 'DriverGUID',
        'TrackName': 'TrackName',
        'CarModel': 'CarModel',
        'Platform': 'Platform',
        'BestLap': 'BestLap',
        'Driver': 'Driver',
        'BestLap_Num': 'BestLap_Num',
        'Lap_Time': 'Lap Time' // note: normalized
    };
    
    const rawHeaders = lines[0].split(',').map((h) => normalize(h.replace(/^"|"$/g, '')));
    
    const out: LapRecordRow[] = [];

    for (let i = 1; i < lines.length; i++) {
        const row: Partial<LapRecordRow> = {};
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));

        for (let j = 0; j < rawHeaders.length; j++) {
            const mapped = headerMap[rawHeaders[j]];
            if (!mapped) continue;
            row[mapped] = values[j];
        }

        out.push(row as LapRecordRow);
    }

    return out;
}


export const load: PageServerLoad = async () => {
    const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPXEpA0_3WvJmtxJTKZ97Bi8tbZWsjCZT892N4mNgdaMJyhO-Syh1Xn-Yf4KaGw9SAZjGRwjtCpjZb/pub?gid=462474009&single=true&output=csv';
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return { lapRecords: [] as LapRecordRow[] };
    const csv = await res.text();
    const lapRecords = parseCsv(csv);
    return { lapRecords };
};


