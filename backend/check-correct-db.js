const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use the same path as the server
const dbPath = path.join(__dirname, '..', 'app.db');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath);

console.log('Checking database tables...');

db.all('SELECT name FROM sqlite_master WHERE type="table"', (err, result) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Tables in database:');
    if (result.length === 0) {
      console.log('No tables found');
    } else {
      result.forEach(row => console.log('- ' + row.name));
    }
  }
  db.close();
});