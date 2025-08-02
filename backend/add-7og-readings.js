const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, '..', 'app.db');
const db = new sqlite3.Database(dbPath);

console.log('Connected to SQLite database.');

// Meter readings data for 7.OG (ID: 14)
const readings = [
    { date: '2025-01-02', value: 1744 },
    { date: '2025-01-03', value: 1745 },
    { date: '2025-01-04', value: null },
    { date: '2025-01-05', value: null },
    { date: '2025-01-06', value: 1747 },
    { date: '2025-01-07', value: 1748 },
    { date: '2025-01-08', value: 1749 },
    { date: '2025-01-09', value: 1749 },
    { date: '2025-01-10', value: 1750 },
    { date: '2025-01-11', value: null },
    { date: '2025-01-12', value: null },
    { date: '2025-01-13', value: 1753 },
    { date: '2025-01-14', value: 1754 },
    { date: '2025-01-15', value: 1754 },
    { date: '2025-01-16', value: 1755 },
    { date: '2025-01-17', value: 1756 },
    { date: '2025-01-18', value: null },
    { date: '2025-01-19', value: null },
    { date: '2025-01-20', value: 1759 },
    { date: '2025-01-21', value: 1764 },
    { date: '2025-01-22', value: 1774 },
    { date: '2025-01-23', value: 1787 },
    { date: '2025-01-24', value: 1790 },
    { date: '2025-01-25', value: null },
    { date: '2025-01-26', value: null },
    { date: '2025-01-27', value: 1804 },
    { date: '2025-01-28', value: 1808 },
    { date: '2025-01-29', value: 1812 },
    { date: '2025-01-30', value: 1811 },
    { date: '2025-01-31', value: 1821 },
    { date: '2025-02-01', value: null },
    { date: '2025-02-02', value: null },
    { date: '2025-02-03', value: 1825 },
    { date: '2025-02-04', value: 1826 },
    { date: '2025-02-05', value: 1827 },
    { date: '2025-02-06', value: 1828 },
    { date: '2025-02-07', value: 1829 },
    { date: '2025-02-08', value: null },
    { date: '2025-02-09', value: null },
    { date: '2025-02-10', value: 1840 },
    { date: '2025-02-11', value: 1846 },
    { date: '2025-02-12', value: 1849 },
    { date: '2025-02-13', value: 1849 },
    { date: '2025-02-14', value: 1851 },
    { date: '2025-02-15', value: null },
    { date: '2025-02-16', value: null },
    { date: '2025-02-17', value: null },
    { date: '2025-02-18', value: null },
    { date: '2025-02-19', value: null },
    { date: '2025-02-20', value: null },
    { date: '2025-02-21', value: null },
    { date: '2025-02-22', value: null },
    { date: '2025-02-23', value: null },
    { date: '2025-02-24', value: 1916 },
    { date: '2025-02-25', value: 1920 },
    { date: '2025-02-26', value: 1924 },
    { date: '2025-02-27', value: 1927 },
    { date: '2025-02-28', value: null },
    { date: '2025-03-01', value: null },
    { date: '2025-03-02', value: null },
    { date: '2025-03-03', value: 1933 },
    { date: '2025-03-04', value: 1934 },
    { date: '2025-03-05', value: 1936 },
    { date: '2025-03-06', value: 1939 },
    { date: '2025-03-07', value: 1941 },
    { date: '2025-03-08', value: null },
    { date: '2025-03-09', value: null },
    { date: '2025-03-10', value: 1943 },
    { date: '2025-03-11', value: 1944 },
    { date: '2025-03-12', value: 1945 },
    { date: '2025-03-13', value: 1946 },
    { date: '2025-03-14', value: 1946 },
    { date: '2025-03-15', value: null },
    { date: '2025-03-16', value: null },
    { date: '2025-03-17', value: 1949 },
    { date: '2025-03-18', value: 1949 },
    { date: '2025-03-19', value: 1950 },
    { date: '2025-03-20', value: 1951 },
    { date: '2025-03-21', value: 1952 },
    { date: '2025-03-22', value: null },
    { date: '2025-03-23', value: null },
    { date: '2025-03-24', value: 1954 },
    { date: '2025-03-25', value: 1955 },
    { date: '2025-03-26', value: 1956 },
    { date: '2025-03-27', value: 1956 },
    { date: '2025-03-28', value: 1957 },
    { date: '2025-03-29', value: null },
    { date: '2025-03-30', value: null },
    { date: '2025-03-31', value: 1959 },
    { date: '2025-04-01', value: 1960 },
    { date: '2025-04-02', value: 1961 },
    { date: '2025-04-03', value: 1962 },
    { date: '2025-04-04', value: 1963 },
    { date: '2025-04-05', value: null },
    { date: '2025-04-06', value: null },
    { date: '2025-04-07', value: 1965 },
    { date: '2025-04-08', value: 1966 },
    { date: '2025-04-09', value: 1967 },
    { date: '2025-04-10', value: 1968 },
    { date: '2025-04-11', value: 1969 },
    { date: '2025-04-12', value: null },
    { date: '2025-04-13', value: null },
    { date: '2025-04-14', value: 1971 },
    { date: '2025-04-15', value: 1972 },
    { date: '2025-04-16', value: 1973 },
    { date: '2025-04-17', value: 1974 },
    { date: '2025-04-18', value: null },
    { date: '2025-04-19', value: null },
    { date: '2025-04-20', value: null },
    { date: '2025-04-21', value: null },
    { date: '2025-04-22', value: 1974 },
    { date: '2025-04-23', value: 1980 },
    { date: '2025-04-24', value: 1980 },
    { date: '2025-04-25', value: 1981 },
    { date: '2025-04-26', value: null },
    { date: '2025-04-27', value: null },
    { date: '2025-04-28', value: 1990 },
    { date: '2025-04-29', value: 1991 },
    { date: '2025-04-30', value: 1992 },
    { date: '2025-05-01', value: null },
    { date: '2025-05-02', value: 1994 },
    { date: '2025-05-03', value: null },
    { date: '2025-05-04', value: null },
    { date: '2025-05-05', value: 2013 },
    { date: '2025-05-06', value: 2016 },
    { date: '2025-05-07', value: 2017 },
    { date: '2025-05-08', value: null },
    { date: '2025-05-09', value: 2019 },
    { date: '2025-05-10', value: null },
    { date: '2025-05-11', value: null },
    { date: '2025-05-12', value: 2024 },
    { date: '2025-05-13', value: 2027 },
    { date: '2025-05-14', value: 2030 },
    { date: '2025-05-15', value: 2033 },
    { date: '2025-05-16', value: 2036 },
    { date: '2025-05-17', value: null },
    { date: '2025-05-18', value: null },
    { date: '2025-05-19', value: 2041 },
    { date: '2025-05-20', value: 2042 },
    { date: '2025-05-21', value: 2042 },
    { date: '2025-05-22', value: 2043 },
    { date: '2025-05-23', value: 2045 },
    { date: '2025-05-24', value: null },
    { date: '2025-05-25', value: null },
    { date: '2025-05-26', value: 2047 }
];

// Insert readings
const insertReading = db.prepare('INSERT INTO meter_readings (meter_id, value, date) VALUES (?, ?, ?)');

let insertedCount = 0;
readings.forEach(reading => {
    if (reading.value !== null) {
        insertReading.run(14, reading.value, reading.date, function(err) {
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
        console.log(`Database connection closed. Added ${insertedCount} readings for 7.OG meter.`);
    }
});