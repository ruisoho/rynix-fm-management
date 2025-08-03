# Facility Management Database Structure - Meter System Overview

## Database Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           FACILITY MANAGEMENT DATABASE                                 │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│     FACILITIES      │
├─────────────────────┤
│ id (PK)            │
│ name               │
│ type               │
│ location           │
│ address            │
│ description        │
│ status             │
│ manager            │
│ contact            │
│ area               │
│ floors             │
│ year_built         │
│ notes              │
│ created_at         │
│ updated_at         │
└─────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────┐      ┌─────────────────────┐
│   ELECTRIC_METERS   │      │  HEATING_SYSTEMS    │
├─────────────────────┤      ├─────────────────────┤
│ id (PK)            │      │ id (PK)            │
│ facility_id (FK)   │◄────►│ facility_id (FK)   │
│ serial_number      │      │ type               │
│ type               │      │ model              │
│ location           │      │ manufacturer       │
│ installation_date  │      │ installation_date  │
│ status             │      │ status             │
│ created_at         │      │ last_check         │
│ updated_at         │      │ next_check         │
└─────────────────────┘      │ notes              │
         │                   │ created_at         │
         │ 1:N               │ updated_at         │
         ▼                   └─────────────────────┘
┌─────────────────────┐               │
│   METER_READINGS    │               │ 1:N
├─────────────────────┤               ▼
│ id (PK)            │      ┌─────────────────────┐
│ meter_id (FK)      │      │  HEATING_READINGS   │
│ value              │      ├─────────────────────┤
│ date               │      │ id (PK)            │
│ notes              │      │ heating_id (FK)    │
│ created_at         │      │ value              │
└─────────────────────┘      │ date               │
                             │ notes              │
                             │ created_at         │
                             └─────────────────────┘
```

## Table Details

### 1. FACILITIES (Main Entity)
**Purpose**: Central table for all facility information

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK) | Primary key, auto-increment |
| name | TEXT | Facility name |
| type | TEXT | Type of facility |
| location | TEXT | Physical location |
| address | TEXT | Full address |
| description | TEXT | Facility description |
| status | TEXT | Active/Inactive (default: 'Active') |
| manager | TEXT | Facility manager name |
| contact | TEXT | Contact information |
| area | REAL | Facility area in square meters |
| floors | INTEGER | Number of floors |
| year_built | INTEGER | Construction year |
| notes | TEXT | Additional notes |
| created_at | TEXT | Creation timestamp |
| updated_at | TEXT | Last update timestamp |

### 2. ELECTRIC_METERS (Meter Devices)
**Purpose**: Stores information about electric meters installed in facilities

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK) | Primary key, auto-increment |
| facility_id | INTEGER (FK) | References facilities(id) |
| serial_number | TEXT (UNIQUE) | Unique meter serial number |
| type | TEXT | Meter type (default: 'electric') |
| location | TEXT | Specific location within facility |
| installation_date | TEXT | Date when meter was installed |
| status | TEXT | active/inactive/broken (default: 'active') |
| created_at | TEXT | Creation timestamp |
| updated_at | TEXT | Last update timestamp |

**Constraints**:
- `serial_number` must be unique
- `status` must be one of: 'active', 'inactive', 'broken'
- Foreign key constraint on `facility_id`

### 3. METER_READINGS (Consumption Data)
**Purpose**: Stores actual meter readings and consumption values

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK) | Primary key, auto-increment |
| meter_id | INTEGER (FK) | References electric_meters(id) |
| value | REAL | Meter reading value (kWh) |
| date | TEXT | Reading date (YYYY-MM-DD format) |
| notes | TEXT | Optional notes about the reading |
| created_at | TEXT | Creation timestamp |

**Constraints**:
- `value` cannot be NULL
- `date` cannot be NULL
- Foreign key constraint on `meter_id` with CASCADE delete

### 4. HEATING_SYSTEMS (Heating Equipment)
**Purpose**: Stores information about heating systems in facilities

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK) | Primary key, auto-increment |
| facility_id | INTEGER (FK) | References facilities(id) |
| type | TEXT | Type of heating system |
| model | TEXT | Equipment model |
| manufacturer | TEXT | Equipment manufacturer |
| installation_date | TEXT | Installation date |
| status | TEXT | active/inactive/maintenance/broken |
| last_check | TEXT | Last maintenance check date |
| next_check | TEXT | Next scheduled check date |
| notes | TEXT | Additional notes |
| created_at | TEXT | Creation timestamp |
| updated_at | TEXT | Last update timestamp |

**Constraints**:
- `status` must be one of: 'active', 'inactive', 'maintenance', 'broken'
- Foreign key constraint on `facility_id`

### 5. HEATING_READINGS (Heating Consumption Data)
**Purpose**: Stores heating system readings and consumption values

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK) | Primary key, auto-increment |
| heating_id | INTEGER (FK) | References heating_systems(id) |
| value | REAL | Heating reading value |
| date | TEXT | Reading date (YYYY-MM-DD format) |
| notes | TEXT | Optional notes about the reading |
| created_at | TEXT | Creation timestamp |

**Constraints**:
- `value` cannot be NULL
- `date` cannot be NULL
- Foreign key constraint on `heating_id` with CASCADE delete

## Key Relationships

1. **Facilities → Electric Meters**: One-to-Many
   - One facility can have multiple electric meters
   - Each meter belongs to exactly one facility

2. **Electric Meters → Meter Readings**: One-to-Many
   - One meter can have multiple readings over time
   - Each reading belongs to exactly one meter

3. **Facilities → Heating Systems**: One-to-Many
   - One facility can have multiple heating systems
   - Each heating system belongs to exactly one facility

4. **Heating Systems → Heating Readings**: One-to-Many
   - One heating system can have multiple readings over time
   - Each reading belongs to exactly one heating system

## Indexes for Performance

- `idx_meters_facility_id`: Index on electric_meters.facility_id
- `idx_readings_meter_id`: Index on meter_readings.meter_id
- `idx_readings_date`: Index on meter_readings.date
- `idx_heating_readings_heating_id`: Index on heating_readings.heating_id
- `idx_heating_readings_date`: Index on heating_readings.date

## Data Flow Example

```
1. Facility "Main Building" (id: 1)
   ├── Electric Meter "EG Rechts" (id: 20, location: "EG Rechts")
   │   ├── Reading: 7781 kWh on 2025-01-02
   │   └── Reading: 7801 kWh on 2025-01-03
   │       └── Daily Consumption: 20 kWh
   │
   ├── Electric Meter "Aufzug" (id: 21, location: "Aufzug")
   │   ├── Reading: 225773 kWh on 2025-01-02
   │   └── Reading: 226805 kWh on 2025-01-03
   │       └── Daily Consumption: 1032 kWh
   │
   └── Heating System "Main Heating" (id: 1)
       ├── Reading: 88427 on 2025-01-02
       └── Reading: 88476 on 2025-01-03
           └── Daily Consumption: 49 units
```

## Current System Statistics

- **19 Electric Meters** across various locations
- **Multiple Heating Systems** for different zones
- **Daily Readings** stored for consumption tracking
- **Automatic Timestamps** for audit trails
- **Status Tracking** for maintenance management