const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, '..', 'app.db');
const db = new sqlite3.Database(dbPath);

console.log('Connected to SQLite database.');

// Meter readings data for 4.OG Rechts [1ESY1160739277]
const readings = [
    { date: '2025-01-02', value: 1329 },
    { date: '2025-01-03', value: 1329 },
    { date: '2025-01-06', value: 1330 },
    { date: '2025-01-07', value: 1330 },
    { date: '2025-01-08', value: 1330 },
    { date: '2025-01-09', value: 1330 },
    { date: '2025-01-10', value: 1330 },
    { date: '2025-01-13', value: 1330 },
    { date: '2025-01-14', value: 1330 },
    { date: '2025-01-15', value: 1330 },
    { date: '2025-01-16', value: 1330 },
    { date: '2025-01-17', value: 1332 },
    { date: '2025-01-20', value: 1340 },
    { date: '2025-01-21', value: 1340 },
    { date: '2025-01-22', value: 1341 },
    { date: '2025-01-23', value: 1341 },
    { date: '2025-01-24', value: 1341 },
    { date: '2025-01-27', value: 1362 },
    { date: '2025-01-28', value: 1362 },
    { date: '2025-01-29', value: 1362 },
    { date: '2025-01-30', value: 1365 },
    { date: '2025-01-31', value: 1366 },
    { date: '2025-02-03', value: 1366 },
    { date: '2025-02-04', value: 1366 },
    { date: '2025-02-05', value: 1366 },
    { date: '2025-02-06', value: 1367 },
    { date: '2025-02-07', value: 1368 },
    { date: '2025-02-10', value: 1369 },
    { date: '2025-02-11', value: 1369 },
    { date: '2025-02-12', value: 1369 },
    { date: '2025-02-13', value: 1369 },
    { date: '2025-02-14', value: 1369 },
    { date: '2025-02-24', value: 1371 },
    { date: '2025-02-25', value: 1371 },
    { date: '2025-02-26', value: 1372 },
    { date: '2025-02-27', value: 1372 },
    { date: '2025-03-03', value: 1374 },
    { date: '2025-03-04', value: 1374 },
    { date: '2025-03-05', value: 1374 },
    { date: '2025-03-06', value: 1375 },
    { date: '2025-03-07', value: 1375 },
    { date: '2025-03-10', value: 1377 },
    { date: '2025-03-11', value: 1377 },
    { date: '2025-03-12', value: 1377 },
    { date: '2025-03-13', value: 1377 },
    { date: '2025-03-14', value: 1377 },
    { date: '2025-03-17', value: 1380 },
    { date: '2025-03-18', value: 1380 },
    { date: '2025-03-19', value: 1380 },
    { date: '2025-03-20', value: 1380 },
    { date: '2025-03-21', value: 1380 },
    { date: '2025-03-24', value: 1381 },
    { date: '2025-03-25', value: 1382 },
    { date: '2025-03-26', value: 1382 },
    { date: '2025-03-27', value: 1382 },
    { date: '2025-03-28', value: 1382 },
    { date: '2025-03-31', value: 1390 },
    { date: '2025-04-01', value: 1390 },
    { date: '2025-04-02', value: 1390 },
    { date: '2025-04-03', value: 1390 },
    { date: '2025-04-04', value: 1390 },
    { date: '2025-04-07', value: 1391 },
    { date: '2025-04-08', value: 1391 },
    { date: '2025-04-09', value: 1391 },
    { date: '2025-04-10', value: 1391 },
    { date: '2025-04-11', value: 1392 },
    { date: '2025-04-14', value: 1402 },
    { date: '2025-04-15', value: 1405 },
    { date: '2025-04-16', value: 1407 },
    { date: '2025-04-17', value: 1410 },
    { date: '2025-04-21', value: 1416 },
    { date: '2025-04-22', value: 1416 },
    { date: '2025-04-23', value: 1416 },
    { date: '2025-04-24', value: 1416 },
    { date: '2025-04-28', value: 1418 },
    { date: '2025-04-29', value: 1418 },
    { date: '2025-04-30', value: 1418 },
    { date: '2025-05-02', value: 1418 },
    { date: '2025-05-05', value: 1420 },
    { date: '2025-05-06', value: 1420 },
    { date: '2025-05-07', value: 1421 },
    { date: '2025-05-09', value: 1421 },
    { date: '2025-05-12', value: 1422 },
    { date: '2025-05-13', value: 1424 },
    { date: '2025-05-14', value: 1424 },
    { date: '2025-05-15', value: 1424 },
    { date: '2025-05-16', value: 1424 },
    { date: '2025-05-19', value: 1425 },
    { date: '2025-05-20', value: 1425 },
    { date: '2025-05-21', value: 1425 },
    { date: '2025-05-22', value: 1425 },
    { date: '2025-05-23', value: 1425 },
    { date: '2025-05-26', value: 1427 }
];

const meterId = 9; // ID for 4.OG Rechts meter

// Function to add readings
function addReadings() {
    let addedCount = 0;
    let totalReadings = readings.length;
    
    readings.forEach((reading, index) => {
        const stmt = db.prepare('INSERT INTO meter_readings (meter_id, value, date) VALUES (?, ?, ?)');
        stmt.run(meterId, reading.value, reading.date, function(err) {
            if (err) {
                console.error(`❌ Error adding reading for ${reading.date}:`, err.message);
            } else {
                console.log(`✓ Added reading for ${reading.date}: ${reading.value} kWh`);
                addedCount++;
            }
            
            // Check if this is the last reading
            if (index === totalReadings - 1) {
                setTimeout(() => {
                    // Get total count for this meter
                    db.get('SELECT COUNT(*) as count FROM meter_readings WHERE meter_id = ?', [meterId], (err, row) => {
                        if (err) {
                            console.error('Error getting count:', err);
                        } else {
                            console.log(`\n🎉 Successfully added ${addedCount} readings for 4.OG Rechts meter!`);
                            console.log(`📊 Total readings for this meter: ${row.count}`);
                        }
                        db.close();
                        console.log('Database connection closed.');
                    });
                }, 100);
            }
        });
        stmt.finalize();
    });
}

// Start adding readings
addReadings();