const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, '..', 'app.db');
const db = new sqlite3.Database(dbPath);

console.log('Connected to SQLite database.');

// Meter readings data for 2.OG Links [6064079]
const readings = [
    { date: '2025-01-02', value: 240643 },
    { date: '2025-01-03', value: 240667 },
    { date: '2025-01-06', value: 240714 },
    { date: '2025-01-07', value: 240740 },
    { date: '2025-01-08', value: 240753 },
    { date: '2025-01-09', value: 240776 },
    { date: '2025-01-10', value: 240805 },
    { date: '2025-01-13', value: 240861 },
    { date: '2025-01-14', value: 240885 },
    { date: '2025-01-15', value: 240920 },
    { date: '2025-01-16', value: 240955 },
    { date: '2025-01-17', value: 240992 },
    { date: '2025-01-20', value: 241045 },
    { date: '2025-01-21', value: 241061 },
    { date: '2025-01-22', value: 241079 },
    { date: '2025-01-23', value: 241097 },
    { date: '2025-01-24', value: 241126 },
    { date: '2025-01-27', value: 241164 },
    { date: '2025-01-28', value: 241182 },
    { date: '2025-01-29', value: 241201 },
    { date: '2025-01-30', value: 241222 },
    { date: '2025-01-31', value: 241235 },
    { date: '2025-02-03', value: 241265 },
    { date: '2025-02-04', value: 241280 },
    { date: '2025-02-05', value: 241300 },
    { date: '2025-02-06', value: 241315 },
    { date: '2025-02-07', value: 241325 },
    { date: '2025-02-10', value: 241335 },
    { date: '2025-02-11', value: 241369 },
    { date: '2025-02-12', value: 241387 },
    { date: '2025-02-13', value: 241394 },
    { date: '2025-02-14', value: 241409 },
    { date: '2025-02-24', value: 241514 },
    { date: '2025-02-25', value: 241526 },
    { date: '2025-02-26', value: 241545 },
    { date: '2025-02-27', value: 241565 },
    { date: '2025-03-03', value: 241602 },
    { date: '2025-03-04', value: 241618 },
    { date: '2025-03-05', value: 241635 },
    { date: '2025-03-06', value: 241654 },
    { date: '2025-03-07', value: 241671 },
    { date: '2025-03-10', value: 241702 },
    { date: '2025-03-11', value: 241715 },
    { date: '2025-03-12', value: 241736 },
    { date: '2025-03-13', value: 241755 },
    { date: '2025-03-14', value: 241771 },
    { date: '2025-03-17', value: 241836 },
    { date: '2025-03-18', value: 241848 },
    { date: '2025-03-19', value: 241868 },
    { date: '2025-03-20', value: 241887 },
    { date: '2025-03-21', value: 241909 },
    { date: '2025-03-24', value: 241961 },
    { date: '2025-03-25', value: 241971 },
    { date: '2025-03-26', value: 241989 },
    { date: '2025-03-27', value: 242016 },
    { date: '2025-03-28', value: 242079 },
    { date: '2025-03-31', value: 242095 },
    { date: '2025-04-01', value: 242109 },
    { date: '2025-04-02', value: 242136 },
    { date: '2025-04-03', value: 242154 },
    { date: '2025-04-04', value: 242178 },
    { date: '2025-04-07', value: 242235 },
    { date: '2025-04-08', value: 242247 },
    { date: '2025-04-09', value: 242259 },
    { date: '2025-04-10', value: 242281 },
    { date: '2025-04-11', value: 242300 },
    { date: '2025-04-14', value: 242359 },
    { date: '2025-04-15', value: 242375 },
    { date: '2025-04-16', value: 242389 },
    { date: '2025-04-17', value: 242403 },
    { date: '2025-04-21', value: 242460 },
    { date: '2025-04-22', value: 242473 },
    { date: '2025-04-23', value: 242491 },
    { date: '2025-04-24', value: 242506 },
    { date: '2025-04-28', value: 242548 },
    { date: '2025-04-29', value: 242558 },
    { date: '2025-04-30', value: 242567 },
    { date: '2025-05-02', value: 242585 },
    { date: '2025-05-05', value: 242628 },
    { date: '2025-05-06', value: 242655 },
    { date: '2025-05-07', value: 242667 },
    { date: '2025-05-09', value: 242698 },
    { date: '2025-05-12', value: 242740 },
    { date: '2025-05-13', value: 242753 },
    { date: '2025-05-14', value: 242775 },
    { date: '2025-05-15', value: 242800 },
    { date: '2025-05-16', value: 242818 },
    { date: '2025-05-19', value: 242863 },
    { date: '2025-05-20', value: 242878 },
    { date: '2025-05-21', value: 242890 },
    { date: '2025-05-22', value: 242918 },
    { date: '2025-05-23', value: 242943 },
    { date: '2025-05-26', value: 242991 }
];

const meterId = 6; // ID for 2.OG Links meter

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
                            console.log(`\n🎉 Successfully added ${addedCount} readings for 2.OG Links meter!`);
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