const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, '..', 'app.db');
const db = new sqlite3.Database(dbPath);

console.log('Connected to SQLite database.');

// Meter readings data for Heizung [5414490] - ID: 20
// Heating system with progressive consumption from 88,427 to 94,026 kWh
const readings = [
    { date: '2025-01-02', value: 88427 },
    { date: '2025-01-03', value: 88476 },
    { date: '2025-01-04', value: null },
    { date: '2025-01-05', value: null },
    { date: '2025-01-06', value: 88627 },
    { date: '2025-01-07', value: 88675 },
    { date: '2025-01-08', value: 88722 },
    { date: '2025-01-09', value: 88769 },
    { date: '2025-01-10', value: 88829 },
    { date: '2025-01-11', value: null },
    { date: '2025-01-12', value: null },
    { date: '2025-01-13', value: 89022 },
    { date: '2025-01-14', value: 89090 },
    { date: '2025-01-15', value: 89154 },
    { date: '2025-01-16', value: 89220 },
    { date: '2025-01-17', value: 89284 },
    { date: '2025-01-18', value: null },
    { date: '2025-01-19', value: null },
    { date: '2025-01-20', value: 89477 },
    { date: '2025-01-21', value: 89537 },
    { date: '2025-01-22', value: 89602 },
    { date: '2025-01-23', value: 89665 },
    { date: '2025-01-24', value: 89730 },
    { date: '2025-01-25', value: null },
    { date: '2025-01-26', value: null },
    { date: '2025-01-27', value: 89908 },
    { date: '2025-01-28', value: 89967 },
    { date: '2025-01-29', value: 90026 },
    { date: '2025-01-30', value: 90082 },
    { date: '2025-01-31', value: 90163 },
    { date: '2025-02-01', value: null },
    { date: '2025-02-02', value: null },
    { date: '2025-02-03', value: 90265 },
    { date: '2025-02-04', value: 90310 },
    { date: '2025-02-05', value: 90356 },
    { date: '2025-02-06', value: 90400 },
    { date: '2025-02-07', value: 90443 },
    { date: '2025-02-08', value: null },
    { date: '2025-02-09', value: null },
    { date: '2025-02-10', value: 90582 },
    { date: '2025-02-11', value: 90631 },
    { date: '2025-02-12', value: 90680 },
    { date: '2025-02-13', value: 90728 },
    { date: '2025-02-14', value: 90777 },
    { date: '2025-02-15', value: null },
    { date: '2025-02-16', value: null },
    { date: '2025-02-17', value: null },
    { date: '2025-02-18', value: null },
    { date: '2025-02-19', value: null },
    { date: '2025-02-20', value: null },
    { date: '2025-02-21', value: null },
    { date: '2025-02-22', value: null },
    { date: '2025-02-23', value: null },
    { date: '2025-02-24', value: 91235 },
    { date: '2025-02-25', value: 91275 },
    { date: '2025-02-26', value: 91315 },
    { date: '2025-02-27', value: 91358 },
    { date: '2025-02-28', value: null },
    { date: '2025-03-01', value: null },
    { date: '2025-03-02', value: null },
    { date: '2025-03-03', value: 91547 },
    { date: '2025-03-04', value: 91596 },
    { date: '2025-03-05', value: 91642 },
    { date: '2025-03-06', value: 91688 },
    { date: '2025-03-07', value: 91737 },
    { date: '2025-03-08', value: null },
    { date: '2025-03-09', value: null },
    { date: '2025-03-10', value: 91882 },
    { date: '2025-03-11', value: 91929 },
    { date: '2025-03-12', value: 91983 },
    { date: '2025-03-13', value: 92025 },
    { date: '2025-03-14', value: 92075 },
    { date: '2025-03-15', value: null },
    { date: '2025-03-16', value: null },
    { date: '2025-03-17', value: 92217 },
    { date: '2025-03-18', value: 92267 },
    { date: '2025-03-19', value: 92316 },
    { date: '2025-03-20', value: 92363 },
    { date: '2025-03-21', value: 92403 },
    { date: '2025-03-22', value: null },
    { date: '2025-03-23', value: null },
    { date: '2025-03-24', value: 92518 },
    { date: '2025-03-25', value: 92551 },
    { date: '2025-03-26', value: 92589 },
    { date: '2025-03-27', value: 92633 },
    { date: '2025-03-28', value: 92676 },
    { date: '2025-03-29', value: null },
    { date: '2025-03-30', value: null },
    { date: '2025-03-31', value: 92794 },
    { date: '2025-04-01', value: 92836 },
    { date: '2025-04-02', value: 92873 },
    { date: '2025-04-03', value: 92908 },
    { date: '2025-04-04', value: 92940 },
    { date: '2025-04-05', value: null },
    { date: '2025-04-06', value: null },
    { date: '2025-04-07', value: 93043 },
    { date: '2025-04-08', value: 93082 },
    { date: '2025-04-09', value: 93115 },
    { date: '2025-04-10', value: 93150 },
    { date: '2025-04-11', value: 93184 },
    { date: '2025-04-12', value: null },
    { date: '2025-04-13', value: null },
    { date: '2025-04-14', value: 93284 },
    { date: '2025-04-15', value: 93312 },
    { date: '2025-04-16', value: 93339 },
    { date: '2025-04-17', value: 93362 },
    { date: '2025-04-18', value: null },
    { date: '2025-04-19', value: null },
    { date: '2025-04-20', value: null },
    { date: '2025-04-21', value: null },
    { date: '2025-04-22', value: 93481 },
    { date: '2025-04-23', value: 93505 },
    { date: '2025-04-24', value: 93527 },
    { date: '2025-04-25', value: 93551 },
    { date: '2025-04-26', value: null },
    { date: '2025-04-27', value: null },
    { date: '2025-04-28', value: 93622 },
    { date: '2025-04-29', value: 93645 },
    { date: '2025-04-30', value: 93667 },
    { date: '2025-05-01', value: null },
    { date: '2025-05-02', value: 93708 },
    { date: '2025-05-03', value: null },
    { date: '2025-05-04', value: null },
    { date: '2025-05-05', value: 93775 },
    { date: '2025-05-06', value: 93800 },
    { date: '2025-05-07', value: 93824 },
    { date: '2025-05-08', value: null },
    { date: '2025-05-09', value: 93872 },
    { date: '2025-05-10', value: null },
    { date: '2025-05-11', value: null },
    { date: '2025-05-12', value: 93940 },
    { date: '2025-05-13', value: 93962 },
    { date: '2025-05-14', value: 93984 },
    { date: '2025-05-15', value: 94005 },
    { date: '2025-05-16', value: 94026 }
];

const meterId = 20; // ID for Heizung meter

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
                                console.log(`Database connection closed. Added ${addedCount} readings for Heizung meter.`);
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
                            console.log(`Database connection closed. Added ${addedCount} readings for Heizung meter.`);
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