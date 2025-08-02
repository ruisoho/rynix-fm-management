const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, '..', 'app.db');
const db = new sqlite3.Database(dbPath);

console.log('Connected to SQLite database.');

// Meter readings data for Hausanlage (ID: 16)
const readings = [
    { date: '2025-01-02', value: 201879 },
    { date: '2025-01-03', value: 201890 },
    { date: '2025-01-04', value: null },
    { date: '2025-01-05', value: null },
    { date: '2025-01-06', value: 201921 },
    { date: '2025-01-07', value: 201932 },
    { date: '2025-01-08', value: 201942 },
    { date: '2025-01-09', value: 201953 },
    { date: '2025-01-10', value: 201964 },
    { date: '2025-01-11', value: null },
    { date: '2025-01-12', value: null },
    { date: '2025-01-13', value: 201995 },
    { date: '2025-01-14', value: 202005 },
    { date: '2025-01-15', value: 202015 },
    { date: '2025-01-16', value: 202026 },
    { date: '2025-01-17', value: 202039 },
    { date: '2025-01-18', value: null },
    { date: '2025-01-19', value: null },
    { date: '2025-01-20', value: 202069 },
    { date: '2025-01-21', value: 202079 },
    { date: '2025-01-22', value: 202092 },
    { date: '2025-01-23', value: 202103 },
    { date: '2025-01-24', value: 202115 },
    { date: '2025-01-25', value: null },
    { date: '2025-01-26', value: null },
    { date: '2025-01-27', value: 202148 },
    { date: '2025-01-28', value: 202165 },
    { date: '2025-01-29', value: 202178 },
    { date: '2025-01-30', value: 202189 },
    { date: '2025-01-31', value: 202199 },
    { date: '2025-02-01', value: null },
    { date: '2025-02-02', value: null },
    { date: '2025-02-03', value: 202226 },
    { date: '2025-02-04', value: 202235 },
    { date: '2025-02-05', value: 202245 },
    { date: '2025-02-06', value: 202255 },
    { date: '2025-02-07', value: 202264 },
    { date: '2025-02-08', value: null },
    { date: '2025-02-09', value: null },
    { date: '2025-02-10', value: 202291 },
    { date: '2025-02-11', value: 202301 },
    { date: '2025-02-12', value: 202312 },
    { date: '2025-02-13', value: 202319 },
    { date: '2025-02-14', value: 202329 },
    { date: '2025-02-15', value: null },
    { date: '2025-02-16', value: null },
    { date: '2025-02-17', value: null },
    { date: '2025-02-18', value: null },
    { date: '2025-02-19', value: null },
    { date: '2025-02-20', value: null },
    { date: '2025-02-21', value: null },
    { date: '2025-02-22', value: null },
    { date: '2025-02-23', value: null },
    { date: '2025-02-24', value: 202420 },
    { date: '2025-02-25', value: 202429 },
    { date: '2025-02-26', value: 202438 },
    { date: '2025-02-27', value: 202447 },
    { date: '2025-02-28', value: null },
    { date: '2025-03-01', value: null },
    { date: '2025-03-02', value: null },
    { date: '2025-03-03', value: 202483 },
    { date: '2025-03-04', value: 202492 },
    { date: '2025-03-05', value: 202500 },
    { date: '2025-03-06', value: 202510 },
    { date: '2025-03-07', value: 202518 },
    { date: '2025-03-08', value: null },
    { date: '2025-03-09', value: null },
    { date: '2025-03-10', value: 202544 },
    { date: '2025-03-11', value: 202553 },
    { date: '2025-03-12', value: 202562 },
    { date: '2025-03-13', value: 202571 },
    { date: '2025-03-14', value: 202581 },
    { date: '2025-03-15', value: null },
    { date: '2025-03-16', value: null },
    { date: '2025-03-17', value: 202607 },
    { date: '2025-03-18', value: 202615 },
    { date: '2025-03-19', value: 202624 },
    { date: '2025-03-20', value: 202632 },
    { date: '2025-03-21', value: 202642 },
    { date: '2025-03-22', value: null },
    { date: '2025-03-23', value: null },
    { date: '2025-03-24', value: 202667 },
    { date: '2025-03-25', value: 202675 },
    { date: '2025-03-26', value: 202684 },
    { date: '2025-03-27', value: 202692 },
    { date: '2025-03-28', value: 202701 },
    { date: '2025-03-29', value: null },
    { date: '2025-03-30', value: null },
    { date: '2025-03-31', value: 202725 },
    { date: '2025-04-01', value: 202735 },
    { date: '2025-04-02', value: 202744 },
    { date: '2025-04-03', value: 202752 },
    { date: '2025-04-04', value: 202760 },
    { date: '2025-04-05', value: null },
    { date: '2025-04-06', value: null },
    { date: '2025-04-07', value: 202783 },
    { date: '2025-04-08', value: 202792 },
    { date: '2025-04-09', value: 202800 },
    { date: '2025-04-10', value: 202808 },
    { date: '2025-04-11', value: 202816 },
    { date: '2025-04-12', value: null },
    { date: '2025-04-13', value: null },
    { date: '2025-04-14', value: 202838 },
    { date: '2025-04-15', value: 202846 },
    { date: '2025-04-16', value: 202854 },
    { date: '2025-04-17', value: 202862 },
    { date: '2025-04-18', value: null },
    { date: '2025-04-19', value: null },
    { date: '2025-04-20', value: null },
    { date: '2025-04-21', value: null },
    { date: '2025-04-22', value: 202899 },
    { date: '2025-04-23', value: 202907 },
    { date: '2025-04-24', value: 202914 },
    { date: '2025-04-25', value: 202923 },
    { date: '2025-04-26', value: null },
    { date: '2025-04-27', value: null },
    { date: '2025-04-28', value: 202945 },
    { date: '2025-04-29', value: 202953 },
    { date: '2025-04-30', value: 202960 },
    { date: '2025-05-01', value: null },
    { date: '2025-05-02', value: 202974 },
    { date: '2025-05-03', value: null },
    { date: '2025-05-04', value: null },
    { date: '2025-05-05', value: 202996 },
    { date: '2025-05-06', value: 203004 },
    { date: '2025-05-07', value: 203013 },
    { date: '2025-05-08', value: null },
    { date: '2025-05-09', value: 203031 },
    { date: '2025-05-10', value: null },
    { date: '2025-05-11', value: null },
    { date: '2025-05-12', value: 203057 },
    { date: '2025-05-13', value: 203066 },
    { date: '2025-05-14', value: 203076 },
    { date: '2025-05-15', value: 203087 },
    { date: '2025-05-16', value: 203097 },
    { date: '2025-05-17', value: null },
    { date: '2025-05-18', value: null },
    { date: '2025-05-19', value: 203126 },
    { date: '2025-05-20', value: 203135 },
    { date: '2025-05-21', value: 203144 },
    { date: '2025-05-22', value: 203154 },
    { date: '2025-05-23', value: 203165 },
    { date: '2025-05-24', value: null },
    { date: '2025-05-25', value: null },
    { date: '2025-05-26', value: 203191 }
];

// Insert readings
const insertReading = db.prepare('INSERT INTO meter_readings (meter_id, value, date) VALUES (?, ?, ?)');

let insertedCount = 0;
readings.forEach(reading => {
    if (reading.value !== null) {
        insertReading.run(16, reading.value, reading.date, function(err) {
            if (err) {
                console.error('Error inserting reading:', err);
            } else {
                insertedCount++;
                console.log(`Inserted reading for ${reading.date}: ${reading.value}`);
            }
        });
    }
});

insertReading.finalize();

// Close database connection
db.close((err) => {
    if (err) {
        console.error('Error closing database:', err);
    } else {
        console.log(`Database connection closed. Added ${insertedCount} readings for Hausanlage meter.`);
    }
});