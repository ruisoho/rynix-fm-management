const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'app.db');
const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');

console.log('Database path:', dbPath);
console.log('Schema path:', schemaPath);

// Check if schema file exists
if (!fs.existsSync(schemaPath)) {
  console.error('Schema file not found at:', schemaPath);
  process.exit(1);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('Database connected successfully');
  
  // Read and execute schema
  const schema = fs.readFileSync(schemaPath, 'utf8');
  console.log('Schema file read successfully, length:', schema.length);
  
  // Split schema into individual statements
  const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
  console.log('Found', statements.length, 'SQL statements');
  
  let completed = 0;
  
  const executeStatement = (index) => {
    if (index >= statements.length) {
      console.log('All statements executed successfully!');
      
      // Verify tables were created
      db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
        if (err) {
          console.error('Error checking tables:', err);
        } else {
          console.log('Created tables:');
          tables.forEach(table => console.log('-', table.name));
        }
        db.close();
      });
      return;
    }
    
    const statement = statements[index].trim();
    if (statement) {
      console.log(`Executing statement ${index + 1}/${statements.length}`);
      db.run(statement, (err) => {
        if (err) {
          console.error('Error executing statement:', err);
          console.error('Failed statement:', statement);
          db.close();
          process.exit(1);
        }
        executeStatement(index + 1);
      });
    } else {
      executeStatement(index + 1);
    }
  };
  
  executeStatement(0);
});