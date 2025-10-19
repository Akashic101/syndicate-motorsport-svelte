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
                    image_path TEXT,
                    start_date TEXT,
                    end_date TEXT,
                    round_count INTEGER DEFAULT 0,
                    status TEXT DEFAULT 'planned',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                // Add new columns if they don't exist (for existing databases)
                database.run(`
                    ALTER TABLE championships ADD COLUMN image_path TEXT DEFAULT ''
                `, (err) => {
                    // Ignore error if column already exists
                });
                
                database.run(`
                    ALTER TABLE championships ADD COLUMN start_date TEXT DEFAULT ''
                `, (err) => {
                    // Ignore error if column already exists
                });
                
                database.run(`
                    ALTER TABLE championships ADD COLUMN end_date TEXT DEFAULT ''
                `, (err) => {
                    // Ignore error if column already exists
                });
                
                database.run(`
                    ALTER TABLE championships ADD COLUMN round_count INTEGER DEFAULT 0
                `, (err) => {
                    // Ignore error if column already exists
                });
                
                database.run(`
                    ALTER TABLE championships ADD COLUMN status TEXT DEFAULT 'planned'
                `, (err) => {
                    // Ignore error if column already exists
                });

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
                                image_path: '/images/championships/btcc-championship.png',
                                start_date: '2024-01-15',
                                end_date: '2024-12-15',
                                round_count: 12,
                                status: 'finished'
                            },
                            {
                                id: '934c2506-1aa3-42da-9a1f-713093b41d3c',
                                name: 'Radical SR3XXR Championship',
                                description: 'Radical SR3XXR championship featuring high-performance prototype racing cars',
                                season: 'Season 1',
                                image_path: '/images/championships/radical-championship.png',
                                start_date: '2024-02-01',
                                end_date: '2024-11-30',
                                round_count: 8,
                                status: 'finished'
                            },
                            {
                                id: 'test-running-2025',
                                name: 'Formula 1 Championship 2025',
                                description: 'Current Formula 1 season with all teams and drivers',
                                season: 'Season 2025',
                                image_path: '/images/championships/f1-2025.png',
                                start_date: '2025-03-15',
                                end_date: '2025-12-07',
                                round_count: 24,
                                status: 'running'
                            },
                            {
                                id: 'test-planned-2025',
                                name: 'Le Mans 24 Hours 2025',
                                description: 'Endurance racing championship featuring prototype and GT cars',
                                season: 'Season 2025',
                                image_path: '/images/championships/lemans-2025.png',
                                start_date: '2025-06-14',
                                end_date: '2025-06-15',
                                round_count: 1,
                                status: 'planned'
                            }
                        ];

                        // Insert sample data
                        const insertStmt = database.prepare(`
                            INSERT INTO championships (id, name, description, season, discord_invite, website, image_path, start_date, end_date, round_count, status)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `);

                        sampleChampionships.forEach(championship => {
                            insertStmt.run(
                                championship.id,
                                championship.name,
                                championship.description,
                                championship.season,
                                '',
                                '',
                                championship.image_path,
                                championship.start_date,
                                championship.end_date,
                                championship.round_count,
                                championship.status
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
    discord_invite?: string;
    website?: string;
    image_path?: string;
    start_date?: string;
    end_date?: string;
    round_count?: number;
    status?: string;
}): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            await initializeDatabase();
            const database = getDatabase();
            const stmt = database.prepare(`
                INSERT OR REPLACE INTO championships (id, name, description, season, discord_invite, website, image_path, start_date, end_date, round_count, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            
            stmt.run(
                championship.id,
                championship.name,
                championship.description || '',
                championship.season || '',
                championship.discord_invite || '',
                championship.website || '',
                championship.image_path || '',
                championship.start_date || '',
                championship.end_date || '',
                championship.round_count || 0,
                championship.status || 'planned',
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