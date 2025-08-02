/**
 * Performance Optimization Service for Rynix FM Management v1.1
 * Implements Phase 1 optimizations: caching, archiving, and query optimization
 * Target: 50-70% reduction in API response times
 */

const crypto = require('crypto');
const path = require('path');

class PerformanceOptimizer {
  constructor(database) {
    this.db = database;
    this.cache = new Map();
    this.performanceMetrics = [];
    
    // Cache configuration
    this.cacheConfig = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxCacheSize: 1000,
      cleanupInterval: 10 * 60 * 1000 // 10 minutes
    };
    
    // Start cache cleanup interval
    this.startCacheCleanup();
  }

  /**
   * Initialize performance optimizations
   */
  async initialize() {
    try {
      console.log('🚀 Initializing Performance Optimizer...');
      
      // Apply performance optimizations from SQL file
      await this.applyPerformanceOptimizations();
      
      // Set up database performance settings
      await this.configureDatabase();
      
      // Initialize materialized views
      await this.initializeMaterializedViews();
      
      console.log('✅ Performance Optimizer initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Performance Optimizer:', error);
      throw error;
    }
  }

  /**
   * Apply performance optimizations from SQL file
   */
  async applyPerformanceOptimizations() {
    return new Promise((resolve, reject) => {
      const fs = require('fs');
      const optimizationsPath = path.join(__dirname, '..', '..', 'database', 'performance_optimizations.sql');
      
      try {
        const sql = fs.readFileSync(optimizationsPath, 'utf8');
        const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
        
        let completed = 0;
        const total = statements.length;
        
        statements.forEach((statement, index) => {
          this.db.run(statement.trim(), (err) => {
            if (err && !err.message.includes('already exists')) {
              console.warn(`Warning applying optimization ${index + 1}:`, err.message);
            }
            
            completed++;
            if (completed === total) {
              console.log(`📊 Applied ${total} performance optimizations`);
              resolve();
            }
          });
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Configure database for optimal performance
   */
  async configureDatabase() {
    const configs = [
      'PRAGMA journal_mode = WAL',
      'PRAGMA synchronous = NORMAL',
      'PRAGMA cache_size = 10000',
      'PRAGMA temp_store = MEMORY',
      'PRAGMA mmap_size = 268435456', // 256MB
      'PRAGMA optimize'
    ];

    for (const config of configs) {
      await new Promise((resolve, reject) => {
        this.db.run(config, (err) => {
          if (err) {
            console.warn(`Warning configuring database: ${config}`, err.message);
          }
          resolve();
        });
      });
    }
    
    console.log('⚙️ Database performance configuration applied');
  }

  /**
   * Initialize materialized views for common queries
   */
  async initializeMaterializedViews() {
    await this.updateMonthlySummary();
    console.log('📈 Materialized views initialized');
  }

  /**
   * Execute query with caching and performance tracking
   */
  async executeOptimizedQuery(queryKey, queryFn, options = {}) {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(queryKey, options);
    const ttl = options.ttl || this.cacheConfig.defaultTTL;
    
    // Check cache first
    const cachedResult = this.getFromCache(cacheKey);
    if (cachedResult) {
      this.trackPerformance(queryKey, Date.now() - startTime, cachedResult.length || 1, true);
      return cachedResult;
    }
    
    try {
      // Execute query
      const result = await queryFn();
      
      // Cache result
      this.setCache(cacheKey, result, ttl);
      
      // Track performance
      const executionTime = Date.now() - startTime;
      this.trackPerformance(queryKey, executionTime, Array.isArray(result) ? result.length : 1, false);
      
      return result;
    } catch (error) {
      console.error(`Query execution failed for ${queryKey}:`, error);
      throw error;
    }
  }

  /**
   * Optimized energy consumption query with caching
   */
  async getOptimizedEnergyConsumption(period = 'monthly') {
    const queryKey = `energy-consumption-${period}`;
    
    return this.executeOptimizedQuery(queryKey, () => {
      return new Promise((resolve, reject) => {
        // Use optimized query with better indexing
        const optimizedQuery = this.buildOptimizedEnergyQuery(period);
        
        this.db.all(optimizedQuery, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(this.processEnergyConsumptionData(result, period));
          }
        });
      });
    }, { ttl: 2 * 60 * 1000 }); // 2 minute cache
  }

  /**
   * Build optimized energy consumption query
   */
  buildOptimizedEnergyQuery(period) {
    let dateGroup;
    switch (period) {
      case 'daily':
        dateGroup = "strftime('%Y-%m-%d', date)";
        break;
      case 'weekly':
        dateGroup = "strftime('%Y-W%W', date)";
        break;
      case 'monthly':
        dateGroup = "strftime('%Y-%m', date)";
        break;
      case 'yearly':
        dateGroup = "strftime('%Y', date)";
        break;
      default:
        dateGroup = "strftime('%Y-%m', date)";
    }

    // Optimized query using indexes and CTEs - includes both electric_meters and heating_systems
    return `
      WITH RECURSIVE date_periods AS (
        SELECT MIN(date) as start_date, MAX(date) as end_date FROM meter_readings
        UNION ALL
        SELECT date(start_date, '+1 month'), end_date FROM date_periods
        WHERE start_date < end_date
      ),
      electric_meters_consumption AS (
        SELECT 
          ${dateGroup} as period,
          em.type,
          em.id as meter_id,
          (
            SELECT MAX(mr2.value) - MIN(mr2.value)
            FROM meter_readings mr2 
            WHERE mr2.meter_id = em.id 
              AND strftime('%Y-%m', mr2.date) = strftime('%Y-%m', mr.date)
              AND mr2.value IS NOT NULL
          ) as consumption
        FROM electric_meters em
        INNER JOIN meter_readings mr ON em.id = mr.meter_id
        WHERE em.type IN ('electric', 'gas', 'heating')
          AND em.status = 'active'
        GROUP BY ${dateGroup}, em.type, em.id
      ),
      heating_systems_consumption AS (
        SELECT 
          ${dateGroup} as period,
          'heating' as type,
          hs.id as meter_id,
          (
            SELECT 
              CASE 
                WHEN LAG(hr2.value) OVER (PARTITION BY hr2.heating_id ORDER BY hr2.date) IS NOT NULL 
                THEN hr2.value - LAG(hr2.value) OVER (PARTITION BY hr2.heating_id ORDER BY hr2.date)
                ELSE hr2.value * 0.1  -- For first reading, use 10% as estimated consumption
              END
            FROM heating_readings hr2 
            WHERE hr2.heating_id = hs.id 
              AND strftime('%Y-%m', hr2.date) = strftime('%Y-%m', hr.date)
              AND hr2.value IS NOT NULL
            ORDER BY hr2.date DESC
            LIMIT 1
          ) as base_consumption
        FROM heating_systems hs
        INNER JOIN heating_readings hr ON hs.id = hr.heating_id
        WHERE hs.status = 'active'
        GROUP BY ${dateGroup}, hs.id
      ),
      gas_correlated_heating AS (
        SELECT 
          hsc.period,
          hsc.type,
          hsc.meter_id,
          (
            SELECT COALESCE(SUM(emc.consumption), 0) * 0.75 * (hsc.base_consumption / NULLIF((SELECT SUM(base_consumption) FROM heating_systems_consumption WHERE period = hsc.period), 0))
            FROM electric_meters_consumption emc
            WHERE emc.period = hsc.period AND emc.type = 'gas'
          ) as consumption
        FROM heating_systems_consumption hsc
      ),
      combined_consumption AS (
        SELECT period, type, consumption FROM electric_meters_consumption
        WHERE consumption > 0
        UNION ALL
        SELECT period, type, consumption FROM gas_correlated_heating
        WHERE consumption > 0
      ),
      aggregated_consumption AS (
        SELECT 
          period,
          type,
          SUM(consumption) as total_consumption
        FROM combined_consumption
        GROUP BY period, type
      )
      SELECT period, type, total_consumption
      FROM aggregated_consumption
      WHERE total_consumption > 0
      ORDER BY period ASC
    `;
  }

  /**
   * Process energy consumption data
   */
 async processEnergyConsumptionData(rawData, period) {
    const groupedData = {};
    
    rawData.forEach(row => {
      if (!groupedData[row.period]) {
        groupedData[row.period] = {
          name: this.formatPeriodName(row.period, period),
          electricity: 0,
          gas: 0,
          heating: 0
        };
      }
      
      if (row.type === 'electric') {
        groupedData[row.period].electricity = Math.max(0, row.total_consumption || 0);
      } else if (row.type === 'gas') {
        groupedData[row.period].gas = Math.max(0, row.total_consumption || 0);
      } else if (row.type === 'heating') {
        // Convert heating from kWh to MWh by dividing by 1000
        groupedData[row.period].heating = Math.max(0, (row.total_consumption || 0) / 1000);
      }
    });
    
    return Object.keys(groupedData)
      .sort((a, b) => a.localeCompare(b))
      .map(period => groupedData[period]);
  }

  /**
   * Archive old readings (12+ months)
   */
  async archiveOldReadings(monthsToKeep = 12) {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsToKeep);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
    
    console.log(`🗄️ Archiving readings older than ${cutoffDateStr}...`);
    
    try {
      // Archive meter readings
      const meterArchiveCount = await this.archiveTable(
        'meter_readings',
        'meter_readings_archive',
        cutoffDateStr
      );
      
      // Archive heating readings
      const heatingArchiveCount = await this.archiveTable(
        'heating_readings',
        'heating_readings_archive',
        cutoffDateStr
      );
      
      console.log(`✅ Archived ${meterArchiveCount} meter readings and ${heatingArchiveCount} heating readings`);
      
      // Update statistics
      await this.updateMonthlySummary();
      
      return {
        meterReadings: meterArchiveCount,
        heatingReadings: heatingArchiveCount
      };
    } catch (error) {
      console.error('❌ Archiving failed:', error);
      throw error;
    }
  }

  /**
   * Archive specific table
   */
  async archiveTable(sourceTable, archiveTable, cutoffDate) {
    return new Promise((resolve, reject) => {
      const db = this.db; // Store reference to avoid 'this' context issues
      
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        // Insert old records into archive
        db.run(
          `INSERT INTO ${archiveTable} 
           SELECT *, datetime('now') as archived_at 
           FROM ${sourceTable} 
           WHERE date < ?`,
          [cutoffDate],
          function(err) {
            if (err) {
              db.run('ROLLBACK');
              reject(err);
              return;
            }
            
            const archivedCount = this.changes;
            
            // Delete archived records from main table
            db.run(
              `DELETE FROM ${sourceTable} WHERE date < ?`,
              [cutoffDate],
              (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  reject(err);
                  return;
                }
                
                db.run('COMMIT', (err) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(archivedCount);
                  }
                });
              }
            );
          }
        );
      });
    });
  }

  /**
   * Update monthly consumption summary (materialized view)
   */
  async updateMonthlySummary() {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT OR REPLACE INTO monthly_consumption_summary 
        (year_month, meter_type, total_consumption, meter_count, last_updated)
        SELECT 
          strftime('%Y-%m', mr.date) as year_month,
          em.type as meter_type,
          SUM(CASE 
            WHEN em.type = 'electric' THEN 
              (SELECT MAX(mr2.value) - MIN(mr2.value) 
               FROM meter_readings mr2 
               WHERE mr2.meter_id = em.id 
                 AND strftime('%Y-%m', mr2.date) = strftime('%Y-%m', mr.date))
            ELSE 0
          END) as total_consumption,
          COUNT(DISTINCT em.id) as meter_count,
          datetime('now') as last_updated
        FROM meter_readings mr
        JOIN electric_meters em ON mr.meter_id = em.id
        WHERE mr.date >= date('now', '-24 months')
        GROUP BY strftime('%Y-%m', mr.date), em.type
        HAVING total_consumption > 0
      `;
      
      this.db.run(query, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Cache management methods
   */
  generateCacheKey(queryKey, options = {}) {
    const keyData = JSON.stringify({ queryKey, options });
    return crypto.createHash('md5').update(keyData).digest('hex');
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      cached.hits++;
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  setCache(key, data, ttl) {
    if (this.cache.size >= this.cacheConfig.maxCacheSize) {
      this.cleanOldestCache();
    }
    
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl,
      hits: 0,
      created: Date.now()
    });
  }

  cleanOldestCache() {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].created - b[1].created);
    
    // Remove oldest 20% of entries
    const toRemove = Math.floor(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  startCacheCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.cache.entries()) {
        if (value.expires <= now) {
          this.cache.delete(key);
        }
      }
    }, this.cacheConfig.cleanupInterval);
  }

  /**
   * Performance tracking
   */
  trackPerformance(endpoint, executionTime, rowsReturned, cacheHit) {
    this.performanceMetrics.push({
      endpoint,
      executionTime,
      rowsReturned,
      cacheHit,
      timestamp: Date.now()
    });
    
    // Keep only last 1000 metrics
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics = this.performanceMetrics.slice(-1000);
    }
    
    // Log slow queries
    if (executionTime > 1000 && !cacheHit) {
      console.warn(`⚠️ Slow query detected: ${endpoint} took ${executionTime}ms`);
    }
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats() {
    const recent = this.performanceMetrics.filter(m => 
      Date.now() - m.timestamp < 60 * 60 * 1000 // Last hour
    );
    
    if (recent.length === 0) return null;
    
    const totalQueries = recent.length;
    const cacheHits = recent.filter(m => m.cacheHit).length;
    const avgTime = recent.reduce((sum, m) => sum + m.executionTime, 0) / totalQueries;
    const maxTime = Math.max(...recent.map(m => m.executionTime));
    
    return {
      totalQueries,
      cacheHitRate: (cacheHits / totalQueries * 100).toFixed(2) + '%',
      averageResponseTime: Math.round(avgTime) + 'ms',
      maxResponseTime: maxTime + 'ms',
      cacheSize: this.cache.size
    };
  }

  /**
   * Format period name helper
   */
  formatPeriodName(period, periodType) {
    switch (periodType) {
      case 'daily':
        return new Date(period).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      case 'weekly':
        const [year, week] = period.split('-W');
        return `Week ${week}`;
      case 'monthly':
        const [monthYear, month] = period.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return monthNames[parseInt(month) - 1];
      case 'yearly':
        return period;
      default:
        return period;
    }
  }

  /**
   * Run maintenance tasks
   */
  async runMaintenance() {
    console.log('🔧 Running performance maintenance tasks...');
    
    try {
      // Archive old data
      await this.archiveOldReadings(12);
      
      // Update materialized views
      await this.updateMonthlySummary();
      
      // Vacuum and analyze database
      await new Promise(resolve => {
        this.db.run('VACUUM', () => {
          this.db.run('ANALYZE', () => {
            this.db.run('PRAGMA optimize', resolve);
          });
        });
      });
      
      console.log('✅ Maintenance tasks completed successfully');
    } catch (error) {
      console.error('❌ Maintenance tasks failed:', error);
      throw error;
    }
  }
}

module.exports = PerformanceOptimizer;