const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./app.db');

console.log('=== NATURAL GAS TOTAL CONSUMPTION CALCULATION ===\n');

db.all(`SELECT r.date, r.value FROM meter_readings r 
        JOIN electric_meters m ON r.meter_id = m.id 
        WHERE m.type = 'gas' AND m.serial_number = '0804521495'
        ORDER BY r.date`, (err, gasReadings) => {
    if (err) {
        console.error('Error:', err.message);
        db.close();
        return;
    }
    
    console.log('Natural Gas Meter (Serial: 0804521495)');
    console.log('Total readings found:', gasReadings.length);
    
    if (gasReadings.length === 0) {
        console.log('No gas readings found!');
        db.close();
        return;
    }
    
    console.log('Date range:', gasReadings[0]?.date, 'to', gasReadings[gasReadings.length-1]?.date);
    
    console.log('\n=== CONSUMPTION CALCULATION ===');
    
    // Calculate total consumption in m³
    const totalM3 = gasReadings.reduce((sum, reading) => sum + (reading.value || 0), 0);
    
    // Convert to MWh (1 m³ = 0.01 MWh)
    const totalMWh = totalM3 * 0.01;
    
    console.log('Total consumption in m³:', totalM3.toLocaleString());
    console.log('Conversion factor: 1 m³ = 0.01 MWh');
    console.log('\n🔥 TOTAL NATURAL GAS CONSUMPTION: ' + totalMWh.toLocaleString() + ' MWh');
    
    // Monthly breakdown
    console.log('\nBreakdown by month:');
    const monthlyData = {};
    
    gasReadings.forEach(reading => {
        const month = reading.date.substring(0, 7); // YYYY-MM format
        if (!monthlyData[month]) monthlyData[month] = 0;
        monthlyData[month] += (reading.value || 0) * 0.01; // Convert to MWh
    });
    
    Object.keys(monthlyData).sort().forEach(month => {
        console.log(`  ${month}: ${monthlyData[month].toLocaleString()} MWh`);
    });
    
    // Show first and last readings for reference
    console.log('\n=== REFERENCE READINGS ===');
    console.log('First reading:', gasReadings[0].date, '-', gasReadings[0].value.toLocaleString(), 'm³');
    console.log('Last reading:', gasReadings[gasReadings.length-1].date, '-', gasReadings[gasReadings.length-1].value.toLocaleString(), 'm³');
    
    const consumptionDifference = gasReadings[gasReadings.length-1].value - gasReadings[0].value;
    const consumptionMWh = consumptionDifference * 0.01;
    
    console.log('\nPeriod consumption (last - first):');
    console.log('Difference:', consumptionDifference.toLocaleString(), 'm³');
    console.log('Difference in MWh:', consumptionMWh.toLocaleString(), 'MWh');
    
    db.close();
});