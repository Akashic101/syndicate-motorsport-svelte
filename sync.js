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
    console.log(`\n🔄 [${new Date().toISOString()}] Starting sync for sheet: ${sheet.name}`);
    console.log(`📡 Fetching data from: ${sheet.url}`);

    const { data } = await axios.get(sheet.url);
    console.log(`✅ Successfully fetched CSV data (${data.length} characters)`);
    
    const jsonData = await csv().fromString(data);
    console.log(`📊 Parsed CSV into ${jsonData.length} rows`);

    console.log(`🏗️  Ensuring table '${sheet.name}' exists with columns:`, sheet.columns.map(c => `${c.name} (${c.type})`));
    ensureTable(sheet.name, sheet.columns);

    const quotedCols = sheet.columns.map((c) => quoteIdentifier(c.name)).join(', ');
    const placeholders = sheet.columns.map(() => '?').join(', ');
    const insertSql = `INSERT INTO ${quoteIdentifier(sheet.name)} (${quotedCols}) VALUES (${placeholders})`;

    console.log(`🗑️  Clearing existing data from '${sheet.name}' table`);
    db.serialize(() => {
      db.run(`DELETE FROM ${quoteIdentifier(sheet.name)}`, function(err) {
        if (err) {
          console.error(`❌ Error clearing table '${sheet.name}':`, err.message);
          return;
        }
        console.log(`✅ Cleared ${this.changes} existing records from '${sheet.name}'`);
      });

      console.log(`📝 Preparing to insert ${jsonData.length} new records`);
      const stmt = db.prepare(insertSql);

      let rowIndex = 0;
      let successCount = 0;
      let errorCount = 0;
      
      for (const row of jsonData) {
        rowIndex++;
        try {
          const values = sheet.columns.map((col) => {
            let v = row[col.header];
            if (v === '') return null;
            
            // Special handling for time field in events table
            if (sheet.name === 'events' && col.name === 'time') {
              const parsedTime = parseEventTime(v);
              if (parsedTime === null) {
                console.log(`⚠️  Row ${rowIndex}: Invalid time format '${v}', setting to null`);
              }
              return parsedTime;
            }
            
            switch (col.type.toUpperCase()) {
              case 'INTEGER':
                const intVal = parseInt(v, 10);
                if (isNaN(intVal)) {
                  console.log(`⚠️  Row ${rowIndex}: Invalid integer '${v}', setting to null`);
                  return null;
                }
                return intVal;
              case 'REAL':
                const floatVal = parseFloat(v);
                if (isNaN(floatVal)) {
                  console.log(`⚠️  Row ${rowIndex}: Invalid float '${v}', setting to null`);
                  return null;
                }
                return floatVal;
              case 'TEXT':
                return v;
              default:
                return v;
            }
          });
          
          stmt.run(values, function(err) {
            if (err) {
              console.error(`❌ Error inserting row ${rowIndex}:`, err.message);
              errorCount++;
            } else {
              successCount++;
            }
          });
        } catch (rowErr) {
          console.error(`❌ Error processing row ${rowIndex}:`, rowErr.message, 'Row data:', row);
          errorCount++;
        }
      }

      stmt.finalize((err) => {
        if (err) {
          console.error(`❌ Error finalizing statement for '${sheet.name}':`, err.message);
        } else {
          console.log(`✅ Completed sync for '${sheet.name}': ${successCount} successful, ${errorCount} errors`);
        }
      });
    });
  } catch (err) {
    console.error(`❌ Error syncing sheet "${sheet.name}":`, err.message);
    if (err.response) {
      console.error(`📡 HTTP Status: ${err.response.status} ${err.response.statusText}`);
    }
  }
}

async function updateAllSheets() {
  console.log(`\n🚀 [${new Date().toISOString()}] Starting full sync of ${sheets.length} sheets`);
  console.log(`📋 Sheets to sync: ${sheets.map(s => s.name).join(', ')}`);
  
  const startTime = Date.now();
  
  for (const sheet of sheets) {
    await updateSheet(sheet);
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  console.log(`\n🎉 [${new Date().toISOString()}] Full sync completed in ${duration} seconds`);
}

// --------------------------
// Initial sync + Cron every 5 minutes
// --------------------------
console.log('🏁 Starting Syndicate Motorsport Data Sync');
console.log('📅 Initial sync starting...');
updateAllSheets();

console.log('⏰ Setting up cron job to sync every 15 minutes');
cron.schedule('*/15 * * * *', () => {
  console.log(`\n⏰ [${new Date().toISOString()}] Cron-triggered sync starting...`);
  updateAllSheets();
});

// --------------------------
// Graceful DB close on exit
// --------------------------
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT. Gracefully shutting down...');
  console.log('📊 Closing database connection...');
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing DB:', err.message);
    } else {
      console.log('✅ Database connection closed successfully');
    }
    console.log('👋 Syndicate Motorsport Data Sync stopped');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM. Gracefully shutting down...');
  console.log('📊 Closing database connection...');
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing DB:', err.message);
    } else {
      console.log('✅ Database connection closed successfully');
    }
    console.log('👋 Syndicate Motorsport Data Sync stopped');
    process.exit(0);
  });
});

// Log startup completion
console.log('✅ Sync service initialized and running');
console.log('💡 Press Ctrl+C to stop the service');
