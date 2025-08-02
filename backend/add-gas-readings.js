const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, '..', 'app.db');
const db = new sqlite3.Database(dbPath);

console.log('Connected to SQLite database.');

// Meter readings data for Natural Gas [0804521495] - ID: 19
// Gas meter with progressive consumption from 2,038,857 to 2,093,268 cubic meters
const readings = [
    { date: '2025-01-02', value: 2038857 },
    { date: '2025-01-03', value: 2039490 },
    { date: '2025-01-04', value: null },
    { date: '2025-01-05', value: null },
    { date: '2025-01-06', value: 2041479 },
    { date: '2025-01-07', value: 2042029 },
    { date: '2025-01-08', value: 2042560 },
    { date: '2025-01-09', value: 2043127 },
    { date: '2025-01-10', value: 2043812 },
    { date: '2025-01-11', value: null },
    { date: '2025-01-12', value: null },
    { date: '2025-01-13', value: 2045920 },
    { date: '2025-01-14', value: 2046668 },
    { date: '2025-01-15', value: 2047360 },
    { date: '2025-01-16', value: 2048086 },
    { date: '2025-01-17', value: 2048791 },
    { date: '2025-01-18', value: null },
    { date: '2025-01-19', value: null },
    { date: '2025-01-20', value: 2050860 },
    { date: '2025-01-21', value: 2051518 },
    { date: '2025-01-22', value: 2052220 },
    { date: '2025-01-23', value: 2052907 },
    { date: '2025-01-24', value: 2053606 },
    { date: '2025-01-25', value: null },
    { date: '2025-01-26', value: null },
    { date: '2025-01-27', value: 2055242 },
    { date: '2025-01-28', value: 2055762 },
    { date: '2025-01-29', value: 2056290 },
    { date: '2025-01-30', value: 2056795 },
    { date: '2025-01-31', value: 2057306 },
    { date: '2025-02-01', value: null },
    { date: '2025-02-02', value: null },
    { date: '2025-02-03', value: 2058799 },
    { date: '2025-02-04', value: 2059341 },
    { date: '2025-02-05', value: 2059914 },
    { date: '2025-02-06', value: 2060439 },
    { date: '2025-02-07', value: 2060943 },
    { date: '2025-02-08', value: null },
    { date: '2025-02-09', value: null },
    { date: '2025-02-10', value: 2062609 },
    { date: '2025-02-11', value: 2063225 },
    { date: '2025-02-12', value: 2063872 },
    { date: '2025-02-13', value: 2064499 },
    { date: '2025-02-14', value: 2065146 },
    { date: '2025-02-15', value: null },
    { date: '2025-02-16', value: null },
    { date: '2025-02-17', value: null },
    { date: '2025-02-18', value: null },
    { date: '2025-02-19', value: null },
    { date: '2025-02-20', value: null },
    { date: '2025-02-21', value: null },
    { date: '2025-02-22', value: null },
    { date: '2025-02-23', value: null },
    { date: '2025-02-24', value: 2070872 },
    { date: '2025-02-25', value: 2071241 },
    { date: '2025-02-26', value: 2071615 },
    { date: '2025-02-27', value: 2072055 },
    { date: '2025-02-28', value: null },
    { date: '2025-03-01', value: null },
    { date: '2025-03-02', value: null },
    { date: '2025-03-03', value: 2074027 },
    { date: '2025-03-04', value: 2074502 },
    { date: '2025-03-05', value: 2074946 },
    { date: '2025-03-06', value: 2075368 },
    { date: '2025-03-07', value: 2075779 },
    { date: '2025-03-08', value: null },
    { date: '2025-03-09', value: null },
    { date: '2025-03-10', value: 2076928 },
    { date: '2025-03-11', value: 2077314 },
    { date: '2025-03-12', value: 2077795 },
    { date: '2025-03-13', value: 2078264 },
    { date: '2025-03-14', value: 2078770 },
    { date: '2025-03-15', value: null },
    { date: '2025-03-16', value: null },
    { date: '2025-03-17', value: 2080288 },
    { date: '2025-03-18', value: 2080838 },
    { date: '2025-03-19', value: 2081352 },
    { date: '2025-03-20', value: 2081823 },
    { date: '2025-03-21', value: 2082198 },
    { date: '2025-03-22', value: null },
    { date: '2025-03-23', value: null },
    { date: '2025-03-24', value: 2083195 },
    { date: '2025-03-25', value: 2083482 },
    { date: '2025-03-26', value: 2083828 },
    { date: '2025-03-27', value: 2084250 },
    { date: '2025-03-28', value: 2084679 },
    { date: '2025-03-29', value: null },
    { date: '2025-03-30', value: null },
    { date: '2025-03-31', value: 2085837 },
    { date: '2025-04-01', value: 2086271 },
    { date: '2025-04-02', value: 2086598 },
    { date: '2025-04-03', value: 2086875 },
    { date: '2025-04-04', value: 2087085 },
    { date: '2025-04-05', value: null },
    { date: '2025-04-06', value: null },
    { date: '2025-04-07', value: 2087987 },
    { date: '2025-04-08', value: 2088338 },
    { date: '2025-04-09', value: 2088615 },
    { date: '2025-04-10', value: 2088901 },
    { date: '2025-04-11', value: 2089179 },
    { date: '2025-04-12', value: null },
    { date: '2025-04-13', value: null },
    { date: '2025-04-14', value: 2089851 },
    { date: '2025-04-15', value: 2089973 },
    { date: '2025-04-16', value: 2090075 },
    { date: '2025-04-17', value: 2090148 },
    { date: '2025-04-18', value: null },
    { date: '2025-04-19', value: null },
    { date: '2025-04-20', value: null },
    { date: '2025-04-21', value: null },
    { date: '2025-04-22', value: 2090778 },
    { date: '2025-04-23', value: 2090887 },
    { date: '2025-04-24', value: 2090994 },
    { date: '2025-04-25', value: 2091118 },
    { date: '2025-04-26', value: null },
    { date: '2025-04-27', value: null },
    { date: '2025-04-28', value: 2091532 },
    { date: '2025-04-29', value: 2091634 },
    { date: '2025-04-30', value: 2091700 },
    { date: '2025-05-01', value: null },
    { date: '2025-05-02', value: 2091794 },
    { date: '2025-05-03', value: null },
    { date: '2025-05-04', value: null },
    { date: '2025-05-05', value: 2092076 },
    { date: '2025-05-06', value: 2092238 },
    { date: '2025-05-07', value: 2092377 },
    { date: '2025-05-08', value: null },
    { date: '2025-05-09', value: 2092635 },
    { date: '2025-05-10', value: null },
    { date: '2025-05-11', value: null },
    { date: '2025-05-12', value: 2092938 },
    { date: '2025-05-13', value: 2093026 },
    { date: '2025-05-14', value: 2093093 },
    { date: '2025-05-15', value: 2093158 },
    { date: '2025-05-16', value: 2093268 }
];

const meterId = 19; // ID for Natural Gas meter

// Function to add readings
function addReadings() {
    let addedCount = 0;
    let skippedCount = 0;
    let totalReadings = readings.length;
    
    readings.forEach((reading, index) => {
        if (reading.value !== null) {
            const stmt = db.prepare('INSERT INTO meter_readings (meter_id, value, date) VALUES (?, ?, ?)');
            stmt.run(meterId, reading.value, reading.date, function(err) {
                if (err) {
                    console.error(`❌ Error adding reading for ${reading.date}:`, err.message);
                } else {
                    console.log(`Inserted reading for ${reading.date}: ${reading.value}`);
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
                                console.log(`Database connection closed. Added ${addedCount} readings for Natural Gas meter.`);
                                console.log(`Total readings for this meter: ${row.count}`);
                            }
                            db.close();
                        });
                    }, 100);
                }
            });
            stmt.finalize();
        } else {
            skippedCount++;
            console.log(`Skipped reading for ${reading.date}: null value`);
            
            // Check if this is the last reading
            if (index === totalReadings - 1) {
                setTimeout(() => {
                    // Get total count for this meter
                    db.get('SELECT COUNT(*) as count FROM meter_readings WHERE meter_id = ?', [meterId], (err, row) => {
                        if (err) {
                            console.error('Error getting count:', err);
                        } else {
                            console.log(`Database connection closed. Added ${addedCount} readings for Natural Gas meter.`);
                            console.log(`Total readings for this meter: ${row.count}`);
                        }
                        db.close();
                    });
                }, 100);
            }
        }
    });
}

// Start adding readings
addReadings();