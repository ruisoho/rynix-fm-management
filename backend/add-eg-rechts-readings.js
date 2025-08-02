const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, '..', 'app.db');

// Connect to database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to SQLite database.');
});

// Meter readings data for EG Rechts [1EMH0010473016] - Meter ID: 2
const readings = [
  // January 2025
  { date: '2025-01-02', reading: 7781 },
  { date: '2025-01-03', reading: 7801 },
  { date: '2025-01-06', reading: 7824 },
  { date: '2025-01-07', reading: 7834 },
  { date: '2025-01-08', reading: 7836 },
  { date: '2025-01-09', reading: 7840 },
  { date: '2025-01-10', reading: 7850 },
  { date: '2025-01-13', reading: 7869 },
  { date: '2025-01-14', reading: 7875 },
  { date: '2025-01-15', reading: 7877 },
  { date: '2025-01-16', reading: 7886 },
  { date: '2025-01-17', reading: 7896 },
  { date: '2025-01-20', reading: 7921 },
  { date: '2025-01-21', reading: 7924 },
  { date: '2025-01-22', reading: 7930 },
  { date: '2025-01-23', reading: 7931 },
  { date: '2025-01-24', reading: 7934 },
  { date: '2025-01-27', reading: 7940 },
  { date: '2025-01-28', reading: 7949 },
  { date: '2025-01-29', reading: 7951 },
  { date: '2025-01-30', reading: 7953 },
  { date: '2025-01-31', reading: 7955 },
  
  // February 2025
  { date: '2025-02-03', reading: 7967 },
  { date: '2025-02-04', reading: 7962 },
  { date: '2025-02-05', reading: 7964 },
  { date: '2025-02-06', reading: 7973 },
  { date: '2025-02-07', reading: 7979 },
  { date: '2025-02-10', reading: 7983 },
  { date: '2025-02-11', reading: 7983 },
  { date: '2025-02-12', reading: 7984 },
  { date: '2025-02-13', reading: 7985 },
  { date: '2025-02-14', reading: 7985 },
  { date: '2025-02-21', reading: 8008 },
  { date: '2025-02-22', reading: 8010 },
  { date: '2025-02-23', reading: 8012 },
  { date: '2025-02-24', reading: 8014 },
  { date: '2025-02-27', reading: 8020 },
  { date: '2025-02-28', reading: 8026 },
  
  // March 2025
  { date: '2025-03-01', reading: 8029 },
  { date: '2025-03-02', reading: 8038 },
  { date: '2025-03-03', reading: 8040 },
  { date: '2025-03-06', reading: 8046 },
  { date: '2025-03-07', reading: 8048 },
  { date: '2025-03-08', reading: 8056 },
  { date: '2025-03-09', reading: 8059 },
  { date: '2025-03-10', reading: 8061 },
  { date: '2025-03-13', reading: 8082 },
  { date: '2025-03-14', reading: 8083 },
  { date: '2025-03-15', reading: 8086 },
  { date: '2025-03-16', reading: 8098 },
  { date: '2025-03-17', reading: 8101 },
  { date: '2025-03-20', reading: 8131 },
  { date: '2025-03-21', reading: 8133 },
  { date: '2025-03-22', reading: 8136 },
  { date: '2025-03-23', reading: 8146 },
  { date: '2025-03-24', reading: 8152 },
  { date: '2025-03-27', reading: 8181 },
  { date: '2025-03-28', reading: 8184 },
  { date: '2025-03-29', reading: 8187 },
  { date: '2025-03-30', reading: 8198 },
  { date: '2025-03-31', reading: 8207 },
  
  // April 2025
  { date: '2025-04-01', reading: 8216 },
  { date: '2025-04-02', reading: 8218 },
  { date: '2025-04-03', reading: 8221 },
  { date: '2025-04-04', reading: 8233 },
  { date: '2025-04-05', reading: 8235 },
  { date: '2025-04-08', reading: 8251 },
  { date: '2025-04-09', reading: 8256 },
  { date: '2025-04-10', reading: 8258 },
  { date: '2025-04-11', reading: 8265 },
  { date: '2025-04-16', reading: 8273 },
  { date: '2025-04-17', reading: 8278 },
  { date: '2025-04-18', reading: 8294 },
  { date: '2025-04-19', reading: 8302 },
  { date: '2025-04-22', reading: 8319 },
  { date: '2025-04-23', reading: 8327 },
  { date: '2025-04-24', reading: 8329 },
  { date: '2025-04-26', reading: 8341 },
  { date: '2025-04-29', reading: 8361 },
  { date: '2025-04-30', reading: 8369 },
  
  // May 2025
  { date: '2025-05-01', reading: 8391 },
  { date: '2025-05-03', reading: 8404 },
  { date: '2025-05-06', reading: 8415 },
  { date: '2025-05-07', reading: 8417 },
  { date: '2025-05-08', reading: 8420 },
  { date: '2025-05-09', reading: 8423 },
  { date: '2025-05-10', reading: 8438 },
  { date: '2025-05-13', reading: 8450 },
  { date: '2025-05-14', reading: 8452 },
  { date: '2025-05-15', reading: 8455 },
  { date: '2025-05-16', reading: 8463 },
  { date: '2025-05-17', reading: 8466 },
  { date: '2025-05-20', reading: 8490 }
];

// Function to add readings for existing meter (ID: 2)
function addReadings() {
  const meterId = 2; // EG Rechts meter ID
  
  console.log(`Adding readings for EG Rechts meter (ID: ${meterId})`);
  
  // Insert all readings
  const insertQuery = `
    INSERT INTO meter_readings (meter_id, value, date, created_at)
    VALUES (?, ?, ?, datetime('now'))
  `;
  
  let insertedCount = 0;
  let totalReadings = readings.length;
  
  readings.forEach((reading, index) => {
    db.run(insertQuery, [meterId, reading.reading, reading.date], function(err) {
      if (err) {
        console.error(`Error inserting reading for ${reading.date}:`, err.message);
      } else {
        console.log(`✓ Added reading for ${reading.date}: ${reading.reading} kWh`);
      }
      
      insertedCount++;
      
      // Close database when all readings are processed
      if (insertedCount === totalReadings) {
        console.log(`\n🎉 Successfully added ${insertedCount} readings for EG Rechts meter!`);
        
        // Verify total readings count
        const countQuery = `SELECT COUNT(*) as count FROM meter_readings WHERE meter_id = ?`;
        db.get(countQuery, [meterId], (err, result) => {
          if (err) {
            console.error('Error counting readings:', err.message);
          } else {
            console.log(`📊 Total readings for this meter: ${result.count}`);
          }
          
          db.close((err) => {
            if (err) {
              console.error('Error closing database:', err.message);
            } else {
              console.log('Database connection closed.');
            }
          });
        });
      }
    });
  });
}

// Run the function
addReadings();