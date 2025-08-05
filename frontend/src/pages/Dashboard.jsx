import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  BoltIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  FireIcon,
  UserGroupIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { useApi } from '../contexts/ApiContext';
import { format } from 'date-fns';
import EnergyChart from '../components/EnergyChart';
import QuickActions from '../components/QuickActions';
import AlertsPanel from '../components/AlertsPanel';

const Dashboard = () => {
  const { getDashboardData, getMaintenance, getTasks, loading, error } = useApi();
  const [dashboardData, setDashboardData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alerts, setAlerts] = useState([]);
  const [chartFilter, setChartFilter] = useState('7d');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardData();
        setDashboardData(data);
        generateAlerts(data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
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

  // Generate alerts based on dashboard data
  const generateAlerts = (data) => {
    const newAlerts = [];
    
    if (data?.counts?.maintenance > 5) {
      newAlerts.push({
        id: 'high-maintenance',
        type: 'warning',
        title: 'High Maintenance Load',
        message: `You have ${data.counts.maintenance} active maintenance requests`,
        timestamp: new Date().toISOString()
      });
    }
    
    if (data?.counts?.tasks > 10) {
      newAlerts.push({
        id: 'many-tasks',
        type: 'info',
        title: 'Many Pending Tasks',
        message: `${data.counts.tasks} tasks are waiting to be completed`,
        timestamp: new Date().toISOString()
      });
    }
    
    if (data?.counts?.facilities === 0) {
      newAlerts.push({
        id: 'no-facilities',
        type: 'error',
        title: 'No Facilities',
        message: 'Add your first facility to get started',
        timestamp: new Date().toISOString()
      });
    }
    
    // Add default success alert if no issues
    if (newAlerts.length === 0) {
      newAlerts.push({
        id: 'system-ok',
        type: 'success',
        title: 'System Status',
        message: 'All systems operational. Database optimizations applied successfully.',
        timestamp: new Date().toISOString()
      });
    }
    
    setAlerts(newAlerts);
  };

  const handleReportGenerate = (period) => {
    console.log(`Report generated for period: ${period}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {format(currentTime, 'EEEE, MMMM d, yyyy • HH:mm:ss')}
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <QuickActions 
            dashboardData={dashboardData} 
            onReportGenerate={handleReportGenerate}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <BuildingOfficeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Facilities
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData?.counts?.facilities || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <WrenchScrewdriverIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Maintenance
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData?.counts?.maintenance || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tasks
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData?.counts?.tasks || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <BoltIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Meters
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData?.counts?.meters || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Energy Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <EnergyChart 
            chartFilter={chartFilter} 
            onFilterChange={setChartFilter} 
          />
        </div>

        {/* Alerts Panel - Takes 1 column */}
        <div className="lg:col-span-1">
          <AlertsPanel alerts={alerts} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <Link
              to="/maintenance"
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center"
            >
              View all
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {/* Sample recent activities */}
            <div className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <WrenchScrewdriverIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Maintenance request created
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  HVAC system check - Building A
                </p>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                2 hours ago
              </span>
            </div>
            
            <div className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Task completed
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Monthly meter reading - Floor 3
                </p>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                4 hours ago
              </span>
            </div>
            
            <div className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <BoltIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  New meter registered
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Electric meter EM-2024-001
                </p>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                1 day ago
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;