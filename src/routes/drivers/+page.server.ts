import type { PageServerLoad } from './$types';

export type DriverRow = {
    Rank: number;
    Driver: string;
    ELO: string;
    License: string;
    'Safety Rating': string;
};

function parseCsv(csv: string): DriverRow[] {
    const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) return [];

    // Map sheet headers to our DriverRow keys
    const headerMap: Record<string, keyof DriverRow> = {
        'Rank': 'Rank',
        'Driver': 'Driver',
        'ELO': 'ELO',
        'License': 'License',
        'Safety Rating': 'Safety Rating'
    };

    const rawHeaders = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));

    const out: DriverRow[] = [];
    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
        const row: Partial<DriverRow> = {};
        for (let j = 0; j < rawHeaders.length; j++) {
            const mapped = headerMap[rawHeaders[j]];
            if (!mapped) continue;
            const value = cols[j] ?? '';
            if (mapped === 'Rank') {
                row[mapped] = Number(value || 0) as unknown as DriverRow[typeof mapped];
            } else {
                row[mapped] = value as unknown as DriverRow[typeof mapped];
            }
        }
        if (Object.keys(row).length > 0) out.push(row as DriverRow);
    }
    return out;
}

export const load: PageServerLoad = async () => {
    const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPXEpA0_3WvJmtxJTKZ97Bi8tbZWsjCZT892N4mNgdaMJyhO-Syh1Xn-Yf4KaGw9SAZjGRwjtCpjZb/pub?gid=254771285&single=true&output=csv';
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return { drivers: [] as DriverRow[] };
    const csv = await res.text();
    const drivers = parseCsv(csv);
    return { drivers };
};


