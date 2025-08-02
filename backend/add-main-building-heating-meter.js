const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./app.db');

console.log('Adding Main Building heating meter with calculated readings...');

// First, add the meter
const meterData = {
    facility_id: 2, // Bike Market facility
    serial_number: '0807830324',
    type: 'heating',
    location: 'Main Building',
    installation_date: '2025-01-01',
    status: 'active'
};

db.run(`INSERT INTO electric_meters (facility_id, serial_number, type, location, installation_date, status) 
        VALUES (?, ?, ?, ?, ?, ?)`,
    [meterData.facility_id, meterData.serial_number, meterData.type, meterData.location, meterData.installation_date, meterData.status],
    function(err) {
        if (err) {
            console.error('Error adding meter:', err.message);
            db.close();
            return;
        }
        
        const meterId = this.lastID;
        console.log(`Main Building heating meter added with ID: ${meterId}`);
        
        // Now calculate and add the readings
        console.log('Calculating Main Building readings...');
        
        // Get gas meter data
        db.all(`SELECT date, value FROM meter_readings r 
                JOIN electric_meters m ON r.meter_id = m.id 
                WHERE m.type = 'gas' AND m.serial_number = '0804521495'
                ORDER BY date`, (err, gasData) => {
            if (err) {
                console.error('Error getting gas data:', err.message);
                db.close();
                return;
            }
            
            // Get Police Building data
            db.all(`SELECT date, value FROM meter_readings r 
                    JOIN electric_meters m ON r.meter_id = m.id 
                    WHERE m.serial_number = '37912473'
                    ORDER BY date`, (err, policeData) => {
                if (err) {
                    console.error('Error getting police data:', err.message);
                    db.close();
                    return;
                }
                
                // Get Bike Market data
                db.all(`SELECT date, value FROM meter_readings r 
                        JOIN electric_meters m ON r.meter_id = m.id 
                        WHERE m.serial_number = '37902218r'
                        ORDER BY date`, (err, bikeData) => {
                    if (err) {
                        console.error('Error getting bike data:', err.message);
                        db.close();
                        return;
                    }
                    
                    // Create maps for easy lookup
                    const gasMap = new Map();
                    const policeMap = new Map();
                    const bikeMap = new Map();
                    
                    gasData.forEach(row => {
                        gasMap.set(row.date, row.value);
                    });
                    
                    policeData.forEach(row => {
                        policeMap.set(row.date, row.value);
                    });
                    
                    bikeData.forEach(row => {
                        bikeMap.set(row.date, row.value);
                    });
                    
                    // Get all unique dates and calculate Main Building readings
                    const allDates = new Set([...gasMap.keys(), ...policeMap.keys(), ...bikeMap.keys()]);
                    const sortedDates = Array.from(allDates).sort();
                    
                    const mainBuildingReadings = [];
                    
                    sortedDates.forEach(date => {
                        const gasM3 = gasMap.get(date) || 0;
                        const gasMWh = gasM3 * 0.01; // Convert m³ to MWh
                        const policeMWh = policeMap.get(date) || 0;
                        const bikeMWh = bikeMap.get(date) || 0;
                        const mainMWh = gasMWh - policeMWh - bikeMWh;
                        
                        // Only add positive readings where we have gas data
                        if (gasM3 > 0 && mainMWh > 0) {
                            mainBuildingReadings.push({
                                date: date,
                                value: parseFloat(mainMWh.toFixed(3))
                            });
                        }
                    });
                    
                    console.log(`Calculated ${mainBuildingReadings.length} Main Building readings`);
                    
                    // Insert the calculated readings
                    let addedCount = 0;
                    let totalReadings = mainBuildingReadings.length;
                    
                    if (totalReadings === 0) {
                        console.log('No valid readings to add');
                        db.close();
                        return;
                    }
                    
                    mainBuildingReadings.forEach((reading, index) => {
                        db.run(`INSERT INTO meter_readings (meter_id, date, value) VALUES (?, ?, ?)`,
                            [meterId, reading.date, reading.value],
                            function(err) {
                                if (err) {
                                    console.error(`Error adding reading for ${reading.date}:`, err.message);
                                } else {
                                    addedCount++;
                                }
                                
                                // Check if this is the last reading
                                if (index === totalReadings - 1) {
                                    console.log(`Successfully added ${addedCount} calculated readings for Main Building heating meter`);
                                    console.log(`Consumption range: ${Math.min(...mainBuildingReadings.map(r => r.value)).toFixed(3)} to ${Math.max(...mainBuildingReadings.map(r => r.value)).toFixed(3)} MWh`);
                                    console.log('Note: Readings calculated as: Gas(MWh) - Police Building(MWh) - Bike Market(MWh)');
                                    db.close();
                                }
                            }
                        );
                    });
                });
            });
        });
    }
);