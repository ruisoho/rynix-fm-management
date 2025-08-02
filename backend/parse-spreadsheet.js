const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database connection
const dbPath = path.join(__dirname, '..', 'app.db');
const db = new sqlite3.Database(dbPath);

// Function to parse the spreadsheet data from the image
// This represents the structure I can see in your spreadsheet
const parseSpreadsheetData = () => {
  // Based on the spreadsheet image, here's the structure I can identify:
  // Row headers appear to be meter/building identifiers
  // Column headers appear to be dates
  // Values are energy consumption readings
  
  const data = {
    // Main Building - I can see this in the first row
    'Main Building [749304]': {
      '01.01.22': 675195,
      '01.02.22': 675415,
      '01.03.22': 675529,
      '01.04.22': 675660,
      '01.05.22': 675744,
      '01.06.22': 675968,
      '01.07.22': 676057,
      '01.08.22': 676178,
      '01.09.22': 676278,
      '01.10.22': 676317,
      '01.11.22': 676545,
      '01.12.22': 676672,
      // Add more months as needed
    },
    
    // Additional meters can be added here following the same pattern
    // Example for other buildings/meters from the spreadsheet:
    /*
    'Building 2 [123456]': {
      '01.01.22': 4657,
      '01.02.22': 4728,
      '01.03.22': 4759,
      // ... more dates
    },
    */
  };
  
  return data;
};

// Enhanced date parsing function
function parseDate(dateStr) {
  try {
    // Handle different date formats
    if (dateStr.includes('.')) {
      // German format: DD.MM.YY or DD.MM.YYYY
      const [day, month, year] = dateStr.split('.');
      const fullYear = year.length === 2 ? `20${year}` : year;
      return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } else if (dateStr.includes('/')) {
      // US format: MM/DD/YY or MM/DD/YYYY
      const [month, day, year] = dateStr.split('/');
      const fullYear = year.length === 2 ? `20${year}` : year;
      return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } else {
      throw new Error(`Unsupported date format: ${dateStr}`);
    }
  } catch (error) {
    console.error(`Error parsing date ${dateStr}:`, error.message);
    return null;
  }
}

// Function to extract serial number from meter name
function extractSerialNumber(meterName) {
  // Look for numbers in brackets [123456]
  const bracketMatch = meterName.match(/\[(\d+)\]/);
  if (bracketMatch) {
    return bracketMatch[1];
  }
  
  // Look for numbers at the end of the string
  const endMatch = meterName.match(/(\d+)$/);
  if (endMatch) {
    return endMatch[1];
  }
  
  // Fallback: create a serial from the name
  return meterName.replace(/[^\w\d]/g, '_').substring(0, 20);
}

// Function to validate reading value
function validateReading(value) {
  const numValue = parseFloat(value);
  if (isNaN(numValue) || numValue < 0) {
    return null;
  }
  return numValue;
}

// Enhanced meter creation function
function createOrFindMeter(serialNumber, meterName, facilityId = 1) {
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
          console.log(`  Found existing meter with ID: ${row.id}`);
          resolve(row.id);
        } else {
          // Create new meter
          const location = meterName.replace(/\[.*?\]/g, '').trim();
          db.run(
            `INSERT INTO electric_meters (facility_id, serial_number, type, location, status, created_at) 
             VALUES (?, ?, 'electric', ?, 'active', datetime('now'))`,
            [facilityId, serialNumber, location],
            function(err) {
              if (err) {
                reject(err);
                return;
              }
              console.log(`  Created new meter with ID: ${this.lastID}`);
              resolve(this.lastID);
            }
          );
        }
      }
    );
  });
}

// Enhanced reading insertion function
function insertReading(meterId, value, date, notes = 'Imported from spreadsheet') {
  return new Promise((resolve, reject) => {
    // Check if reading already exists for this date
    db.get(
      'SELECT id, value FROM meter_readings WHERE meter_id = ? AND date = ?',
      [meterId, date],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (row) {
          // Update existing reading if value is different
          if (row.value !== value) {
            db.run(
              'UPDATE meter_readings SET value = ?, notes = ? WHERE id = ?',
              [value, `${notes} (Updated)`, row.id],
              (err) => {
                if (err) reject(err);
                else resolve({ action: 'updated', oldValue: row.value, newValue: value });
              }
            );
          } else {
            resolve({ action: 'skipped', reason: 'same value' });
          }
        } else {
          // Insert new reading
          db.run(
            'INSERT INTO meter_readings (meter_id, value, date, notes, created_at) VALUES (?, ?, ?, ?, datetime(\'now\'))',
            [meterId, value, date, notes],
            function(err) {
              if (err) reject(err);
              else resolve({ action: 'inserted', id: this.lastID });
            }
          );
        }
      }
    );
  });
}

// Main import function with enhanced error handling
async function importElectricMeterData() {
  console.log('\n=== Starting Electric Meter Data Import ===\n');
  
  const data = parseSpreadsheetData();
  let totalProcessed = 0;
  let totalInserted = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  
  try {
    for (const [meterName, readings] of Object.entries(data)) {
      console.log(`\nProcessing meter: ${meterName}`);
      
      const serialNumber = extractSerialNumber(meterName);
      console.log(`  Serial number: ${serialNumber}`);
      
      try {
        // Create or find meter
        const meterId = await createOrFindMeter(serialNumber, meterName);
        
        // Import readings
        for (const [dateStr, value] of Object.entries(readings)) {
          totalProcessed++;
          
          try {
            const isoDate = parseDate(dateStr);
            const validValue = validateReading(value);
            
            if (!isoDate) {
              console.log(`    ❌ Invalid date: ${dateStr}`);
              totalErrors++;
              continue;
            }
            
            if (validValue === null) {
              console.log(`    ❌ Invalid value: ${value} for date ${dateStr}`);
              totalErrors++;
              continue;
            }
            
            const result = await insertReading(meterId, validValue, isoDate);
            
            switch (result.action) {
              case 'inserted':
                console.log(`    ✅ ${dateStr} → ${isoDate}: ${validValue} kWh (inserted)`);
                totalInserted++;
                break;
              case 'updated':
                console.log(`    🔄 ${dateStr} → ${isoDate}: ${result.oldValue} → ${validValue} kWh (updated)`);
                totalUpdated++;
                break;
              case 'skipped':
                console.log(`    ⏭️  ${dateStr} → ${isoDate}: ${validValue} kWh (skipped - same value)`);
                totalSkipped++;
                break;
            }
          } catch (error) {
            console.error(`    ❌ Error processing reading for ${dateStr}:`, error.message);
            totalErrors++;
          }
        }
      } catch (error) {
        console.error(`  ❌ Error processing meter ${meterName}:`, error.message);
        totalErrors++;
      }
    }
    
    console.log('\n=== Import Summary ===');
    console.log(`Total readings processed: ${totalProcessed}`);
    console.log(`✅ Inserted: ${totalInserted}`);
    console.log(`🔄 Updated: ${totalUpdated}`);
    console.log(`⏭️  Skipped: ${totalSkipped}`);
    console.log(`❌ Errors: ${totalErrors}`);
    console.log('\n✅ Import completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Import failed:', error);
  } finally {
    db.close();
  }
}

// Usage instructions
if (require.main === module) {
  console.log('\n=== Electric Meter Data Import Tool ===');
  console.log('\nTo customize this script for your data:');
  console.log('1. Edit the parseSpreadsheetData() function');
  console.log('2. Add your meter names and readings');
  console.log('3. Ensure dates are in DD.MM.YY format');
  console.log('4. Run: node parse-spreadsheet.js');
  console.log('\nPress Ctrl+C to cancel, or wait 5 seconds to start import...');
  
  setTimeout(() => {
    importElectricMeterData();
  }, 5000);
}

module.exports = {
  importElectricMeterData,
  parseSpreadsheetData,
  parseDate,
  extractSerialNumber,
  validateReading,
  createOrFindMeter,
  insertReading
};