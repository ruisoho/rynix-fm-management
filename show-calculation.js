const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'app.db');
const db = new sqlite3.Database(dbPath);

const query = `
SELECT DISTINCT
  em.location as meter_location,
  em.id as meter_id,
  current_reading.date,
  current_reading.value as current_value,
  prev_reading.value as prev_value,
  CASE 
    WHEN current_reading.value IS NOT NULL AND prev_reading.value IS NOT NULL
    THEN CASE WHEN (current_reading.value - prev_reading.value) > 0 
         THEN (current_reading.value - prev_reading.value) 
         ELSE 0 END
    ELSE 0
  END as daily_consumption
FROM electric_meters em
JOIN meter_readings current_reading ON current_reading.meter_id = em.id
LEFT JOIN meter_readings prev_reading ON (
  prev_reading.meter_id = current_reading.meter_id 
  AND prev_reading.date = (
    SELECT MAX(mr3.date) 
    FROM meter_readings mr3 
    WHERE mr3.meter_id = current_reading.meter_id 
      AND mr3.date < current_reading.date 
      AND mr3.value IS NOT NULL
  )
)
WHERE current_reading.date = '2025-01-03'
  AND current_reading.value IS NOT NULL
  AND em.status = 'active'
GROUP BY em.id, em.location, current_reading.date, current_reading.value, prev_reading.value
ORDER BY daily_consumption DESC;
`;

console.log('Exact Calculation Breakdown for January 3rd, 2025:');
console.log('=====================================================');
console.log('Meter Location\t\t\tCurrent\t\tPrevious\tDaily Consumption');
console.log('--------------\t\t\t-------\t\t--------\t-----------------');

let totalConsumption = 0;

db.all(query, [], (err, rows) => {
  if (err) {
    console.error('Error:', err.message);
    return;
  }
  
  rows.forEach((row) => {
    const consumption = parseFloat(row.daily_consumption);
    totalConsumption += consumption;
    
    console.log(`${(row.meter_location || `Meter ${row.meter_id}`).padEnd(25)}\t${row.current_value}\t\t${row.prev_value || 'NULL'}\t\t${consumption.toFixed(2)} kWh`);
  });
  
  console.log('\n=====================================================');
  console.log(`TOTAL DAILY CONSUMPTION: ${totalConsumption.toFixed(2)} kWh`);
  console.log('=====================================================');
  
  db.close();
});