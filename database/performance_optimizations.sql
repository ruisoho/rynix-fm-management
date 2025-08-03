-- Performance Optimizations for Rynix FM Management v1.1
-- Phase 1: Database Optimization Implementation
-- Target: 50-70% reduction in API response times

-- ============================================================================
-- ADDITIONAL INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Composite indexes for frequently used query patterns
CREATE INDEX IF NOT EXISTS idx_meter_readings_meter_date ON meter_readings(meter_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_meter_readings_date_value ON meter_readings(date DESC, value);
CREATE INDEX IF NOT EXISTS idx_heating_readings_heating_date ON heating_readings(heating_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_heating_readings_date_value ON heating_readings(date DESC, value);

-- Indexes for energy consumption queries
CREATE INDEX IF NOT EXISTS idx_electric_meters_type_location ON electric_meters(type, location);
CREATE INDEX IF NOT EXISTS idx_electric_meters_facility_type ON electric_meters(facility_id, type);

-- Indexes for dashboard queries
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_facilities_status ON facilities(status);

-- Indexes for date-based filtering (monthly/yearly aggregations)
CREATE INDEX IF NOT EXISTS idx_meter_readings_date_month ON meter_readings(date(date, 'start of month'));
CREATE INDEX IF NOT EXISTS idx_meter_readings_date_year ON meter_readings(date(date, 'start of year'));
CREATE INDEX IF NOT EXISTS idx_heating_readings_date_month ON heating_readings(date(date, 'start of month'));
CREATE INDEX IF NOT EXISTS idx_heating_readings_date_year ON heating_readings(date(date, 'start of year'));

-- ============================================================================
-- DATA ARCHIVING SYSTEM
-- ============================================================================

-- Archive tables for old data (12+ months)
CREATE TABLE IF NOT EXISTS meter_readings_archive (
    id INTEGER PRIMARY KEY,
    meter_id INTEGER NOT NULL,
    value REAL NOT NULL,
    date TEXT NOT NULL,
    notes TEXT,
    created_at TEXT,
    archived_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS heating_readings_archive (
    id INTEGER PRIMARY KEY,
    heating_id INTEGER NOT NULL,
    value REAL NOT NULL,
    date TEXT NOT NULL,
    notes TEXT,
    created_at TEXT,
    archived_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for archive tables
CREATE INDEX IF NOT EXISTS idx_meter_readings_archive_meter_date ON meter_readings_archive(meter_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_meter_readings_archive_date ON meter_readings_archive(date DESC);
CREATE INDEX IF NOT EXISTS idx_heating_readings_archive_heating_date ON heating_readings_archive(heating_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_heating_readings_archive_date ON heating_readings_archive(date DESC);

-- ============================================================================
-- QUERY RESULT CACHING SYSTEM
-- ============================================================================

-- Cache table for expensive query results
CREATE TABLE IF NOT EXISTS query_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cache_key TEXT UNIQUE NOT NULL,
    result_data TEXT NOT NULL, -- JSON string
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    hit_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_query_cache_key ON query_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_query_cache_expires ON query_cache(expires_at);

-- ============================================================================
-- PERFORMANCE MONITORING
-- ============================================================================

-- Query performance tracking
CREATE TABLE IF NOT EXISTS query_performance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    endpoint TEXT NOT NULL,
    query_type TEXT NOT NULL,
    execution_time_ms INTEGER NOT NULL,
    rows_returned INTEGER,
    cache_hit BOOLEAN DEFAULT FALSE,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_query_performance_endpoint ON query_performance(endpoint);
CREATE INDEX IF NOT EXISTS idx_query_performance_created_at ON query_performance(created_at DESC);

-- ============================================================================
-- MATERIALIZED VIEWS FOR COMMON AGGREGATIONS
-- ============================================================================

-- Monthly consumption summary (updated via triggers)
CREATE TABLE IF NOT EXISTS monthly_consumption_summary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year_month TEXT NOT NULL,
    meter_type TEXT NOT NULL,
    total_consumption REAL NOT NULL,
    meter_count INTEGER NOT NULL,
    last_updated TEXT DEFAULT (datetime('now')),
    UNIQUE(year_month, meter_type)
);

CREATE INDEX IF NOT EXISTS idx_monthly_summary_year_month ON monthly_consumption_summary(year_month DESC);
CREATE INDEX IF NOT EXISTS idx_monthly_summary_type ON monthly_consumption_summary(meter_type);

-- ============================================================================
-- OPTIMIZATION PROCEDURES (SQLite doesn't support stored procedures,
-- but these are the equivalent functions to be implemented in Node.js)
-- ============================================================================

-- Archive old data (to be implemented as Node.js function)
-- FUNCTION: archiveOldReadings(months_to_keep = 12)
-- - Move readings older than X months to archive tables
-- - Delete from main tables after successful archive
-- - Compress archive data if needed

-- Clean cache (to be implemented as Node.js function)
-- FUNCTION: cleanExpiredCache()
-- - Remove expired cache entries
-- - Clean up old performance tracking data

-- Update materialized views (to be implemented as Node.js function)
-- FUNCTION: updateMonthlySummary()
-- - Recalculate monthly consumption summaries
-- - Update last_updated timestamp

-- ============================================================================
-- PERFORMANCE ANALYSIS VIEWS
-- ============================================================================

-- View for analyzing query performance
CREATE VIEW IF NOT EXISTS performance_analysis AS
SELECT 
    endpoint,
    query_type,
    COUNT(*) as query_count,
    AVG(execution_time_ms) as avg_time_ms,
    MIN(execution_time_ms) as min_time_ms,
    MAX(execution_time_ms) as max_time_ms,
    SUM(CASE WHEN cache_hit THEN 1 ELSE 0 END) as cache_hits,
    ROUND(SUM(CASE WHEN cache_hit THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as cache_hit_rate
FROM query_performance 
WHERE created_at >= datetime('now', '-7 days')
GROUP BY endpoint, query_type
ORDER BY avg_time_ms DESC;

-- View for data volume analysis
CREATE VIEW IF NOT EXISTS data_volume_analysis AS
SELECT 
    'meter_readings' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN date >= date('now', '-12 months') THEN 1 END) as recent_records,
    COUNT(CASE WHEN date < date('now', '-12 months') THEN 1 END) as archivable_records,
    MIN(date) as oldest_record,
    MAX(date) as newest_record
FROM meter_readings
UNION ALL
SELECT 
    'heating_readings' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN date >= date('now', '-12 months') THEN 1 END) as recent_records,
    COUNT(CASE WHEN date < date('now', '-12 months') THEN 1 END) as archivable_records,
    MIN(date) as oldest_record,
    MAX(date) as newest_record
FROM heating_readings;

-- ============================================================================
-- VACUUM AND ANALYZE COMMANDS (to be run periodically)
-- ============================================================================

-- These should be run periodically via Node.js maintenance tasks:
-- VACUUM; -- Reclaim space and defragment
-- ANALYZE; -- Update query planner statistics
-- PRAGMA optimize; -- Run optimization recommendations

-- ============================================================================
-- CONFIGURATION SETTINGS FOR PERFORMANCE
-- ============================================================================

-- Enable Write-Ahead Logging for better concurrency
-- PRAGMA journal_mode = WAL;

-- Increase cache size (already set in server.js)
-- PRAGMA cache_size = 10000;

-- Enable foreign key constraints (already set in schema.sql)
-- PRAGMA foreign_keys = ON;

-- Optimize for read-heavy workloads
-- PRAGMA synchronous = NORMAL;
-- PRAGMA temp_store = MEMORY;
-- PRAGMA mmap_size = 268435456; -- 256MB memory mapping