const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const dbPath = path.join(__dirname, '..', 'app.db');
const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');

let mainWindow;
let db;

// Initialize database
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    try {
      // Create database connection
      db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Database connection failed:', err);
          reject(false);
          return;
        }
        
        console.log('Connected to SQLite database at:', dbPath);
        
        // Check if database is empty (first run)
        db.get("SELECT name FROM sqlite_master WHERE type='table' LIMIT 1", (err, row) => {
          if (err) {
            console.error('Error checking database tables:', err);
            reject(false);
            return;
          }
          
          if (!row) {
            console.log('First run detected. Initializing database...');
            
            // Read and execute schema
            const schema = fs.readFileSync(schemaPath, 'utf8');
            db.exec(schema, (err) => {
              if (err) {
                console.error('Schema execution failed:', err);
                reject(false);
                return;
              }
              
              console.log('Database initialized successfully.');
              
              // Enable WAL mode for better performance
              db.run('PRAGMA journal_mode = WAL', (err) => {
                if (err) {
                  console.error('Failed to enable WAL mode:', err);
                } else {
                  console.log('WAL mode enabled');
                }
                resolve(true);
              });
            });
          } else {
            console.log('Database already exists. Skipping initialization.');
            
            // Enable WAL mode for better performance
            db.run('PRAGMA journal_mode = WAL', (err) => {
              if (err) {
                console.error('Failed to enable WAL mode:', err);
              } else {
                console.log('WAL mode enabled');
              }
              resolve(true);
            });
          }
        });
      });
    } catch (error) {
      console.error('Database initialization failed:', error);
      reject(false);
    }
  });
}

// Create main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '..', 'frontend', 'public', 'icon.png'),
    show: false,
    titleBarStyle: 'default'
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Facility',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-action', 'new-facility');
          }
        },
        { type: 'separator' },
        {
          label: 'Export Data',
          click: () => {
            mainWindow.webContents.send('menu-action', 'export-data');
          }
        },
        {
          label: 'Import Data',
          click: () => {
            mainWindow.webContents.send('menu-action', 'import-data');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Facility Manager',
          click: () => {
            mainWindow.webContents.send('menu-action', 'about');
          }
        }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });

    // Window menu
    template[4].submenu = [
      { role: 'close' },
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' }
    ];
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(async () => {
  try {
    // Initialize database first
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      console.error('Failed to initialize database. Exiting...');
      app.quit();
      return;
    }

    createWindow();
    createMenu();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('App initialization failed:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (db) {
      db.close();
    }
    app.quit();
  }
});

app.on('before-quit', () => {
  if (db) {
    db.close();
  }
});

// Handle app protocol for deep linking (optional)
app.setAsDefaultProtocolClient('facility-manager');

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
  });
});

// Export database instance for IPC
module.exports = { db };