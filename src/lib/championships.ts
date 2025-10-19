import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'data.db');

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
                    sign_up_link TEXT DEFAULT '',
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
                
                database.run(`
                    ALTER TABLE championships ADD COLUMN sign_up_link TEXT DEFAULT ''
                `, (err) => {
                    // Ignore error if column already exists
                });

                // Database initialization complete
                isInitialized = true;
                resolve();
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
    sign_up_link?: string;
}): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            await initializeDatabase();
            const database = getDatabase();
            const stmt = database.prepare(`
                INSERT OR REPLACE INTO championships (id, name, description, season, discord_invite, website, image_path, start_date, end_date, round_count, status, sign_up_link)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                championship.sign_up_link || '',
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