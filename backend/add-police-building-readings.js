const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, '..', 'app.db');
const db = new sqlite3.Database(dbPath);

// Police Building heating meter readings data
const meterId = 24; // Police Building heating meter ID
const readings = [
    { date: '2025-01-02', value: 5027.34 },
    { date: '2025-01-03', value: 5030.35 },
    { date: '2025-01-04', value: null },
    { date: '2025-01-05', value: null },
    { date: '2025-01-06', value: 5039.66 },
    { date: '2025-01-07', value: 5041.97 },
    { date: '2025-01-08', value: 5044.17 },
    { date: '2025-01-09', value: 5046.56 },
    { date: '2025-01-10', value: 5049.14 },
    { date: '2025-01-11', value: null },
    { date: '2025-01-12', value: null },
    { date: '2025-01-13', value: 5057.19 },
    { date: '2025-01-14', value: 5060.21 },
    { date: '2025-01-15', value: 5062.53 },
    { date: '2025-01-16', value: 5065.41 },
    { date: '2025-01-17', value: 5068.20 },
    { date: '2025-01-18', value: null },
    { date: '2025-01-19', value: null },
    { date: '2025-01-20', value: 5076.04 },
    { date: '2025-01-21', value: 5078.49 },
    { date: '2025-01-22', value: 5081.00 },
    { date: '2025-01-23', value: 5083.49 },
    { date: '2025-01-24', value: 5086.13 },
    { date: '2025-01-25', value: null },
    { date: '2025-01-26', value: null },
    { date: '2025-01-27', value: 5091.86 },
    { date: '2025-01-28', value: 5093.66 },
    { date: '2025-01-29', value: 5095.57 },
    { date: '2025-01-30', value: 5097.43 },
    { date: '2025-01-31', value: 5099.38 },
    { date: '2025-02-01', value: null },
    { date: '2025-02-02', value: null },
    { date: '2025-02-03', value: 5106.07 },
    { date: '2025-02-04', value: 5108.44 },
    { date: '2025-02-05', value: 5111.02 },
    { date: '2025-02-06', value: 5113.26 },
    { date: '2025-02-07', value: 5115.44 },
    { date: '2025-02-08', value: null },
    { date: '2025-02-09', value: null },
    { date: '2025-02-10', value: 5122.66 },
    { date: '2025-02-11', value: 5125.42 },
    { date: '2025-02-12', value: 5128.36 },
    { date: '2025-02-13', value: 5131.11 },
    { date: '2025-02-14', value: 5133.94 },
    { date: '2025-02-15', value: null },
    { date: '2025-02-16', value: null },
    { date: '2025-02-17', value: null },
    { date: '2025-02-18', value: null },
    { date: '2025-02-19', value: null },
    { date: '2025-02-20', value: null },
    { date: '2025-02-21', value: null },
    { date: '2025-02-22', value: null },
    { date: '2025-02-23', value: null },
    { date: '2025-02-24', value: 5159.05 },
    { date: '2025-02-25', value: 5160.60 },
    { date: '2025-02-26', value: 5162.22 },
    { date: '2025-02-27', value: 5163.79 },
    { date: '2025-02-28', value: null },
    { date: '2025-03-01', value: null },
    { date: '2025-03-02', value: null },
    { date: '2025-03-03', value: 5171.02 },
    { date: '2025-03-04', value: 5172.65 },
    { date: '2025-03-05', value: 5174.15 },
    { date: '2025-03-06', value: 5175.44 },
    { date: '2025-03-07', value: 5176.58 },
    { date: '2025-03-08', value: null },
    { date: '2025-03-09', value: null },
    { date: '2025-03-10', value: 5179.60 },
    { date: '2025-03-11', value: 5180.73 },
    { date: '2025-03-12', value: 5182.24 },
    { date: '2025-03-13', value: 5183.80 },
    { date: '2025-03-14', value: 5185.52 },
    { date: '2025-03-15', value: null },
    { date: '2025-03-16', value: null },
    { date: '2025-03-17', value: 5190.37 },
    { date: '2025-03-18', value: 5192.20 },
    { date: '2025-03-19', value: 5193.85 },
    { date: '2025-03-20', value: 5195.20 },
    { date: '2025-03-21', value: 5196.15 },
    { date: '2025-03-22', value: null },
    { date: '2025-03-23', value: null },
    { date: '2025-03-24', value: 5198.50 },
    { date: '2025-03-25', value: 5199.28 },
    { date: '2025-03-26', value: 5200.23 },
    { date: '2025-03-27', value: 5201.58 },
    { date: '2025-03-28', value: 5202.80 },
    { date: '2025-03-29', value: null },
    { date: '2025-03-30', value: null },
    { date: '2025-03-31', value: 5206.08 },
    { date: '2025-04-01', value: 5207.37 },
    { date: '2025-04-02', value: 5208.37 },
    { date: '2025-04-03', value: 5209.10 },
    { date: '2025-04-04', value: 5209.60 },
    { date: '2025-04-05', value: null },
    { date: '2025-04-06', value: null },
    { date: '2025-04-07', value: 5212.65 },
    { date: '2025-04-08', value: 5213.78 },
    { date: '2025-04-09', value: 5214.57 },
    { date: '2025-04-10', value: 5215.42 },
    { date: '2025-04-11', value: 5216.22 },
    { date: '2025-04-12', value: null },
    { date: '2025-04-13', value: null },
    { date: '2025-04-14', value: 5217.63 },
    { date: '2025-04-15', value: 5217.72 },
    { date: '2025-04-16', value: 5217.74 },
    { date: '2025-04-17', value: 5217.76 },
    { date: '2025-04-18', value: null },
    { date: '2025-04-19', value: null },
    { date: '2025-04-20', value: null },
    { date: '2025-04-21', value: null },
    { date: '2025-04-22', value: 5219.39 },
    { date: '2025-04-23', value: 5219.61 },
    { date: '2025-04-24', value: 5219.80 },
    { date: '2025-04-25', value: 5220.10 },
    { date: '2025-04-26', value: null },
    { date: '2025-04-27', value: null },
    { date: '2025-04-28', value: 5221.16 },
    { date: '2025-04-29', value: 5221.33 },
    { date: '2025-04-30', value: 5223.51 },
    { date: '2025-05-01', value: null },
    { date: '2025-05-02', value: 5221.34 },
    { date: '2025-05-03', value: null },
    { date: '2025-05-04', value: null },
    { date: '2025-05-05', value: 5221.90 },
    { date: '2025-05-06', value: 5222.38 },
    { date: '2025-05-07', value: 5222.73 },
    { date: '2025-05-08', value: null },
    { date: '2025-05-09', value: 5223.38 },
    { date: '2025-05-10', value: null },
    { date: '2025-05-11', value: null },
    { date: '2025-05-12', value: 5223.91 },
    { date: '2025-05-13', value: 5523.95 }, // Note: This seems like a data entry error (5523.95 vs expected ~5224)
    { date: '2025-05-14', value: 5523.95 },
    { date: '2025-05-15', value: 5224.05 },
    { date: '2025-05-16', value: 5224.34 }
];

let insertedCount = 0;
let totalReadings = readings.length;

// Insert readings one by one
readings.forEach((reading, index) => {
    if (reading.value !== null) {
        db.run(`INSERT INTO meter_readings (meter_id, date, value, created_at) 
                VALUES (?, ?, ?, datetime('now'))`,
            [meterId, reading.date, reading.value],
            function(err) {
                if (err) {
                    console.error(`Error inserting reading for ${reading.date}:`, err.message);
                } else {
                    console.log(`Inserted reading for ${reading.date}: ${reading.value}`);
                    insertedCount++;
                }
                
                // Close database after last reading
                if (index === totalReadings - 1) {
                    setTimeout(() => {
                        db.close((err) => {
                            if (err) {
                                console.error('Error closing database:', err.message);
                            } else {
                                console.log(`Database connection closed. Added ${insertedCount} readings for Police Building heating meter.`);
                                console.log(`Total readings for this meter: ${insertedCount}`);
                            }
                        });
                    }, 100);
                }
            }
        );
    } else {
        // Handle null values - just count them for completion check
        if (index === totalReadings - 1) {
            setTimeout(() => {
                db.close((err) => {
                    if (err) {
                        console.error('Error closing database:', err.message);
                    } else {
                        console.log(`Database connection closed. Added ${insertedCount} readings for Police Building heating meter.`);
                        console.log(`Total readings for this meter: ${insertedCount}`);
                    }
                });
            }, 100);
        }
    }
});