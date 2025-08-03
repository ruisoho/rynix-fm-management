-- Migration Script for Rynix FM Management v1.1
-- Performance & Optimization Release
-- Date: January 2025

-- ============================================================================
-- VERSION 1.1 PERFORMANCE OPTIMIZATIONS
-- ============================================================================

BEGIN TRANSACTION;

-- Update database version
CREATE TABLE IF NOT EXISTS database_version (
    version TEXT PRIMARY KEY,
    applied_at TEXT DEFAULT (datetime('now')),
    description TEXT
);

INSERT OR REPLACE INTO database_version (version, description) 
VALUES ('1.1.0', 'Performance & Optimization Release - Data archiving, caching, and query optimization');

-- ============================================================================
-- ENHANCED INDEXES FOR PERFORMANCE
-- ============================================================================

-- Composite indexes for frequently used query patterns
CREATE INDEX IF NOT EXISTS idx_meter_readings_meter_date_v11 ON meter_readings(meter_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_meter_readings_date_value_v11 ON meter_readings(date DESC, value);
CREATE INDEX IF NOT EXISTS idx_heating_readings_heating_date_v11 ON heating_readings(heating_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_heating_readings_date_value_v11 ON heating_readings(date DESC, value);

-- Indexes for energy consumption queries
CREATE INDEX IF NOT EXISTS idx_electric_meters_type_location_v11 ON electric_meters(type, location);
CREATE INDEX IF NOT EXISTS idx_electric_meters_facility_type_v11 ON electric_meters(facility_id, type);

-- Indexes for dashboard queries
CREATE INDEX IF NOT EXISTS idx_maintenance_status_v11 ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_tasks_status_v11 ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_facilities_status_v11 ON facilities(status);

-- Indexes for date-based filtering (monthly/yearly aggregations)
CREATE INDEX IF NOT EXISTS idx_meter_readings_month_v11 ON meter_readings(substr(date, 1, 7)); -- YYYY-MM format
CREATE INDEX IF NOT EXISTS idx_meter_readings_year_v11 ON meter_readings(substr(date, 1, 4)); -- YYYY format
CREATE INDEX IF NOT EXISTS idx_heating_readings_month_v11 ON heating_readings(substr(date, 1, 7));
CREATE INDEX IF NOT EXISTS idx_heating_readings_year_v11 ON heating_readings(substr(date, 1, 4));

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
    archived_at TEXT DEFAULT (datetime('now')),
    compression_ratio REAL DEFAULT 1.0
);

CREATE TABLE IF NOT EXISTS heating_readings_archive (
    id INTEGER PRIMARY KEY,
    heating_id INTEGER NOT NULL,
    value REAL NOT NULL,
    date TEXT NOT NULL,
    notes TEXT,
    created_at TEXT,
    archived_at TEXT DEFAULT (datetime('now')),
    compression_ratio REAL DEFAULT 1.0
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
    hit_count INTEGER DEFAULT 0,
    data_size INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_query_cache_key ON query_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_query_cache_expires ON query_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_query_cache_hit_count ON query_cache(hit_count DESC);

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
    memory_usage_mb REAL,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_query_performance_endpoint ON query_performance(endpoint);
CREATE INDEX IF NOT EXISTS idx_query_performance_created_at ON query_performance(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_query_performance_execution_time ON query_performance(execution_time_ms DESC);

-- ============================================================================
-- MATERIALIZED VIEWS FOR COMMON AGGREGATIONS
-- ============================================================================

-- Monthly consumption summary (updated via triggers)
CREATE TABLE IF NOT EXISTS monthly_consumption_summary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year_month TEXT NOT NULL,
    meter_type TEXT NOT NULL,
    facility_id INTEGER,
    total_consumption REAL NOT NULL,
    avg_consumption REAL NOT NULL,
    meter_count INTEGER NOT NULL,
    min_reading REAL,
    max_reading REAL,
    last_updated TEXT DEFAULT (datetime('now')),
    UNIQUE(year_month, meter_type, facility_id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_summary_year_month ON monthly_consumption_summary(year_month DESC);
CREATE INDEX IF NOT EXISTS idx_monthly_summary_type ON monthly_consumption_summary(meter_type);
CREATE INDEX IF NOT EXISTS idx_monthly_summary_facility ON monthly_consumption_summary(facility_id);

-- Daily consumption summary for recent data
CREATE TABLE IF NOT EXISTS daily_consumption_summary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    meter_type TEXT NOT NULL,
    facility_id INTEGER,
    total_consumption REAL NOT NULL,
    reading_count INTEGER NOT NULL,
    last_updated TEXT DEFAULT (datetime('now')),
    UNIQUE(date, meter_type, facility_id)
);

CREATE INDEX IF NOT EXISTS idx_daily_summary_date ON daily_consumption_summary(date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_summary_type ON daily_consumption_summary(meter_type);
CREATE INDEX IF NOT EXISTS idx_daily_summary_facility ON daily_consumption_summary(facility_id);

-- ============================================================================
-- PERFORMANCE ANALYSIS VIEWS
-- ============================================================================

-- View for analyzing query performance
CREATE VIEW IF NOT EXISTS v_performance_analysis AS
SELECT 
    endpoint,
    query_type,
    COUNT(*) as query_count,
    AVG(execution_time_ms) as avg_time_ms,
    MIN(execution_time_ms) as min_time_ms,
    MAX(execution_time_ms) as max_time_ms,
    SUM(CASE WHEN cache_hit THEN 1 ELSE 0 END) as cache_hits,
    ROUND(SUM(CASE WHEN cache_hit THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as cache_hit_rate,
    AVG(memory_usage_mb) as avg_memory_mb
FROM query_performance 
WHERE created_at >= datetime('now', '-7 days')
GROUP BY endpoint, query_type
ORDER BY avg_time_ms DESC;

-- View for data volume analysis
CREATE VIEW IF NOT EXISTS v_data_volume_analysis AS
SELECT 
    'meter_readings' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN date >= date('now', '-12 months') THEN 1 END) as recent_records,
    COUNT(CASE WHEN date < date('now', '-12 months') THEN 1 END) as archivable_records,
    MIN(date) as oldest_record,
    MAX(date) as newest_record,
    ROUND(AVG(LENGTH(notes)), 2) as avg_note_length
FROM meter_readings
UNION ALL
SELECT 
    'heating_readings' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN date >= date('now', '-12 months') THEN 1 END) as recent_records,
    COUNT(CASE WHEN date < date('now', '-12 months') THEN 1 END) as archivable_records,
    MIN(date) as oldest_record,
    MAX(date) as newest_record,
    ROUND(AVG(LENGTH(notes)), 2) as avg_note_length
FROM heating_readings;

-- View for cache performance analysis
CREATE VIEW IF NOT EXISTS v_cache_analysis AS
SELECT 
    cache_key,
    hit_count,
    data_size,
    expires_at,
    created_at,
    CASE 
        WHEN expires_at > datetime('now') THEN 'Active'
        ELSE 'Expired'
    END as status,
    ROUND((julianday('now') - julianday(created_at)) * 24 * 60, 2) as age_minutes
FROM query_cache
ORDER BY hit_count DESC, created_at DESC;

-- ============================================================================
-- TRIGGERS FOR MATERIALIZED VIEW UPDATES
-- ============================================================================

-- Trigger to update monthly summary when new meter readings are added
CREATE TRIGGER IF NOT EXISTS trg_update_monthly_summary_meter
AFTER INSERT ON meter_readings
BEGIN
    INSERT OR REPLACE INTO monthly_consumption_summary (
        year_month, meter_type, facility_id, total_consumption, 
        avg_consumption, meter_count, min_reading, max_reading
    )
    SELECT 
        substr(NEW.date, 1, 7) as year_month,
        'electric' as meter_type,
        em.facility_id,
        SUM(mr.value) as total_consumption,
        AVG(mr.value) as avg_consumption,
        COUNT(DISTINCT mr.meter_id) as meter_count,
        MIN(mr.value) as min_reading,
        MAX(mr.value) as max_reading
    FROM meter_readings mr
    JOIN electric_meters em ON mr.meter_id = em.id
    WHERE substr(mr.date, 1, 7) = substr(NEW.date, 1, 7)
      AND em.facility_id = (SELECT facility_id FROM electric_meters WHERE id = NEW.meter_id)
    GROUP BY substr(mr.date, 1, 7), em.facility_id;
END;

-- Trigger to update monthly summary when new heating readings are added
CREATE TRIGGER IF NOT EXISTS trg_update_monthly_summary_heating
AFTER INSERT ON heating_readings
BEGIN
    INSERT OR REPLACE INTO monthly_consumption_summary (
        year_month, meter_type, facility_id, total_consumption, 
        avg_consumption, meter_count, min_reading, max_reading
    )
    SELECT 
        substr(NEW.date, 1, 7) as year_month,
        'heating' as meter_type,
        hs.facility_id,
        SUM(hr.value) as total_consumption,
        AVG(hr.value) as avg_consumption,
        COUNT(DISTINCT hr.heating_id) as meter_count,
        MIN(hr.value) as min_reading,
        MAX(hr.value) as max_reading
    FROM heating_readings hr
    JOIN heating_systems hs ON hr.heating_id = hs.id
    WHERE substr(hr.date, 1, 7) = substr(NEW.date, 1, 7)
      AND hs.facility_id = (SELECT facility_id FROM heating_systems WHERE id = NEW.heating_id)
    GROUP BY substr(hr.date, 1, 7), hs.facility_id;
END;

-- ============================================================================
-- MAINTENANCE PROCEDURES SETUP
-- ============================================================================

-- Create maintenance log table
CREATE TABLE IF NOT EXISTS maintenance_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    operation_type TEXT NOT NULL,
    operation_details TEXT,
    records_affected INTEGER DEFAULT 0,
    execution_time_ms INTEGER,
    status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'failed', 'partial')),
    error_message TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_maintenance_log_created_at ON maintenance_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_log_operation_type ON maintenance_log(operation_type);

-- ============================================================================
-- PERFORMANCE CONFIGURATION
-- ============================================================================

-- Enable Write-Ahead Logging for better concurrency
PRAGMA journal_mode = WAL;

-- Optimize for read-heavy workloads
PRAGMA synchronous = NORMAL;
PRAGMA temp_store = MEMORY;
PRAGMA mmap_size = 268435456; -- 256MB memory mapping
PRAGMA cache_size = 10000;

-- Update query planner statistics
ANALYZE;

-- Run optimization recommendations
PRAGMA optimize;

COMMIT;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

SELECT 'Migration to v1.1.0 completed successfully!' as result;
SELECT 'Performance optimizations applied' as status;
SELECT 'Data archiving system ready' as archiving_status;
SELECT 'Query caching enabled' as caching_status;
SELECT 'Monitoring systems active' as monitoring_status;