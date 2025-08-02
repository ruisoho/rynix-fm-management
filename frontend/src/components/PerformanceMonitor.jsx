import React, { useState, useEffect } from 'react';
import { useApi } from '../contexts/ApiContext';

const PerformanceMonitor = () => {
  const { loading, error } = useApi();
  const [performanceStats, setPerformanceStats] = useState(null);
  const [archiveStatus, setArchiveStatus] = useState(null);
  const [maintenanceStatus, setMaintenanceStatus] = useState(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isRunningMaintenance, setIsRunningMaintenance] = useState(false);
  const [monthsToKeep, setMonthsToKeep] = useState(12);

  // Fetch performance stats
  const fetchPerformanceStats = async () => {
    try {
      const response = await fetch('/api/performance/stats');
      if (response.ok) {
        const stats = await response.json();
        setPerformanceStats(stats);
      } else {
        console.error('Failed to fetch performance stats');
      }
    } catch (error) {
      console.error('Error fetching performance stats:', error);
    }
  };

  // Archive old readings
  const handleArchive = async () => {
    setIsArchiving(true);
    setArchiveStatus(null);
    
    try {
      const response = await fetch('/api/performance/archive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ monthsToKeep }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setArchiveStatus({
          type: 'success',
          message: `Successfully archived ${result.meterReadings} meter readings and ${result.heatingReadings} heating readings`,
        });
        // Refresh stats after archiving
        setTimeout(fetchPerformanceStats, 1000);
      } else {
        setArchiveStatus({
          type: 'error',
          message: result.error || 'Failed to archive readings',
        });
      }
    } catch (error) {
      setArchiveStatus({
        type: 'error',
        message: 'Network error during archiving',
      });
    } finally {
      setIsArchiving(false);
    }
  };

  // Run maintenance tasks
  const handleMaintenance = async () => {
    setIsRunningMaintenance(true);
    setMaintenanceStatus(null);
    
    try {
      const response = await fetch('/api/performance/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setMaintenanceStatus({
          type: 'success',
          message: 'Maintenance tasks completed successfully',
        });
        // Refresh stats after maintenance
        setTimeout(fetchPerformanceStats, 1000);
      } else {
        setMaintenanceStatus({
          type: 'error',
          message: result.error || 'Failed to run maintenance tasks',
        });
      }
    } catch (error) {
      setMaintenanceStatus({
        type: 'error',
        message: 'Network error during maintenance',
      });
    } finally {
      setIsRunningMaintenance(false);
    }
  };

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    fetchPerformanceStats();
    const interval = setInterval(fetchPerformanceStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ title, value, description, color = 'blue' }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-2 rounded-md bg-${color}-100 dark:bg-${color}-900`}>
          <div className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`}>
            {color === 'green' && (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            )}
            {color === 'blue' && (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {color === 'purple' && (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            )}
            {color === 'orange' && (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            )}
          </div>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  );

  const StatusAlert = ({ status, onClose }) => {
    if (!status) return null;
    
    const bgColor = status.type === 'success' ? 'bg-green-50 dark:bg-green-900' : 'bg-red-50 dark:bg-red-900';
    const textColor = status.type === 'success' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200';
    const iconColor = status.type === 'success' ? 'text-green-400' : 'text-red-400';
    
    return (
      <div className={`rounded-md p-4 mb-4 ${bgColor}`}>
        <div className="flex">
          <div className="flex-shrink-0">
            <div className={`w-5 h-5 ${iconColor}`}>
              {status.type === 'success' ? (
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
          <div className="ml-3">
            <p className={`text-sm font-medium ${textColor}`}>
              {status.message}
            </p>
          </div>
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={onClose}
                className={`inline-flex rounded-md p-1.5 ${textColor} hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2`}
              >
                <span className="sr-only">Dismiss</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              🚀 Performance Monitor
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Phase 1 Optimization: Database Performance & Caching
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Live Monitoring</span>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      {performanceStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Cache Hit Rate"
            value={performanceStats.cacheHitRate || '0%'}
            description="Query cache effectiveness"
            color="green"
          />
          <StatCard
            title="Avg Response Time"
            value={performanceStats.averageResponseTime || '0ms'}
            description="API response performance"
            color="blue"
          />
          <StatCard
            title="Total Queries"
            value={performanceStats.totalQueries || '0'}
            description="Last hour activity"
            color="purple"
          />
          <StatCard
            title="Cache Size"
            value={performanceStats.cacheSize || '0'}
            description="Cached query results"
            color="orange"
          />
        </div>
      )}

      {/* Maintenance Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Archiving */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            📦 Data Archiving System
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Archive old meter readings to improve query performance. Readings older than the specified months will be moved to archive tables.
          </p>
          
          <StatusAlert 
            status={archiveStatus} 
            onClose={() => setArchiveStatus(null)} 
          />
          
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Months to Keep
              </label>
              <input
                type="number"
                min="6"
                max="24"
                value={monthsToKeep}
                onChange={(e) => setMonthsToKeep(parseInt(e.target.value))}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleArchive}
              disabled={isArchiving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isArchiving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Archiving...
                </div>
              ) : (
                'Start Archive'
              )}
            </button>
          </div>
        </div>

        {/* Database Maintenance */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            🔧 Database Maintenance
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Run comprehensive maintenance tasks including VACUUM, ANALYZE, and cache cleanup to optimize database performance.
          </p>
          
          <StatusAlert 
            status={maintenanceStatus} 
            onClose={() => setMaintenanceStatus(null)} 
          />
          
          <button
            onClick={handleMaintenance}
            disabled={isRunningMaintenance}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunningMaintenance ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Running Maintenance...
              </div>
            ) : (
              'Run Maintenance Tasks'
            )}
          </button>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          📊 Performance Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">50-70%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Target Response Time Reduction</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">2min</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Energy Data Cache TTL</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">12mo</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Default Archive Threshold</div>
          </div>
        </div>
      </div>

      {/* Optimization Status */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900 dark:to-green-900 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 text-green-500">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Phase 1 Optimizations Active
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              ✅ Database indexes optimized • ✅ Query result caching enabled • ✅ Performance monitoring active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;