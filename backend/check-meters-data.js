const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use the same path as the server
const dbPath = path.join(__dirname, '..', 'app.db');
const db = new sqlite3.Database(dbPath);

console.log('Checking electric_meters data...');

// Check total count
db.get('SELECT COUNT(*) as count FROM electric_meters', (err, result) => {
  if (err) {
    console.error('Error counting meters:', err);
  } else {
    console.log('Total meters:', result.count);
  }
});

// Check types
db.all('SELECT type, COUNT(*) as count FROM electric_meters GROUP BY type', (err, result) => {
  if (err) {
    console.error('Error grouping by type:', err);
  } else {
    console.log('\nMeter types:');
    result.forEach(row => console.log('- ' + row.type + ': ' + row.count));
  }
});

// Check sample data
db.all('SELECT * FROM electric_meters LIMIT 5', (err, result) => {
  if (err) {
    console.error('Error getting sample data:', err);
  } else {
    console.log('\nSample meters:');
    result.forEach(meter => {
      console.log(`- ID: ${meter.id}, Type: ${meter.type}, Serial: ${meter.serial_number}, Status: ${meter.status}`);
    });
  }
  db.close();
});