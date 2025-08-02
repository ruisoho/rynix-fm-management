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
  console.log('Creating BrowserWindow...');
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: false,
      webSecurity: false,
      allowRunningInsecureContent: true,
      experimentalFeatures: true
    },
    show: true,
    titleBarStyle: 'default',
    center: true
  });
  console.log('BrowserWindow created successfully.');

  // Add comprehensive event logging
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.log('Content failed to load:', errorDescription, 'URL:', validatedURL);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Content loaded successfully');
  });

  mainWindow.webContents.on('dom-ready', () => {
    console.log('DOM is ready');
  });

  mainWindow.webContents.on('did-start-loading', () => {
    console.log('Started loading content');
  });

  mainWindow.webContents.on('did-stop-loading', () => {
    console.log('Stopped loading content');
  });

  mainWindow.on('show', () => {
    console.log('Window is now visible');
  });

  mainWindow.on('focus', () => {
    console.log('Window gained focus');
  });

  // Log console messages from the renderer process
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`Renderer Console [${level}]:`, message);
    if (line) console.log(`  at line ${line} in ${sourceId}`);
  });

  // Add crash and unresponsive handlers
  mainWindow.webContents.on('crashed', (event, killed) => {
    console.log('Renderer process crashed:', killed);
  });

  mainWindow.on('unresponsive', () => {
    console.log('Window became unresponsive');
  });

  mainWindow.on('responsive', () => {
    console.log('Window became responsive again');
  });

  // Ensure window is visible
  console.log('Showing window immediately');
  mainWindow.show();
  
  // Load the app
  if (isDev) {
    console.log('Development mode: Loading React dev server');
    
    mainWindow.loadURL('http://localhost:3000').then(() => {
      console.log('React dev server loaded successfully!');
    }).catch((error) => {
      console.error('Failed to load React dev server:', error);
    });
    
    // Open dev tools to see console
    mainWindow.webContents.openDevTools();
  } else {
    console.log('Production mode: Loading from file');
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    console.log('Window ready to show, displaying...');
    mainWindow.show();
  });

  // Force show window after timeout if ready-to-show doesn't fire
  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      console.log('Forcing window to show after timeout');
      mainWindow.show();
    }
  }, 10000);

  // Temporarily disabled force reload to debug loading issues
  // setTimeout(() => {
  //   if (mainWindow) {
  //     console.log('Forcing content reload after timeout');
  //     mainWindow.reload();
  //   }
  // }, 15000);

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
    console.log('App is ready, initializing...');
    // Initialize database first
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      console.error('Failed to initialize database. Exiting...');
      app.quit();
      return;
    }

    console.log('Creating window...');
    createWindow();
    console.log('Creating menu...');
    createMenu();
    console.log('App initialization complete.');

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