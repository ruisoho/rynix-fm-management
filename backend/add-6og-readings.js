const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, '..', 'app.db');
const db = new sqlite3.Database(dbPath);

console.log('Connected to SQLite database.');

// Meter readings data for 6.OG (ID: 13)
const readings = [
    { date: '2025-01-02', value: 259236 },
    { date: '2025-01-03', value: 259336 },
    { date: '2025-01-04', value: null },
    { date: '2025-01-05', value: null },
    { date: '2025-01-06', value: 259599 },
    { date: '2025-01-07', value: 259705 },
    { date: '2025-01-08', value: 259812 },
    { date: '2025-01-09', value: 259922 },
    { date: '2025-01-10', value: 260028 },
    { date: '2025-01-11', value: null },
    { date: '2025-01-12', value: null },
    { date: '2025-01-13', value: 260289 },
    { date: '2025-01-14', value: 260386 },
    { date: '2025-01-15', value: 260487 },
    { date: '2025-01-16', value: 260595 },
    { date: '2025-01-17', value: 260694 },
    { date: '2025-01-18', value: null },
    { date: '2025-01-19', value: null },
    { date: '2025-01-20', value: 260959 },
    { date: '2025-01-21', value: 261066 },
    { date: '2025-01-22', value: 261171 },
    { date: '2025-01-23', value: 261274 },
    { date: '2025-01-24', value: 261382 },
    { date: '2025-01-25', value: null },
    { date: '2025-01-26', value: null },
    { date: '2025-01-27', value: 261639 },
    { date: '2025-01-28', value: 261723 },
    { date: '2025-01-29', value: 261815 },
    { date: '2025-01-30', value: 261899 },
    { date: '2025-01-31', value: 261986 },
    { date: '2025-02-01', value: null },
    { date: '2025-02-02', value: null },
    { date: '2025-02-03', value: 262235 },
    { date: '2025-02-04', value: 262317 },
    { date: '2025-02-05', value: 262411 },
    { date: '2025-02-06', value: 262505 },
    { date: '2025-02-07', value: 262585 },
    { date: '2025-02-08', value: null },
    { date: '2025-02-09', value: null },
    { date: '2025-02-10', value: 262852 },
    { date: '2025-02-11', value: 262932 },
    { date: '2025-02-12', value: 263038 },
    { date: '2025-02-13', value: 263094 },
    { date: '2025-02-14', value: 263180 },
    { date: '2025-02-15', value: null },
    { date: '2025-02-16', value: null },
    { date: '2025-02-17', value: null },
    { date: '2025-02-18', value: null },
    { date: '2025-02-19', value: null },
    { date: '2025-02-20', value: null },
    { date: '2025-02-21', value: null },
    { date: '2025-02-22', value: null },
    { date: '2025-02-23', value: null },
    { date: '2025-02-24', value: 263914 },
    { date: '2025-02-25', value: 263986 },
    { date: '2025-02-26', value: 264066 },
    { date: '2025-02-27', value: 264156 },
    { date: '2025-02-28', value: null },
    { date: '2025-03-01', value: null },
    { date: '2025-03-02', value: null },
    { date: '2025-03-03', value: 264473 },
    { date: '2025-03-04', value: 264560 },
    { date: '2025-03-05', value: 264648 },
    { date: '2025-03-06', value: 264750 },
    { date: '2025-03-07', value: 264846 },
    { date: '2025-03-08', value: null },
    { date: '2025-03-09', value: null },
    { date: '2025-03-10', value: 265111 },
    { date: '2025-03-11', value: 265217 },
    { date: '2025-03-12', value: 265332 },
    { date: '2025-03-13', value: 265429 },
    { date: '2025-03-14', value: 265533 },
    { date: '2025-03-15', value: null },
    { date: '2025-03-16', value: null },
    { date: '2025-03-17', value: 265810 },
    { date: '2025-03-18', value: 265900 },
    { date: '2025-03-19', value: 265999 },
    { date: '2025-03-20', value: 266097 },
    { date: '2025-03-21', value: 266200 },
    { date: '2025-03-22', value: null },
    { date: '2025-03-23', value: null },
    { date: '2025-03-24', value: 266468 },
    { date: '2025-03-25', value: 266557 },
    { date: '2025-03-26', value: 266664 },
    { date: '2025-03-27', value: 266769 },
    { date: '2025-03-28', value: 266868 },
    { date: '2025-03-29', value: null },
    { date: '2025-03-30', value: null },
    { date: '2025-03-31', value: 267139 },
    { date: '2025-04-01', value: 267235 },
    { date: '2025-04-02', value: 267335 },
    { date: '2025-04-03', value: 267435 },
    { date: '2025-04-04', value: 267530 },
    { date: '2025-04-05', value: null },
    { date: '2025-04-06', value: null },
    { date: '2025-04-07', value: 267808 },
    { date: '2025-04-08', value: 267898 },
    { date: '2025-04-09', value: 267993 },
    { date: '2025-04-10', value: 268096 },
    { date: '2025-04-11', value: 268192 },
    { date: '2025-04-12', value: null },
    { date: '2025-04-13', value: null },
    { date: '2025-04-14', value: 268449 },
    { date: '2025-04-15', value: 268526 },
    { date: '2025-04-16', value: 268619 },
    { date: '2025-04-17', value: 268710 },
    { date: '2025-04-18', value: null },
    { date: '2025-04-19', value: null },
    { date: '2025-04-20', value: null },
    { date: '2025-04-21', value: null },
    { date: '2025-04-22', value: 269097 },
    { date: '2025-04-23', value: 269187 },
    { date: '2025-04-24', value: 269282 },
    { date: '2025-04-25', value: 269380 },
    { date: '2025-04-26', value: null },
    { date: '2025-04-27', value: null },
    { date: '2025-04-28', value: 269649 },
    { date: '2025-04-29', value: 269742 },
    { date: '2025-04-30', value: 269836 },
    { date: '2025-05-01', value: null },
    { date: '2025-05-02', value: 270013 },
    { date: '2025-05-03', value: null },
    { date: '2025-05-04', value: null },
    { date: '2025-05-05', value: 270282 },
    { date: '2025-05-06', value: 270372 },
    { date: '2025-05-07', value: 270481 },
    { date: '2025-05-08', value: null },
    { date: '2025-05-09', value: 270659 },
    { date: '2025-05-10', value: null },
    { date: '2025-05-11', value: null },
    { date: '2025-05-12', value: 270928 },
    { date: '2025-05-13', value: 271016 },
    { date: '2025-05-14', value: 271108 },
    { date: '2025-05-15', value: 271224 },
    { date: '2025-05-16', value: 271306 },
    { date: '2025-05-17', value: null },
    { date: '2025-05-18', value: null },
    { date: '2025-05-19', value: 271574 },
    { date: '2025-05-20', value: 271656 },
    { date: '2025-05-21', value: 271748 },
    { date: '2025-05-22', value: 271844 },
    { date: '2025-05-23', value: 271955 },
    { date: '2025-05-24', value: null },
    { date: '2025-05-25', value: null },
    { date: '2025-05-26', value: 272212 }
];

// Insert readings
const insertReading = db.prepare('INSERT INTO meter_readings (meter_id, value, date) VALUES (?, ?, ?)');

let insertedCount = 0;
readings.forEach(reading => {
    if (reading.value !== null) {
        insertReading.run(13, reading.value, reading.date, function(err) {
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
        console.log(`Database connection closed. Added ${insertedCount} readings for 6.OG meter.`);
    }
});