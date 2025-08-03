const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const multer = require('multer');
const PerformanceOptimizer = require('./services/performanceOptimizer');
const DataArchiver = require('./services/dataArchiver');
const {
  dashboardCache,
  meterCache,
  facilityCache,
  heatingCache,
  invalidateMeters,
  invalidateFacilities,
  invalidateHeating,
  invalidateMaintenance,
  invalidateTasks
} = require('./middleware/cacheMiddleware');
require('dotenv').config();

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

const app = express();
const PORT = process.env.PORT || 3001;

// Database setup
const dbPath = path.join(__dirname, '..', 'app.db');
const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
let db;
let performanceOptimizer;
let dataArchiver;

// Database migrations
function runV11Migration() {
  return new Promise((resolve, reject) => {
    console.log('🔄 Running v1.1 migration...');
    
    const migrationPath = path.join(__dirname, '..', 'database', 'migration_v1_1.sql');
    
    try {
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');
      const statements = migrationSql.split(';').filter(stmt => stmt.trim().length > 0);
      
      let completed = 0;
      const total = statements.length;
      
      statements.forEach((statement, index) => {
        const trimmedStatement = statement.trim();
        if (trimmedStatement) {
          db.run(trimmedStatement, (err) => {
            if (err && !err.message.includes('already exists')) {
              console.warn(`Warning in migration statement ${index + 1}:`, err.message);
            }
            
            completed++;
            if (completed === total) {
              console.log('✅ v1.1 migration completed successfully');
              resolve();
            }
          });
        } else {
          completed++;
          if (completed === total) {
            console.log('✅ v1.1 migration completed successfully');
            resolve();
          }
        }
      });
    } catch (error) {
      console.error('❌ v1.1 migration failed:', error);
      reject(error);
    }
  });
}

function runMigrations() {
  return new Promise((resolve, reject) => {
    console.log('Running database migrations...');
    
    // Check if status column exists in maintenance_requests table
    db.all("PRAGMA table_info(maintenance_requests)", (err, columns) => {
      if (err) {
        console.error('Migration check error:', err);
        reject(err);
        return;
      }
      
      const hasStatusColumn = columns.some(col => col.name === 'status');
      
      if (!hasStatusColumn) {
        console.log('Adding status column to maintenance_requests table...');
        db.run(`ALTER TABLE maintenance_requests ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled'))`, (err) => {
          if (err) {
            console.error('Migration error:', err);
            reject(err);
            return;
          }
          console.log('Status column added successfully.');
          resolve();
        });
      } else {
        console.log('Database is up to date.');
        resolve();
      }
    });
  });
}

// Initialize database
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    try {
      db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Database connection error:', err);
          reject(err);
          return;
        }
        console.log('Database connected successfully');
        
        // Enable foreign key constraints
        db.run('PRAGMA foreign_keys = ON', (err) => {
          if (err) {
            console.error('Error enabling foreign keys:', err);
          } else {
            console.log('Foreign key constraints enabled');
          }
        });
        
        // Check if database is empty (first run)
        db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
          if (err) {
            console.error('Database query error:', err);
            reject(err);
            return;
          }
          
          if (tables.length === 0) {
            console.log('Initializing database from schema...');
            const schema = fs.readFileSync(schemaPath, 'utf8');
            
            // Split schema into individual statements and execute them
            const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
            let completed = 0;
            
            const executeStatement = (index) => {
              if (index >= statements.length) {
                console.log('Database initialized successfully.');
            
            // Run v1.1 migration
            runV11Migration().then(() => {
              // Initialize performance optimizer
              performanceOptimizer = new PerformanceOptimizer(db);
              return performanceOptimizer.initialize();
            }).then(() => {
              console.log('🚀 Performance optimizations applied');
              
              // Initialize data archiver
              dataArchiver = new DataArchiver(db);
              return dataArchiver.initialize();
            }).then(() => {
              console.log('📦 Data archiver initialized');
              
              // Schedule automatic archiving (every 24 hours)
              dataArchiver.scheduleAutoArchiving(24);
            }).catch(err => {
              console.error('v1.1 services initialization failed:', err);
            });
            
            // Enable WAL mode for better performance
            db.run('PRAGMA journal_mode = WAL', (err) => {
              if (err) {
                    console.error('WAL mode error:', err);
                  }
                  resolve();
                });
                return;
              }
              
              const statement = statements[index].trim();
              if (statement) {
                db.run(statement, (err) => {
                  if (err) {
                    console.error('Schema statement error:', err);
                    console.error('Failed statement:', statement);
                    reject(err);
                    return;
                  }
                  executeStatement(index + 1);
                });
              } else {
                executeStatement(index + 1);
              }
            };
            
            executeStatement(0);
          } else {
            // Run database migrations for existing databases
            runMigrations().then(() => {
              // Run v1.1 migration for existing databases
              return runV11Migration();
            }).then(() => {
              // Initialize performance optimizer
              performanceOptimizer = new PerformanceOptimizer(db);
              return performanceOptimizer.initialize();
            }).then(() => {
              console.log('🚀 Performance optimizations applied');
              
              // Initialize data archiver
              dataArchiver = new DataArchiver(db);
              return dataArchiver.initialize();
            }).then(() => {
              console.log('📦 Data archiver initialized');
              
              // Schedule automatic archiving (every 24 hours)
              dataArchiver.scheduleAutoArchiving(24);
              
              // Enable WAL mode for better performance
              db.run('PRAGMA journal_mode = WAL', (err) => {
                if (err) {
                  console.error('WAL mode error:', err);
                }
                resolve(true);
              });
            }).catch(err => {
              console.error('v1.1 services initialization failed:', err);
              reject(err);
            });
          }
        });
      });
    } catch (error) {
      console.error('Database initialization failed:', error);
      reject(error);
    }
  });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Dashboard endpoint - get summary data
app.get('/api/dashboard', dashboardCache, (req, res) => {
  const stats = {};
  let completed = 0;
  const total = 4;
  
  const checkComplete = () => {
    completed++;
    if (completed === total) {
      // Get recent data
      db.all(`
        SELECT * FROM maintenance_requests 
        ORDER BY created_at DESC 
        LIMIT 5
      `, (err, recentMaintenance) => {
        if (err) {
          console.error('Dashboard maintenance error:', err);
          return res.status(500).json({ error: 'Failed to fetch dashboard data' });
        }
        
        db.all(`
          SELECT t.*, f.name as facility_name 
          FROM tasks t 
          LEFT JOIN facilities f ON t.facility_id = f.id 
          ORDER BY t.created_at DESC 
          LIMIT 5
        `, (err, recentTasks) => {
          if (err) {
            console.error('Dashboard tasks error:', err);
            return res.status(500).json({ error: 'Failed to fetch dashboard data' });
          }
          
          res.json({
            counts: {
              facilities: stats.facilities,
              maintenance: stats.maintenance,
              tasks: stats.tasks,
              meters: stats.meters
            },
            recent: {
              maintenance: recentMaintenance,
              tasks: recentTasks
            }
          });
        });
      });
    }
  };
  
  db.get('SELECT COUNT(*) as count FROM facilities', (err, row) => {
    if (err) {
      console.error('Dashboard facilities error:', err);
      return res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
    stats.facilities = row.count;
    checkComplete();
  });
  
  db.get('SELECT COUNT(*) as count FROM maintenance_requests WHERE status != "completed"', (err, row) => {
    if (err) {
      console.error('Dashboard maintenance count error:', err);
      return res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
    stats.maintenance = row.count;
    checkComplete();
  });
  
  db.get('SELECT COUNT(*) as count FROM tasks WHERE status != "completed"', (err, row) => {
    if (err) {
      console.error('Dashboard tasks count error:', err);
      return res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
    stats.tasks = row.count;
    checkComplete();
  });
  
  db.get('SELECT COUNT(*) as count FROM electric_meters', (err, row) => {
    if (err) {
      console.error('Dashboard meters error:', err);
      return res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
    stats.meters = row.count;
    checkComplete();
  });
});

// Facilities endpoints
app.get('/api/facilities', facilityCache, (req, res) => {
  db.all('SELECT * FROM facilities ORDER BY name', (err, facilities) => {
    if (err) {
      console.error('Get facilities error:', err);
      return res.status(500).json({ error: 'Failed to fetch facilities' });
    }
    res.json(facilities);
  });
});

app.get('/api/facilities/:id', facilityCache, (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM facilities WHERE id = ?', [id], (err, facility) => {
    if (err) {
      console.error('Get facility error:', err);
      return res.status(500).json({ error: 'Failed to fetch facility' });
    }
    
    if (!facility) {
      return res.status(404).json({ error: 'Facility not found' });
    }
    
    let completed = 0;
    const total = 5;
    const data = { ...facility };
    
    const checkComplete = () => {
      completed++;
      if (completed === total) {
        res.json(data);
      }
    };
    
    // Get floors and their rooms
    db.all('SELECT * FROM floors WHERE facility_id = ? ORDER BY floor_number, name', [id], (err, floors) => {
      if (err) {
        console.error('Get facility floors error:', err);
        return res.status(500).json({ error: 'Failed to fetch facility' });
      }
      
      if (floors.length === 0) {
        data.floors = [];
        data.rooms = [];
        checkComplete();
        return;
      }
      
      let floorsCompleted = 0;
      const floorsWithRooms = floors.map(floor => ({ ...floor, rooms: [] }));
      
      floors.forEach((floor, index) => {
        db.all('SELECT * FROM rooms WHERE floor_id = ? ORDER BY room_number, name', [floor.id], (err, rooms) => {
          if (err) {
            console.error('Get floor rooms error:', err);
            return res.status(500).json({ error: 'Failed to fetch facility' });
          }
          
          floorsWithRooms[index].rooms = rooms;
          floorsCompleted++;
          
          if (floorsCompleted === floors.length) {
            data.floors = floorsWithRooms;
            // Also provide all rooms for backward compatibility
            data.rooms = floorsWithRooms.reduce((allRooms, floor) => [...allRooms, ...floor.rooms], []);
            checkComplete();
          }
        });
      });
    });
    
    // Get maintenance requests related to this facility (by location match)
    db.all('SELECT * FROM maintenance_requests WHERE location LIKE ? ORDER BY created_at DESC', ['%' + facility.name + '%'], (err, maintenance) => {
      if (err) {
        console.error('Get facility maintenance error:', err);
        return res.status(500).json({ error: 'Failed to fetch facility' });
      }
      data.maintenance = maintenance || [];
      checkComplete();
    });
    
    db.all('SELECT * FROM tasks WHERE facility_id = ? ORDER BY created_at DESC', [id], (err, tasks) => {
      if (err) {
        console.error('Get facility tasks error:', err);
        return res.status(500).json({ error: 'Failed to fetch facility' });
      }
      data.tasks = tasks;
      checkComplete();
    });
    
    db.all('SELECT * FROM heating_systems WHERE facility_id = ?', [id], (err, heating) => {
      if (err) {
        console.error('Get facility heating error:', err);
        return res.status(500).json({ error: 'Failed to fetch facility' });
      }
      data.heating = heating;
      checkComplete();
    });
    
    db.all('SELECT * FROM electric_meters WHERE facility_id = ?', [id], (err, meters) => {
      if (err) {
        console.error('Get facility meters error:', err);
        return res.status(500).json({ error: 'Failed to fetch facility' });
      }
      data.meters = meters;
      checkComplete();
    });
  });
});

app.post('/api/facilities', invalidateFacilities, (req, res) => {
  const { 
    name, type, location, address, description, status, 
    manager, contact, area, floors, yearBuilt, notes 
  } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  const sql = `INSERT INTO facilities (
    name, type, location, address, description, status, 
    manager, contact, area, floors, year_built, notes
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  const params = [
    name,
    type || null,
    location || null,
    address || null,
    description || null,
    status || 'Active',
    manager || null,
    contact || null,
    area ? parseFloat(area) : null,
    floors ? parseInt(floors) : null,
    yearBuilt ? parseInt(yearBuilt) : null,
    notes || null
  ];
  
  db.run(sql, params, function(err) {
    if (err) {
      console.error('Create facility error:', err);
      return res.status(500).json({ error: 'Failed to create facility' });
    }
    
    db.get('SELECT * FROM facilities WHERE id = ?', [this.lastID], (err, facility) => {
      if (err) {
        console.error('Create facility fetch error:', err);
        return res.status(500).json({ error: 'Failed to create facility' });
      }
      res.status(201).json(facility);
    });
  });
});

app.put('/api/facilities/:id', invalidateFacilities, (req, res) => {
  const { 
    name, type, location, address, description, status, 
    manager, contact, area, floors, yearBuilt, notes 
  } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  const sql = `UPDATE facilities SET 
    name = ?, type = ?, location = ?, address = ?, description = ?, status = ?, 
    manager = ?, contact = ?, area = ?, floors = ?, year_built = ?, notes = ?,
    updated_at = datetime('now')
    WHERE id = ?`;
  
  const params = [
    name,
    type || null,
    location || null,
    address || null,
    description || null,
    status || 'Active',
    manager || null,
    contact || null,
    area ? parseFloat(area) : null,
    floors ? parseInt(floors) : null,
    yearBuilt ? parseInt(yearBuilt) : null,
    notes || null,
    req.params.id
  ];
  
  db.run(sql, params, function(err) {
    if (err) {
      console.error('Update facility error:', err);
      return res.status(500).json({ error: 'Failed to update facility' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Facility not found' });
    }
    
    db.get('SELECT * FROM facilities WHERE id = ?', [req.params.id], (err, facility) => {
      if (err) {
        console.error('Update facility fetch error:', err);
        return res.status(500).json({ error: 'Failed to update facility' });
      }
      res.json(facility);
    });
  });
});

app.delete('/api/facilities/:id', invalidateFacilities, (req, res) => {
  db.run('DELETE FROM facilities WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      console.error('Delete facility error:', err);
      return res.status(500).json({ error: 'Failed to delete facility' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Facility not found' });
    }
    
    res.json({ message: 'Facility deleted successfully' });
  });
});

// Rooms endpoints
app.get('/api/facilities/:facilityId/rooms', (req, res) => {
  db.all('SELECT * FROM rooms WHERE facility_id = ? ORDER BY name', [req.params.facilityId], (err, rooms) => {
    if (err) {
      console.error('Get rooms error:', err);
      return res.status(500).json({ error: 'Failed to fetch rooms' });
    }
    res.json(rooms);
  });
});

app.post('/api/facilities/:facilityId/rooms', (req, res) => {
  const { name, floor_id, room_number, room_type, area, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  const query = floor_id 
    ? 'INSERT INTO rooms (facility_id, floor_id, name, room_number, room_type, area, description) VALUES (?, ?, ?, ?, ?, ?, ?)'
    : 'INSERT INTO rooms (facility_id, name, room_number, room_type, area, description) VALUES (?, ?, ?, ?, ?, ?)';
  
  const params = floor_id 
    ? [req.params.facilityId, floor_id, name, room_number, room_type, area, description]
    : [req.params.facilityId, name, room_number, room_type, area, description];
  
  db.run(query, params, function(err) {
    if (err) {
      console.error('Create room error:', err);
      return res.status(500).json({ error: 'Failed to create room' });
    }
    
    db.get('SELECT * FROM rooms WHERE id = ?', [this.lastID], (err, room) => {
      if (err) {
        console.error('Create room fetch error:', err);
        return res.status(500).json({ error: 'Failed to create room' });
      }
      res.status(201).json(room);
    });
  });
});

// Floors endpoints
app.get('/api/facilities/:facilityId/floors', (req, res) => {
  db.all('SELECT * FROM floors WHERE facility_id = ? ORDER BY floor_number, name', [req.params.facilityId], (err, floors) => {
    if (err) {
      console.error('Get floors error:', err);
      return res.status(500).json({ error: 'Failed to fetch floors' });
    }
    res.json(floors);
  });
});

app.post('/api/facilities/:facilityId/floors', (req, res) => {
  const { name, floor_number, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  db.run('INSERT INTO floors (facility_id, name, floor_number, description) VALUES (?, ?, ?, ?)', 
    [req.params.facilityId, name, floor_number, description], function(err) {
    if (err) {
      console.error('Create floor error:', err);
      return res.status(500).json({ error: 'Failed to create floor' });
    }
    
    db.get('SELECT * FROM floors WHERE id = ?', [this.lastID], (err, floor) => {
      if (err) {
        console.error('Create floor fetch error:', err);
        return res.status(500).json({ error: 'Failed to create floor' });
      }
      res.status(201).json(floor);
    });
  });
});

app.put('/api/floors/:id', (req, res) => {
  const { name, floor_number, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  db.run('UPDATE floors SET name = ?, floor_number = ?, description = ?, updated_at = datetime(\'now\') WHERE id = ?', 
    [name, floor_number, description, req.params.id], function(err) {
    if (err) {
      console.error('Update floor error:', err);
      return res.status(500).json({ error: 'Failed to update floor' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Floor not found' });
    }
    
    db.get('SELECT * FROM floors WHERE id = ?', [req.params.id], (err, floor) => {
      if (err) {
        console.error('Update floor fetch error:', err);
        return res.status(500).json({ error: 'Failed to update floor' });
      }
      res.json(floor);
    });
  });
});

app.delete('/api/floors/:id', (req, res) => {
  db.run('DELETE FROM floors WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      console.error('Delete floor error:', err);
      return res.status(500).json({ error: 'Failed to delete floor' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Floor not found' });
    }
    
    res.json({ message: 'Floor deleted successfully' });
  });
});

// Floor rooms endpoint
app.get('/api/floors/:floorId/rooms', (req, res) => {
  db.all('SELECT * FROM rooms WHERE floor_id = ? ORDER BY room_number, name', [req.params.floorId], (err, rooms) => {
    if (err) {
      console.error('Get floor rooms error:', err);
      return res.status(500).json({ error: 'Failed to fetch rooms' });
    }
    res.json(rooms);
  });
});

app.post('/api/floors/:floorId/rooms', (req, res) => {
  const { name, room_number, room_type, area, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  // Get facility_id from floor
  db.get('SELECT facility_id FROM floors WHERE id = ?', [req.params.floorId], (err, floor) => {
    if (err) {
      console.error('Get floor error:', err);
      return res.status(500).json({ error: 'Failed to create room' });
    }
    
    if (!floor) {
      return res.status(404).json({ error: 'Floor not found' });
    }
    
    db.run('INSERT INTO rooms (facility_id, floor_id, name, room_number, room_type, area, description) VALUES (?, ?, ?, ?, ?, ?, ?)', 
      [floor.facility_id, req.params.floorId, name, room_number, room_type, area, description], function(err) {
      if (err) {
        console.error('Create room error:', err);
        return res.status(500).json({ error: 'Failed to create room' });
      }
      
      db.get('SELECT * FROM rooms WHERE id = ?', [this.lastID], (err, room) => {
        if (err) {
          console.error('Create room fetch error:', err);
          return res.status(500).json({ error: 'Failed to create room' });
        }
        res.status(201).json(room);
      });
    });
  });
});

// Update room endpoint
app.put('/api/rooms/:id', (req, res) => {
  const { name, room_number, room_type, area, description, floor_id } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  db.run('UPDATE rooms SET name = ?, room_number = ?, room_type = ?, area = ?, description = ?, floor_id = ?, updated_at = datetime(\'now\') WHERE id = ?', 
    [name, room_number, room_type, area, description, floor_id, req.params.id], function(err) {
    if (err) {
      console.error('Update room error:', err);
      return res.status(500).json({ error: 'Failed to update room' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    db.get('SELECT * FROM rooms WHERE id = ?', [req.params.id], (err, room) => {
      if (err) {
        console.error('Update room fetch error:', err);
        return res.status(500).json({ error: 'Failed to update room' });
      }
      res.json(room);
    });
  });
});

// Delete room endpoint
app.delete('/api/rooms/:id', (req, res) => {
  db.run('DELETE FROM rooms WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      console.error('Delete room error:', err);
      return res.status(500).json({ error: 'Failed to delete room' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    res.json({ message: 'Room deleted successfully' });
  });
});

// Maintenance requests endpoints
app.get('/api/maintenance', (req, res) => {
  try {
    db.all(`
      SELECT * FROM maintenance_requests 
      ORDER BY created_at DESC
    `, (err, maintenance) => {
      if (err) {
        console.error('Get maintenance error:', err);
        return res.status(500).json({ error: 'Failed to fetch maintenance requests' });
      }
      res.json(maintenance);
    });
  } catch (error) {
    console.error('Get maintenance error:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance requests' });
  }
});

app.post('/api/maintenance', (req, res) => {
  try {
    const { 
      system,
      systemType,
      location,
      cycle,
      company,
      norms,
      lastMaintenance,
      priority,
      cost,
      notes,
      // New detailed fields
      urgencyLevel,
      estimatedDuration,
      requiredParts,
      assignedTechnician,
      workDescription,
      safetyRequirements,
      completionCriteria,
      maintenanceType,
      equipmentCondition,
      accessRequirements
    } = req.body;
    
    if (!system) {
      return res.status(400).json({ error: 'System name is required' });
    }
    
    if (!workDescription) {
      return res.status(400).json({ error: 'Work description is required' });
    }
    
    // Transform nested objects for database storage
    const cycleType = cycle?.type || 'monthly';
    const cycleCustomDays = cycle?.customDays || null;
    const companyName = company?.name || null;
    const companyContact = company?.contact || null;
    const companyPhone = company?.phone || null;
    const companyEmail = company?.email || null;
    
    // Format dates for database storage
    const lastMaintenanceDate = lastMaintenance ? new Date(lastMaintenance).toISOString().split('T')[0] : null;
    
    // Calculate next maintenance date automatically
    const calculateNextMaintenance = (lastDate, cycleType, customDays) => {
      if (!lastDate) return null;
      
      const lastMaintenanceDate = new Date(lastDate);
      let daysToAdd = 30; // default monthly
      
      switch (cycleType) {
        case 'weekly':
          daysToAdd = 7;
          break;
        case 'monthly':
          daysToAdd = 30;
          break;
        case 'quarterly':
          daysToAdd = 90;
          break;
        case 'semi-annual':
          daysToAdd = 180;
          break;
        case 'annual':
          daysToAdd = 365;
          break;
        case 'custom':
          daysToAdd = customDays || 30;
          break;
        default:
          daysToAdd = 30;
      }
      
      const nextDate = new Date(lastMaintenanceDate);
      nextDate.setDate(lastMaintenanceDate.getDate() + daysToAdd);
      return nextDate.toISOString().split('T')[0];
    };
    
    const nextMaintenanceDate = calculateNextMaintenance(lastMaintenanceDate, cycleType, cycleCustomDays);
    
    db.run(`INSERT INTO maintenance_requests (
      system, system_type, location, cycle_type, cycle_custom_days,
      company_name, company_contact, company_phone, company_email,
      norms, last_maintenance, next_maintenance, priority, cost, notes,
      urgency_level, estimated_duration, required_parts, assigned_technician,
      work_description, safety_requirements, completion_criteria,
      maintenance_type, equipment_condition, access_requirements
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      [
        system,
        systemType || 'HVAC',
        location || null,
        cycleType,
        cycleCustomDays,
        companyName,
        companyContact,
        companyPhone,
        companyEmail,
        norms || null,
        lastMaintenanceDate,
        nextMaintenanceDate,
        priority || 'medium',
        cost || null,
        notes || null,
        // New detailed fields
        urgencyLevel || 'normal',
        estimatedDuration || null,
        requiredParts || null,
        assignedTechnician || null,
        workDescription,
        safetyRequirements || null,
        completionCriteria || null,
        maintenanceType || 'preventive',
        equipmentCondition || 'good',
        accessRequirements || null
      ], 
      function(err) {
        if (err) {
          console.error('Create maintenance error:', err);
          return res.status(500).json({ error: 'Failed to create maintenance request' });
        }
        
        db.get(`
          SELECT * FROM maintenance_requests WHERE id = ?
        `, [this.lastID], (err, maintenance) => {
          if (err) {
            console.error('Get created maintenance error:', err);
            return res.status(500).json({ error: 'Failed to fetch created maintenance request' });
          }
          res.status(201).json(maintenance);
        });
      }
    );
  } catch (error) {
    console.error('Create maintenance error:', error);
    res.status(500).json({ error: 'Failed to create maintenance request' });
  }
});

// Tasks endpoints
app.get('/api/tasks', (req, res) => {
  try {
    db.all(`
      SELECT t.*, f.name as facility_name, mr.work_description as maintenance_description 
      FROM tasks t 
      LEFT JOIN facilities f ON t.facility_id = f.id 
      LEFT JOIN maintenance_requests mr ON t.maintenance_id = mr.id 
      ORDER BY t.created_at DESC
    `, (err, tasks) => {
      if (err) {
        console.error('Get tasks error:', err);
        return res.status(500).json({ error: 'Failed to fetch tasks' });
      }
      res.json(tasks);
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/tasks', (req, res) => {
  try {
    const { title, description, assigned_to, due_date, status, priority, facility_id, maintenance_id } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    db.run(`
      INSERT INTO tasks (title, description, assigned_to, due_date, status, priority, facility_id, maintenance_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title, 
      description || null, 
      assigned_to || null, 
      due_date || null, 
      status || 'todo', 
      priority || 'medium', 
      facility_id || null, 
      maintenance_id || null
    ], function(err) {
      if (err) {
        console.error('Create task error:', err);
        return res.status(500).json({ error: 'Failed to create task' });
      }
      
      db.get(`
        SELECT t.*, f.name as facility_name, mr.work_description as maintenance_description 
        FROM tasks t 
        LEFT JOIN facilities f ON t.facility_id = f.id 
        LEFT JOIN maintenance_requests mr ON t.maintenance_id = mr.id 
        WHERE t.id = ?
      `, [this.lastID], (err, task) => {
        if (err) {
          console.error('Get created task error:', err);
          return res.status(500).json({ error: 'Failed to fetch created task' });
        }
        res.status(201).json(task);
      });
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task endpoint
app.put('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, assigned_to, due_date, status, priority, facility_id, maintenance_id } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    db.run(`
      UPDATE tasks 
      SET title = ?, description = ?, assigned_to = ?, due_date = ?, status = ?, priority = ?, facility_id = ?, maintenance_id = ?
      WHERE id = ?
    `, [
      title,
      description || null,
      assigned_to || null,
      due_date || null,
      status || 'todo',
      priority || 'medium',
      facility_id || null,
      maintenance_id || null,
      id
    ], function(err) {
      if (err) {
        console.error('Update task error:', err);
        return res.status(500).json({ error: 'Failed to update task' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      db.get(`
        SELECT t.*, f.name as facility_name, mr.work_description as maintenance_description 
        FROM tasks t 
        LEFT JOIN facilities f ON t.facility_id = f.id 
        LEFT JOIN maintenance_requests mr ON t.maintenance_id = mr.id 
        WHERE t.id = ?
      `, [id], (err, task) => {
        if (err) {
          console.error('Get updated task error:', err);
          return res.status(500).json({ error: 'Failed to fetch updated task' });
        }
        res.json(task);
      });
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task endpoint
app.delete('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Delete task error:', err);
        return res.status(500).json({ error: 'Failed to delete task' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      res.json({ message: 'Task deleted successfully' });
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Heating systems endpoints
app.get('/api/heating', heatingCache, (req, res) => {
  try {
    // Get heating meters from electric_meters table
    const heatingMetersQuery = `
      SELECT em.*, f.name as facility_name, 'electric_meters' as source_table
      FROM electric_meters em 
      JOIN facilities f ON em.facility_id = f.id 
      WHERE em.type = 'heating'
      ORDER BY f.name, em.serial_number
    `;
    
    // Get heating systems from heating_systems table
    const heatingSystemsQuery = `
      SELECT hs.id, hs.facility_id, hs.manufacturer as serial_number, hs.type, 
             hs.notes as location, hs.installation_date, hs.status, 
             hs.created_at, hs.updated_at, f.name as facility_name, 'heating_systems' as source_table
      FROM heating_systems hs 
      JOIN facilities f ON hs.facility_id = f.id 
      ORDER BY f.name, hs.manufacturer
    `;
    
    // Execute both queries and combine results
    db.all(heatingMetersQuery, (err, heatingMeters) => {
      if (err) {
        console.error('Get heating meters error:', err);
        return res.status(500).json({ error: 'Failed to fetch heating meters' });
      }
      
      db.all(heatingSystemsQuery, (err, heatingSystems) => {
        if (err) {
          console.error('Get heating systems error:', err);
          return res.status(500).json({ error: 'Failed to fetch heating systems' });
        }
        
        // Combine both arrays
        const allHeatingData = [...heatingMeters, ...heatingSystems];
        console.log('Total heating data fetched:', allHeatingData.length, 'records');
        console.log('- From electric_meters:', heatingMeters.length);
        console.log('- From heating_systems:', heatingSystems.length);
        
        res.json(allHeatingData);
      });
    });
  } catch (error) {
    console.error('Get heating systems error:', error);
    res.status(500).json({ error: 'Failed to fetch heating systems' });
  }
});

app.post('/api/heating', (req, res) => {
  try {
    const { facility_id, serial_number, type, location, installation_date, status, heating_type } = req.body;
    if (!facility_id || !serial_number) {
      return res.status(400).json({ error: 'Facility ID and serial number are required' });
    }
    
    db.run(`
      INSERT INTO heating_systems (facility_id, type, model, manufacturer, installation_date, status, notes) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      facility_id, 
      type || 'heating',
      heating_type || 'boiler',
      serial_number,
      installation_date || null, 
      status || 'active',
      location || null
    ], function(err) {
      if (err) {
        console.error('Create heating meter error:', err);
        return res.status(500).json({ error: 'Failed to create heating meter' });
      }
      
      // Get the created heating system
      db.get(`
        SELECT hs.*, f.name as facility_name 
        FROM heating_systems hs 
        JOIN facilities f ON hs.facility_id = f.id 
        WHERE hs.id = ?
      `, [this.lastID], (err, heating) => {
        if (err) {
          console.error('Get created heating meter error:', err);
          return res.status(500).json({ error: 'Failed to retrieve created heating meter' });
        }
        res.status(201).json(heating);
      });
    });
  } catch (error) {
    console.error('Create heating meter error:', error);
    res.status(500).json({ error: 'Failed to create heating meter' });
  }
});

// Update heating system endpoint
app.put('/api/heating/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { facility_id, serial_number, type, location, installation_date, status, heating_type } = req.body;
    
    if (!facility_id || !serial_number) {
      return res.status(400).json({ error: 'Facility ID and serial number are required' });
    }
    
    // First check if this is a heating meter in electric_meters table
    db.get('SELECT type FROM electric_meters WHERE id = ?', [id], (err, meter) => {
      if (err) {
        console.error('Get heating meter type error:', err);
        return res.status(500).json({ error: 'Failed to check meter type' });
      }
      
      if (meter && meter.type === 'heating') {
        // Update heating meter in electric_meters table
        db.run(`
          UPDATE electric_meters 
          SET facility_id = ?, serial_number = ?, type = ?, location = ?, installation_date = ?, status = ?, updated_at = datetime('now')
          WHERE id = ?
        `, [
          facility_id,
          serial_number,
          type || 'heating',
          location || null,
          installation_date || null,
          status || 'active',
          id
        ], function(err) {
          if (err) {
            console.error('Update heating meter error:', err);
            return res.status(500).json({ error: 'Failed to update heating meter' });
          }
          
          if (this.changes === 0) {
            return res.status(404).json({ error: 'Heating meter not found' });
          }
          
          // Get the updated heating meter
          db.get(`
            SELECT em.*, f.name as facility_name 
            FROM electric_meters em 
            JOIN facilities f ON em.facility_id = f.id 
            WHERE em.id = ?
          `, [id], (err, heating) => {
            if (err) {
              console.error('Get updated heating meter error:', err);
              return res.status(500).json({ error: 'Failed to retrieve updated heating meter' });
            }
            res.json(heating);
          });
        });
      } else {
        // Fallback to original heating_systems table for legacy heating systems
        db.run(`
          UPDATE heating_systems 
          SET facility_id = ?, type = ?, model = ?, manufacturer = ?, installation_date = ?, status = ?, notes = ?, updated_at = datetime('now')
          WHERE id = ?
        `, [
          facility_id,
          type || 'heating',
          heating_type || 'boiler',
          serial_number,
          installation_date || null,
          status || 'active',
          location || null,
          id
        ], function(err) {
          if (err) {
            console.error('Update heating system error:', err);
            return res.status(500).json({ error: 'Failed to update heating system' });
          }
          
          if (this.changes === 0) {
            return res.status(404).json({ error: 'Heating system not found' });
          }
          
          // Get the updated heating system
          db.get(`
            SELECT hs.*, f.name as facility_name 
            FROM heating_systems hs 
            JOIN facilities f ON hs.facility_id = f.id 
            WHERE hs.id = ?
          `, [id], (err, heating) => {
            if (err) {
              console.error('Get updated heating system error:', err);
              return res.status(500).json({ error: 'Failed to retrieve updated heating system' });
            }
            res.json(heating);
          });
        });
      }
    });
  } catch (error) {
    console.error('Update heating system error:', error);
    res.status(500).json({ error: 'Failed to update heating system' });
  }
});

// Delete heating system endpoint
app.delete('/api/heating/:id', (req, res) => {
  const heatingId = req.params.id;
  
  // First check if heating system exists
  db.get('SELECT * FROM heating_systems WHERE id = ?', [heatingId], (err, heating) => {
    if (err) {
      console.error('Check heating system error:', err);
      return res.status(500).json({ error: 'Failed to check heating system' });
    }
    
    if (!heating) {
      return res.status(404).json({ error: 'Heating system not found' });
    }
    
    // Delete heating system
    db.run('DELETE FROM heating_systems WHERE id = ?', [heatingId], function(err) {
      if (err) {
        console.error('Delete heating system error:', err);
        return res.status(500).json({ error: 'Failed to delete heating system' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Heating system not found' });
      }
      
      res.json({ message: 'Heating system deleted successfully', id: heatingId });
    });
  });
});

// Heating readings endpoints
app.get('/api/heating/:heatingId/readings', (req, res) => {
  // First check if this is a heating meter in electric_meters table
  db.get('SELECT type FROM electric_meters WHERE id = ?', [req.params.heatingId], (err, meter) => {
    if (err) {
      console.error('Get heating meter type error:', err);
      return res.status(500).json({ error: 'Failed to check meter type' });
    }
    
    if (meter && meter.type === 'heating') {
      // Fetch from meter_readings table for heating meters stored in electric_meters
      db.all('SELECT * FROM meter_readings WHERE meter_id = ? ORDER BY date DESC', [req.params.heatingId], (err, readings) => {
        if (err) {
          console.error('Get heating readings error:', err);
          return res.status(500).json({ error: 'Failed to fetch heating readings' });
        }
        res.json(readings);
      });
    } else {
      // Fallback to original heating_readings table for legacy heating systems
      db.all('SELECT * FROM heating_readings WHERE heating_id = ? ORDER BY date DESC', [req.params.heatingId], (err, readings) => {
        if (err) {
          console.error('Get heating readings error:', err);
          return res.status(500).json({ error: 'Failed to fetch heating readings' });
        }
        res.json(readings);
      });
    }
  });
});

app.post('/api/heating/:heatingId/readings', (req, res) => {
  const { value, date, notes } = req.body;
  if (value === undefined || !date) {
    return res.status(400).json({ error: 'Value and date are required' });
  }
  
  // First check if this is a heating meter in electric_meters table
  db.get('SELECT type FROM electric_meters WHERE id = ?', [req.params.heatingId], (err, meter) => {
    if (err) {
      console.error('Get heating meter type error:', err);
      return res.status(500).json({ error: 'Failed to check meter type' });
    }
    
    if (meter && meter.type === 'heating') {
      // Insert into meter_readings table for heating meters stored in electric_meters
      db.run('INSERT INTO meter_readings (meter_id, value, date, notes) VALUES (?, ?, ?, ?)', 
        [req.params.heatingId, value, date, notes || null], function(err) {
        if (err) {
          console.error('Create heating reading error:', err);
          return res.status(500).json({ error: 'Failed to create heating reading' });
        }
        
        db.get('SELECT * FROM meter_readings WHERE id = ?', [this.lastID], (err, reading) => {
          if (err) {
            console.error('Get created heating reading error:', err);
            return res.status(500).json({ error: 'Failed to fetch created reading' });
          }
          res.status(201).json(reading);
        });
      });
    } else {
      // Fallback to original heating_readings table for legacy heating systems
      db.run('INSERT INTO heating_readings (heating_id, value, date, notes) VALUES (?, ?, ?, ?)', 
        [req.params.heatingId, value, date, notes || null], function(err) {
        if (err) {
          console.error('Create heating reading error:', err);
          return res.status(500).json({ error: 'Failed to create heating reading' });
        }
        
        db.get('SELECT * FROM heating_readings WHERE id = ?', [this.lastID], (err, reading) => {
          if (err) {
            console.error('Get created heating reading error:', err);
            return res.status(500).json({ error: 'Failed to fetch created reading' });
          }
          res.status(201).json(reading);
        });
      });
    }
  });
});

// Electric meters endpoints
app.get('/api/meters', meterCache, (req, res) => {
  db.all(`
    SELECT em.*, f.name as facility_name 
    FROM electric_meters em 
    JOIN facilities f ON em.facility_id = f.id 
    ORDER BY f.name, em.serial_number
  `, (err, meters) => {
    if (err) {
      console.error('Get meters error:', err);
      return res.status(500).json({ error: 'Failed to fetch electric meters' });
    }
    res.json(meters);
  });
});

app.post('/api/meters', invalidateMeters, (req, res) => {
  const { facility_id, serial_number, type, location, installation_date, status } = req.body;
  if (!facility_id || !serial_number) {
    return res.status(400).json({ error: 'Facility ID and serial number are required' });
  }
  
  db.run(`
    INSERT INTO electric_meters (facility_id, serial_number, type, location, installation_date, status) 
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    facility_id, 
    serial_number, 
    type || 'electric', 
    location || null, 
    installation_date || null, 
    status || 'active'
  ], function(err) {
    if (err) {
      console.error('Create meter error:', err);
      return res.status(500).json({ error: 'Failed to create electric meter' });
    }
    
    db.get(`
      SELECT em.*, f.name as facility_name 
      FROM electric_meters em 
      JOIN facilities f ON em.facility_id = f.id 
      WHERE em.id = ?
    `, [this.lastID], (err, meter) => {
      if (err) {
        console.error('Get created meter error:', err);
        return res.status(500).json({ error: 'Failed to fetch created meter' });
      }
      res.status(201).json(meter);
    });
  });
});

// Update electric meter endpoint
app.put('/api/meters/:id', (req, res) => {
  const { id } = req.params;
  const { facility_id, serial_number, type, location, installation_date, status } = req.body;
  
  if (!facility_id || !serial_number) {
    return res.status(400).json({ error: 'Facility ID and serial number are required' });
  }
  
  db.run(`
    UPDATE electric_meters 
    SET facility_id = ?, serial_number = ?, type = ?, location = ?, installation_date = ?, status = ?, updated_at = datetime('now')
    WHERE id = ?
  `, [
    facility_id,
    serial_number,
    type || 'electric',
    location || null,
    installation_date || null,
    status || 'active',
    id
  ], function(err) {
    if (err) {
      console.error('Update meter error:', err);
      return res.status(500).json({ error: 'Failed to update electric meter' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Electric meter not found' });
    }
    
    // Get the updated meter
    db.get(`
      SELECT em.*, f.name as facility_name 
      FROM electric_meters em 
      JOIN facilities f ON em.facility_id = f.id 
      WHERE em.id = ?
    `, [id], (err, meter) => {
      if (err) {
        console.error('Get updated meter error:', err);
        return res.status(500).json({ error: 'Failed to retrieve updated meter' });
      }
      res.json(meter);
    });
  });
});

// Meter readings endpoints
app.get('/api/meters/:meterId/readings', (req, res) => {
  db.all('SELECT * FROM meter_readings WHERE meter_id = ? ORDER BY date DESC', [req.params.meterId], (err, readings) => {
    if (err) {
      console.error('Get readings error:', err);
      return res.status(500).json({ error: 'Failed to fetch meter readings' });
    }
    res.json(readings);
  });
});

// Get meter consumption data with baseline exclusion
app.get('/api/meters/:meterId/consumption', (req, res) => {
  const { startDate, endDate } = req.query;
  let dateFilter = '';
  let params = [req.params.meterId];
  
  if (startDate && endDate) {
    dateFilter = 'AND date BETWEEN ? AND ?';
    params.push(startDate, endDate);
  } else if (startDate) {
    dateFilter = 'AND date >= ?';
    params.push(startDate);
  } else if (endDate) {
    dateFilter = 'AND date <= ?';
    params.push(endDate);
  }
  
  const query = `
    WITH ordered_readings AS (
      SELECT 
        id,
        meter_id,
        value,
        date,
        notes,
        LAG(value) OVER (ORDER BY date) as prev_value,
        ROW_NUMBER() OVER (ORDER BY date) as row_num
      FROM meter_readings 
      WHERE meter_id = ? ${dateFilter}
        AND value IS NOT NULL
      ORDER BY date
    )
    SELECT 
      id,
      meter_id,
      value,
      date,
      notes,
      CASE 
         WHEN row_num > 1 AND prev_value IS NOT NULL 
         THEN CASE WHEN (value - prev_value) > 0 THEN (value - prev_value) ELSE 0 END
         ELSE 0
       END as consumption,
      row_num = 1 as is_baseline
    FROM ordered_readings
    ORDER BY date
  `;
  
  db.all(query, params, (err, readings) => {
    if (err) {
      console.error('Get consumption data error:', err);
      return res.status(500).json({ error: 'Failed to fetch meter consumption data' });
    }
    res.json(readings);
  });
});

app.post('/api/meters/:meterId/readings', (req, res) => {
  const { value, date, notes } = req.body;
  if (value === undefined || !date) {
    return res.status(400).json({ error: 'Value and date are required' });
  }
  
  db.run('INSERT INTO meter_readings (meter_id, value, date, notes) VALUES (?, ?, ?, ?)', 
    [req.params.meterId, value, date, notes || null], function(err) {
    if (err) {
      console.error('Create reading error:', err);
      return res.status(500).json({ error: 'Failed to create meter reading' });
    }
    
    db.get('SELECT * FROM meter_readings WHERE id = ?', [this.lastID], (err, reading) => {
      if (err) {
        console.error('Get created reading error:', err);
        return res.status(500).json({ error: 'Failed to fetch created reading' });
      }
      res.status(201).json(reading);
    });
  });
});

// Delete meter endpoint
app.delete('/api/meters/:id', (req, res) => {
  const meterId = req.params.id;
  
  // First check if meter exists
  db.get('SELECT * FROM electric_meters WHERE id = ?', [meterId], (err, meter) => {
    if (err) {
      console.error('Check meter error:', err);
      return res.status(500).json({ error: 'Failed to check meter' });
    }
    
    if (!meter) {
      return res.status(404).json({ error: 'Meter not found' });
    }
    
    // Delete meter (readings will be deleted automatically due to CASCADE)
    db.run('DELETE FROM electric_meters WHERE id = ?', [meterId], function(err) {
      if (err) {
        console.error('Delete meter error:', err);
        return res.status(500).json({ error: 'Failed to delete meter' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Meter not found' });
      }
      
      res.json({ message: 'Meter deleted successfully', id: meterId });
    });
  });
});

// CSV Upload endpoint for electric meters
app.post('/api/meters/upload-csv', upload.single('csvFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No CSV file uploaded' });
  }

  const csvFilePath = req.file.path;
  const results = {
    metersCreated: 0,
    readingsAdded: 0,
    readingsUpdated: 0,
    errors: 0,
    errorMessages: []
  };

  try {
      // Read and parse CSV file
      const csvContent = fs.readFileSync(csvFilePath, 'utf8');
      const lines = csvContent.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file must contain at least a header row and one data row');
      }

      // Try different delimiters (comma, semicolon, tab)
      let delimiter = ',';
      const firstLine = lines[0];
      if (firstLine.split(';').length > firstLine.split(',').length) {
        delimiter = ';';
      } else if (firstLine.split('\t').length > firstLine.split(',').length) {
        delimiter = '\t';
      }

      const headers = lines[0].split(delimiter).map(h => h.trim());
      const dataLines = lines.slice(1);
      
      // Debug logging
      console.log('CSV Debug Info:');
      console.log('Delimiter detected:', delimiter === ',' ? 'comma' : delimiter === ';' ? 'semicolon' : 'tab');
      console.log('Headers found:', headers);
      console.log('Number of data lines:', dataLines.length);
      console.log('First data line:', dataLines[0] ? dataLines[0].split(delimiter) : 'none');
      
      // Add debug info to results for user feedback
      results.debugInfo = {
        delimiter: delimiter,
        headers: headers,
        totalRows: dataLines.length,
        firstDataRow: dataLines[0] ? dataLines[0].split(delimiter) : null
      };

    // Helper functions
    const parseGermanDate = (dateStr) => {
      if (!dateStr) return null;
      
      // Try different date formats
      const formats = [
        /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/, // DD.MM.YYYY
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // MM/DD/YYYY
        /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
      ];
      
      for (const format of formats) {
        const match = dateStr.match(format);
        if (match) {
          if (format === formats[0]) { // DD.MM.YYYY
            return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
          } else if (format === formats[1]) { // MM/DD/YYYY
            return `${match[3]}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`;
          } else { // YYYY-MM-DD
            return dateStr;
          }
        }
      }
      return null;
    };

    const extractSerialNumber = (meterName) => {
      if (!meterName) return null;
      // Extract numbers from meter name (assuming serial number is numeric)
      const match = meterName.match(/\d+/);
      return match ? match[0] : null;
    };

    const findOrCreateMeter = (serialNumber, facilityId = 1) => {
      return new Promise((resolve, reject) => {
        // First try to find existing meter
        db.get(
          'SELECT * FROM electric_meters WHERE serial_number = ?',
          [serialNumber],
          (err, existingMeter) => {
            if (err) {
              reject(err);
              return;
            }

            if (existingMeter) {
              resolve(existingMeter);
              return;
            }

            // Create new meter
            db.run(
              `INSERT INTO electric_meters (facility_id, serial_number, type, location, installation_date, status, created_at, updated_at)
               VALUES (?, ?, 'electric', 'Imported from CSV', date('now'), 'active', datetime('now'), datetime('now'))`,
              [facilityId, serialNumber],
              function(err) {
                if (err) {
                  reject(err);
                  return;
                }

                // Get the created meter
                db.get(
                  'SELECT * FROM electric_meters WHERE id = ?',
                  [this.lastID],
                  (err, newMeter) => {
                    if (err) {
                      reject(err);
                      return;
                    }
                    results.metersCreated++;
                    resolve(newMeter);
                  }
                );
              }
            );
          }
        );
      });
    };

    const insertOrUpdateReading = (meterId, date, value) => {
      return new Promise((resolve, reject) => {
        // Check if reading exists for this date
        db.get(
          'SELECT * FROM meter_readings WHERE meter_id = ? AND date = ?',
          [meterId, date],
          (err, existingReading) => {
            if (err) {
              reject(err);
              return;
            }

            if (existingReading) {
              // Update existing reading
              db.run(
                'UPDATE meter_readings SET value = ?, updated_at = datetime(\'now\') WHERE id = ?',
                [value, existingReading.id],
                (err) => {
                  if (err) {
                    reject(err);
                    return;
                  }
                  results.readingsUpdated++;
                  resolve();
                }
              );
            } else {
              // Insert new reading
              db.run(
                'INSERT INTO meter_readings (meter_id, value, date, created_at, updated_at) VALUES (?, ?, ?, datetime(\'now\'), datetime(\'now\'))',
                [meterId, value, date],
                (err) => {
                  if (err) {
                    reject(err);
                    return;
                  }
                  results.readingsAdded++;
                  resolve();
                }
              );
            }
          }
        );
      });
    };

    // Process CSV data - Handle matrix format (meters in rows, dates in columns)
       const processData = async () => {
         // Detect if this is a matrix format (dates in headers, meters in rows)
         const isMatrixFormat = headers.some(header => 
           header.match(/^\d{1,2}[\.\/-]\d{1,2}[\.\/-]\d{2,4}$/) || 
           header.match(/^\d{4}[\.\/-]\d{1,2}[\.\/-]\d{1,2}$/)
         );
         
         console.log('Matrix format detected:', isMatrixFormat);
         
         if (isMatrixFormat) {
           // Matrix format: first column is meter names, subsequent columns are dates with values
           const meterNameCol = 0;
           const dateColumns = [];
           
           // Find all date columns
           for (let j = 1; j < headers.length; j++) {
             const header = headers[j].trim();
             const parsedDate = parseGermanDate(header);
             if (parsedDate) {
               dateColumns.push({ index: j, date: parsedDate, header: header });
             }
           }
           
           console.log('Date columns found:', dateColumns.length);
           
           if (dateColumns.length === 0) {
             throw new Error('No valid date columns found in matrix format');
           }
           
           // Process each row (meter)
           for (let i = 0; i < dataLines.length; i++) {
             const line = dataLines[i];
             const values = line.split(delimiter).map(v => v.trim());
          
          if (values.length === 0 || !values[meterNameCol]) {
            continue; // Skip empty rows
          }
          
          const meterName = values[meterNameCol];
          const serialNumber = extractSerialNumber(meterName);
          
          if (!serialNumber) {
            results.errors++;
            results.errorMessages.push(`Row ${i + 2}: Could not extract serial number from meter name: ${meterName}`);
            continue;
          }
          
          try {
            // Find or create meter
            const meter = await findOrCreateMeter(serialNumber);
            
            // Process each date column for this meter
            for (const dateCol of dateColumns) {
              const valueStr = values[dateCol.index];
              
              if (valueStr && valueStr.trim() !== '') {
                const value = parseFloat(valueStr.replace(',', '.'));
                
                if (!isNaN(value) && value >= 0) {
                  try {
                    await insertOrUpdateReading(meter.id, dateCol.date, value);
                  } catch (error) {
                    results.errors++;
                    results.errorMessages.push(`Row ${i + 2}, Date ${dateCol.header}: ${error.message}`);
                  }
                }
              }
            }
          } catch (error) {
            results.errors++;
            results.errorMessages.push(`Row ${i + 2}: ${error.message}`);
          }
        }
      } else {
        // Traditional format: each row has meter, date, and value
         for (let i = 0; i < dataLines.length; i++) {
           const line = dataLines[i];
           const values = line.split(delimiter).map(v => v.trim());
          
          try {
            // Find relevant columns
            let meterNameCol = -1, dateCol = -1, valueCol = -1;
            
            // Header-based detection
            for (let j = 0; j < headers.length; j++) {
              const header = headers[j].toLowerCase();
              
              if (meterNameCol === -1 && (
                header.includes('meter') || header.includes('name') || header.includes('serial') ||
                header.includes('zähler') || header.includes('bezeichnung') || header.includes('building') ||
                header.includes('main') || header.includes('gebäude')
              )) {
                meterNameCol = j;
              } else if (dateCol === -1 && (
                header.includes('date') || header.includes('datum') || header.includes('zeit') ||
                header.includes('time')
              )) {
                dateCol = j;
              } else if (valueCol === -1 && (
                header.includes('value') || header.includes('reading') || header.includes('wert') ||
                header.includes('verbrauch') || header.includes('consumption') || header.includes('energie') ||
                header.includes('energy') || header.includes('kwh') || header.includes('mwh')
              )) {
                valueCol = j;
              }
            }
            
            // Fallback to positional detection
            if (meterNameCol === -1) meterNameCol = 0;
            if (dateCol === -1) dateCol = 1;
            if (valueCol === -1) valueCol = 2;
            
            if (values.length <= Math.max(meterNameCol, dateCol, valueCol)) {
              throw new Error(`Insufficient columns. Expected at least ${Math.max(meterNameCol, dateCol, valueCol) + 1} columns, got ${values.length}`);
            }
            
            const meterName = values[meterNameCol];
            const dateStr = values[dateCol];
            const valueStr = values[valueCol];
            
            if (!meterName || !dateStr || !valueStr) {
              throw new Error(`Missing data: meter='${meterName}', date='${dateStr}', value='${valueStr}'`);
            }
            
            const serialNumber = extractSerialNumber(meterName);
            if (!serialNumber) {
              throw new Error(`Could not extract serial number from meter name: ${meterName}`);
            }
            
            const date = parseGermanDate(dateStr);
            if (!date) {
              throw new Error(`Invalid date format: ${dateStr}`);
            }
            
            const value = parseFloat(valueStr.replace(',', '.'));
            if (isNaN(value)) {
              throw new Error(`Invalid reading value: ${valueStr}`);
            }
            
            // Find or create meter
            const meter = await findOrCreateMeter(serialNumber);
            
            // Insert or update reading
            await insertOrUpdateReading(meter.id, date, value);
            
          } catch (error) {
            results.errors++;
            results.errorMessages.push(`Row ${i + 2}: ${error.message}`);
          }
        }
      }
    };

    // Execute processing
    processData()
      .then(() => {
        // Clean up uploaded file
        fs.unlinkSync(csvFilePath);
        res.json(results);
      })
      .catch((error) => {
        // Clean up uploaded file
        fs.unlinkSync(csvFilePath);
        console.error('CSV processing error:', error);
        res.status(500).json({ error: 'Failed to process CSV file', details: error.message });
      });

  } catch (error) {
    // Clean up uploaded file
    fs.unlinkSync(csvFilePath);
    console.error('CSV upload error:', error);
    res.status(500).json({ error: 'Failed to process CSV file', details: error.message });
  }
});

// Energy consumption data endpoint for charts
// Optimized energy consumption endpoint with caching
app.get('/api/energy-consumption', async (req, res) => {
  const { period = 'monthly' } = req.query;
  
  try {
    if (!performanceOptimizer) {
      // Fallback to original query if optimizer not initialized
      return res.status(503).json({ error: 'Performance optimizer not ready' });
    }
    
    const result = await performanceOptimizer.getOptimizedEnergyConsumption(period);
    res.json(result);
  } catch (error) {
    console.error('Optimized energy consumption error:', error);
    res.status(500).json({ error: 'Failed to fetch energy consumption data' });
  }
});

// Performance monitoring and maintenance endpoints
app.get('/api/performance/stats', (req, res) => {
  if (!performanceOptimizer) {
    return res.status(503).json({ error: 'Performance optimizer not ready' });
  }
  
  const stats = performanceOptimizer.getPerformanceStats();
  res.json(stats || { message: 'No performance data available yet' });
});

app.post('/api/performance/archive', async (req, res) => {
  if (!performanceOptimizer) {
    return res.status(503).json({ error: 'Performance optimizer not ready' });
  }
  
  try {
    const { monthsToKeep = 12 } = req.body;
    const result = await performanceOptimizer.archiveOldReadings(monthsToKeep);
    res.json({
      message: 'Archiving completed successfully',
      ...result
    });
  } catch (error) {
    console.error('Archive operation failed:', error);
    res.status(500).json({ error: 'Failed to archive old readings' });
  }
});

app.post('/api/performance/maintenance', async (req, res) => {
  if (!performanceOptimizer) {
    return res.status(503).json({ error: 'Performance optimizer not ready' });
  }
  
  try {
    await performanceOptimizer.runMaintenance();
    res.json({ message: 'Maintenance tasks completed successfully' });
  } catch (error) {
    console.error('Maintenance tasks failed:', error);
    res.status(500).json({ error: 'Failed to run maintenance tasks' });
  }
});

// ============================================================================
// V1.1 DATA ARCHIVING ENDPOINTS
// ============================================================================

// Get archive statistics
app.get('/api/v11/archive/stats', async (req, res) => {
  if (!dataArchiver) {
    return res.status(503).json({ error: 'Data archiver not ready' });
  }
  
  try {
    const stats = await dataArchiver.getArchiveStats();
    const archivableStats = await dataArchiver.getArchivableDataStats();
    
    res.json({
      archiveStats: stats,
      archivableData: archivableStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to get archive stats:', error);
    res.status(500).json({ error: 'Failed to retrieve archive statistics' });
  }
});

// Manual archive operation
app.post('/api/v11/archive/run', async (req, res) => {
  if (!dataArchiver) {
    return res.status(503).json({ error: 'Data archiver not ready' });
  }
  
  try {
    const { monthsToKeep = 12, dryRun = false } = req.body;
    
    const result = await dataArchiver.archiveOldReadings({
      monthsToKeep,
      dryRun
    });
    
    res.json({
      message: dryRun ? 'Dry run completed successfully' : 'Archiving completed successfully',
      ...result
    });
  } catch (error) {
    console.error('Archive operation failed:', error);
    res.status(500).json({ error: 'Failed to run archive operation' });
  }
});

// Get database version info
app.get('/api/v11/version', (req, res) => {
  const query = `SELECT * FROM database_version ORDER BY applied_at DESC`;
  
  db.all(query, (err, rows) => {
    if (err) {
      console.error('Version query error:', err);
      res.status(500).json({ error: 'Failed to retrieve version information' });
      return;
    }
    
    res.json({
      versions: rows,
      currentVersion: '1.1.0',
      timestamp: new Date().toISOString()
    });
  });
});

// Helper function to format period names
function formatPeriodName(period, periodType) {
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Database: ${dbPath}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server due to database initialization error:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  if (db) {
    db.close();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down server...');
  if (db) {
    db.close();
  }
  process.exit(0);
});