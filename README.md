# Rynix FM Management - Version 1.0

A comprehensive web-based facility management application built with React, Node.js, and SQLite.

## Version 1.0 Release Notes

**Release Date**: January 2025  
**Major Features**: Energy consumption monitoring, gas-heating correlation, chronological data sorting

### What's New in v1.0
- ✅ **Energy Consumption Dashboard** - Real-time monitoring with dual Y-axis charts
- ✅ **Gas-Heating Correlation** - Automatic heating calculation based on gas consumption (75% correlation)
- ✅ **Chronological Data Sorting** - Months displayed in proper order (Jan, Feb, Mar, Apr, May)
- ✅ **Optimized Electricity Calculation** - Accurate consumption tracking with meter exclusions
- ✅ **Performance Improvements** - Enhanced database queries and API responses
- ✅ **Professional UI** - Modern dashboard with real-time updates and alerts

## Features

### Core Modules
- **Dashboard** - Overview of all system modules with counts and recent activities
- **Facility Management** - Add and manage buildings, facilities, and their rooms
- **Maintenance Records** - Log and track maintenance requests per facility
- **Tasks / To-Do List** - Create and manage tasks linked to facilities or maintenance
- **Heating Management** - Monitor and manage heating systems per facility
- **Electric Meters** - Manage meters and readings linked to facilities

### Technical Features
- **Offline-first Architecture** - Works completely offline with local SQLite database
- **Cross-platform Desktop App** - Runs on Windows, macOS, and Linux
- **Modern UI** - React with Tailwind CSS and dark/light theme support
- **Real-time Data** - All modules communicate through single local database
- **Data Export/Import** - Backup and restore functionality
- **Responsive Design** - Works on different screen sizes

## Technology Stack

- **Frontend**: React 18, Tailwind CSS, React Router, Heroicons
- **Backend**: Node.js, Express, better-sqlite3
- **Web Application**: Modern web standards, responsive design
- **Database**: SQLite (local file-based)
- **Authentication**: bcrypt (local password hashing)
- **Testing**: Jest, React Testing Library, Supertest

## Project Structure

```
facility-manager/
├── backend/
│   ├── server.js              # Express server with API routes
│   ├── models/                # Database models (future)
│   └── routes/                # API route handlers (future)
├── frontend/
│   ├── public/
│   │   └── index.html         # HTML template
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   ├── contexts/          # React contexts (API, Theme)
│   │   ├── pages/             # Page components
│   │   ├── App.jsx            # Main React component
│   │   ├── index.js           # React entry point
│   │   └── index.css          # Tailwind CSS styles
│   ├── package.json           # Frontend dependencies
│   └── tailwind.config.js     # Tailwind configuration

├── database/
│   └── schema.sql             # Database schema
├── package.json               # Main package.json
├── .env                       # Environment variables
└── README.md                  # This file
```

## Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- Git

### Development Setup

1. **Clone and navigate to the project**:
   ```bash
   cd facility-management-app
   ```

2. **Install main dependencies**:
   ```bash
   npm install
   ```

3. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Start development servers**:
   ```bash
   # Start both backend and frontend
   npm start
   
   # Or start them separately:
   npm run backend    # Starts Node.js server on port 3001
   npm run frontend   # Starts React dev server on port 3000
   ```

5. **Access the web application**:

   Open your browser and navigate to `http://localhost:3000`

### Database Initialization

The SQLite database is automatically initialized on first run:
- Database file: `app.db` (created in project root)
- Schema: Defined in `database/schema.sql`
- No seed data - starts with empty tables

## Building for Production

### Build React Frontend
```bash
npm run build
```

### Create Desktop Installers
```bash
# Build for current platform
npm run dist

# Build for Windows
npm run dist:win

# Build for macOS
npm run dist:mac
```

Installers will be created in the `dist/` directory.

## API Endpoints

### Dashboard
- `GET /api/dashboard` - Get dashboard summary data

### Facilities
- `GET /api/facilities` - List all facilities
- `GET /api/facilities/:id` - Get facility details with related data
- `POST /api/facilities` - Create new facility
- `PUT /api/facilities/:id` - Update facility
- `DELETE /api/facilities/:id` - Delete facility

### Rooms
- `GET /api/facilities/:facilityId/rooms` - Get rooms for facility
- `POST /api/facilities/:facilityId/rooms` - Create room

### Maintenance
- `GET /api/maintenance` - List maintenance requests
- `POST /api/maintenance` - Create maintenance request
- `PUT /api/maintenance/:id` - Update maintenance request

### Tasks
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task

### Heating Systems
- `GET /api/heating` - List heating systems
- `POST /api/heating` - Create heating system
- `PUT /api/heating/:id` - Update heating system

### Electric Meters
- `GET /api/meters` - List electric meters
- `POST /api/meters` - Create electric meter
- `GET /api/meters/:meterId/readings` - Get meter readings
- `POST /api/meters/:meterId/readings` - Add meter reading

## Database Schema

The application uses SQLite with the following main tables:

- **facilities** - Main facility entities
- **rooms** - Rooms within facilities
- **maintenance_requests** - Maintenance tracking
- **tasks** - Task management
- **heating_systems** - Heating system monitoring
- **electric_meters** - Meter management
- **meter_readings** - Meter reading history
- **users** - Local user authentication

All tables include timestamps and proper foreign key relationships.

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run backend tests only
cd backend && npm test

# Run frontend tests only
cd frontend && npm test
```

## Usage Guide

### Getting Started
1. Launch the application
2. Start by creating your first facility
3. Add rooms, maintenance requests, and tasks as needed
4. Monitor heating systems and electric meters
5. Use the dashboard to get an overview of all activities

### Data Management
- All data is stored locally in SQLite database
- Use Settings > Data Management to export/import data
- Regular backups are recommended
- No internet connection required

### Themes
- Switch between light/dark themes in Settings
- System theme detection supported
- Theme preference is saved locally

## Development

### Adding New Features
1. Update database schema in `database/schema.sql`
2. Add API endpoints in `backend/server.js`
3. Create React components in `frontend/src/`
4. Update navigation in `frontend/src/components/Sidebar.jsx`
5. Add tests for new functionality

### Code Style
- ESLint configuration included
- Prettier for code formatting
- Follow React best practices
- Use TypeScript for type safety (future enhancement)

## Troubleshooting

### Common Issues

**Database not initializing**:
- Check if `database/schema.sql` exists
- Verify file permissions
- Delete `app.db` and restart to reinitialize

**Frontend not loading**:
- Ensure React dev server is running on port 3000
- Check browser console for errors
- Verify all dependencies are installed

**Web application not loading**:
- Check if both backend and frontend servers are running
- Verify browser console for errors
- Ensure you're accessing the correct URL (http://localhost:3000)

**Build failures**:
- Clear node_modules and reinstall dependencies
- Check Node.js version compatibility
- Verify all required build tools are installed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Search existing issues
3. Create a new issue with detailed information

---

**Facility Manager** - Professional facility management made simple and offline-first.