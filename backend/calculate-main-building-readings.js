const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./app.db');

console.log('=== MAIN BUILDING HEATING METER CALCULATION ===\n');

// Step 1: Get gas meter data
console.log('Step 1: Retrieving gas meter data (Natural Gas - Serial: 0804521495)...');
db.all(`SELECT m.*, r.date, r.value FROM electric_meters m 
        JOIN meter_readings r ON m.id = r.meter_id 
        WHERE m.type = 'gas' AND m.serial_number = '0804521495'
        ORDER BY r.date`, (err, gasData) => {
    if (err) {
        console.error('Error getting gas data:', err.message);
        db.close();
        return;
    }
    
    console.log(`Gas meter readings found: ${gasData.length}`);
    
    // Step 2: Get Police Building heating data
    console.log('\nStep 2: Retrieving Police Building heating data (Serial: 37912473)...');
    db.all(`SELECT m.*, r.date, r.value FROM electric_meters m 
            JOIN meter_readings r ON m.id = r.meter_id 
            WHERE m.serial_number = '37912473'
            ORDER BY r.date`, (err, policeData) => {
        if (err) {
            console.error('Error getting police data:', err.message);
            db.close();
            return;
        }
        
        console.log(`Police Building readings found: ${policeData.length}`);
        
        // Step 3: Get Bike Market heating data
        console.log('\nStep 3: Retrieving Bike Market heating data (Serial: 37902218r)...');
        db.all(`SELECT m.*, r.date, r.value FROM electric_meters m 
                JOIN meter_readings r ON m.id = r.meter_id 
                WHERE m.serial_number = '37902218r'
                ORDER BY r.date`, (err, bikeData) => {
            if (err) {
                console.error('Error getting bike data:', err.message);
                db.close();
                return;
            }
            
            console.log(`Bike Market readings found: ${bikeData.length}`);
            
            // Step 4: Perform calculations
            console.log('\n=== CALCULATION PROCESS ===');
            console.log('Conversion factor: 1 m³ of natural gas ≈ 0.01 MWh');
            
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
            
            // Get all unique dates
            const allDates = new Set([...gasMap.keys(), ...policeMap.keys(), ...bikeMap.keys()]);
            const sortedDates = Array.from(allDates).sort();
            
            console.log(`\nTotal unique dates to process: ${sortedDates.length}`);
            console.log('\nSample calculations (first 10 dates):');
            console.log('Date\t\t| Gas(m³)\t| Gas(MWh)\t| Police(MWh)\t| Bike(MWh)\t| Main(MWh)');
            console.log(''.padEnd(90, '-'));
            
            const mainBuildingReadings = [];
            let calculatedCount = 0;
            
            sortedDates.forEach((date, index) => {
                const gasM3 = gasMap.get(date) || 0;
                const gasMWh = gasM3 * 0.01; // Convert m³ to MWh
                const policeMWh = policeMap.get(date) || 0;
                const bikeMWh = bikeMap.get(date) || 0;
                const mainMWh = gasMWh - policeMWh - bikeMWh;
                
                // Only show first 10 for display
                if (index < 10) {
                    console.log(`${date}\t| ${gasM3.toFixed(2)}\t\t| ${gasMWh.toFixed(2)}\t\t| ${policeMWh.toFixed(2)}\t\t| ${bikeMWh.toFixed(2)}\t\t| ${mainMWh.toFixed(2)}`);
                }
                
                // Store reading if it's positive and we have gas data
                if (gasM3 > 0 && mainMWh > 0) {
                    mainBuildingReadings.push({
                        date: date,
                        value: parseFloat(mainMWh.toFixed(3))
                    });
                    calculatedCount++;
                }
            });
            
            console.log(`\nCalculation complete!`);
            console.log(`Valid Main Building readings calculated: ${calculatedCount}`);
            console.log(`Date range: ${sortedDates[0]} to ${sortedDates[sortedDates.length - 1]}`);
            
            if (mainBuildingReadings.length > 0) {
                console.log(`\nMain Building consumption range: ${Math.min(...mainBuildingReadings.map(r => r.value)).toFixed(3)} to ${Math.max(...mainBuildingReadings.map(r => r.value)).toFixed(3)} MWh`);
                console.log('\nReady to create Main Building heating meter with calculated readings.');
            } else {
                console.log('\nWarning: No valid readings calculated. Check data alignment.');
            }
            
            db.close();
        });
    });
});