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

// Meter readings data for EG Links [1DZG0061112423]
const readings = [
  // January 2025 (continuing from where we left off)
  { date: '2025-01-11', reading: 4860 },
  { date: '2025-01-12', reading: 4881 },
  { date: '2025-01-13', reading: 4903 },
  { date: '2025-01-14', reading: 4921 },
  { date: '2025-01-15', reading: 4949 },
  { date: '2025-01-18', reading: 4997 },
  { date: '2025-01-19', reading: 5009 },
  { date: '2025-01-20', reading: 5026 },
  { date: '2025-01-21', reading: 5038 },
  { date: '2025-01-22', reading: 5054 },
  { date: '2025-01-25', reading: 5099 },
  { date: '2025-01-26', reading: 5116 },
  { date: '2025-01-27', reading: 5129 },
  { date: '2025-01-28', reading: 5141 },
  { date: '2025-01-29', reading: 5154 },
  
  // February 2025
  { date: '2025-02-01', reading: 5190 },
  { date: '2025-02-02', reading: 5203 },
  { date: '2025-02-03', reading: 5218 },
  { date: '2025-02-04', reading: 5235 },
  { date: '2025-02-05', reading: 5247 },
  { date: '2025-02-08', reading: 5283 },
  { date: '2025-02-09', reading: 5302 },
  { date: '2025-02-10', reading: 5322 },
  { date: '2025-02-11', reading: 5330 },
  { date: '2025-02-12', reading: 5343 },
  { date: '2025-02-19', reading: 5467 },
  { date: '2025-02-20', reading: 5480 },
  { date: '2025-02-21', reading: 5494 },
  { date: '2025-02-22', reading: 5510 },
  { date: '2025-02-25', reading: 5561 },
  { date: '2025-02-26', reading: 5576 },
  { date: '2025-02-27', reading: 5590 },
  { date: '2025-02-28', reading: 5606 },
  
  // March 2025
  { date: '2025-03-01', reading: 5621 },
  { date: '2025-03-04', reading: 5667 },
  { date: '2025-03-05', reading: 5685 },
  { date: '2025-03-06', reading: 5774 },
  { date: '2025-03-07', reading: 5737 },
  { date: '2025-03-08', reading: 5753 },
  { date: '2025-03-11', reading: 5799 },
  { date: '2025-03-12', reading: 5873 },
  { date: '2025-03-13', reading: 5827 },
  { date: '2025-03-14', reading: 5842 },
  { date: '2025-03-15', reading: 5857 },
  { date: '2025-03-18', reading: 5903 },
  { date: '2025-03-19', reading: 5915 },
  { date: '2025-03-20', reading: 5930 },
  { date: '2025-03-21', reading: 5944 },
  { date: '2025-03-22', reading: 5958 },
  { date: '2025-03-25', reading: 5999 },
  { date: '2025-03-26', reading: 6013 },
  { date: '2025-03-27', reading: 6028 },
  { date: '2025-03-28', reading: 6042 },
  { date: '2025-03-29', reading: 6056 },
  
  // April 2025
  { date: '2025-04-01', reading: 6100 },
  { date: '2025-04-02', reading: 6114 },
  { date: '2025-04-03', reading: 6127 },
  { date: '2025-04-04', reading: 6141 },
  { date: '2025-04-05', reading: 6154 },
  { date: '2025-04-08', reading: 6201 },
  { date: '2025-04-09', reading: 6215 },
  { date: '2025-04-10', reading: 6228 },
  { date: '2025-04-11', reading: 6242 },
  { date: '2025-04-16', reading: 6303 },
  { date: '2025-04-17', reading: 6316 },
  { date: '2025-04-18', reading: 6330 },
  { date: '2025-04-19', reading: 6345 },
  { date: '2025-04-22', reading: 6386 },
  { date: '2025-04-23', reading: 6399 },
  { date: '2025-04-24', reading: 6412 },
  { date: '2025-04-26', reading: 6440 },
  { date: '2025-04-29', reading: 6492 },
  { date: '2025-04-30', reading: 6505 },
  
  // May 2025
  { date: '2025-05-01', reading: 6525 },
  { date: '2025-05-03', reading: 6558 },
  { date: '2025-05-06', reading: 6613 },
  { date: '2025-05-07', reading: 6627 },
  { date: '2025-05-08', reading: 6641 },
  { date: '2025-05-09', reading: 6657 },
  { date: '2025-05-10', reading: 6677 },
  { date: '2025-05-13', reading: 6763 },
  { date: '2025-05-14', reading: 6748 },
  { date: '2025-05-15', reading: 6762 },
  { date: '2025-05-16', reading: 6778 },
  { date: '2025-05-17', reading: 6795 },
  { date: '2025-05-20', reading: 6863 }
];

// Function to add readings
function addReadings() {
  // First, get the meter ID for the EG Links meter
  const getMeterQuery = `SELECT id FROM electric_meters WHERE serial_number = '1DZG0061112423'`;
  
  db.get(getMeterQuery, (err, row) => {
    if (err) {
      console.error('Error finding meter:', err.message);
      return;
    }
    
    if (!row) {
      console.error('Meter with serial number 1DZG0061112423 not found!');
      return;
    }
    
    const meterId = row.id;
    console.log(`Found meter with ID: ${meterId}`);
    
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
          console.log(`\n🎉 Successfully added ${insertedCount} readings for EG Links meter!`);
          
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
  });
}

// Run the function
addReadings();