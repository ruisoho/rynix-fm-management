const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, '..', 'app.db');
const db = new sqlite3.Database(dbPath);

console.log('Connected to SQLite database.');

// Meter readings data for 5.OG Rechts (ID: 11)
const readings = [
    { date: '2025-01-02', value: 5167 },
    { date: '2025-01-03', value: 5170 },
    { date: '2025-01-04', value: null },
    { date: '2025-01-05', value: null },
    { date: '2025-01-06', value: 5180 },
    { date: '2025-01-07', value: 5184 },
    { date: '2025-01-08', value: 5187 },
    { date: '2025-01-09', value: 5190 },
    { date: '2025-01-10', value: 5194 },
    { date: '2025-01-11', value: null },
    { date: '2025-01-12', value: null },
    { date: '2025-01-13', value: 5203 },
    { date: '2025-01-14', value: 5205 },
    { date: '2025-01-15', value: 5208 },
    { date: '2025-01-16', value: 5211 },
    { date: '2025-01-17', value: 5214 },
    { date: '2025-01-18', value: null },
    { date: '2025-01-19', value: null },
    { date: '2025-01-20', value: 5223 },
    { date: '2025-01-21', value: 5227 },
    { date: '2025-01-22', value: 5231 },
    { date: '2025-01-23', value: 5234 },
    { date: '2025-01-24', value: 5237 },
    { date: '2025-01-25', value: null },
    { date: '2025-01-26', value: null },
    { date: '2025-01-27', value: 5246 },
    { date: '2025-01-28', value: 5249 },
    { date: '2025-01-29', value: 5252 },
    { date: '2025-01-30', value: 5255 },
    { date: '2025-01-31', value: 5258 },
    { date: '2025-02-01', value: null },
    { date: '2025-02-02', value: null },
    { date: '2025-02-03', value: 5267 },
    { date: '2025-02-04', value: 5270 },
    { date: '2025-02-05', value: 5273 },
    { date: '2025-02-06', value: 5276 },
    { date: '2025-02-07', value: 5279 },
    { date: '2025-02-08', value: null },
    { date: '2025-02-09', value: null },
    { date: '2025-02-10', value: 5289 },
    { date: '2025-02-11', value: 5292 },
    { date: '2025-02-12', value: 5297 },
    { date: '2025-02-13', value: 5299 },
    { date: '2025-02-14', value: 5304 },
    { date: '2025-02-15', value: null },
    { date: '2025-02-16', value: null },
    { date: '2025-02-17', value: null },
    { date: '2025-02-18', value: null },
    { date: '2025-02-19', value: null },
    { date: '2025-02-20', value: null },
    { date: '2025-02-21', value: null },
    { date: '2025-02-22', value: null },
    { date: '2025-02-23', value: null },
    { date: '2025-02-24', value: 5344 },
    { date: '2025-02-25', value: 5349 },
    { date: '2025-02-26', value: 5359 },
    { date: '2025-02-27', value: 5365 },
    { date: '2025-02-28', value: null },
    { date: '2025-03-01', value: null },
    { date: '2025-03-02', value: null },
    { date: '2025-03-03', value: 5379 },
    { date: '2025-03-04', value: 5382 },
    { date: '2025-03-05', value: 5386 },
    { date: '2025-03-06', value: 5390 },
    { date: '2025-03-07', value: 5393 },
    { date: '2025-03-08', value: null },
    { date: '2025-03-09', value: null },
    { date: '2025-03-10', value: 5404 },
    { date: '2025-03-11', value: 5408 },
    { date: '2025-03-12', value: 5412 },
    { date: '2025-03-13', value: 5416 },
    { date: '2025-03-14', value: 5419 },
    { date: '2025-03-15', value: null },
    { date: '2025-03-16', value: null },
    { date: '2025-03-17', value: 5428 },
    { date: '2025-03-18', value: 5431 },
    { date: '2025-03-19', value: 5433 },
    { date: '2025-03-20', value: 5436 },
    { date: '2025-03-21', value: 5440 },
    { date: '2025-03-22', value: null },
    { date: '2025-03-23', value: null },
    { date: '2025-03-24', value: 5448 },
    { date: '2025-03-25', value: 5451 },
    { date: '2025-03-26', value: 5454 },
    { date: '2025-03-27', value: 5458 },
    { date: '2025-03-28', value: 5460 },
    { date: '2025-03-29', value: null },
    { date: '2025-03-30', value: null },
    { date: '2025-03-31', value: 5471 },
    { date: '2025-04-01', value: 5474 },
    { date: '2025-04-02', value: 5477 },
    { date: '2025-04-03', value: 5480 },
    { date: '2025-04-04', value: 5483 },
    { date: '2025-04-05', value: null },
    { date: '2025-04-06', value: null },
    { date: '2025-04-07', value: 5491 },
    { date: '2025-04-08', value: 5494 },
    { date: '2025-04-09', value: 5497 },
    { date: '2025-04-10', value: 5500 },
    { date: '2025-04-11', value: 5504 },
    { date: '2025-04-12', value: null },
    { date: '2025-04-13', value: null },
    { date: '2025-04-14', value: 5516 },
    { date: '2025-04-15', value: 5519 },
    { date: '2025-04-16', value: 5523 },
    { date: '2025-04-17', value: 5523 },
    { date: '2025-04-18', value: null },
    { date: '2025-04-19', value: null },
    { date: '2025-04-20', value: null },
    { date: '2025-04-21', value: null },
    { date: '2025-04-22', value: 5543 },
    { date: '2025-04-23', value: 5546 },
    { date: '2025-04-24', value: 5551 },
    { date: '2025-04-25', value: 5560 },
    { date: '2025-04-26', value: null },
    { date: '2025-04-27', value: null },
    { date: '2025-04-28', value: 5570 },
    { date: '2025-04-29', value: 5573 },
    { date: '2025-04-30', value: 5576 },
    { date: '2025-05-01', value: null },
    { date: '2025-05-02', value: 5582 },
    { date: '2025-05-03', value: null },
    { date: '2025-05-04', value: null },
    { date: '2025-05-05', value: 5590 },
    { date: '2025-05-06', value: 5593 },
    { date: '2025-05-07', value: 5596 },
    { date: '2025-05-08', value: null },
    { date: '2025-05-09', value: 5605 },
    { date: '2025-05-10', value: null },
    { date: '2025-05-11', value: null },
    { date: '2025-05-12', value: 5616 },
    { date: '2025-05-13', value: 5619 },
    { date: '2025-05-14', value: 5621 },
    { date: '2025-05-15', value: 5624 },
    { date: '2025-05-16', value: 5627 },
    { date: '2025-05-17', value: null },
    { date: '2025-05-18', value: null },
    { date: '2025-05-19', value: 5637 },
    { date: '2025-05-20', value: 5640 },
    { date: '2025-05-21', value: 5642 },
    { date: '2025-05-22', value: 5646 },
    { date: '2025-05-23', value: 5650 },
    { date: '2025-05-24', value: null },
    { date: '2025-05-25', value: null },
    { date: '2025-05-26', value: 5662 }
];

// Insert readings
const insertReading = db.prepare('INSERT INTO meter_readings (meter_id, value, date) VALUES (?, ?, ?)');

let insertedCount = 0;
readings.forEach(reading => {
    if (reading.value !== null) {
        insertReading.run(11, reading.value, reading.date, function(err) {
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
        console.log(`Database connection closed. Added ${insertedCount} readings for 5.OG Rechts meter.`);
    }
});