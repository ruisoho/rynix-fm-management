const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, '..', 'app.db');
const db = new sqlite3.Database(dbPath);

// Add Police Building heating meter
const meterData = {
    facility_id: 1, // Default facility ID
    serial_number: '37912473',
    type: 'heating',
    location: 'Police Building',
    installation_date: '2025-01-01',
    status: 'active'
};

db.run(`INSERT INTO electric_meters (facility_id, serial_number, type, location, installation_date, status) 
        VALUES (?, ?, ?, ?, ?, ?)`,
    [meterData.facility_id, meterData.serial_number, meterData.type, 
     meterData.location, meterData.installation_date, meterData.status],
    function(err) {
        if (err) {
            console.error('Error inserting meter:', err.message);
        } else {
            console.log(`Successfully added Police Building heating meter with ID: ${this.lastID}`);
            console.log('Meter details:', meterData);
        }
        
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    }
);