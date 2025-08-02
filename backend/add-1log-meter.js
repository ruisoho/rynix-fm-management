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

// Meter data for 1.OG Rechts
const meterData = {
  facility_id: 1, // Main Building
  serial_number: '1LOG0057059180',
  type: 'electric',
  location: '1.OG Rechts',
  installation_date: '2025-01-01',
  status: 'active'
};

// Meter readings data for 1.OG Rechts [1LOG0057059180]
const readings = [
  // January 2025
  { date: '2025-01-02', reading: 5356 },
  { date: '2025-01-03', reading: 5370 },
  { date: '2025-01-06', reading: 5412 },
  { date: '2025-01-07', reading: 5432 },
  { date: '2025-01-08', reading: 5444 },
  { date: '2025-01-09', reading: 5462 },
  { date: '2025-01-10', reading: 5478 },
  { date: '2025-01-13', reading: 5509 },
  { date: '2025-01-14', reading: 5519 },
  { date: '2025-01-15', reading: 5529 },
  { date: '2025-01-16', reading: 5540 },
  { date: '2025-01-17', reading: 5551 },
  { date: '2025-01-20', reading: 5577 },
  { date: '2025-01-21', reading: 5586 },
  { date: '2025-01-22', reading: 5595 },
  { date: '2025-01-23', reading: 5606 },
  { date: '2025-01-24', reading: 5614 },
  { date: '2025-01-27', reading: 5647 },
  { date: '2025-01-28', reading: 5656 },
  { date: '2025-01-29', reading: 5665 },
  { date: '2025-01-30', reading: 5674 },
  { date: '2025-01-31', reading: 5683 },
  
  // February 2025
  { date: '2025-02-03', reading: 5708 },
  { date: '2025-02-04', reading: 5718 },
  { date: '2025-02-05', reading: 5727 },
  { date: '2025-02-06', reading: 5735 },
  { date: '2025-02-07', reading: 5744 },
  { date: '2025-02-10', reading: 5773 },
  { date: '2025-02-11', reading: 5782 },
  { date: '2025-02-12', reading: 5794 },
  { date: '2025-02-13', reading: 5800 },
  { date: '2025-02-14', reading: 5811 },
  { date: '2025-02-21', reading: 5887 },
  { date: '2025-02-22', reading: 5894 },
  { date: '2025-02-23', reading: 5902 },
  { date: '2025-02-24', reading: 5908 },
  { date: '2025-02-27', reading: 5941 },
  { date: '2025-02-28', reading: 5949 },
  
  // March 2025
  { date: '2025-03-01', reading: 5958 },
  { date: '2025-03-02', reading: 5967 },
  { date: '2025-03-03', reading: 5976 },
  { date: '2025-03-06', reading: 5998 },
  { date: '2025-03-07', reading: 6007 },
  { date: '2025-03-08', reading: 6018 },
  { date: '2025-03-09', reading: 6031 },
  { date: '2025-03-10', reading: 6040 },
  { date: '2025-03-13', reading: 6073 },
  { date: '2025-03-14', reading: 6082 },
  { date: '2025-03-15', reading: 6093 },
  { date: '2025-03-16', reading: 6109 },
  { date: '2025-03-17', reading: 6126 },
  { date: '2025-03-20', reading: 6153 },
  { date: '2025-03-21', reading: 6161 },
  { date: '2025-03-22', reading: 6171 },
  { date: '2025-03-23', reading: 6188 },
  { date: '2025-03-24', reading: 6196 },
  { date: '2025-03-27', reading: 6234 },
  { date: '2025-03-28', reading: 6243 },
  { date: '2025-03-29', reading: 6253 },
  { date: '2025-03-30', reading: 6268 },
  { date: '2025-03-31', reading: 6282 },
  
  // April 2025
  { date: '2025-04-01', reading: 6318 },
  { date: '2025-04-02', reading: 6326 },
  { date: '2025-04-03', reading: 6336 },
  { date: '2025-04-04', reading: 6350 },
  { date: '2025-04-05', reading: 6365 },
  { date: '2025-04-08', reading: 6399 },
  { date: '2025-04-09', reading: 6406 },
  { date: '2025-04-10', reading: 6414 },
  { date: '2025-04-11', reading: 6422 },
  { date: '2025-04-16', reading: 6457 },
  { date: '2025-04-17', reading: 6465 },
  { date: '2025-04-18', reading: 6475 },
  { date: '2025-04-19', reading: 6485 },
  { date: '2025-04-22', reading: 6509 },
  { date: '2025-04-23', reading: 6516 },
  { date: '2025-04-24', reading: 6525 },
  { date: '2025-04-26', reading: 6540 },
  { date: '2025-04-29', reading: 6568 },
  { date: '2025-04-30', reading: 6579 },
  
  // May 2025
  { date: '2025-05-01', reading: 6591 },
  { date: '2025-05-03', reading: 6611 },
  { date: '2025-05-06', reading: 6652 },
  { date: '2025-05-07', reading: 6660 },
  { date: '2025-05-08', reading: 6670 },
  { date: '2025-05-09', reading: 6681 },
  { date: '2025-05-10', reading: 6694 },
  { date: '2025-05-13', reading: 6722 },
  { date: '2025-05-14', reading: 6730 },
  { date: '2025-05-15', reading: 6741 },
  { date: '2025-05-16', reading: 6755 },
  { date: '2025-05-17', reading: 6768 },
  { date: '2025-05-20', reading: 6797 }
];

// Function to add meter and readings
function addMeterAndReadings() {
  // First, add the meter
  const insertMeterQuery = `
    INSERT INTO electric_meters (facility_id, serial_number, type, location, installation_date, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `;
  
  db.run(insertMeterQuery, [
    meterData.facility_id,
    meterData.serial_number,
    meterData.type,
    meterData.location,
    meterData.installation_date,
    meterData.status
  ], function(err) {
    if (err) {
      console.error('Error inserting meter:', err.message);
      return;
    }
    
    const meterId = this.lastID;
    console.log(`✓ Added 1.OG Rechts meter with ID: ${meterId}`);
    
    // Now add all readings
    const insertReadingQuery = `
      INSERT INTO meter_readings (meter_id, value, date, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `;
    
    let insertedCount = 0;
    let totalReadings = readings.length;
    
    readings.forEach((reading, index) => {
      db.run(insertReadingQuery, [meterId, reading.reading, reading.date], function(err) {
        if (err) {
          console.error(`Error inserting reading for ${reading.date}:`, err.message);
        } else {
          console.log(`✓ Added reading for ${reading.date}: ${reading.reading} kWh`);
        }
        
        insertedCount++;
        
        // Close database when all readings are processed
        if (insertedCount === totalReadings) {
          console.log(`\n🎉 Successfully added ${insertedCount} readings for 1.OG Rechts meter!`);
          
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
addMeterAndReadings();