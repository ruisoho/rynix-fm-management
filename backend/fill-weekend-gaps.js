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

// Function to get day of week (0 = Sunday, 1 = Monday, etc.)
function getDayOfWeek(dateString) {
  return new Date(dateString).getDay();
}

// Function to add days to a date
function addDays(dateString, days) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

// Function to find weekend gaps and fill them
function fillWeekendGaps() {
  console.log('🔍 Analyzing meter readings for weekend gaps...');
  
  // Get all meters
  const getMetersQuery = `
    SELECT id, location, serial_number 
    FROM electric_meters 
    WHERE status = 'active'
    ORDER BY id
  `;
  
  db.all(getMetersQuery, (err, meters) => {
    if (err) {
      console.error('Error fetching meters:', err.message);
      return;
    }
    
    console.log(`📊 Found ${meters.length} active meters to process`);
    let processedMeters = 0;
    let totalGapsFilled = 0;
    
    meters.forEach((meter, meterIndex) => {
      // Get readings for this meter, ordered by date
      const getReadingsQuery = `
        SELECT id, date, value 
        FROM meter_readings 
        WHERE meter_id = ? 
        ORDER BY date ASC
      `;
      
      db.all(getReadingsQuery, [meter.id], (err, readings) => {
        if (err) {
          console.error(`Error fetching readings for meter ${meter.id}:`, err.message);
          processedMeters++;
          checkCompletion();
          return;
        }
        
        console.log(`\n📈 Processing ${meter.location} (${readings.length} readings)`);
        
        const weekendGaps = [];
        
        // Find weekend gaps
        for (let i = 1; i < readings.length; i++) {
          const prevReading = readings[i - 1];
          const currReading = readings[i];
          
          const prevDate = new Date(prevReading.date);
          const currDate = new Date(currReading.date);
          
          // Calculate days between readings
          const daysDiff = Math.ceil((currDate - prevDate) / (1000 * 60 * 60 * 24));
          
          // Check if there's a gap that includes weekend
          if (daysDiff > 1) {
            const prevDayOfWeek = getDayOfWeek(prevReading.date);
            const currDayOfWeek = getDayOfWeek(currReading.date);
            
            // Check if gap spans from Friday to Monday (common pattern)
            if (prevDayOfWeek === 5 && currDayOfWeek === 1 && daysDiff === 3) {
              weekendGaps.push({
                prevReading,
                currReading,
                gapDays: daysDiff,
                saturdayDate: addDays(prevReading.date, 1),
                sundayDate: addDays(prevReading.date, 2)
              });
            }
            // Check for other weekend patterns (e.g., Thursday to Monday)
            else if (daysDiff >= 2 && daysDiff <= 4) {
              const gapStart = new Date(prevReading.date);
              const gapEnd = new Date(currReading.date);
              let hasWeekend = false;
              let saturdayDate = null;
              let sundayDate = null;
              
              // Check if gap includes Saturday or Sunday
              for (let d = new Date(gapStart); d < gapEnd; d.setDate(d.getDate() + 1)) {
                const dayOfWeek = d.getDay();
                if (dayOfWeek === 6) { // Saturday
                  saturdayDate = d.toISOString().split('T')[0];
                  hasWeekend = true;
                }
                if (dayOfWeek === 0) { // Sunday
                  sundayDate = d.toISOString().split('T')[0];
                  hasWeekend = true;
                }
              }
              
              if (hasWeekend) {
                weekendGaps.push({
                  prevReading,
                  currReading,
                  gapDays: daysDiff,
                  saturdayDate,
                  sundayDate
                });
              }
            }
          }
        }
        
        if (weekendGaps.length > 0) {
          console.log(`   🔧 Found ${weekendGaps.length} weekend gaps to fill`);
          fillGapsForMeter(meter, weekendGaps, () => {
            totalGapsFilled += weekendGaps.length;
            processedMeters++;
            checkCompletion();
          });
        } else {
          console.log(`   ✅ No weekend gaps found`);
          processedMeters++;
          checkCompletion();
        }
      });
    });
    
    function checkCompletion() {
      if (processedMeters === meters.length) {
        console.log(`\n🎉 Processing complete!`);
        console.log(`📊 Total weekend gaps filled: ${totalGapsFilled}`);
        console.log(`📈 Processed ${processedMeters} meters`);
        
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
          } else {
            console.log('\n✅ Database connection closed.');
          }
        });
      }
    }
  });
}

// Function to fill gaps for a specific meter
function fillGapsForMeter(meter, gaps, callback) {
  let processedGaps = 0;
  
  gaps.forEach((gap, gapIndex) => {
    const totalConsumption = gap.currReading.value - gap.prevReading.value;
    const dailyConsumption = totalConsumption / gap.gapDays;
    
    console.log(`     Gap ${gapIndex + 1}: ${gap.prevReading.date} to ${gap.currReading.date}`);
    console.log(`     Total consumption: ${totalConsumption} kWh over ${gap.gapDays} days`);
    console.log(`     Daily average: ${dailyConsumption.toFixed(2)} kWh`);
    
    const insertions = [];
    
    // Create Saturday reading if needed
    if (gap.saturdayDate) {
      const saturdayValue = gap.prevReading.value + dailyConsumption;
      insertions.push({
        date: gap.saturdayDate,
        value: Math.round(saturdayValue * 100) / 100, // Round to 2 decimal places
        day: 'Saturday'
      });
    }
    
    // Create Sunday reading if needed
    if (gap.sundayDate) {
      const sundayValue = gap.saturdayDate ? 
        gap.prevReading.value + (dailyConsumption * 2) : 
        gap.prevReading.value + dailyConsumption;
      insertions.push({
        date: gap.sundayDate,
        value: Math.round(sundayValue * 100) / 100, // Round to 2 decimal places
        day: 'Sunday'
      });
    }
    
    // Insert the weekend readings
    let insertedCount = 0;
    insertions.forEach((insertion) => {
      const insertQuery = `
        INSERT INTO meter_readings (meter_id, date, value, created_at, notes)
        VALUES (?, ?, ?, datetime('now'), 'Auto-generated weekend reading')
      `;
      
      db.run(insertQuery, [meter.id, insertion.date, insertion.value], function(err) {
        if (err) {
          console.error(`     ❌ Error inserting ${insertion.day} reading:`, err.message);
        } else {
          console.log(`     ✅ Added ${insertion.day} reading: ${insertion.date} = ${insertion.value} kWh`);
        }
        
        insertedCount++;
        if (insertedCount === insertions.length) {
          processedGaps++;
          if (processedGaps === gaps.length) {
            callback();
          }
        }
      });
    });
    
    // Handle case where no insertions are needed
    if (insertions.length === 0) {
      processedGaps++;
      if (processedGaps === gaps.length) {
        callback();
      }
    }
  });
}

// Function to preview gaps without filling them
function previewWeekendGaps() {
  console.log('🔍 Previewing weekend gaps (no changes will be made)...');
  
  const query = `
    SELECT 
      em.id as meter_id,
      em.location,
      em.serial_number,
      COUNT(*) as total_readings,
      MIN(mr.date) as first_reading,
      MAX(mr.date) as last_reading
    FROM electric_meters em
    JOIN meter_readings mr ON em.id = mr.meter_id
    WHERE em.status = 'active'
    GROUP BY em.id, em.location, em.serial_number
    ORDER BY em.location
  `;
  
  db.all(query, (err, meters) => {
    if (err) {
      console.error('Error fetching meter summary:', err.message);
      return;
    }
    
    console.log('\n📊 Meter Reading Summary:');
    console.log('Location\t\t\tReadings\tFirst\t\tLast');
    console.log('--------\t\t\t--------\t-----\t\t----');
    
    meters.forEach(meter => {
      console.log(`${meter.location.padEnd(20)}\t${meter.total_readings}\t\t${meter.first_reading}\t${meter.last_reading}`);
    });
    
    db.close();
  });
}

// Main execution
const args = process.argv.slice(2);
if (args.includes('--preview')) {
  previewWeekendGaps();
} else if (args.includes('--fill')) {
  fillWeekendGaps();
} else {
  console.log('Weekend Gap Filler for Meter Readings');
  console.log('=====================================');
  console.log('');
  console.log('Usage:');
  console.log('  node fill-weekend-gaps.js --preview   # Preview gaps without making changes');
  console.log('  node fill-weekend-gaps.js --fill      # Fill weekend gaps with interpolated readings');
  console.log('');
  console.log('This script identifies gaps in meter readings that span weekends');
  console.log('and fills them by distributing Monday readings across Saturday and Sunday.');
  
  db.close();
}