const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'app.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('Database connected successfully');
  
  // Create facilities table first
  const createFacilitiesSQL = `
    CREATE TABLE IF NOT EXISTS facilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT,
      location TEXT,
      address TEXT,
      description TEXT,
      status TEXT DEFAULT 'Active',
      manager TEXT,
      contact TEXT,
      area REAL,
      floors INTEGER,
      year_built INTEGER,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`;
  
  // Create meter_readings table
  const createReadingsSQL = `
    CREATE TABLE IF NOT EXISTS meter_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meter_id INTEGER NOT NULL,
      value REAL NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (meter_id) REFERENCES electric_meters(id) ON DELETE CASCADE
    )`;
  
  console.log('Creating facilities table...');
  db.run(createFacilitiesSQL, (err) => {
    if (err) {
      console.error('Error creating facilities table:', err);
      db.close();
      process.exit(1);
    }
    
    console.log('facilities table created successfully!');
    
    console.log('Creating meter_readings table...');
    db.run(createReadingsSQL, (err) => {
      if (err) {
        console.error('Error creating meter_readings table:', err);
        db.close();
        process.exit(1);
      }
      
      console.log('meter_readings table created successfully!');
      
      // Insert sample facility
      const insertFacilitySQL = `
        INSERT OR IGNORE INTO facilities (id, name, type, location, status) 
        VALUES (1, 'Main Building', 'Office', 'Downtown', 'Active')`;
      
      db.run(insertFacilitySQL, (err) => {
        if (err) {
          console.error('Error inserting sample facility:', err);
        } else {
          console.log('Sample facility inserted');
        }
        
        // Insert sample meter
        const insertMeterSQL = `
          INSERT OR IGNORE INTO electric_meters (facility_id, serial_number, type, location, status) 
          VALUES (1, 'METER001', 'electric', 'Main Panel', 'active')`;
        
        db.run(insertMeterSQL, (err) => {
          if (err) {
            console.error('Error inserting sample meter:', err);
          } else {
            console.log('Sample meter inserted');
          }
          
          // Verify data
          db.all('SELECT COUNT(*) as count FROM electric_meters', (err, rows) => {
            if (err) {
              console.error('Error counting meters:', err);
            } else {
              console.log('Total meters in database:', rows[0].count);
            }
            
            db.all('SELECT COUNT(*) as count FROM facilities', (err, rows) => {
              if (err) {
                console.error('Error counting facilities:', err);
              } else {
                console.log('Total facilities in database:', rows[0].count);
              }
              db.close();
            });
          });
        });
      });
    });
  });
});