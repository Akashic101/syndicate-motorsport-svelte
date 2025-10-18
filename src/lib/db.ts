import { db } from '../../db'; // adjust path to your sqlite db.js

export type DriverRow = {
    Rank: number;
    Driver: string;
    ELO: string;
    License: string;
    'Safety Rating': string;
    DriverGUID: string;
};

export function getAllDrivers(): Promise<DriverRow[]> {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                rank AS Rank, 
                driver AS Driver, 
                elo AS ELO, 
                license AS License, 
                safety_rating AS "Safety Rating",
                driver_guid AS DriverGUID
            FROM driver_overview
        `;
        db.all(sql, [], (err: any, rows: DriverRow[]) => {
            if (err) return reject(err);
            console.table(rows)
            resolve(rows as DriverRow[]);
        });
    });
}
export function getDriverByGUID(driverGUID: string): Promise<DriverRow | null> {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                rank AS Rank, 
                driver AS Driver, 
                elo AS ELO, 
                license AS License, 
                safety_rating AS "Safety Rating",
                driver_guid AS DriverGUID
            FROM driver_overview 
            WHERE driver_guid = ?
        `;
        db.get(sql, [driverGUID], (err: any, row: DriverRow | undefined) => {
            if (err) return reject(err);
            resolve(row || null);
        });
    });
}

export type EventRow = {
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