const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, '..', 'app.db');
const db = new sqlite3.Database(dbPath);

console.log('Connected to SQLite database.');

// Meter readings data for 4.OG Links (ID: 10)
const readings = [
    { date: '2025-01-02', value: 2922 },
    { date: '2025-01-03', value: 2923 },
    { date: '2025-01-04', value: null },
    { date: '2025-01-05', value: null },
    { date: '2025-01-06', value: 2928 },
    { date: '2025-01-07', value: 2930 },
    { date: '2025-01-08', value: 2932 },
    { date: '2025-01-09', value: 2933 },
    { date: '2025-01-10', value: 2935 },
    { date: '2025-01-11', value: null },
    { date: '2025-01-12', value: null },
    { date: '2025-01-13', value: 2940 },
    { date: '2025-01-14', value: 2942 },
    { date: '2025-01-15', value: 2944 },
    { date: '2025-01-16', value: 2945 },
    { date: '2025-01-17', value: 2947 },
    { date: '2025-01-18', value: null },
    { date: '2025-01-19', value: null },
    { date: '2025-01-20', value: 2952 },
    { date: '2025-01-21', value: 2954 },
    { date: '2025-01-22', value: 2955 },
    { date: '2025-01-23', value: 2957 },
    { date: '2025-01-24', value: 2957 },
    { date: '2025-01-25', value: null },
    { date: '2025-01-26', value: null },
    { date: '2025-01-27', value: 2964 },
    { date: '2025-01-28', value: 2966 },
    { date: '2025-01-29', value: 2967 },
    { date: '2025-01-30', value: 2969 },
    { date: '2025-01-31', value: 2971 },
    { date: '2025-02-01', value: null },
    { date: '2025-02-02', value: null },
    { date: '2025-02-03', value: 2976 },
    { date: '2025-02-04', value: 2977 },
    { date: '2025-02-05', value: 2979 },
    { date: '2025-02-06', value: 2981 },
    { date: '2025-02-07', value: 2983 },
    { date: '2025-02-08', value: null },
    { date: '2025-02-09', value: null },
    { date: '2025-02-10', value: 2988 },
    { date: '2025-02-11', value: 2989 },
    { date: '2025-02-12', value: 2992 },
    { date: '2025-02-13', value: 2993 },
    { date: '2025-02-14', value: 2995 },
    { date: '2025-02-15', value: null },
    { date: '2025-02-16', value: null },
    { date: '2025-02-17', value: null },
    { date: '2025-02-18', value: null },
    { date: '2025-02-19', value: null },
    { date: '2025-02-20', value: null },
    { date: '2025-02-21', value: null },
    { date: '2025-02-22', value: null },
    { date: '2025-02-23', value: null },
    { date: '2025-02-24', value: 3012 },
    { date: '2025-02-25', value: 3013 },
    { date: '2025-02-26', value: 3015 },
    { date: '2025-02-27', value: 3017 },
    { date: '2025-02-28', value: null },
    { date: '2025-03-01', value: null },
    { date: '2025-03-02', value: null },
    { date: '2025-03-03', value: 3023 },
    { date: '2025-03-04', value: 3025 },
    { date: '2025-03-05', value: 3027 },
    { date: '2025-03-06', value: 3029 },
    { date: '2025-03-07', value: 3030 },
    { date: '2025-03-08', value: null },
    { date: '2025-03-09', value: null },
    { date: '2025-03-10', value: 3035 },
    { date: '2025-03-11', value: 3037 },
    { date: '2025-03-12', value: 3039 },
    { date: '2025-03-13', value: 3040 },
    { date: '2025-03-14', value: 3042 },
    { date: '2025-03-15', value: null },
    { date: '2025-03-16', value: null },
    { date: '2025-03-17', value: 3047 },
    { date: '2025-03-18', value: 3049 },
    { date: '2025-03-19', value: 3051 },
    { date: '2025-03-20', value: 3052 },
    { date: '2025-03-21', value: 3054 },
    { date: '2025-03-22', value: null },
    { date: '2025-03-23', value: null },
    { date: '2025-03-24', value: 3059 },
    { date: '2025-03-25', value: 3061 },
    { date: '2025-03-26', value: 3062 },
    { date: '2025-03-27', value: 3064 },
    { date: '2025-03-28', value: 3066 },
    { date: '2025-03-29', value: null },
    { date: '2025-03-30', value: null },
    { date: '2025-03-31', value: 3071 },
    { date: '2025-04-01', value: 3072 },
    { date: '2025-04-02', value: 3074 },
    { date: '2025-04-03', value: 3076 },
    { date: '2025-04-04', value: 3077 },
    { date: '2025-04-05', value: null },
    { date: '2025-04-06', value: null },
    { date: '2025-04-07', value: 3083 },
    { date: '2025-04-08', value: 3084 },
    { date: '2025-04-09', value: 3086 },
    { date: '2025-04-10', value: 3088 },
    { date: '2025-04-11', value: 3089 },
    { date: '2025-04-12', value: null },
    { date: '2025-04-13', value: null },
    { date: '2025-04-14', value: 3094 },
    { date: '2025-04-15', value: 3096 },
    { date: '2025-04-16', value: 3098 },
    { date: '2025-04-17', value: 3099 },
    { date: '2025-04-18', value: null },
    { date: '2025-04-19', value: null },
    { date: '2025-04-20', value: null },
    { date: '2025-04-21', value: null },
    { date: '2025-04-22', value: 3108 },
    { date: '2025-04-23', value: 3109 },
    { date: '2025-04-24', value: 3111 },
    { date: '2025-04-25', value: 3118 },
    { date: '2025-04-26', value: null },
    { date: '2025-04-27', value: null },
    { date: '2025-04-28', value: 3133 },
    { date: '2025-04-29', value: 3135 },
    { date: '2025-04-30', value: 3140 },
    { date: '2025-05-01', value: null },
    { date: '2025-05-02', value: 3144 },
    { date: '2025-05-03', value: null },
    { date: '2025-05-04', value: null },
    { date: '2025-05-05', value: 3149 },
    { date: '2025-05-06', value: 3151 },
    { date: '2025-05-07', value: 3153 },
    { date: '2025-05-08', value: null },
    { date: '2025-05-09', value: 3156 },
    { date: '2025-05-10', value: null },
    { date: '2025-05-11', value: null },
    { date: '2025-05-12', value: 3161 },
    { date: '2025-05-13', value: 3163 },
    { date: '2025-05-14', value: 3165 },
    { date: '2025-05-15', value: 3168 },
    { date: '2025-05-16', value: 3171 },
    { date: '2025-05-17', value: null },
    { date: '2025-05-18', value: null },
    { date: '2025-05-19', value: 3179 },
    { date: '2025-05-20', value: 3181 },
    { date: '2025-05-21', value: 3183 },
    { date: '2025-05-22', value: 3185 },
    { date: '2025-05-23', value: 3186 },
    { date: '2025-05-24', value: null },
    { date: '2025-05-25', value: null },
    { date: '2025-05-26', value: 3191 }
];

// Insert readings
const insertReading = db.prepare('INSERT INTO meter_readings (meter_id, value, date) VALUES (?, ?, ?)');

let insertedCount = 0;
readings.forEach(reading => {
    if (reading.value !== null) {
        insertReading.run(10, reading.value, reading.date, function(err) {
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
        console.log(`Database connection closed. Added ${insertedCount} readings for 4.OG Links meter.`);
    }
});