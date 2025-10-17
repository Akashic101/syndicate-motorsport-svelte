import { db } from '../../db'; // adjust path to your sqlite db.js

export type DriverRow = {
    Rank: number;
    Driver: string;
    ELO: string;
    License: string;
    'Safety Rating': string;
};

export function getAllDrivers(): Promise<DriverRow[]> {
    return new Promise((resolve, reject) => {
        const sql = `SELECT rank AS Rank, driver AS Driver, elo AS ELO, license AS License, safety_rating AS "Safety Rating" FROM driver_overview`;
        db.all(sql, [], (err: any, rows: DriverRow[]) => {
            if (err) return reject(err);
            resolve(rows as DriverRow[]);
        });
    });
}
