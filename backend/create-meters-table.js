const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'app.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('Database connected successfully');
  
  // Create electric_meters table
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS electric_meters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      facility_id INTEGER NOT NULL,
      serial_number TEXT NOT NULL UNIQUE,
      type TEXT DEFAULT 'electric' CHECK (type IN ('electric', 'gas', 'water', 'heating')),
      location TEXT,
      installation_date TEXT,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'broken')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE
    )`;
  
  console.log('Creating electric_meters table...');
  db.run(createTableSQL, (err) => {
    if (err) {
      console.error('Error creating table:', err);
      db.close();
      process.exit(1);
    }
    
    console.log('electric_meters table created successfully!');
    
    // Verify table was created
    db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='electric_meters'", (err, tables) => {
      if (err) {
        console.error('Error checking table:', err);
      } else if (tables.length > 0) {
        console.log('✓ electric_meters table exists');
        
        // Check table structure
        db.all("PRAGMA table_info(electric_meters)", (err, columns) => {
          if (err) {
            console.error('Error getting table info:', err);
          } else {
            console.log('Table columns:');
            columns.forEach(col => {
              console.log(`- ${col.name}: ${col.type}`);
            });
          }
          db.close();
        });
      } else {
        console.log('✗ electric_meters table was not created');
        db.close();
      }
    });
  });
});