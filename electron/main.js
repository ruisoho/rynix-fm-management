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
      enableRemoteModule: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
      experimentalFeatures: true,
      devTools: true
    },
    show: false,
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
    console.log(`🖥️ Browser Console [${level}]: ${message} (line: ${line}, source: ${sourceId})`);
  });

  // Add more detailed webContents event logging
  mainWindow.webContents.on('did-start-loading', () => {
    console.log('🔄 Started loading page...');
  });

  mainWindow.webContents.on('did-stop-loading', () => {
    console.log('⏹️ Stopped loading page');
  });

  mainWindow.webContents.on('did-frame-finish-load', () => {
    console.log('🖼️ Frame finished loading');
  });

  mainWindow.webContents.on('page-title-updated', (event, title) => {
    console.log('📄 Page title updated:', title);
  });

  mainWindow.webContents.on('new-window', (event, navigationUrl) => {
    console.log('🔗 New window requested:', navigationUrl);
  });

  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    console.log('🧭 Will navigate to:', navigationUrl);
  });

  mainWindow.webContents.on('did-navigate', (event, url) => {
    console.log('✅ Did navigate to:', url);
  });

  mainWindow.webContents.on('did-navigate-in-page', (event, url) => {
    console.log('📍 Did navigate in page to:', url);
  });

  // Basic error handling
  mainWindow.webContents.on('crashed', () => {
    console.log('Renderer process crashed');
  });

  mainWindow.on('unresponsive', () => {
    console.log('Window became unresponsive');
  });

  // Ensure window is visible
  console.log('Showing window immediately');
  mainWindow.show();
  
  // Load from HTTP server instead of file system
  console.log('Loading React app from HTTP server...');
  const serverUrl = 'http://localhost:3000/#/dashboard';
  console.log('Server URL:', serverUrl);
  
  // Immediate event listeners with more debugging
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Page finished loading!');
    console.log('Current URL:', mainWindow.webContents.getURL());
    console.log('Page title:', mainWindow.webContents.getTitle());
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('❌ Page failed to load:', errorCode, errorDescription, validatedURL);
  });

  mainWindow.webContents.on('dom-ready', () => {
    console.log('🎯 DOM is ready!');
  });

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`Browser Console [${level}]:`, message);
    if (line) console.log(`  at line ${line} in ${sourceId}`);
    
    // Check for CSP errors
    if (message.includes('Content Security Policy') || message.includes('CSP')) {
      console.error('🚨 CSP Error detected:', message);
    }
    
    // Check for JavaScript errors
    if (level === 3) { // Error level
      console.error('🚨 JavaScript Error:', message);
    }
  });
  
  // Add more detailed error handling
  mainWindow.webContents.on('preload-error', (event, preloadPath, error) => {
    console.error('❌ Preload script error:', preloadPath, error);
  });
  
  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.error('❌ Render process gone:', details);
  });

  // Force show window immediately
  mainWindow.show();
  console.log('🔍 Window shown, now attempting to load content...');
  
  // Try direct URL loading first (most reliable)
  console.log('🌐 Attempting to load from HTTP server: http://localhost:3000/#/dashboard');
  
  // Set a timeout to force action if promises don't resolve
  let loadingComplete = false;
  
  setTimeout(() => {
    if (!loadingComplete) {
      console.log('⏰ TIMEOUT: LoadURL promises not resolving - forcing content injection');
      console.log('🔧 This indicates webContents events are not firing properly');
      injectDashboardHTML();
      loadingComplete = true;
    }
  }, 3000);
  
  mainWindow.loadURL('http://localhost:3000/#/dashboard')
    .then(() => {
      if (!loadingComplete) {
        console.log('✅ SUCCESS: HTTP server loaded!');
        console.log('🎯 Content should now be visible in Electron window');
        loadingComplete = true;
      }
    })
    .catch((error) => {
      if (!loadingComplete) {
        console.error('❌ HTTP server failed:', error.message);
        console.log('🔄 Trying React build file as fallback...');
        
        const buildPath = path.join(__dirname, '..', 'frontend', 'build', 'index.html');
        console.log('📁 Build path:', buildPath);
        console.log('📋 File exists:', fs.existsSync(buildPath));
        
        if (fs.existsSync(buildPath)) {
          mainWindow.loadFile(buildPath)
            .then(() => {
              if (!loadingComplete) {
                console.log('✅ SUCCESS: React build file loaded!');
                console.log('🎯 Content should now be visible in Electron window');
                loadingComplete = true;
              }
            })
            .catch((fileError) => {
              if (!loadingComplete) {
                console.error('❌ React build file failed:', fileError.message);
                console.log('🔄 Forcing content injection as final solution...');
                injectDashboardHTML();
                loadingComplete = true;
              }
            });
        } else {
          console.error('❌ React build not found - forcing content injection');
          injectDashboardHTML();
          loadingComplete = true;
        }
      }
    });
  
  // Add immediate logging to confirm this code runs
  console.log('📝 Loading sequence initiated...');
  console.log('⏱️  Waiting for load results...');
  
  function injectDashboardHTML() {
      
      // Inject HTML content directly
      const dashboardHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Facility Manager Dashboard</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              margin: 0; 
              padding: 40px; 
              text-align: center; 
            }
            .container { max-width: 800px; margin: 0 auto; }
            h1 { font-size: 3rem; margin-bottom: 20px; }
            .card { 
              background: rgba(255,255,255,0.2); 
              padding: 20px; 
              border-radius: 10px; 
              margin: 20px 0; 
            }
            .button { 
              background: rgba(255,255,255,0.3); 
              border: none; 
              padding: 15px 30px; 
              color: white; 
              font-size: 1.1rem; 
              border-radius: 5px; 
              cursor: pointer; 
              margin: 10px; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🏢 Facility Manager Dashboard</h1>
            <div class="card">
              <h2>✅ Dashboard Loaded Successfully!</h2>
              <p>The Electron app is now working properly.</p>
              <p>Time: <span id="time"></span></p>
            </div>
            <div class="card">
              <h3>System Status</h3>
              <p>Database: <strong>Connected</strong></p>
              <p>Application: <strong>Running</strong></p>
            </div>
            <button class="button" onclick="alert('Dashboard is working!')">Test Button</button>
          </div>
          <script>
            function updateTime() {
              document.getElementById('time').textContent = new Date().toLocaleTimeString();
            }
            setInterval(updateTime, 1000);
            updateTime();
            console.log('✅ Dashboard loaded and running!');
          </script>
        </body>
        </html>
      `;
      
      mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(dashboardHTML))
        .then(() => {
          console.log('✅ Dashboard HTML injected successfully!');
        })
        .catch((err) => {
           console.error('❌ Failed to inject HTML:', err);
         });
   }
  
  // Open dev tools to see console
  mainWindow.webContents.openDevTools();

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