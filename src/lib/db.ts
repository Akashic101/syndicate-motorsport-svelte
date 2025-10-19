import { db } from '../../db'; // adjust path to your sqlite db.js

type EventRow = {
    event: string;
    time: number; // timestamp in milliseconds
};

export function getEvents(): Promise<EventRow[]> {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                event,
                time
            FROM events
            ORDER BY time ASC
        `;
        db.all(sql, [], (err: any, rows: EventRow[]) => {
            if (err) return reject(err);
            resolve(rows as EventRow[]);
        });
    });
}

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

export function getLapRecords(): Promise<LapRecordRow[]> {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                driver_guid AS DriverGUID,
                track_name AS TrackName,
                car_model AS CarModel,
                platform AS Platform,
                best_lap AS BestLap,
                driver AS Driver,
                best_lap_num AS BestLap_Num,
                lap_time AS "Lap Time"
            FROM lap_records
            ORDER BY 
                CASE 
                    WHEN lap_time LIKE '%:%:%' THEN 
                        CAST(SUBSTR(lap_time, 1, 2) AS INTEGER) * 3600 + 
                        CAST(SUBSTR(lap_time, 4, 2) AS INTEGER) * 60 + 
                        CAST(SUBSTR(lap_time, 7) AS REAL)
                    WHEN lap_time LIKE '%:%' THEN 
                        CAST(SUBSTR(lap_time, 1, INSTR(lap_time, ':') - 1) AS INTEGER) * 60 + 
                        CAST(SUBSTR(lap_time, INSTR(lap_time, ':') + 1) AS REAL)
                    ELSE 
                        CAST(lap_time AS REAL)
                END ASC
        `;
        db.all(sql, [], (err: any, rows: LapRecordRow[]) => {
            if (err) return reject(err);
            resolve(rows as LapRecordRow[]);
        });
    });
}