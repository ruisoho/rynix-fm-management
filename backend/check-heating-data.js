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

console.log('=== HEATING SYSTEMS CHECK ===\n');

// Check heating_systems table
db.all('SELECT * FROM heating_systems', (err, systems) => {
  if (err) {
    console.error('Error fetching heating systems:', err.message);
  } else {
    console.log(`Heating systems count: ${systems.length}`);
    if (systems.length > 0) {
      console.log('Heating systems:');
      systems.forEach(s => {
        console.log(`  ID: ${s.id}, Type: ${s.type}, Manufacturer: ${s.manufacturer}, Status: ${s.status}, Location: ${s.notes}`);
      });
    }
  }
  
  // Check electric_meters with type 'heating'
  db.all('SELECT * FROM electric_meters WHERE type = "heating"', (err, meters) => {
    if (err) {
      console.error('Error fetching heating meters:', err.message);
    } else {
      console.log(`\nHeating meters count: ${meters.length}`);
      if (meters.length > 0) {
        console.log('Heating meters:');
        meters.forEach(m => {
          console.log(`  ID: ${m.id}, Location: ${m.location}, Serial: ${m.serial_number}, Status: ${m.status}`);
        });
      }
    }
    
    // Check heating readings
    db.all('SELECT COUNT(*) as count FROM heating_readings', (err, readingCount) => {
      if (err) {
        console.error('Error fetching heating readings count:', err.message);
      } else {
        console.log(`\nHeating readings count: ${readingCount[0].count}`);
      }
      
      // Check meter readings for heating meters
      db.all(`
        SELECT COUNT(*) as count 
        FROM meter_readings mr 
        JOIN electric_meters em ON mr.meter_id = em.id 
        WHERE em.type = 'heating'
      `, (err, meterReadingCount) => {
        if (err) {
          console.error('Error fetching meter readings for heating:', err.message);
        } else {
          console.log(`Meter readings for heating meters: ${meterReadingCount[0].count}`);
        }
        
        // Test the API endpoint
        console.log('\n=== TESTING HEATING API ===');
        testHeatingAPI();
      });
    });
  });
});

function testHeatingAPI() {
  // Simulate the API query from server.js
  const heatingMetersQuery = `
    SELECT em.*, f.name as facility_name, 'electric_meters' as source_table
    FROM electric_meters em 
    JOIN facilities f ON em.facility_id = f.id 
    WHERE em.type = 'heating'
    ORDER BY f.name, em.serial_number
  `;
  
  const heatingSystemsQuery = `
    SELECT hs.id, hs.facility_id, hs.manufacturer as serial_number, hs.type, 
           hs.notes as location, hs.installation_date, hs.status, 
           hs.created_at, hs.updated_at, f.name as facility_name, 'heating_systems' as source_table
    FROM heating_systems hs 
    JOIN facilities f ON hs.facility_id = f.id 
    ORDER BY f.name, hs.manufacturer
  `;
  
  db.all(heatingMetersQuery, (err, heatingMeters) => {
    if (err) {
      console.error('Error with heating meters query:', err.message);
    } else {
      console.log(`API heating meters result: ${heatingMeters.length} records`);
      heatingMeters.forEach(hm => {
        console.log(`  - ${hm.facility_name}: ${hm.location} (${hm.serial_number})`);
      });
    }
    
    db.all(heatingSystemsQuery, (err, heatingSystems) => {
      if (err) {
        console.error('Error with heating systems query:', err.message);
      } else {
        console.log(`API heating systems result: ${heatingSystems.length} records`);
        heatingSystems.forEach(hs => {
          console.log(`  - ${hs.facility_name}: ${hs.location} (${hs.serial_number})`);
        });
      }
      
      const totalHeatingData = heatingMeters.length + heatingSystems.length;
      console.log(`\nTotal heating data that API would return: ${totalHeatingData}`);
      
      if (totalHeatingData === 0) {
        console.log('\n❌ NO HEATING DATA FOUND!');
        console.log('This explains why heating is not showing in the frontend.');
        console.log('\nPossible solutions:');
        console.log('1. Add heating systems to the heating_systems table');
        console.log('2. Add heating meters to electric_meters table with type="heating"');
        console.log('3. Check if existing heating data has correct type/status');
      } else {
        console.log('\n✅ Heating data exists - check frontend rendering');
      }
      
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('\n🔒 Database connection closed.');
        }
      });
    });
  });
}