const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, '..', 'app.db');
const db = new sqlite3.Database(dbPath);

console.log('Connected to SQLite database.');

// Meter readings data for 3.OG Rechts [1EMH0010473024]
const readings = [
    { date: '2025-01-02', value: 20014 },
    { date: '2025-01-03', value: 20047 },
    { date: '2025-01-06', value: 20103 },
    { date: '2025-01-07', value: 20134 },
    { date: '2025-01-08', value: 20165 },
    { date: '2025-01-09', value: 20196 },
    { date: '2025-01-10', value: 20227 },
    { date: '2025-01-13', value: 20291 },
    { date: '2025-01-14', value: 20323 },
    { date: '2025-01-15', value: 20354 },
    { date: '2025-01-16', value: 20386 },
    { date: '2025-01-17', value: 20415 },
    { date: '2025-01-20', value: 20483 },
    { date: '2025-01-21', value: 20508 },
    { date: '2025-01-22', value: 20537 },
    { date: '2025-01-23', value: 20570 },
    { date: '2025-01-24', value: 20603 },
    { date: '2025-01-27', value: 20652 },
    { date: '2025-01-28', value: 20663 },
    { date: '2025-01-29', value: 20683 },
    { date: '2025-01-30', value: 20695 },
    { date: '2025-01-31', value: 20712 },
    { date: '2025-02-03', value: 20743 },
    { date: '2025-02-04', value: 20759 },
    { date: '2025-02-05', value: 20771 },
    { date: '2025-02-06', value: 20786 },
    { date: '2025-02-07', value: 20805 },
    { date: '2025-02-10', value: 20831 },
    { date: '2025-02-11', value: 20844 },
    { date: '2025-02-12', value: 20867 },
    { date: '2025-02-13', value: 20873 },
    { date: '2025-02-14', value: 20898 },
    { date: '2025-02-24', value: 20986 },
    { date: '2025-02-25', value: 20998 },
    { date: '2025-02-26', value: 21024 },
    { date: '2025-02-27', value: 21050 },
    { date: '2025-03-03', value: 21085 },
    { date: '2025-03-04', value: 21105 },
    { date: '2025-03-05', value: 21125 },
    { date: '2025-03-06', value: 21145 },
    { date: '2025-03-07', value: 21163 },
    { date: '2025-03-10', value: 21202 },
    { date: '2025-03-11', value: 21232 },
    { date: '2025-03-12', value: 21264 },
    { date: '2025-03-13', value: 21296 },
    { date: '2025-03-14', value: 21315 },
    { date: '2025-03-17', value: 21370 },
    { date: '2025-03-18', value: 21385 },
    { date: '2025-03-19', value: 21410 },
    { date: '2025-03-20', value: 21432 },
    { date: '2025-03-21', value: 21453 },
    { date: '2025-03-24', value: 21500 },
    { date: '2025-03-25', value: 21528 },
    { date: '2025-03-26', value: 21554 },
    { date: '2025-03-27', value: 21600 },
    { date: '2025-03-28', value: 21632 },
    { date: '2025-03-31', value: 21689 },
    { date: '2025-04-01', value: 21715 },
    { date: '2025-04-02', value: 21745 },
    { date: '2025-04-03', value: 21777 },
    { date: '2025-04-04', value: 21810 },
    { date: '2025-04-07', value: 21868 },
    { date: '2025-04-08', value: 21890 },
    { date: '2025-04-09', value: 21912 },
    { date: '2025-04-10', value: 21940 },
    { date: '2025-04-11', value: 21975 },
    { date: '2025-04-14', value: 22037 },
    { date: '2025-04-15', value: 22063 },
    { date: '2025-04-16', value: 22074 },
    { date: '2025-04-17', value: 22084 },
    { date: '2025-04-21', value: 22134 },
    { date: '2025-04-22', value: 22152 },
    { date: '2025-04-23', value: 22174 },
    { date: '2025-04-24', value: 22193 },
    { date: '2025-04-28', value: 22232 },
    { date: '2025-04-29', value: 22250 },
    { date: '2025-04-30', value: 22265 },
    { date: '2025-05-02', value: 22281 },
    { date: '2025-05-05', value: 22326 },
    { date: '2025-05-06', value: 22348 },
    { date: '2025-05-07', value: 22367 },
    { date: '2025-05-09', value: 22395 },
    { date: '2025-05-12', value: 22474 },
    { date: '2025-05-13', value: 22502 },
    { date: '2025-05-14', value: 22517 },
    { date: '2025-05-15', value: 22537 },
    { date: '2025-05-16', value: 22559 },
    { date: '2025-05-19', value: 22604 },
    { date: '2025-05-20', value: 22621 },
    { date: '2025-05-21', value: 22635 },
    { date: '2025-05-22', value: 22662 },
    { date: '2025-05-23', value: 22689 },
    { date: '2025-05-26', value: 22741 }
];

const meterId = 7; // ID for 3.OG Rechts meter

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
                            console.log(`\n🎉 Successfully added ${addedCount} readings for 3.OG Rechts meter!`);
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