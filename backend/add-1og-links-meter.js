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

// Meter data for 1.OG Links
const meterData = {
  facility_id: 1, // Main Building
  serial_number: '6063928',
  type: 'electric',
  location: '1.OG Links',
  installation_date: '2025-01-01',
  status: 'active'
};

// Meter readings data for 1.OG Links [6063928]
const readings = [
  // January 2025
  { date: '2025-01-02', reading: 263205 },
  { date: '2025-01-03', reading: 263243 },
  { date: '2025-01-06', reading: 263312 },
  { date: '2025-01-07', reading: 263345 },
  { date: '2025-01-08', reading: 263377 },
  { date: '2025-01-09', reading: 263415 },
  { date: '2025-01-10', reading: 263474 },
  { date: '2025-01-13', reading: 263541 },
  { date: '2025-01-14', reading: 263586 },
  { date: '2025-01-15', reading: 263620 },
  { date: '2025-01-16', reading: 263665 },
  { date: '2025-01-17', reading: 263720 },
  { date: '2025-01-20', reading: 263799 },
  { date: '2025-01-21', reading: 263825 },
  { date: '2025-01-22', reading: 263855 },
  { date: '2025-01-23', reading: 263880 },
  { date: '2025-01-24', reading: 263906 },
  { date: '2025-01-27', reading: 263953 },
  { date: '2025-01-28', reading: 263977 },
  { date: '2025-01-29', reading: 264007 },
  { date: '2025-01-30', reading: 264044 },
  { date: '2025-01-31', reading: 264064 },
  
  // February 2025
  { date: '2025-02-03', reading: 264112 },
  { date: '2025-02-04', reading: 264132 },
  { date: '2025-02-05', reading: 264148 },
  { date: '2025-02-06', reading: 264172 },
  { date: '2025-02-07', reading: 264190 },
  { date: '2025-02-10', reading: 264232 },
  { date: '2025-02-11', reading: 264252 },
  { date: '2025-02-12', reading: 264288 },
  { date: '2025-02-13', reading: 264298 },
  { date: '2025-02-14', reading: 264325 },
  { date: '2025-02-21', reading: 264467 },
  { date: '2025-02-22', reading: 264488 },
  { date: '2025-02-23', reading: 264504 },
  { date: '2025-02-24', reading: 264524 },
  { date: '2025-02-27', reading: 264577 },
  { date: '2025-02-28', reading: 264592 },
  
  // March 2025
  { date: '2025-03-01', reading: 264622 },
  { date: '2025-03-02', reading: 264652 },
  { date: '2025-03-03', reading: 264679 },
  { date: '2025-03-06', reading: 264718 },
  { date: '2025-03-07', reading: 264738 },
  { date: '2025-03-08', reading: 264783 },
  { date: '2025-03-09', reading: 264828 },
  { date: '2025-03-10', reading: 264857 },
  { date: '2025-03-13', reading: 264946 },
  { date: '2025-03-14', reading: 264964 },
  { date: '2025-03-15', reading: 264992 },
  { date: '2025-03-16', reading: 265028 },
  { date: '2025-03-17', reading: 265065 },
  { date: '2025-03-20', reading: 265125 },
  { date: '2025-03-21', reading: 265145 },
  { date: '2025-03-22', reading: 265174 },
  { date: '2025-03-23', reading: 265252 },
  { date: '2025-03-24', reading: 265284 },
  { date: '2025-03-27', reading: 265352 },
  { date: '2025-03-28', reading: 265375 },
  { date: '2025-03-29', reading: 265408 },
  { date: '2025-03-30', reading: 265485 },
  { date: '2025-03-31', reading: 265487 },
  
  // April 2025
  { date: '2025-04-01', reading: 265565 },
  { date: '2025-04-02', reading: 265584 },
  { date: '2025-04-03', reading: 265614 },
  { date: '2025-04-04', reading: 265660 },
  { date: '2025-04-05', reading: 265688 },
  { date: '2025-04-08', reading: 265779 },
  { date: '2025-04-09', reading: 265794 },
  { date: '2025-04-10', reading: 265815 },
  { date: '2025-04-11', reading: 265832 },
  { date: '2025-04-16', reading: 265886 },
  { date: '2025-04-17', reading: 265908 },
  { date: '2025-04-18', reading: 265939 },
  { date: '2025-04-19', reading: 265959 },
  { date: '2025-04-22', reading: 266016 },
  { date: '2025-04-23', reading: 266033 },
  { date: '2025-04-24', reading: 266065 },
  { date: '2025-04-26', reading: 266097 },
  { date: '2025-04-29', reading: 266164 },
  { date: '2025-04-30', reading: 266184 },
  
  // May 2025
  { date: '2025-05-01', reading: 266216 },
  { date: '2025-05-03', reading: 266265 },
  { date: '2025-05-06', reading: 266352 },
  { date: '2025-05-07', reading: 266369 },
  { date: '2025-05-08', reading: 266399 },
  { date: '2025-05-09', reading: 266438 },
  { date: '2025-05-10', reading: 266479 },
  { date: '2025-05-13', reading: 266549 },
  { date: '2025-05-14', reading: 266567 },
  { date: '2025-05-15', reading: 266594 },
  { date: '2025-05-16', reading: 266639 },
  { date: '2025-05-17', reading: 266682 },
  { date: '2025-05-20', reading: 266763 }
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
    console.log(`✓ Added 1.OG Links meter with ID: ${meterId}`);
    
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
          console.log(`\n🎉 Successfully added ${insertedCount} readings for 1.OG Links meter!`);
          
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