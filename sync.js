import axios from 'axios';
import cron from 'node-cron';
import csv from 'csvtojson';
import { db, ensureTable, quoteIdentifier } from './db.js';

// List of sheets → tables
const sheets = [
  {
    name: 'events',
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPXEpA0_3WvJmtxJTKZ97Bi8tbZWsjCZT892N4mNgdaMJyhO-Syh1Xn-Yf4KaGw9SAZjGRwjtCpjZb/pub?gid=1933046167&single=true&output=csv',
    columns: [
      { header: 'Event', name: 'event', type: 'TEXT' },
      { header: 'Time', name: 'time', type: 'INTEGER' }
    ]
  },
  {
    name: 'driver_overview',
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPXEpA0_3WvJmtxJTKZ97Bi8tbZWsjCZT892N4mNgdaMJyhO-Syh1Xn-Yf4KaGw9SAZjGRwjtCpjZb/pub?gid=254771285&single=true&output=csv',
    columns: [
      { header: 'DriverGUID', name: 'driver_guid', type: 'TEXT' },
      { header: 'Rank', name: 'rank', type: 'INTEGER' },
      { header: 'Driver', name: 'driver', type: 'TEXT' },
      { header: 'ELO', name: 'elo', type: 'INTEGER' },
      { header: 'License', name: 'license', type: 'TEXT' },
      { header: 'Safety Rating', name: 'safety_rating', type: 'TEXT' }
    ]
  },
  {
    name: 'lap_records',
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPXEpA0_3WvJmtxJTKZ97Bi8tbZWsjCZT892N4mNgdaMJyhO-Syh1Xn-Yf4KaGw9SAZjGRwjtCpjZb/pub?gid=462474009&single=true&output=csv',
    columns: [
      { header: 'DriverGUID', name: 'driver_guid', type: 'TEXT' },
      { header: 'TrackName', name: 'track_name', type: 'TEXT' },
      { header: 'CarModel', name: 'car_model', type: 'TEXT' },
      { header: 'Platform', name: 'platform', type: 'TEXT' },
      { header: 'BestLap', name: 'best_lap', type: 'TEXT' },
      { header: 'Driver', name: 'driver', type: 'TEXT' },
      { header: 'BestLap_Num', name: 'best_lap_num', type: 'TEXT' },
      { header: 'Lap Time', name: 'lap_time', type: 'TEXT' }
    ]
  }
];

// --------------------------
// Date Parsing Helper
// --------------------------
function parseEventTime(timeString) {
  if (!timeString || timeString === '') return null;
  
  try {
    // Parse date string like "October 25 2025 07:00 PM"
    const date = new Date(timeString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string: "${timeString}"`);
      return null;
    }
    
    // Return timestamp in milliseconds (SQLite INTEGER can store this)
    return date.getTime();
  } catch (error) {
    console.warn(`Error parsing date "${timeString}":`, error.message);
    return null;
  }
}

// --------------------------
// CSV Update Logic
// --------------------------
async function updateSheet(sheet) {
  try {
    console.log(`[${new Date().toISOString()}] Starting sync for sheet: ${sheet.name}`);

    const { data } = await axios.get(sheet.url);
    const jsonData = await csv().fromString(data);

    ensureTable(sheet.name, sheet.columns);

    const quotedCols = sheet.columns.map((c) => quoteIdentifier(c.name)).join(', ');
    const placeholders = sheet.columns.map(() => '?').join(', ');
    const insertSql = `INSERT INTO ${quoteIdentifier(sheet.name)} (${quotedCols}) VALUES (${placeholders})`;

    db.serialize(() => {
      db.run(`DELETE FROM ${quoteIdentifier(sheet.name)}`);

      const stmt = db.prepare(insertSql);

      let rowIndex = 0;
      for (const row of jsonData) {
        rowIndex++;
        try {
          const values = sheet.columns.map((col) => {
            let v = row[col.header];
            if (v === '') return null;
            
            // Special handling for time field in events table
            if (sheet.name === 'events' && col.name === 'time') {
              return parseEventTime(v);
            }
            
            switch (col.type.toUpperCase()) {
              case 'INTEGER':
                return parseInt(v, 10);
              case 'REAL':
                return parseFloat(v);
              case 'TEXT':
                return v;
              default:
                return v;
            }
          });
          stmt.run(values);
        } catch (rowErr) {
          console.error(`❌ Error inserting row ${rowIndex}:`, rowErr.message, 'Row data:', row);
        }
      }

      stmt.finalize();
    });
  } catch (err) {
    console.error(`❌ Error syncing sheet "${sheet.name}":`, err.message);
  }
}

async function updateAllSheets() {
  for (const sheet of sheets) {
    await updateSheet(sheet);
  }
}

// --------------------------
// Initial sync + Cron every 5 minutes
// --------------------------
updateAllSheets();
cron.schedule('*/5 * * * *', updateAllSheets);

// --------------------------
// Graceful DB close on exit
// --------------------------
process.on('SIGINT', () => {
  console.log('Received SIGINT. Closing DB...');
  db.close((err) => {
    if (err) console.error('Error closing DB:', err.message);
    else console.log('DB closed.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Closing DB...');
  db.close((err) => {
    if (err) console.error('Error closing DB:', err.message);
    else console.log('DB closed.');
    process.exit(0);
  });
});
