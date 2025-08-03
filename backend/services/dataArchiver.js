/**
 * Data Archiving Service for Rynix FM Management v1.1
 * Implements automatic archiving for readings older than 12 months
 * Includes data compression and archive/restore functionality
 */

const fs = require('fs').promises;
const path = require('path');
const zlib = require('zlib');
const { promisify } = require('util');

class DataArchiver {
  constructor(database) {
    this.db = database;
    this.archiveConfig = {
      monthsToKeep: 12,
      compressionLevel: 6,
      batchSize: 1000,
      archiveDirectory: path.join(__dirname, '..', '..', 'archives')
    };
    
    this.compressionRatios = {
      meter_readings: 0,
      heating_readings: 0
    };
  }

  /**
   * Initialize the archiving system
   */
  async initialize() {
    try {
      console.log('📦 Initializing Data Archiver...');
      
      // Create archive directory if it doesn't exist
      await this.ensureArchiveDirectory();
      
      // Check for data that needs archiving
      const archivableData = await this.getArchivableDataStats();
      
      if (archivableData.totalRecords > 0) {
        console.log(`📊 Found ${archivableData.totalRecords} records eligible for archiving`);
        console.log(`   - Meter readings: ${archivableData.meterReadings}`);
        console.log(`   - Heating readings: ${archivableData.heatingReadings}`);
      }
      
      console.log('✅ Data Archiver initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Data Archiver:', error);
      throw error;
    }
  }

  /**
   * Ensure archive directory exists
   */
  async ensureArchiveDirectory() {
    try {
      await fs.access(this.archiveConfig.archiveDirectory);
    } catch (error) {
      await fs.mkdir(this.archiveConfig.archiveDirectory, { recursive: true });
      console.log(`📁 Created archive directory: ${this.archiveConfig.archiveDirectory}`);
    }
  }

  /**
   * Get statistics on archivable data
   */
  async getArchivableDataStats() {
    return new Promise((resolve, reject) => {
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - this.archiveConfig.monthsToKeep);
      const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

      const query = `
        SELECT 
          'meter_readings' as table_name,
          COUNT(*) as count
        FROM meter_readings 
        WHERE date < ?
        UNION ALL
        SELECT 
          'heating_readings' as table_name,
          COUNT(*) as count
        FROM heating_readings 
        WHERE date < ?
      `;

      this.db.all(query, [cutoffDateStr, cutoffDateStr], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        const stats = {
          meterReadings: 0,
          heatingReadings: 0,
          totalRecords: 0
        };

        rows.forEach(row => {
          if (row.table_name === 'meter_readings') {
            stats.meterReadings = row.count;
          } else if (row.table_name === 'heating_readings') {
            stats.heatingReadings = row.count;
          }
          stats.totalRecords += row.count;
        });

        resolve(stats);
      });
    });
  }

  /**
   * Archive old readings automatically
   */
  async archiveOldReadings(options = {}) {
    const startTime = Date.now();
    const monthsToKeep = options.monthsToKeep || this.archiveConfig.monthsToKeep;
    
    try {
      console.log(`🗄️ Starting automatic archiving (keeping ${monthsToKeep} months of data)...`);
      
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - monthsToKeep);
      const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
      
      // Archive meter readings
      const meterResults = await this.archiveTable(
        'meter_readings',
        'meter_readings_archive',
        cutoffDateStr,
        options.dryRun
      );
      
      // Archive heating readings
      const heatingResults = await this.archiveTable(
        'heating_readings',
        'heating_readings_archive',
        cutoffDateStr,
        options.dryRun
      );
      
      const totalArchived = meterResults.archived + heatingResults.archived;
      const executionTime = Date.now() - startTime;
      
      // Log the operation
      await this.logMaintenanceOperation('archive_old_readings', {
        cutoff_date: cutoffDateStr,
        meter_readings_archived: meterResults.archived,
        heating_readings_archived: heatingResults.archived,
        total_archived: totalArchived,
        compression_ratio_meter: meterResults.compressionRatio,
        compression_ratio_heating: heatingResults.compressionRatio,
        dry_run: options.dryRun || false
      }, totalArchived, executionTime);
      
      console.log(`✅ Archiving completed in ${executionTime}ms`);
      console.log(`   - Meter readings archived: ${meterResults.archived}`);
      console.log(`   - Heating readings archived: ${heatingResults.archived}`);
      console.log(`   - Total records archived: ${totalArchived}`);
      
      if (!options.dryRun && totalArchived > 0) {
        // Run VACUUM to reclaim space
        await this.vacuumDatabase();
      }
      
      return {
        success: true,
        totalArchived,
        executionTime,
        meterReadings: meterResults,
        heatingReadings: heatingResults
      };
      
    } catch (error) {
      console.error('❌ Archiving failed:', error);
      
      await this.logMaintenanceOperation('archive_old_readings', {
        error: error.message
      }, 0, Date.now() - startTime, 'failed', error.message);
      
      throw error;
    }
  }

  /**
   * Archive a specific table
   */
  async archiveTable(sourceTable, archiveTable, cutoffDate, dryRun = false) {
    return new Promise((resolve, reject) => {
      // First, get the data to be archived
      const selectQuery = `SELECT * FROM ${sourceTable} WHERE date < ? ORDER BY date`;
      
      this.db.all(selectQuery, [cutoffDate], async (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (rows.length === 0) {
          resolve({ archived: 0, compressionRatio: 1.0 });
          return;
        }
        
        try {
          let compressionRatio = 1.0;
          
          if (!dryRun) {
            // Compress and store data
            const originalSize = JSON.stringify(rows).length;
            const compressedData = await this.compressData(rows);
            const compressedSize = compressedData.length;
            compressionRatio = compressedSize / originalSize;
            
            // Save compressed archive file
            const archiveFileName = `${sourceTable}_${cutoffDate}_${Date.now()}.gz`;
            const archiveFilePath = path.join(this.archiveConfig.archiveDirectory, archiveFileName);
            await fs.writeFile(archiveFilePath, compressedData);
            
            // Insert into archive table with compression info
            await this.insertArchivedData(archiveTable, rows, compressionRatio, archiveFileName);
            
            // Delete from source table
            await this.deleteArchivedData(sourceTable, cutoffDate);
            
            console.log(`📦 Archived ${rows.length} records from ${sourceTable} (compression: ${(compressionRatio * 100).toFixed(1)}%)`);
          }
          
          resolve({ 
            archived: rows.length, 
            compressionRatio,
            archiveFile: !dryRun ? archiveFileName : null
          });
          
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Compress data using gzip
   */
  async compressData(data) {
    const gzip = promisify(zlib.gzip);
    const jsonData = JSON.stringify(data);
    return await gzip(jsonData, { level: this.archiveConfig.compressionLevel });
  }

  /**
   * Decompress archived data
   */
  async decompressData(compressedData) {
    const gunzip = promisify(zlib.gunzip);
    const decompressed = await gunzip(compressedData);
    return JSON.parse(decompressed.toString());
  }

  /**
   * Insert archived data into archive table
   */
  async insertArchivedData(archiveTable, rows, compressionRatio, archiveFileName) {
    return new Promise((resolve, reject) => {
      const insertQuery = `
        INSERT INTO ${archiveTable} 
        (id, ${archiveTable === 'meter_readings_archive' ? 'meter_id' : 'heating_id'}, value, date, notes, created_at, compression_ratio)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const stmt = this.db.prepare(insertQuery);
      
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');
        
        rows.forEach(row => {
          stmt.run([
            row.id,
            archiveTable === 'meter_readings_archive' ? row.meter_id : row.heating_id,
            row.value,
            row.date,
            row.notes,
            row.created_at,
            compressionRatio
          ]);
        });
        
        stmt.finalize((err) => {
          if (err) {
            this.db.run('ROLLBACK');
            reject(err);
            return;
          }
          
          this.db.run('COMMIT', (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      });
    });
  }

  /**
   * Delete archived data from source table
   */
  async deleteArchivedData(sourceTable, cutoffDate) {
    return new Promise((resolve, reject) => {
      const deleteQuery = `DELETE FROM ${sourceTable} WHERE date < ?`;
      
      this.db.run(deleteQuery, [cutoffDate], function(err) {
        if (err) {
          reject(err);
        } else {
          console.log(`🗑️ Deleted ${this.changes} records from ${sourceTable}`);
          resolve(this.changes);
        }
      });
    });
  }

  /**
   * Restore archived data
   */
  async restoreArchivedData(archiveFileName, targetTable) {
    try {
      const archiveFilePath = path.join(this.archiveConfig.archiveDirectory, archiveFileName);
      const compressedData = await fs.readFile(archiveFilePath);
      const data = await this.decompressData(compressedData);
      
      // Insert data back into the target table
      const insertQuery = `
        INSERT OR REPLACE INTO ${targetTable} 
        (id, ${targetTable === 'meter_readings' ? 'meter_id' : 'heating_id'}, value, date, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      return new Promise((resolve, reject) => {
        const stmt = this.db.prepare(insertQuery);
        
        this.db.serialize(() => {
          this.db.run('BEGIN TRANSACTION');
          
          data.forEach(row => {
            stmt.run([
              row.id,
              targetTable === 'meter_readings' ? row.meter_id : row.heating_id,
              row.value,
              row.date,
              row.notes,
              row.created_at
            ]);
          });
          
          stmt.finalize((err) => {
            if (err) {
              this.db.run('ROLLBACK');
              reject(err);
              return;
            }
            
            this.db.run('COMMIT', (err) => {
              if (err) {
                reject(err);
              } else {
                console.log(`📥 Restored ${data.length} records to ${targetTable}`);
                resolve(data.length);
              }
            });
          });
        });
      });
      
    } catch (error) {
      console.error('❌ Failed to restore archived data:', error);
      throw error;
    }
  }

  /**
   * Get archive statistics
   */
  async getArchiveStats() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          'meter_readings_archive' as table_name,
          COUNT(*) as archived_count,
          MIN(date) as oldest_archived,
          MAX(date) as newest_archived,
          AVG(compression_ratio) as avg_compression_ratio
        FROM meter_readings_archive
        UNION ALL
        SELECT 
          'heating_readings_archive' as table_name,
          COUNT(*) as archived_count,
          MIN(date) as oldest_archived,
          MAX(date) as newest_archived,
          AVG(compression_ratio) as avg_compression_ratio
        FROM heating_readings_archive
      `;
      
      this.db.all(query, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Vacuum database to reclaim space
   */
  async vacuumDatabase() {
    return new Promise((resolve, reject) => {
      console.log('🧹 Running database VACUUM to reclaim space...');
      
      this.db.run('VACUUM', (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Database VACUUM completed');
          resolve();
        }
      });
    });
  }

  /**
   * Log maintenance operation
   */
  async logMaintenanceOperation(operationType, details, recordsAffected, executionTime, status = 'completed', errorMessage = null) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO maintenance_log 
        (operation_type, operation_details, records_affected, execution_time_ms, status, error_message)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      this.db.run(query, [
        operationType,
        JSON.stringify(details),
        recordsAffected,
        executionTime,
        status,
        errorMessage
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  /**
   * Schedule automatic archiving
   */
  scheduleAutoArchiving(intervalHours = 24) {
    console.log(`⏰ Scheduling automatic archiving every ${intervalHours} hours`);
    
    setInterval(async () => {
      try {
        console.log('🔄 Running scheduled archiving...');
        await this.archiveOldReadings();
      } catch (error) {
        console.error('❌ Scheduled archiving failed:', error);
      }
    }, intervalHours * 60 * 60 * 1000);
  }
}

module.exports = DataArchiver;