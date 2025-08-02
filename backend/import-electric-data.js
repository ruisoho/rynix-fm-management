const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database connection
const dbPath = path.join(__dirname, '..', 'app.db');
const db = new sqlite3.Database(dbPath);

// Sample spreadsheet data structure - replace with your actual data
const spreadsheetData = {
  // Main Building data with dates as columns
  'Main Building [749304]': {
    '01.01.22': 675195,
    '01.02.22': 675415,
    '01.03.22': 675529,
    '01.04.22': 675660,
    '01.05.22': 675744,
    // Add more dates and values as needed
  },
  // Add more buildings/meters as needed
};

// Function to parse date from German format (DD.MM.YY) to ISO format
function parseGermanDate(dateStr) {
  const [day, month, year] = dateStr.split('.');
  const fullYear = year.length === 2 ? `20${year}` : year;
  return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// Function to create or find electric meter
function createOrFindMeter(serialNumber, facilityId = 1) {
  return new Promise((resolve, reject) => {
    // First, try to find existing meter
    db.get(
      'SELECT id FROM electric_meters WHERE serial_number = ?',
      [serialNumber],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (row) {
          // Meter exists, return its ID
          resolve(row.id);
        } else {
          // Create new meter
          db.run(
            `INSERT INTO electric_meters (facility_id, serial_number, type, location, status) 
             VALUES (?, ?, 'electric', 'Imported from spreadsheet', 'active')`,
            [facilityId, serialNumber],
            function(err) {
              if (err) {
                reject(err);
                return;
              }
              resolve(this.lastID);
            }
          );
        }
      }
    );
  });
}

// Function to insert meter reading
function insertReading(meterId, value, date) {
  return new Promise((resolve, reject) => {
    // Check if reading already exists for this date
    db.get(
      'SELECT id FROM meter_readings WHERE meter_id = ? AND date = ?',
      [meterId, date],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (row) {
          // Update existing reading
          db.run(
            'UPDATE meter_readings SET value = ? WHERE id = ?',
            [value, row.id],
            (err) => {
              if (err) reject(err);
              else resolve('updated');
            }
          );
        } else {
          // Insert new reading
          db.run(
            'INSERT INTO meter_readings (meter_id, value, date, notes) VALUES (?, ?, ?, ?)',
            [meterId, value, date, 'Imported from spreadsheet'],
            function(err) {
              if (err) reject(err);
              else resolve('inserted');
            }
          );
        }
      }
    );
  });
}

// Main import function
async function importElectricData() {
  console.log('Starting electric meter data import...');
  
  try {
    for (const [meterName, readings] of Object.entries(spreadsheetData)) {
      console.log(`Processing meter: ${meterName}`);
      
      // Extract serial number from meter name (e.g., "Main Building [749304]" -> "749304")
      const serialMatch = meterName.match(/\[(\d+)\]/);
      const serialNumber = serialMatch ? serialMatch[1] : meterName.replace(/[^\w]/g, '_');
      
      // Create or find meter
      const meterId = await createOrFindMeter(serialNumber);
      console.log(`Meter ID: ${meterId}`);
      
      // Import readings
      for (const [dateStr, value] of Object.entries(readings)) {
        try {
          const isoDate = parseGermanDate(dateStr);
          const result = await insertReading(meterId, value, isoDate);
          console.log(`  ${dateStr} (${isoDate}): ${value} kWh - ${result}`);
        } catch (error) {
          console.error(`  Error importing reading for ${dateStr}:`, error.message);
        }
      }
    }
    
    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    db.close();
  }
}

// Instructions for using this script
console.log(`
=== Electric Meter Data Import Script ===
`);
console.log('To use this script with your spreadsheet data:');
console.log('1. Replace the spreadsheetData object with your actual data');
console.log('2. Ensure your data follows this format:');
console.log('   {');
console.log('     "Meter Name [Serial]": {');
console.log('       "DD.MM.YY": value,');
console.log('       "DD.MM.YY": value,');
console.log('       ...');
console.log('     }');
console.log('   }');
console.log('3. Run: node import-electric-data.js\n');

// Uncomment the line below to run the import
// importElectricData();

module.exports = { importElectricData, parseGermanDate, createOrFindMeter, insertReading };