import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'championships.db');

// Lazy database initialization
let db: sqlite3.Database | null = null;
let isInitialized = false;

function getDatabase(): sqlite3.Database {
    if (!db) {
        db = new sqlite3.Database(dbPath);
    }
    return db;
}

function initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (isInitialized) {
            resolve();
            return;
        }

        const database = getDatabase();
        
        database.serialize(() => {
            // Create championships table if it doesn't exist
            database.run(`
                CREATE TABLE IF NOT EXISTS championships (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    description TEXT,
                    season TEXT,
                    discord_invite TEXT,
                    website TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                // Check if we already have data
                database.get('SELECT COUNT(*) as count FROM championships', (err, row: any) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    // Only insert sample data if table is empty
                    if (row.count === 0) {
                        const sampleChampionships = [
                            {
                                id: '2b6bfff2-8c01-450f-afee-03f881f3cfa4',
                                name: 'BTCC Championship 2024',
                                description: 'British Touring Car Championship featuring Honda Civic, Toyota Avensis, BMW 125i, Audi RS3, Ford Focus, and Alfa Romeo Giulietta',
                                season: 'Season 1',
                            },
                            {
                                id: '934c2506-1aa3-42da-9a1f-713093b41d3c',
                                name: 'Radical SR3XXR Championship',
                                description: 'Radical SR3XXR championship featuring high-performance prototype racing cars',
                                season: 'Season 1',
                            }
                        ];

                        // Insert sample data
                        const insertStmt = database.prepare(`
                            INSERT INTO championships (id, name, description, season, discord_invite, website)
                            VALUES (?, ?, ?, ?, ?, ?)
                        `);

                        sampleChampionships.forEach(championship => {
                            insertStmt.run(
                                championship.id,
                                championship.name,
                                championship.description,
                                championship.season,
                                '',
                                ''
                            );
                        });

                        insertStmt.finalize((err) => {
                            if (err) {
                                reject(err);
                            } else {
                                isInitialized = true;
                                resolve();
                            }
                        });
                    } else {
                        isInitialized = true;
                        resolve();
                    }
                });
            });
        });
    });
}

// Get all championships
export function getAllChampionships(): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
        try {
            await initializeDatabase();
            const database = getDatabase();
            const stmt = database.prepare('SELECT * FROM championships ORDER BY created_at DESC');
            stmt.all((err: any, rows: any[]) => {
                if (err) return reject(err);
                resolve(rows);
            });
        } catch (error) {
            reject(error);
        }
    });
}

// Get championship by ID
export function getChampionshipById(id: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            await initializeDatabase();
            const database = getDatabase();
            const stmt = database.prepare('SELECT * FROM championships WHERE id = ?');
            stmt.get(id, (err: any, row: any) => {
                if (err) return reject(err);
                resolve(row);
            });
        } catch (error) {
            reject(error);
        }
    });
}

// Add new championship
export function addChampionship(championship: {
    id: string;
    name: string;
    description?: string;
    season?: string;
}): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            await initializeDatabase();
            const database = getDatabase();
            const stmt = database.prepare(`
                INSERT OR REPLACE INTO championships (id, name, description, season, discord_invite, website)
                VALUES (?, ?, ?, ?, ?, ?)
            `);
            
            stmt.run(
                championship.id,
                championship.name,
                championship.description || '',
                championship.season || '',
                '',
                '',
                function(this: { changes: number }, err: any) {
                    if (err) return reject(err);
                    resolve({ id: championship.id, changes: this.changes });
                }
            );
        } catch (error) {
            reject(error);
        }
    });
}

// Close database connection
process.on('exit', () => {
    if (db) {
        db.close();
    }
});

process.on('SIGINT', () => {
    if (db) {
        db.close();
    }
    process.exit(0);
});

process.on('SIGTERM', () => {
    if (db) {
        db.close();
    }
    process.exit(0);
});