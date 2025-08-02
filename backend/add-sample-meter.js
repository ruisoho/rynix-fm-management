const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, '..', 'app.db');
const db = new sqlite3.Database(dbPath);

// Sample meter data from user input
const meterData = {
  name: 'EG Links',
  serialNumber: '1DZG0061112423',
  type: 'electric',
  location: 'Ground Floor Left',
  status: 'active',
  facilityId: 1 // Assuming facility ID 1 exists
};

// Sample readings data
const readingsData = [
  { date: '2025-01-02', value: 4657 },
  { date: '2025-01-05', value: 4728 },
  { date: '2025-01-06', value: 4754 },
  { date: '2025-01-07', value: 4769 },
  { date: '2025-01-08', value: 4781 },
  { date: '2025-01-09', value: 4812 }
];

async function addSampleMeter() {
  try {
    console.log('Adding sample meter data...');
    
    // Check if meter already exists
    const existingMeter = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM electric_meters WHERE serial_number = ?',
        [meterData.serialNumber],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    let meterId;
    
    if (existingMeter) {
      console.log('Meter already exists with ID:', existingMeter.id);
      meterId = existingMeter.id;
    } else {
      // Insert new meter
      meterId = await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO electric_meters 
           (facility_id, serial_number, type, location, installation_date, status) 
           VALUES (?, ?, ?, ?, datetime('now'), ?)`,
          [meterData.facilityId, meterData.serialNumber, meterData.type, meterData.location, meterData.status],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
      console.log('Created new meter with ID:', meterId);
    }
    
    // Insert readings
    let readingsAdded = 0;
    let readingsUpdated = 0;
    
    for (const reading of readingsData) {
      // Check if reading already exists
      const existingReading = await new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM meter_readings WHERE meter_id = ? AND date = ?',
          [meterId, reading.date],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });
      
      if (existingReading) {
        // Update existing reading
        await new Promise((resolve, reject) => {
          db.run(
            'UPDATE meter_readings SET value = ? WHERE meter_id = ? AND date = ?',
            [reading.value, meterId, reading.date],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
        readingsUpdated++;
        console.log(`Updated reading for ${reading.date}: ${reading.value} kWh`);
      } else {
        // Insert new reading
        await new Promise((resolve, reject) => {
          db.run(
            'INSERT INTO meter_readings (meter_id, value, date) VALUES (?, ?, ?)',
            [meterId, reading.value, reading.date],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
        readingsAdded++;
        console.log(`Added reading for ${reading.date}: ${reading.value} kWh`);
      }
    }
    
    console.log('\n=== Summary ===');
    console.log(`Meter: ${meterData.name} [${meterData.serialNumber}]`);
    console.log(`Readings added: ${readingsAdded}`);
    console.log(`Readings updated: ${readingsUpdated}`);
    console.log('Sample data added successfully!');
    
  } catch (error) {
    console.error('Error adding sample meter:', error);
  } finally {
    db.close();
  }
}

// Run the script
addSampleMeter();