import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  BoltIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  XMarkIcon,
  CalendarDaysIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  FireIcon,
  LightBulbIcon,
  CogIcon,
  UserGroupIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { useApi } from '../contexts/ApiContext';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  const { getDashboardData, getMaintenance, getTasks, getEnergyConsumption, loading, error } = useApi();
  const [dashboardData, setDashboardData] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPeriod, setReportPeriod] = useState('monthly');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [chartFilter, setChartFilter] = useState('daily');
  const [selectedChart, setSelectedChart] = useState('energy');
  const [energyData, setEnergyData] = useState([]);
  const [energyLoading, setEnergyLoading] = useState(false);

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
    fetchEnergyData(chartFilter);
  }, [getDashboardData]);

  // Effect to fetch energy data when chart filter changes
  useEffect(() => {
    fetchEnergyData(chartFilter);
  }, [chartFilter]);

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

  const generateReport = async () => {
    setGeneratingReport(true);
    try {
      // Fetch actual maintenance and tasks data
      const [maintenanceData, tasksData] = await Promise.all([
        getMaintenance(),
        getTasks()
      ]);
      
      // Calculate date range based on selected period
      const now = new Date();
      let startDate;
      switch (reportPeriod) {
        case 'daily':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'weekly':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'yearly':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      
      // Filter maintenance and tasks by date range
      const filteredMaintenance = (maintenanceData || []).filter(item => {
        try {
          const itemDate = new Date(item.created_at);
          return itemDate >= startDate;
        } catch {
          return false;
        }
      });
      
      const filteredTasks = (tasksData || []).filter(item => {
        try {
          const itemDate = new Date(item.created_at);
          return itemDate >= startDate;
        } catch {
          return false;
        }
      });
      
      // Create a comprehensive report
      const reportData = {
        period: reportPeriod,
        generatedAt: new Date().toISOString(),
        dateRange: { start: startDate, end: now },
        facilities: dashboardData?.facilities || [],
        maintenance: filteredMaintenance,
        tasks: filteredTasks,
        energy: dashboardData?.energy || [],
        summary: {
          totalFacilities: dashboardData?.stats?.facilities || 0,
          totalMaintenance: filteredMaintenance.length,
          totalTasks: filteredTasks.length,
          totalMeters: dashboardData?.stats?.meters || 0
        }
      };
      
      // Create PDF report
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = 30;
      
      // Title
      pdf.setFontSize(20);
      pdf.setFont(undefined, 'bold');
      pdf.text('FACILITY MANAGEMENT REPORT', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;
      
      // Report details
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Generated: ${format(new Date(), 'PPP')}`, margin, yPosition);
      yPosition += 10;
      pdf.text(`Period: ${reportPeriod.toUpperCase()}`, margin, yPosition);
      yPosition += 20;
      
      // Date range
       pdf.setFontSize(12);
       pdf.setFont(undefined, 'normal');
       pdf.text(`Date Range: ${format(reportData.dateRange.start, 'MMM dd, yyyy')} - ${format(reportData.dateRange.end, 'MMM dd, yyyy')}`, margin, yPosition);
       yPosition += 20;
       
       // Summary section
       pdf.setFontSize(16);
       pdf.setFont(undefined, 'bold');
       pdf.text('SUMMARY', margin, yPosition);
       yPosition += 15;
       
       pdf.setFontSize(12);
       pdf.setFont(undefined, 'normal');
       const summaryItems = [
         `Total Facilities: ${reportData.summary.totalFacilities}`,
         `Maintenance Requests (${reportPeriod}): ${reportData.summary.totalMaintenance}`,
         `Tasks (${reportPeriod}): ${reportData.summary.totalTasks}`,
         `Total Electric Meters: ${reportData.summary.totalMeters}`
       ];
       
       summaryItems.forEach(item => {
         pdf.text(`• ${item}`, margin + 10, yPosition);
         yPosition += 10;
       });
       
       yPosition += 20;
      
      // Description
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('REPORT DESCRIPTION', margin, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      const description = `This is a comprehensive ${reportPeriod} report containing detailed data about facilities, maintenance operations, energy usage, heating systems, and gas consumption. The report provides insights into the overall performance and status of all managed facilities.`;
      
      const splitDescription = pdf.splitTextToSize(description, pageWidth - 2 * margin);
      pdf.text(splitDescription, margin, yPosition);
      yPosition += splitDescription.length * 6 + 20;
      
      // Maintenance Requests Section
       if (yPosition > 220) {
         pdf.addPage();
         yPosition = 30;
       }
       
       pdf.setFontSize(16);
       pdf.setFont(undefined, 'bold');
       pdf.text(`MAINTENANCE REQUESTS (${reportData.maintenance.length})`, margin, yPosition);
       yPosition += 15;
       
       if (reportData.maintenance.length > 0) {
         pdf.setFontSize(12);
         pdf.setFont(undefined, 'normal');
         
         reportData.maintenance.slice(0, 10).forEach((maintenance, index) => {
           if (yPosition > 250) {
             pdf.addPage();
             yPosition = 30;
           }
           
           const createdDate = format(new Date(maintenance.created_at), 'MMM dd, yyyy');
           pdf.text(`${index + 1}. ${maintenance.facility_name || 'Unknown Facility'}`, margin, yPosition);
           yPosition += 8;
           pdf.text(`   Status: ${maintenance.status.toUpperCase()} | Priority: ${maintenance.priority.toUpperCase()}`, margin + 10, yPosition);
           yPosition += 8;
           pdf.text(`   Created: ${createdDate}`, margin + 10, yPosition);
           yPosition += 8;
           
           const description = maintenance.description || 'No description';
           const splitDesc = pdf.splitTextToSize(`   Description: ${description}`, pageWidth - margin - 20);
           pdf.text(splitDesc, margin + 10, yPosition);
           yPosition += splitDesc.length * 6 + 8;
         });
         
         if (reportData.maintenance.length > 10) {
           pdf.text(`... and ${reportData.maintenance.length - 10} more maintenance requests`, margin, yPosition);
           yPosition += 10;
         }
       } else {
         pdf.setFontSize(12);
         pdf.setFont(undefined, 'italic');
         pdf.text('No maintenance requests found for this period.', margin, yPosition);
         yPosition += 10;
       }
       
       yPosition += 15;
       
       // Tasks Section
       if (yPosition > 220) {
         pdf.addPage();
         yPosition = 30;
       }
       
       pdf.setFontSize(16);
       pdf.setFont(undefined, 'bold');
       pdf.text(`TASKS (${reportData.tasks.length})`, margin, yPosition);
       yPosition += 15;
       
       if (reportData.tasks.length > 0) {
         pdf.setFontSize(12);
         pdf.setFont(undefined, 'normal');
         
         reportData.tasks.slice(0, 10).forEach((task, index) => {
           if (yPosition > 250) {
             pdf.addPage();
             yPosition = 30;
           }
           
           const createdDate = format(new Date(task.created_at), 'MMM dd, yyyy');
           const dueDate = task.due_date ? format(new Date(task.due_date), 'MMM dd, yyyy') : 'No due date';
           
           pdf.text(`${index + 1}. ${task.title}`, margin, yPosition);
           yPosition += 8;
           pdf.text(`   Status: ${task.status.toUpperCase()} | Priority: ${task.priority.toUpperCase()}`, margin + 10, yPosition);
           yPosition += 8;
           pdf.text(`   Created: ${createdDate} | Due: ${dueDate}`, margin + 10, yPosition);
           yPosition += 8;
           
           if (task.assigned_to) {
             pdf.text(`   Assigned to: ${task.assigned_to}`, margin + 10, yPosition);
             yPosition += 8;
           }
           
           if (task.facility_name) {
             pdf.text(`   Facility: ${task.facility_name}`, margin + 10, yPosition);
             yPosition += 8;
           }
           
           if (task.description) {
             const splitDesc = pdf.splitTextToSize(`   Description: ${task.description}`, pageWidth - margin - 20);
             pdf.text(splitDesc, margin + 10, yPosition);
             yPosition += splitDesc.length * 6 + 8;
           }
           
           yPosition += 5;
         });
         
         if (reportData.tasks.length > 10) {
           pdf.text(`... and ${reportData.tasks.length - 10} more tasks`, margin, yPosition);
           yPosition += 10;
         }
       } else {
         pdf.setFontSize(12);
         pdf.setFont(undefined, 'italic');
         pdf.text('No tasks found for this period.', margin, yPosition);
         yPosition += 10;
       }
       
       yPosition += 15;
       
       // Additional Analysis Section
       if (yPosition > 220) {
         pdf.addPage();
         yPosition = 30;
       }
       
       pdf.setFontSize(16);
       pdf.setFont(undefined, 'bold');
       pdf.text('ANALYSIS & INSIGHTS', margin, yPosition);
       yPosition += 15;
       
       pdf.setFontSize(12);
       pdf.setFont(undefined, 'normal');
       
       // Maintenance status breakdown
       const maintenanceByStatus = reportData.maintenance.reduce((acc, item) => {
         acc[item.status] = (acc[item.status] || 0) + 1;
         return acc;
       }, {});
       
       pdf.text('Maintenance Requests by Status:', margin, yPosition);
       yPosition += 10;
       Object.entries(maintenanceByStatus).forEach(([status, count]) => {
         pdf.text(`• ${status.toUpperCase()}: ${count}`, margin + 10, yPosition);
         yPosition += 8;
       });
       
       yPosition += 10;
       
       // Tasks status breakdown
       const tasksByStatus = reportData.tasks.reduce((acc, item) => {
         acc[item.status] = (acc[item.status] || 0) + 1;
         return acc;
       }, {});
       
       pdf.text('Tasks by Status:', margin, yPosition);
       yPosition += 10;
       Object.entries(tasksByStatus).forEach(([status, count]) => {
         pdf.text(`• ${status.toUpperCase()}: ${count}`, margin + 10, yPosition);
         yPosition += 8;
       });
       
       yPosition += 15;
       
       // Performance insights
       const performanceInsights = [
         `Total items processed: ${reportData.maintenance.length + reportData.tasks.length}`,
         `Average maintenance priority: ${reportData.maintenance.length > 0 ? 'Mixed priorities' : 'N/A'}`,
         `Task completion tracking: ${reportData.tasks.filter(t => t.status === 'completed').length} completed tasks`,
         'Facility management efficiency metrics included'
       ];
       
       pdf.text('Performance Insights:', margin, yPosition);
       yPosition += 10;
       performanceInsights.forEach(insight => {
         pdf.text(`• ${insight}`, margin + 10, yPosition);
         yPosition += 8;
       });
      
      // Footer
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        pdf.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pdf.internal.pageSize.getHeight() - 10, { align: 'right' });
        pdf.text('Facility Management System', margin, pdf.internal.pageSize.getHeight() - 10);
      }
      
      // Download the PDF
      pdf.save(`facility-report-${reportPeriod}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      
      setShowReportModal(false);
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setGeneratingReport(false);
    }
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

  // Helper function to get alert styling
  const getAlertStyling = (type) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  // Function to fetch energy consumption data
  const fetchEnergyData = async (period) => {
    setEnergyLoading(true);
    try {
      const data = await getEnergyConsumption(period);
      console.log('Energy data received from API:', data);
      setEnergyData(data || []);
    } catch (error) {
      console.error('Error fetching energy data:', error);
      // Fallback to sample data if API fails completely
      const baseData = {
        daily: [
          { name: 'Mon', electricity: 120, gas: 80, heating: 0.06 },
          { name: 'Tue', electricity: 135, gas: 85, heating: 0.065 },
          { name: 'Wed', electricity: 128, gas: 78, heating: 0.058 },
          { name: 'Thu', electricity: 142, gas: 92, heating: 0.072 },
          { name: 'Fri', electricity: 155, gas: 88, heating: 0.068 },
          { name: 'Sat', electricity: 98, gas: 65, heating: 0.045 },
          { name: 'Sun', electricity: 89, gas: 58, heating: 0.042 }
        ],
        monthly: [
          { name: 'Jan', electricity: 45000, gas: 50000, heating: 0 },
          { name: 'Feb', electricity: 42000, gas: 48000, heating: 0 },
          { name: 'Mar', electricity: 46000, gas: 49000, heating: 0 },
          { name: 'Apr', electricity: 40000, gas: 42000, heating: 0 },
          { name: 'May', electricity: 38000, gas: 40000, heating: 0 }
        ]
      };
      setEnergyData(baseData[period] || baseData.daily);
    } finally {
      setEnergyLoading(false);
    }
  };

  // Helper function to get energy data
  const getEnergyData = () => {
    return energyData;
  };

  // Get chart configuration based on selected chart type
  const getChartConfig = () => {
    const configs = {
      energy: {
        title: 'Energy Consumption Overview',
        data: energyData,
        lines: [
          { key: 'electricity', color: '#3B82F6', name: 'Electricity (kWh)' },
          { key: 'gas', color: '#F59E0B', name: 'Gas (m³)' },
          { key: 'heating', color: '#EF4444', name: 'Heating (kWh)' }
        ]
      },
      electricity: {
        title: 'Electricity Usage',
        data: energyData,
        lines: [{ key: 'electricity', color: '#3B82F6', name: 'Electricity (kWh)' }]
      },
      gas: {
        title: 'Gas Consumption',
        data: energyData,
        lines: [{ key: 'gas', color: '#F59E0B', name: 'Gas (m³)' }]
      },
      heating: {
          title: 'Heating Usage',
          data: energyData,
          lines: [{ key: 'heating', color: '#EF4444', name: 'Heating (kWh)' }]
        }
    };
    return configs[selectedChart] || configs.energy;
  };

  const stats = [
    {
      name: 'Total Facilities',
      value: dashboardData?.counts?.facilities || 0,
      icon: BuildingOfficeIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      link: '/facilities',
      trend: '+2.5%',
      trendDirection: 'up',
      description: 'Managed properties'
    },
    {
      name: 'Active Maintenance',
      value: dashboardData?.counts?.maintenance || 0,
      icon: WrenchScrewdriverIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900',
      link: '/maintenance',
      trend: '-12%',
      trendDirection: 'down',
      description: 'Pending requests'
    },
    {
      name: 'Pending Tasks',
      value: dashboardData?.counts?.tasks || 0,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
      link: '/tasks',
      trend: '+8.1%',
      trendDirection: 'up',
      description: 'To be completed'
    },
    {
      name: 'Electric Meters',
      value: dashboardData?.counts?.meters || 0,
      icon: BoltIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
      link: '/meters',
      trend: '+5.2%',
      trendDirection: 'up',
      description: 'Monitoring devices'
    }
  ];

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      in_progress: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      completed: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      todo: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };
    return statusClasses[status] || 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
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
          <button
            onClick={() => setShowReportModal(true)}
            className="btn btn-primary inline-flex items-center px-4 py-2"
          >
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const Icon = alert.icon;
            return (
              <div
                key={alert.id}
                className={`rounded-lg border p-4 ${getAlertStyling(alert.type)}`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium">
                      {alert.title}
                    </h3>
                    <p className="mt-1 text-sm opacity-90">
                      {alert.message}
                    </p>
                  </div>
                  <button
                    onClick={() => setAlerts(alerts.filter(a => a.id !== alert.id))}
                    className="flex-shrink-0 ml-4 text-current opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trendDirection === 'up' ? ArrowUpIcon : ArrowDownIcon;
          const trendColor = stat.trendDirection === 'up' ? 'text-green-600' : 'text-red-600';
          
          return (
            <Link
              key={stat.name}
              to={stat.link}
              className="card hover:shadow-medium transition-all duration-200 transform hover:-translate-y-1 group"
            >
              <div className="card-body p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-7 w-7 ${stat.color}`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        {stat.name}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {stat.description}
                  </p>
                  <div className={`flex items-center text-xs font-medium ${trendColor}`}>
                    <TrendIcon className="h-3 w-3 mr-1" />
                    {stat.trend}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent maintenance requests */}
        <div className="card h-fit">
          <div className="card-header px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Recent Maintenance
              </h3>
              <Link
                to="/maintenance"
                className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                View all →
              </Link>
            </div>
          </div>
          <div className="card-body px-6 py-4">
            {dashboardData?.recent?.maintenance?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recent.maintenance.map((item) => (
                  <div key={item.id} className="flex items-start justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate mb-1">
                        {item.facility_name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-2">
                        {item.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {formatDate(item.created_at)}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={getStatusBadge(item.status)}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state py-8">
                <WrenchScrewdriverIcon className="empty-state-icon" />
                <h3 className="empty-state-title">No maintenance requests</h3>
                <p className="empty-state-description">
                  Create your first maintenance request to get started.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent tasks */}
        <div className="card h-fit">
          <div className="card-header px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Recent Tasks
              </h3>
              <Link
                to="/tasks"
                className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                View all →
              </Link>
            </div>
          </div>
          <div className="card-body px-6 py-4">
            {dashboardData?.recent?.tasks?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recent.tasks.map((item) => (
                  <div key={item.id} className="flex items-start justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate mb-1">
                        {item.title}
                      </p>
                      {item.facility_name && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-2">
                          {item.facility_name}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {formatDate(item.created_at)}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={getStatusBadge(item.status)}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state py-8">
                <CheckCircleIcon className="empty-state-icon" />
                <h3 className="empty-state-title">No tasks</h3>
                <p className="empty-state-description">
                  Create your first task to get started.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Energy Consumption Charts */}
      <div className="card">
        <div className="card-header px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {getChartConfig().title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Monitor energy consumption across all facilities
              </p>
            </div>
            
            {/* Chart Type Selector */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'energy', label: 'All', icon: ChartBarIcon },
                { key: 'electricity', label: 'Electricity', icon: BoltIcon },
                { key: 'gas', label: 'Gas', icon: FireIcon },
                { key: 'heating', label: 'Heating', icon: FireIcon }
              ].map((chart) => {
                const Icon = chart.icon;
                return (
                  <button
                    key={chart.key}
                    onClick={() => setSelectedChart(chart.key)}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      selectedChart === chart.key
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-700'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {chart.label}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Time Period Filter */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 self-center mr-2">
              Period:
            </span>
            {[
              { key: 'daily', label: 'Daily' },
              { key: 'weekly', label: 'Weekly' },
              { key: 'monthly', label: 'Monthly' },
              { key: 'yearly', label: 'Yearly' }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setChartFilter(filter.key)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  chartFilter === filter.key
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="card-body px-6 py-4">
          <div className="h-80">
            {energyLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading energy data...</span>
              </div>
            ) : getChartConfig().data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getChartConfig().data}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="name" 
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    yAxisId="left"
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Electricity & Gas', angle: -90, position: 'insideLeft' }}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Heating (kWh)', angle: 90, position: 'insideRight' }}
                    domain={[0, 'dataMax + 5']}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  {getChartConfig().lines.map((line) => (
                    <Line
                      key={line.key}
                      type="monotone"
                      dataKey={line.key}
                      stroke={line.color}
                      strokeWidth={line.key === 'heating' ? 3 : 2}
                      dot={{ fill: line.color, strokeWidth: 2, r: line.key === 'heating' ? 5 : 4 }}
                      activeDot={{ r: line.key === 'heating' ? 7 : 6, stroke: line.color, strokeWidth: 2 }}
                      name={line.name}
                      yAxisId={line.key === 'heating' ? 'right' : 'left'}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <ChartBarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No energy consumption data available</p>
                  <p className="text-sm mt-1">Add meter readings to see charts</p>
                </div>
              </div>
            )}
          </div>
          

          {/* Chart Summary */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {!energyLoading && energyData.length > 0 && getChartConfig().lines.map((line) => {
              const data = getChartConfig().data;
              
              // Calculate proper consumption totals by summing daily usage differences
              // For electricity, this represents the actual daily consumption from all electric meters
              let total, average, latest;
              
              if (line.key === 'electricity') {
                // Sum all daily electricity consumption values (already calculated as differences)
                total = data.reduce((sum, item) => sum + (item[line.key] || 0), 0);
                average = data.length > 0 ? Math.round(total / data.length) : 0;
                latest = data[data.length - 1]?.[line.key] || 0;
              } else {
                // For gas and heating, use the same logic
                total = data.reduce((sum, item) => sum + (item[line.key] || 0), 0);
                average = data.length > 0 ? Math.round(total / data.length) : 0;
                latest = data[data.length - 1]?.[line.key] || 0;
              }
              
              return (
                <div key={line.key} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: line.color }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {line.name}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Total:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {total.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Average:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {average.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Latest:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {latest.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card">
        <div className="card-header px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Quick Actions
          </h3>
        </div>
        <div className="card-body px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/facilities" className="btn-outline flex items-center justify-center py-3 px-4 text-center">
              <BuildingOfficeIcon className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>Add Facility</span>
            </Link>
            <Link to="/maintenance" className="btn-outline flex items-center justify-center py-3 px-4 text-center">
              <WrenchScrewdriverIcon className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>New Maintenance</span>
            </Link>
            <Link to="/tasks" className="btn-outline flex items-center justify-center py-3 px-4 text-center">
              <CheckCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>Create Task</span>
            </Link>
            <Link to="/meters" className="btn-outline flex items-center justify-center py-3 px-4 text-center">
              <BoltIcon className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>Add Meter</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Report Generation Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Generate Facility Report
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Generate a comprehensive report including facilities, maintenance, energy usage, heating, and gas consumption data.
              </p>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Report Period
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'yearly', label: 'Yearly' }
                  ].map((period) => (
                    <button
                      key={period.value}
                      onClick={() => setReportPeriod(period.value)}
                      className={`p-3 text-sm rounded-lg border-2 transition-colors ${
                        reportPeriod === period.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <CalendarDaysIcon className="h-5 w-5 mx-auto mb-1" />
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={generateReport}
                disabled={generatingReport}
                className="btn btn-primary flex items-center"
              >
                {generatingReport ? (
                  <>
                    <div className="spinner mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;