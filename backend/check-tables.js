const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./app.db');

console.log('Checking database tables...');

db.all('SELECT name FROM sqlite_master WHERE type="table"', (err, result) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Tables in database:');
    result.forEach(row => console.log('- ' + row.name));
  }
  db.close();
});