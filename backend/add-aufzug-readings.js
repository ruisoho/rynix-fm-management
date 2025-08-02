const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, '..', 'app.db');
const db = new sqlite3.Database(dbPath);

console.log('Connected to SQLite database.');

// Meter readings data for Aufzug [37504581] - ID: 17
const readings = [
    { date: '2025-01-02', value: 225773 },
    { date: '2025-01-03', value: 226805 },
    { date: '2025-01-04', value: null },
    { date: '2025-01-05', value: null },
    { date: '2025-01-06', value: 226866 },
    { date: '2025-01-07', value: 226898 },
    { date: '2025-01-08', value: 226921 },
    { date: '2025-01-09', value: 226951 },
    { date: '2025-01-10', value: 226981 },
    { date: '2025-01-11', value: null },
    { date: '2025-01-12', value: null },
    { date: '2025-01-13', value: 227046 },
    { date: '2025-01-14', value: 227079 },
    { date: '2025-01-15', value: 227106 },
    { date: '2025-01-16', value: 227142 },
    { date: '2025-01-17', value: 227172 },
    { date: '2025-01-18', value: null },
    { date: '2025-01-19', value: null },
    { date: '2025-01-20', value: 227245 },
    { date: '2025-01-21', value: 227269 },
    { date: '2025-01-22', value: 227298 },
    { date: '2025-01-23', value: 227325 },
    { date: '2025-01-24', value: 227352 },
    { date: '2025-01-25', value: null },
    { date: '2025-01-26', value: null },
    { date: '2025-01-27', value: 227391 },
    { date: '2025-01-28', value: 227403 },
    { date: '2025-01-29', value: 227417 },
    { date: '2025-01-30', value: 227429 },
    { date: '2025-01-31', value: 227441 },
    { date: '2025-02-01', value: null },
    { date: '2025-02-02', value: null },
    { date: '2025-02-03', value: 227465 },
    { date: '2025-02-04', value: 227476 },
    { date: '2025-02-05', value: 227490 },
    { date: '2025-02-06', value: 227504 },
    { date: '2025-02-07', value: 227516 },
    { date: '2025-02-08', value: null },
    { date: '2025-02-09', value: null },
    { date: '2025-02-10', value: 227548 },
    { date: '2025-02-11', value: 227561 },
    { date: '2025-02-12', value: 227579 },
    { date: '2025-02-13', value: 227584 },
    { date: '2025-02-14', value: 227600 },
    { date: '2025-02-15', value: null },
    { date: '2025-02-16', value: null },
    { date: '2025-02-17', value: null },
    { date: '2025-02-18', value: null },
    { date: '2025-02-19', value: null },
    { date: '2025-02-20', value: null },
    { date: '2025-02-21', value: null },
    { date: '2025-02-22', value: null },
    { date: '2025-02-23', value: null },
    { date: '2025-02-24', value: 227725 },
    { date: '2025-02-25', value: 227741 },
    { date: '2025-02-26', value: 227757 },
    { date: '2025-02-27', value: 227761 },
    { date: '2025-02-28', value: null },
    { date: '2025-03-01', value: null },
    { date: '2025-03-02', value: null },
    { date: '2025-03-03', value: 227822 },
    { date: '2025-03-04', value: 227848 },
    { date: '2025-03-05', value: 227871 },
    { date: '2025-03-06', value: 227900 },
    { date: '2025-03-07', value: 227925 },
    { date: '2025-03-08', value: null },
    { date: '2025-03-09', value: null },
    { date: '2025-03-10', value: 227969 },
    { date: '2025-03-11', value: 227990 },
    { date: '2025-03-12', value: 228024 },
    { date: '2025-03-13', value: 228055 },
    { date: '2025-03-14', value: 228084 },
    { date: '2025-03-15', value: null },
    { date: '2025-03-16', value: null },
    { date: '2025-03-17', value: 228150 },
    { date: '2025-03-18', value: 228169 },
    { date: '2025-03-19', value: 228198 },
    { date: '2025-03-20', value: 228229 },
    { date: '2025-03-21', value: 228257 },
    { date: '2025-03-22', value: null },
    { date: '2025-03-23', value: null },
    { date: '2025-03-24', value: 228320 },
    { date: '2025-03-25', value: 228338 },
    { date: '2025-03-26', value: 228367 },
    { date: '2025-03-27', value: 228398 },
    { date: '2025-03-28', value: 228422 },
    { date: '2025-03-29', value: null },
    { date: '2025-03-30', value: null },
    { date: '2025-03-31', value: 228490 },
    { date: '2025-04-01', value: 228507 },
    { date: '2025-04-02', value: 228539 },
    { date: '2025-04-03', value: 228574 },
    { date: '2025-04-04', value: 228611 },
    { date: '2025-04-05', value: null },
    { date: '2025-04-06', value: null },
    { date: '2025-04-07', value: 228679 },
    { date: '2025-04-08', value: 228701 },
    { date: '2025-04-09', value: 228732 },
    { date: '2025-04-10', value: 228768 },
    { date: '2025-04-11', value: 228798 },
    { date: '2025-04-12', value: null },
    { date: '2025-04-13', value: null },
    { date: '2025-04-14', value: 228873 },
    { date: '2025-04-15', value: 228890 },
    { date: '2025-04-16', value: 228909 },
    { date: '2025-04-17', value: 228931 },
    { date: '2025-04-18', value: null },
    { date: '2025-04-19', value: null },
    { date: '2025-04-20', value: null },
    { date: '2025-04-21', value: null },
    { date: '2025-04-22', value: 228987 },
    { date: '2025-04-23', value: 229011 },
    { date: '2025-04-24', value: 229042 },
    { date: '2025-04-25', value: 229072 },
    { date: '2025-04-26', value: null },
    { date: '2025-04-27', value: null },
    { date: '2025-04-28', value: 229140 },
    { date: '2025-04-29', value: 229164 },
    { date: '2025-04-30', value: 229189 },
    { date: '2025-05-01', value: null },
    { date: '2025-05-02', value: 229226 },
    { date: '2025-05-03', value: null },
    { date: '2025-05-04', value: null },
    { date: '2025-05-05', value: 229294 },
    { date: '2025-05-06', value: 229316 },
    { date: '2025-05-07', value: 229347 },
    { date: '2025-05-08', value: null },
    { date: '2025-05-09', value: 229395 },
    { date: '2025-05-10', value: null },
    { date: '2025-05-11', value: null },
    { date: '2025-05-12', value: 229467 },
    { date: '2025-05-13', value: 229487 },
    { date: '2025-05-14', value: 229520 },
    { date: '2025-05-15', value: 229558 },
    { date: '2025-05-16', value: 229592 },
    { date: '2025-05-17', value: null },
    { date: '2025-05-18', value: null },
    { date: '2025-05-19', value: 229660 },
    { date: '2025-05-20', value: 229678 },
    { date: '2025-05-21', value: 229704 },
    { date: '2025-05-22', value: 229743 },
    { date: '2025-05-23', value: 229782 },
    { date: '2025-05-24', value: null },
    { date: '2025-05-25', value: null },
    { date: '2025-05-26', value: 229853 }
];

const meterId = 17; // ID for Aufzug meter

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
                                console.log(`Database connection closed. Added ${addedCount} readings for Aufzug meter.`);
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
                            console.log(`Database connection closed. Added ${addedCount} readings for Aufzug meter.`);
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