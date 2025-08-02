const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database connection
const dbPath = path.join(__dirname, '..', 'app.db');
const db = new sqlite3.Database(dbPath);

// Function to parse CSV data
function parseCSV(csvContent) {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }
  
  // Parse header (dates)
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const dateColumns = headers.slice(1); // Skip first column (meter names)
  
  console.log(`Found ${dateColumns.length} date columns:`, dateColumns.slice(0, 5), '...');
  
  const data = {};
  
  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const meterName = values[0];
    
    if (!meterName || meterName === '') continue;
    
    data[meterName] = {};
    
    // Parse readings for each date
    for (let j = 1; j < values.length && j <= dateColumns.length; j++) {
      const value = values[j];
      const date = dateColumns[j - 1];
      
      if (value && value !== '' && !isNaN(parseFloat(value))) {
        data[meterName][date] = parseFloat(value);
      }
    }
  }
  
  return data;
}

// Function to parse date from various formats
function parseDate(dateStr) {
  try {
    // Remove any extra whitespace
    dateStr = dateStr.trim();
    
    // Handle German format: DD.MM.YY or DD.MM.YYYY
    if (dateStr.includes('.')) {
      const [day, month, year] = dateStr.split('.');
      const fullYear = year.length === 2 ? `20${year}` : year;
      return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Handle US format: MM/DD/YY or MM/DD/YYYY
    if (dateStr.includes('/')) {
      const [month, day, year] = dateStr.split('/');
      const fullYear = year.length === 2 ? `20${year}` : year;
      return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Handle ISO format: YYYY-MM-DD
    if (dateStr.includes('-') && dateStr.length >= 8) {
      return dateStr;
    }
    
    // Handle format like "Jan 2022" or "January 2022"
    const monthNames = {
      'jan': '01', 'january': '01',
      'feb': '02', 'february': '02',
      'mar': '03', 'march': '03',
      'apr': '04', 'april': '04',
      'may': '05',
      'jun': '06', 'june': '06',
      'jul': '07', 'july': '07',
      'aug': '08', 'august': '08',
      'sep': '09', 'september': '09',
      'oct': '10', 'october': '10',
      'nov': '11', 'november': '11',
      'dec': '12', 'december': '12'
    };
    
    const monthMatch = dateStr.toLowerCase().match(/(\w+)\s+(\d{4}|\d{2})/);
    if (monthMatch) {
      const month = monthNames[monthMatch[1]];
      const year = monthMatch[2].length === 2 ? `20${monthMatch[2]}` : monthMatch[2];
      if (month) {
        return `${year}-${month}-01`; // Use first day of month
      }
    }
    
    throw new Error(`Unsupported date format: ${dateStr}`);
  } catch (error) {
    console.error(`Error parsing date "${dateStr}":`, error.message);
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
  
  // Look for numbers at the end
  const endMatch = meterName.match(/(\d+)$/);
  if (endMatch) {
    return endMatch[1];
  }
  
  // Look for any sequence of digits
  const digitMatch = meterName.match(/(\d{4,})/);
  if (digitMatch) {
    return digitMatch[1];
  }
  
  // Fallback: create serial from name
  return meterName.replace(/[^\w\d]/g, '_').substring(0, 20);
}

// Function to create or find meter
function createOrFindMeter(serialNumber, meterName, facilityId = 1) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT id FROM electric_meters WHERE serial_number = ?',
      [serialNumber],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (row) {
          resolve(row.id);
        } else {
          const location = meterName.replace(/\[.*?\]/g, '').trim();
          db.run(
            `INSERT INTO electric_meters (facility_id, serial_number, type, location, status) 
             VALUES (?, ?, 'electric', ?, 'active')`,
            [facilityId, serialNumber, location],
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

// Function to insert reading
function insertReading(meterId, value, date) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT id FROM meter_readings WHERE meter_id = ? AND date = ?',
      [meterId, date],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (row) {
          db.run(
            'UPDATE meter_readings SET value = ? WHERE id = ?',
            [value, row.id],
            (err) => {
              if (err) reject(err);
              else resolve('updated');
            }
          );
        } else {
          db.run(
            'INSERT INTO meter_readings (meter_id, value, date, notes) VALUES (?, ?, ?, ?)',
            [meterId, value, date, 'Imported from CSV'],
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
async function importFromCSV(csvFilePath) {
  console.log(`\n=== Importing Electric Meter Data from CSV ===`);
  console.log(`File: ${csvFilePath}\n`);
  
  try {
    // Read CSV file
    if (!fs.existsSync(csvFilePath)) {
      throw new Error(`CSV file not found: ${csvFilePath}`);
    }
    
    const csvContent = fs.readFileSync(csvFilePath, 'utf8');
    console.log(`CSV file loaded (${csvContent.length} characters)`);
    
    // Parse CSV
    const data = parseCSV(csvContent);
    const meterCount = Object.keys(data).length;
    console.log(`Parsed ${meterCount} meters from CSV\n`);
    
    let totalProcessed = 0;
    let totalInserted = 0;
    let totalUpdated = 0;
    let totalErrors = 0;
    
    // Process each meter
    for (const [meterName, readings] of Object.entries(data)) {
      console.log(`Processing: ${meterName}`);
      
      try {
        const serialNumber = extractSerialNumber(meterName);
        const meterId = await createOrFindMeter(serialNumber, meterName);
        
        console.log(`  Serial: ${serialNumber}, Meter ID: ${meterId}`);
        
        // Process readings
        for (const [dateStr, value] of Object.entries(readings)) {
          totalProcessed++;
          
          const isoDate = parseDate(dateStr);
          if (!isoDate) {
            console.log(`    ❌ Invalid date: ${dateStr}`);
            totalErrors++;
            continue;
          }
          
          try {
            const result = await insertReading(meterId, value, isoDate);
            if (result === 'inserted') {
              totalInserted++;
              console.log(`    ✅ ${dateStr} → ${value} kWh (inserted)`);
            } else {
              totalUpdated++;
              console.log(`    🔄 ${dateStr} → ${value} kWh (updated)`);
            }
          } catch (error) {
            console.error(`    ❌ Error inserting reading:`, error.message);
            totalErrors++;
          }
        }
      } catch (error) {
        console.error(`  ❌ Error processing meter:`, error.message);
        totalErrors++;
      }
      
      console.log(''); // Empty line for readability
    }
    
    console.log('=== Import Summary ===');
    console.log(`Total readings processed: ${totalProcessed}`);
    console.log(`✅ Inserted: ${totalInserted}`);
    console.log(`🔄 Updated: ${totalUpdated}`);
    console.log(`❌ Errors: ${totalErrors}`);
    console.log('\n✅ Import completed!');
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
  } finally {
    db.close();
  }
}

// Usage
if (require.main === module) {
  const csvFile = process.argv[2];
  
  if (!csvFile) {
    console.log('\n=== CSV Import Tool for Electric Meters ===');
    console.log('\nUsage: node csv-import.js <path-to-csv-file>');
    console.log('\nCSV Format:');
    console.log('- First column: Meter names (e.g., "Main Building [749304]")');
    console.log('- Other columns: Dates as headers (e.g., "01.01.22", "01.02.22")');
    console.log('- Data rows: Energy consumption values');
    console.log('\nExample:');
    console.log('  node csv-import.js energy-data.csv');
    console.log('\nTo export from Excel/Google Sheets:');
    console.log('1. Select all your data');
    console.log('2. File → Export → CSV');
    console.log('3. Save the file');
    console.log('4. Run this script with the CSV file path');
    process.exit(1);
  }
  
  importFromCSV(csvFile);
}

module.exports = {
  importFromCSV,
  parseCSV,
  parseDate,
  extractSerialNumber
};