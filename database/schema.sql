-- Facility Manager Database Schema
-- SQLite database for offline-first facility management

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Facilities table - main entities being managed
CREATE TABLE IF NOT EXISTS facilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT,
    location TEXT,
    address TEXT,
    description TEXT,
    status TEXT DEFAULT 'Active',
    manager TEXT,
    contact TEXT,
    area REAL,
    floors INTEGER,
    year_built INTEGER,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Floors table - linked to facilities
CREATE TABLE IF NOT EXISTS floors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    facility_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    floor_number INTEGER,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE
);

-- Rooms table - linked to floors
CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    floor_id INTEGER NOT NULL,
    facility_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    room_number TEXT,
    room_type TEXT,
    area REAL,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE CASCADE,
    FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE
);}]}}

-- Maintenance requests table - updated structure with detailed fields
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    system TEXT NOT NULL,
    system_type TEXT DEFAULT 'HVAC' CHECK (system_type IN ('HVAC', 'Electrical', 'Plumbing', 'Fire Safety', 'Security', 'Elevator', 'Lighting', 'Ventilation', 'Heating', 'Cooling', 'Generator', 'UPS', 'Network', 'Access Control', 'CCTV')),
    location TEXT,
    cycle_type TEXT DEFAULT 'monthly' CHECK (cycle_type IN ('weekly', 'monthly', 'quarterly', 'semi-annual', 'annual', 'custom')),
    cycle_custom_days INTEGER,
    company_name TEXT,
    company_contact TEXT,
    company_phone TEXT,
    company_email TEXT,
    norms TEXT,
    last_maintenance TEXT,
    next_maintenance TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    cost TEXT,
    notes TEXT,
    -- New detailed fields
    urgency_level TEXT DEFAULT 'normal' CHECK (urgency_level IN ('low', 'normal', 'urgent', 'emergency')),
    estimated_duration TEXT,
    required_parts TEXT,
    assigned_technician TEXT,
    work_description TEXT,
    safety_requirements TEXT,
    completion_criteria TEXT,
    maintenance_type TEXT DEFAULT 'preventive' CHECK (maintenance_type IN ('preventive', 'corrective', 'predictive', 'emergency')),
    equipment_condition TEXT DEFAULT 'good' CHECK (equipment_condition IN ('excellent', 'good', 'fair', 'poor', 'critical')),
    access_requirements TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT
);

-- Tasks table - can be linked to facilities or maintenance requests
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to TEXT,
    due_date TEXT,
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    facility_id INTEGER,
    maintenance_id INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT,
    FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE,
    FOREIGN KEY (maintenance_id) REFERENCES maintenance_requests(id) ON DELETE CASCADE
);

-- Heating systems table - linked to facilities
CREATE TABLE IF NOT EXISTS heating_systems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    facility_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    model TEXT,
    manufacturer TEXT,
    installation_date TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'broken')),
    last_check TEXT,
    next_check TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE
);

-- Electric meters table - linked to facilities
CREATE TABLE IF NOT EXISTS electric_meters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    facility_id INTEGER NOT NULL,
    serial_number TEXT UNIQUE NOT NULL,
    type TEXT DEFAULT 'electric',
    location TEXT,
    installation_date TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'broken')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE
);

-- Meter readings table - linked to electric meters
CREATE TABLE IF NOT EXISTS meter_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meter_id INTEGER NOT NULL,
    value REAL NOT NULL,
    date TEXT NOT NULL,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (meter_id) REFERENCES electric_meters(id) ON DELETE CASCADE
);

-- Heating readings table - linked to heating systems
CREATE TABLE IF NOT EXISTS heating_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    heating_id INTEGER NOT NULL,
    value REAL NOT NULL,
    date TEXT NOT NULL,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (heating_id) REFERENCES heating_systems(id) ON DELETE CASCADE
);

-- Users table for local authentication
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TEXT DEFAULT (datetime('now')),
    last_login TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rooms_facility_id ON rooms(facility_id);
-- Removed facility_id index as maintenance_requests no longer has facility_id column
CREATE INDEX IF NOT EXISTS idx_tasks_facility_id ON tasks(facility_id);
CREATE INDEX IF NOT EXISTS idx_tasks_maintenance_id ON tasks(maintenance_id);
CREATE INDEX IF NOT EXISTS idx_heating_facility_id ON heating_systems(facility_id);
CREATE INDEX IF NOT EXISTS idx_meters_facility_id ON electric_meters(facility_id);
CREATE INDEX IF NOT EXISTS idx_readings_meter_id ON meter_readings(meter_id);
CREATE INDEX IF NOT EXISTS idx_readings_date ON meter_readings(date);
CREATE INDEX IF NOT EXISTS idx_heating_readings_heating_id ON heating_readings(heating_id);
CREATE INDEX IF NOT EXISTS idx_heating_readings_date ON heating_readings(date);

-- Create triggers to update the updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_facilities_timestamp 
    AFTER UPDATE ON facilities
    BEGIN
        UPDATE facilities SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_rooms_timestamp 
    AFTER UPDATE ON rooms
    BEGIN
        UPDATE rooms SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_maintenance_timestamp 
    AFTER UPDATE ON maintenance_requests
    BEGIN
        UPDATE maintenance_requests SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_tasks_timestamp 
    AFTER UPDATE ON tasks
    BEGIN
        UPDATE tasks SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_heating_timestamp 
    AFTER UPDATE ON heating_systems
    BEGIN
        UPDATE heating_systems SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_meters_timestamp 
    AFTER UPDATE ON electric_meters
    BEGIN
        UPDATE electric_meters SET updated_at = datetime('now') WHERE id = NEW.id;
    END;