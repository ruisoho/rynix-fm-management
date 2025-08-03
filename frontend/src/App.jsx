import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DemoBanner from './components/DemoBanner';
import Dashboard from './pages/Dashboard';
import Facilities from './pages/Facilities';
import FacilityDetail from './pages/FacilityDetail';
import Maintenance from './pages/Maintenance';
import Tasks from './pages/Tasks';
import Apartments from './pages/Apartments';
import ChartsReports from './pages/ChartsReports';
import Meters from './pages/Meters';
import Settings from './pages/Settings';
import { ThemeProvider } from './contexts/ThemeContext';
import { ApiProvider } from './contexts/ApiContext';
import './index.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check API health on app start
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        console.log('Checking API health...');
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/health`);
        console.log('API health response:', response.status, response.ok);
        if (!response.ok) {
          throw new Error('API not available');
        }
        console.log('API health check passed');
        setIsLoading(false);
      } catch (err) {
        console.error('API health check failed:', err);
        setError('Unable to connect to the application backend. Please ensure the server is running.');
        setIsLoading(false);
      }
    };

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('API health check timeout - proceeding anyway');
      setIsLoading(false);
    }, 10000);

    checkApiHealth();
    
    return () => clearTimeout(timeout);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Facility Manager...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Connection Error
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <ApiProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-300">
            <DemoBanner />
            <div className="flex">
              {/* Mobile sidebar overlay */}
              {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                  <div 
                    className="fixed inset-0 bg-gray-600 bg-opacity-75" 
                    onClick={() => setSidebarOpen(false)}
                  />
                </div>
              )}

              {/* Sidebar */}
              <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-light-card dark:bg-dark-card border-r border-light-border dark:border-dark-border shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-y-0 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`}>
                <div className="flex items-center justify-between h-16 px-4 border-b border-light-border dark:border-dark-border lg:hidden">
                  <h1 className="text-lg font-semibold text-light-text dark:text-dark-text">
                    Facility Manager
                  </h1>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-md text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <Sidebar onNavigate={() => setSidebarOpen(false)} />
              </div>

              {/* Main content */}
              <div className="flex-1">
                {/* Header positioned to the right of sidebar on desktop */}
                <Header 
                  onMenuClick={() => setSidebarOpen(true)}
                  showMenuButton={true}
                />
                
                {/* Page content */}
                <main className="py-2 px-4 sm:px-6 lg:px-8">
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/facilities" element={<Facilities />} />
                    <Route path="/facilities/:id" element={<FacilityDetail />} />
                    <Route path="/maintenance" element={<Maintenance />} />
                    <Route path="/tasks" element={<Tasks />} />
                    <Route path="/apartments" element={<Apartments />} />
                    <Route path="/charts-reports" element={<ChartsReports />} />
                    <Route path="/meters" element={<Meters />} />
                    {/* Backward compatibility routes */}
                    <Route path="/heating" element={<Navigate to="/meters" replace />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={
                      <div className="text-center py-12">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                          Page Not Found
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          The page you're looking for doesn't exist.
                        </p>
                        <button
                          onClick={() => window.history.back()}
                          className="btn btn-primary"
                        >
                          Go Back
                        </button>
                      </div>
                    } />
                    </Routes>
                </main>
              </div>
            </div>
          </div>
        </Router>
      </ApiProvider>
    </ThemeProvider>
  );
}

export default App;