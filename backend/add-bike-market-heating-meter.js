const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./app.db');

console.log('Adding Bike Market heating meter...');

// First, add the meter
const meterData = {
    facility_id: 2, // Bike Market facility
    serial_number: '37902218r',
    type: 'heating',
    location: 'Bike Market',
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
        console.log(`Bike Market heating meter added with ID: ${meterId}`);
        
        // Now add the readings
        const readings = [
            { date: '2025-01-02', value: 773.153 },
            { date: '2025-01-03', value: 773.558 },
            { date: '2025-01-04', value: null },
            { date: '2025-01-05', value: null },
            { date: '2025-01-06', value: 774.760 },
            { date: '2025-01-07', value: 775.183 },
            { date: '2025-01-08', value: 775.590 },
            { date: '2025-01-09', value: 775.998 },
            { date: '2025-01-10', value: 777.009 },
            { date: '2025-01-11', value: null },
            { date: '2025-01-12', value: null },
            { date: '2025-01-13', value: 780.641 },
            { date: '2025-01-14', value: 781.823 },
            { date: '2025-01-15', value: 783.226 },
            { date: '2025-01-16', value: 784.518 },
            { date: '2025-01-17', value: 785.656 },
            { date: '2025-01-18', value: null },
            { date: '2025-01-19', value: null },
            { date: '2025-01-20', value: 789.123 },
            { date: '2025-01-21', value: 790.231 },
            { date: '2025-01-22', value: 791.430 },
            { date: '2025-01-23', value: 792.626 },
            { date: '2025-01-24', value: 793.817 },
            { date: '2025-01-25', value: null },
            { date: '2025-01-26', value: null },
            { date: '2025-01-27', value: 797.090 },
            { date: '2025-01-28', value: 798.167 },
            { date: '2025-01-29', value: 799.140 },
            { date: '2025-01-30', value: 800.060 },
            { date: '2025-01-31', value: 801.012 },
            { date: '2025-02-01', value: null },
            { date: '2025-02-02', value: null },
            { date: '2025-02-03', value: 802.083 },
            { date: '2025-02-04', value: 802.448 },
            { date: '2025-02-05', value: 802.838 },
            { date: '2025-02-06', value: 803.211 },
            { date: '2025-02-07', value: 803.579 },
            { date: '2025-02-08', value: null },
            { date: '2025-02-09', value: null },
            { date: '2025-02-10', value: 804.660 },
            { date: '2025-02-11', value: 805.005 },
            { date: '2025-02-12', value: 805.340 },
            { date: '2025-02-13', value: 805.544 },
            { date: '2025-02-14', value: 805.791 },
            { date: '2025-02-15', value: null },
            { date: '2025-02-16', value: null },
            { date: '2025-02-17', value: null },
            { date: '2025-02-18', value: null },
            { date: '2025-02-19', value: null },
            { date: '2025-02-20', value: null },
            { date: '2025-02-21', value: null },
            { date: '2025-02-22', value: null },
            { date: '2025-02-23', value: null },
            { date: '2025-02-24', value: 808.965 },
            { date: '2025-02-25', value: 809.352 },
            { date: '2025-02-26', value: 809.730 },
            { date: '2025-02-27', value: 810.375 },
            { date: '2025-02-28', value: null },
            { date: '2025-03-01', value: null },
            { date: '2025-03-02', value: null },
            { date: '2025-03-03', value: 812.978 },
            { date: '2025-03-04', value: 813.658 },
            { date: '2025-03-05', value: 814.320 },
            { date: '2025-03-06', value: 814.045 },
            { date: '2025-03-07', value: 816.153 },
            { date: '2025-03-08', value: null },
            { date: '2025-03-09', value: null },
            { date: '2025-03-10', value: 819.385 },
            { date: '2025-03-11', value: 820.324 },
            { date: '2025-03-12', value: 821.385 },
            { date: '2025-03-13', value: 822.358 },
            { date: '2025-03-14', value: 823.404 },
            { date: '2025-03-15', value: null },
            { date: '2025-03-16', value: null },
            { date: '2025-03-17', value: 826.508 },
            { date: '2025-03-18', value: 827.638 },
            { date: '2025-03-19', value: 828.721 },
            { date: '2025-03-20', value: 829.799 },
            { date: '2025-03-21', value: 830.771 },
            { date: '2025-03-22', value: null },
            { date: '2025-03-23', value: null },
            { date: '2025-03-24', value: 833.560 },
            { date: '2025-03-25', value: 834.303 },
            { date: '2025-03-26', value: 835.174 },
            { date: '2025-03-27', value: 836.111 },
            { date: '2025-03-28', value: 837.136 },
            { date: '2025-03-29', value: null },
            { date: '2025-03-30', value: null },
            { date: '2025-03-31', value: 839.560 },
            { date: '2025-04-01', value: 840.130 },
            { date: '2025-04-02', value: 841.553 },
            { date: '2025-04-03', value: 842.114 },
            { date: '2025-04-04', value: 842.514 },
            { date: '2025-04-05', value: null },
            { date: '2025-04-06', value: null },
            { date: '2025-04-07', value: 844.240 },
            { date: '2025-04-08', value: 844.937 },
            { date: '2025-04-09', value: 845.476 },
            { date: '2025-04-10', value: 846.040 },
            { date: '2025-04-11', value: 846.608 },
            { date: '2025-04-12', value: null },
            { date: '2025-04-13', value: null },
            { date: '2025-04-14', value: 848.077 },
            { date: '2025-04-15', value: 848.308 },
            { date: '2025-04-16', value: 848.534 },
            { date: '2025-04-17', value: 848.699 },
            { date: '2025-04-18', value: null },
            { date: '2025-04-19', value: null },
            { date: '2025-04-20', value: null },
            { date: '2025-04-21', value: null },
            { date: '2025-04-22', value: 850.103 },
            { date: '2025-04-23', value: 850.361 },
            { date: '2025-04-24', value: 850.631 },
            { date: '2025-04-25', value: 850.909 },
            { date: '2025-04-26', value: null },
            { date: '2025-04-27', value: null },
            { date: '2025-04-28', value: 851.768 },
            { date: '2025-04-29', value: 852.003 },
            { date: '2025-04-30', value: 852.189 },
            { date: '2025-05-01', value: null },
            { date: '2025-05-02', value: 852.471 },
            { date: '2025-05-03', value: null },
            { date: '2025-05-04', value: null },
            { date: '2025-05-05', value: 853.099 },
            { date: '2025-05-06', value: 853.338 },
            { date: '2025-05-07', value: 853.532 },
            { date: '2025-05-08', value: null },
            { date: '2025-05-09', value: 853.879 },
            { date: '2025-05-10', value: null },
            { date: '2025-05-11', value: null },
            { date: '2025-05-12', value: 854.367 },
            { date: '2025-05-13', value: 854.517 },
            { date: '2025-05-14', value: 854.651 },
            { date: '2025-05-15', value: 854.761 },
            { date: '2025-05-16', value: 854.925 }
        ];
        
        let addedCount = 0;
        let totalReadings = readings.length;
        
        readings.forEach((reading, index) => {
            if (reading.value !== null) {
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
                            console.log(`Successfully added ${addedCount} readings for Bike Market heating meter`);
                            console.log('Note: Some readings were null and were skipped');
                            db.close();
                        }
                    }
                );
            } else {
                // Check if this is the last reading
                if (index === totalReadings - 1) {
                    console.log(`Successfully added ${addedCount} readings for Bike Market heating meter`);
                    console.log('Note: Some readings were null and were skipped');
                    db.close();
                }
            }
        });
    }
);