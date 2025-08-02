const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, '..', 'app.db');
const db = new sqlite3.Database(dbPath);

console.log('Connected to SQLite database.');

// Meter readings data for 3.OG Links [1EMH0010470265]
const readings = [
    { date: '2025-01-02', value: 13211 },
    { date: '2025-01-03', value: 13276 },
    { date: '2025-01-06', value: 13325 },
    { date: '2025-01-07', value: 13358 },
    { date: '2025-01-08', value: 13358 },
    { date: '2025-01-09', value: 13359 },
    { date: '2025-01-10', value: 13371 },
    { date: '2025-01-13', value: 13435 },
    { date: '2025-01-14', value: 13466 },
    { date: '2025-01-15', value: 13486 },
    { date: '2025-01-16', value: 13495 },
    { date: '2025-01-17', value: 13543 },
    { date: '2025-01-20', value: 13618 },
    { date: '2025-01-21', value: 13618 },
    { date: '2025-01-22', value: 13627 },
    { date: '2025-01-23', value: 13658 },
    { date: '2025-01-24', value: 13673 },
    { date: '2025-01-27', value: 13680 },
    { date: '2025-01-28', value: 13680 },
    { date: '2025-01-29', value: 13693 },
    { date: '2025-01-30', value: 13693 },
    { date: '2025-01-31', value: 13693 },
    { date: '2025-02-03', value: 13693 },
    { date: '2025-02-04', value: 13693 },
    { date: '2025-02-05', value: 13698 },
    { date: '2025-02-06', value: 13698 },
    { date: '2025-02-07', value: 13706 },
    { date: '2025-02-10', value: 13709 },
    { date: '2025-02-11', value: 13709 },
    { date: '2025-02-12', value: 13709 },
    { date: '2025-02-13', value: 13709 },
    { date: '2025-02-14', value: 13710 },
    { date: '2025-02-24', value: 13710 },
    { date: '2025-02-25', value: 13710 },
    { date: '2025-02-26', value: 13710 },
    { date: '2025-02-27', value: 13710 },
    { date: '2025-03-03', value: 13710 },
    { date: '2025-03-04', value: 13717 },
    { date: '2025-03-05', value: 13726 },
    { date: '2025-03-06', value: 13739 },
    { date: '2025-03-07', value: 13749 },
    { date: '2025-03-10', value: 13754 },
    { date: '2025-03-11', value: 13754 },
    { date: '2025-03-12', value: 13777 },
    { date: '2025-03-13', value: 13790 },
    { date: '2025-03-14', value: 13805 },
    { date: '2025-03-17', value: 13819 },
    { date: '2025-03-18', value: 13819 },
    { date: '2025-03-19', value: 13840 },
    { date: '2025-03-20', value: 13853 },
    { date: '2025-03-21', value: 13864 },
    { date: '2025-03-24', value: 13877 },
    { date: '2025-03-25', value: 13877 },
    { date: '2025-03-26', value: 13900 },
    { date: '2025-03-27', value: 13924 },
    { date: '2025-03-28', value: 13937 },
    { date: '2025-03-31', value: 13962 },
    { date: '2025-04-01', value: 13968 },
    { date: '2025-04-02', value: 13993 },
    { date: '2025-04-03', value: 14010 },
    { date: '2025-04-04', value: 14025 },
    { date: '2025-04-07', value: 14051 },
    { date: '2025-04-08', value: 14053 },
    { date: '2025-04-09', value: 14063 },
    { date: '2025-04-10', value: 14072 },
    { date: '2025-04-11', value: 14082 },
    { date: '2025-04-14', value: 14113 },
    { date: '2025-04-15', value: 14116 },
    { date: '2025-04-16', value: 14118 },
    { date: '2025-04-17', value: 14121 },
    { date: '2025-04-21', value: 14129 },
    { date: '2025-04-22', value: 14132 },
    { date: '2025-04-23', value: 14145 },
    { date: '2025-04-24', value: 14159 },
    { date: '2025-04-28', value: 14185 },
    { date: '2025-04-29', value: 14198 },
    { date: '2025-04-30', value: 14200 },
    { date: '2025-05-02', value: 14219 },
    { date: '2025-05-05', value: 14257 },
    { date: '2025-05-06', value: 14261 },
    { date: '2025-05-07', value: 14287 },
    { date: '2025-05-09', value: 14302 },
    { date: '2025-05-12', value: 14313 },
    { date: '2025-05-13', value: 14324 },
    { date: '2025-05-14', value: 14349 },
    { date: '2025-05-15', value: 14363 },
    { date: '2025-05-16', value: 14373 },
    { date: '2025-05-19', value: 14423 },
    { date: '2025-05-20', value: 14432 },
    { date: '2025-05-21', value: 14441 },
    { date: '2025-05-22', value: 14476 },
    { date: '2025-05-23', value: 14484 },
    { date: '2025-05-26', value: 14515 }
];

const meterId = 8; // ID for 3.OG Links meter

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
                            console.log(`\n🎉 Successfully added ${addedCount} readings for 3.OG Links meter!`);
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