import React, { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import {
  ClockIcon,
  ExclamationTriangleIcon,
  CogIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  BoltIcon,
  PlusIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useApi } from '../contexts/ApiContext';
import { format } from 'date-fns';

// Import extracted components
import DashboardStats from '../components/dashboard/DashboardStats';
import DashboardAlerts from '../components/dashboard/DashboardAlerts';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import DashboardRecentActivity from '../components/dashboard/DashboardRecentActivity';
import ErrorBoundary, { SectionErrorBoundary } from '../components/common/ErrorBoundary';

const Dashboard = () => {
  const { getDashboardData, getMaintenance, getTasks } = useApi();
  const [dashboardData, setDashboardData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getDashboardData();
        setDashboardData(data);
        generateAlerts(data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getDashboardData]);

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Close quick actions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showQuickActions && !event.target.closest('.quick-actions-container')) {
        setShowQuickActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showQuickActions]);

  // Generate alerts based on dashboard data
  const generateAlerts = (data) => {
    const newAlerts = [];
    
    if (data?.counts?.maintenance > 5) {
      newAlerts.push({
        id: 'high-maintenance',
        type: 'warning',
        title: 'High Maintenance Load',
        message: `You have ${data.counts.maintenance} active maintenance requests`,
        icon: ExclamationTriangleIcon
      });
    }
    
    if (data?.counts?.tasks > 10) {
      newAlerts.push({
        id: 'many-tasks',
        type: 'info',
        title: 'Many Pending Tasks',
        message: `${data.counts.tasks} tasks are waiting to be completed`,
        icon: ClockIcon
      });
    }
    
    if (data?.counts?.facilities === 0) {
      newAlerts.push({
        id: 'no-facilities',
        type: 'error',
        title: 'No Facilities',
        message: 'Add your first facility to get started',
        icon: BuildingOfficeIcon
      });
    }
    
    setAlerts(newAlerts);
  };



  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card">
              <div className="card-body">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Failed to load dashboard
        </h3>
        <p className="text-gray-500 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  // Quick actions data
  const quickActions = [
    {
      name: 'Add Facility',
      description: 'Create a new facility',
      icon: BuildingOfficeIcon,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-800/30',
      link: '/facilities?action=create'
    },
    {
      name: 'New Maintenance',
      description: 'Report maintenance issue',
      icon: WrenchScrewdriverIcon,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-800/30',
      link: '/maintenance?action=create'
    },
    {
      name: 'Create Task',
      description: 'Add a new task',
      icon: CheckCircleIcon,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-800/30',
      link: '/tasks?action=create'
    },
    {
      name: 'Add Meter',
      description: 'Register new meter',
      icon: BoltIcon,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-800/30',
      link: '/meters?action=create'
    }
  ];

  // Function to dismiss alerts
  const dismissAlert = (alertId) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Dashboard
              </h1>
              <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                Overview of your facility management system
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="text-right">
                <div className="text-2xl font-mono font-bold text-gray-900 dark:text-gray-100">
                  {format(currentTime, 'HH:mm:ss')}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {format(currentTime, 'EEEE, MMM dd, yyyy')}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 flex gap-3">
          <div className="relative quick-actions-container">
             <button
               onClick={() => setShowQuickActions(!showQuickActions)}
               className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
             >
               <PlusIcon className="h-5 w-5 mr-2" />
               Quick Actions
             </button>
             
             {/* Quick Actions Dropdown */}
             {showQuickActions && (
               <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Quick Actions</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Create new items quickly</p>
                </div>
                <div className="p-2">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Link
                        key={action.name}
                        to={action.link}
                        onClick={() => setShowQuickActions(false)}
                        className="flex items-center p-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-200 group border border-transparent hover:border-blue-200 dark:hover:border-blue-500/30"
                      >
                        <div className={`p-2.5 rounded-xl ${action.bgColor} mr-4 group-hover:scale-110 transition-transform duration-200 shadow-sm`}>
                          <Icon className={`h-5 w-5 ${action.color}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-200 transition-colors">
                            {action.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors">
                            {action.description}
                          </p>
                        </div>
                        <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-200" />
                      </Link>
                    );
                  })}
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">More options available in each section</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Error Boundary for Dashboard Content */}
      <ErrorBoundary title="Dashboard Error" message="There was an error loading the dashboard. Please refresh the page.">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="spinner"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading dashboard...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {!loading && !error && (
          <>
            {/* Alerts Section */}
            <SectionErrorBoundary section="Alerts">
              <DashboardAlerts alerts={alerts} onDismissAlert={dismissAlert} />
            </SectionErrorBoundary>

            {/* Statistics Cards */}
            <SectionErrorBoundary section="Statistics">
              <DashboardStats dashboardData={dashboardData} />
            </SectionErrorBoundary>

            {/* Energy Charts */}
            <SectionErrorBoundary section="Energy Charts">
              <DashboardCharts />
            </SectionErrorBoundary>

            {/* Recent Activity */}
            <SectionErrorBoundary section="Recent Activity">
              <DashboardRecentActivity dashboardData={dashboardData} />
            </SectionErrorBoundary>
          </>
        )}
      </ErrorBoundary>
    </div>
  );
};

export default memo(Dashboard);