const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, '..', 'app.db');
const db = new sqlite3.Database(dbPath);

console.log('Connected to SQLite database.');

// Meter readings data for 2.OG Recht [6063399]
const readings = [
    { date: '2025-01-02', value: 387829 },
    { date: '2025-01-03', value: 387858 },
    { date: '2025-01-06', value: 387945 },
    { date: '2025-01-07', value: 387976 },
    { date: '2025-01-08', value: 388007 },
    { date: '2025-01-09', value: 388034 },
    { date: '2025-01-10', value: 388066 },
    { date: '2025-01-13', value: 388147 },
    { date: '2025-01-14', value: 388177 },
    { date: '2025-01-15', value: 388218 },
    { date: '2025-01-16', value: 388263 },
    { date: '2025-01-17', value: 388306 },
    { date: '2025-01-20', value: 388397 },
    { date: '2025-01-21', value: 388427 },
    { date: '2025-01-22', value: 388463 },
    { date: '2025-01-23', value: 388495 },
    { date: '2025-01-24', value: 388529 },
    { date: '2025-01-27', value: 388615 },
    { date: '2025-01-28', value: 388645 },
    { date: '2025-01-29', value: 388673 },
    { date: '2025-01-30', value: 388699 },
    { date: '2025-01-31', value: 388726 },
    { date: '2025-02-03', value: 388804 },
    { date: '2025-02-04', value: 388833 },
    { date: '2025-02-05', value: 388863 },
    { date: '2025-02-06', value: 388895 },
    { date: '2025-02-07', value: 388928 },
    { date: '2025-02-10', value: 389009 },
    { date: '2025-02-11', value: 389038 },
    { date: '2025-02-12', value: 389074 },
    { date: '2025-02-13', value: 389095 },
    { date: '2025-02-14', value: 389129 },
    { date: '2025-02-24', value: 389393 },
    { date: '2025-02-25', value: 389418 },
    { date: '2025-02-26', value: 389444 },
    { date: '2025-02-27', value: 389470 },
    { date: '2025-03-03', value: 389572 },
    { date: '2025-03-04', value: 389599 },
    { date: '2025-03-05', value: 389624 },
    { date: '2025-03-06', value: 389654 },
    { date: '2025-03-07', value: 389681 },
    { date: '2025-03-10', value: 389764 },
    { date: '2025-03-11', value: 389792 },
    { date: '2025-03-12', value: 389829 },
    { date: '2025-03-13', value: 389862 },
    { date: '2025-03-14', value: 389891 },
    { date: '2025-03-17', value: 389979 },
    { date: '2025-03-18', value: 390005 },
    { date: '2025-03-19', value: 390037 },
    { date: '2025-03-20', value: 390073 },
    { date: '2025-03-21', value: 390104 },
    { date: '2025-03-24', value: 390200 },
    { date: '2025-03-25', value: 390224 },
    { date: '2025-03-26', value: 390262 },
    { date: '2025-03-27', value: 390314 },
    { date: '2025-03-28', value: 390355 },
    { date: '2025-03-31', value: 390465 },
    { date: '2025-04-01', value: 390499 },
    { date: '2025-04-02', value: 390534 },
    { date: '2025-04-03', value: 390572 },
    { date: '2025-04-04', value: 390612 },
    { date: '2025-04-07', value: 390704 },
    { date: '2025-04-08', value: 390735 },
    { date: '2025-04-09', value: 390771 },
    { date: '2025-04-10', value: 390811 },
    { date: '2025-04-11', value: 390844 },
    { date: '2025-04-14', value: 390940 },
    { date: '2025-04-15', value: 390964 },
    { date: '2025-04-16', value: 390991 },
    { date: '2025-04-17', value: 391017 },
    { date: '2025-04-21', value: 391136 },
    { date: '2025-04-22', value: 391158 },
    { date: '2025-04-23', value: 391180 },
    { date: '2025-04-24', value: 391202 },
    { date: '2025-04-28', value: 391267 },
    { date: '2025-04-29', value: 391288 },
    { date: '2025-04-30', value: 391308 },
    { date: '2025-05-02', value: 391347 },
    { date: '2025-05-05', value: 391418 },
    { date: '2025-05-06', value: 391443 },
    { date: '2025-05-07', value: 391469 },
    { date: '2025-05-09', value: 391527 },
    { date: '2025-05-12', value: 391611 },
    { date: '2025-05-13', value: 391635 },
    { date: '2025-05-14', value: 391663 },
    { date: '2025-05-15', value: 391694 },
    { date: '2025-05-16', value: 391722 },
    { date: '2025-05-19', value: 391802 },
    { date: '2025-05-20', value: 391830 },
    { date: '2025-05-21', value: 391855 },
    { date: '2025-05-22', value: 391882 },
    { date: '2025-05-23', value: 391915 },
    { date: '2025-05-26', value: 391993 }
];

const meterId = 5; // ID for 2.OG Recht meter

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
                            console.log(`\n🎉 Successfully added ${addedCount} readings for 2.OG Recht meter!`);
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