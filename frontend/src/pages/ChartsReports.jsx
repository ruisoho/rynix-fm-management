import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  DocumentChartBarIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  FireIcon,
  BoltIcon,
  FunnelIcon,
  EyeIcon,
  BuildingOfficeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useApi } from '../contexts/ApiContext';
import { format, parseISO, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart
} from 'recharts';

const ChartsReports = () => {
  const { getHeating, getMeters, getMeterReadings, getFacilities, getEnergyConsumption, loading, error } = useApi();
  const [heating, setHeating] = useState([]);
  const [meters, setMeters] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [meterReadings, setMeterReadings] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30');
  const [selectedFacility, setSelectedFacility] = useState('all');
  const [selectedMeter, setSelectedMeter] = useState('all');
  const [reportType, setReportType] = useState('summary');
  const [energyData, setEnergyData] = useState([]);
  const [chartType, setChartType] = useState('line');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [chartFilter, setChartFilter] = useState('daily');
  const [selectedChart, setSelectedChart] = useState('energy');
  const [energyLoading, setEnergyLoading] = useState(false);
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState(1000);
  const [showPredictions, setShowPredictions] = useState(false);

  useEffect(() => {
    fetchData();
    fetchEnergyData(chartFilter);
  }, []);

  // Effect to fetch energy data when chart filter changes
  useEffect(() => {
    fetchEnergyData(chartFilter);
  }, [chartFilter]);

  const fetchData = async () => {
    try {
      const [heatingData, metersData, facilitiesData] = await Promise.all([
        getHeating(),
        getMeters(),
        getFacilities()
      ]);
      
      setHeating(Array.isArray(heatingData) ? heatingData : []);
      setMeters(Array.isArray(metersData) ? metersData : []);
      setFacilities(Array.isArray(facilitiesData) ? facilitiesData : []);
      
      // Fetch readings for all meters
      const readingsData = {};
      if (Array.isArray(metersData)) {
        for (const meter of metersData) {
          try {
            const readings = await getMeterReadings(meter.id);
            readingsData[meter.id] = Array.isArray(readings) ? readings : [];
          } catch (err) {
            console.error(`Failed to fetch readings for meter ${meter.id}:`, err);
            readingsData[meter.id] = [];
          }
        }
      }
      setMeterReadings(readingsData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setHeating([]);
      setMeters([]);
      setFacilities([]);
      setMeterReadings({});
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

  // Advanced Analytics Functions
  const getConsumptionTrend = (data) => {
    if (data.length < 2) return 'stable';
    const recent = data.slice(-3).reduce((sum, item) => sum + (item.electricity || 0), 0) / 3;
    const previous = data.slice(-6, -3).reduce((sum, item) => sum + (item.electricity || 0), 0) / 3;
    const change = ((recent - previous) / previous) * 100;
    
    if (change > 10) return 'increasing';
    if (change < -10) return 'decreasing';
    return 'stable';
  };

  const getEfficiencyScore = () => {
    const totalConsumption = energyData.reduce((sum, item) => 
      sum + (item.electricity || 0) + (item.gas || 0) + (item.heating || 0), 0
    );
    const avgConsumption = totalConsumption / energyData.length;
    const benchmark = 1000; // Industry benchmark
    return Math.max(0, Math.min(100, ((benchmark - avgConsumption) / benchmark) * 100));
  };

  const getPredictedConsumption = (data, periods = 3) => {
    if (data.length < 3) return [];
    
    const trend = data.slice(-3).map((item, index) => ({
      period: index,
      value: (item.electricity || 0) + (item.gas || 0) + (item.heating || 0)
    }));
    
    const slope = (trend[2].value - trend[0].value) / 2;
    const predictions = [];
    
    for (let i = 1; i <= periods; i++) {
      const lastValue = trend[trend.length - 1].value;
      predictions.push({
        name: `Predicted +${i}`,
        electricity: Math.max(0, lastValue + (slope * i) * 0.6),
        gas: Math.max(0, lastValue + (slope * i) * 0.3),
        heating: Math.max(0, (lastValue + (slope * i)) * 0.1),
        isPrediction: true
      });
    }
    
    return predictions;
  };

  const getAnomalies = () => {
    if (energyData.length < 5) return [];
    
    const anomalies = [];
    const avgElectricity = energyData.reduce((sum, item) => sum + (item.electricity || 0), 0) / energyData.length;
    const threshold = avgElectricity * 1.5;
    
    energyData.forEach((item, index) => {
      if (item.electricity > threshold) {
        anomalies.push({
          period: item.name,
          type: 'High Consumption',
          value: item.electricity,
          severity: item.electricity > threshold * 1.5 ? 'high' : 'medium'
        });
      }
    });
    
    return anomalies;
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

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  // Chart colors
  const COLORS = {
    electricity: '#3B82F6',
    gas: '#F59E0B', 
    heating: '#EF4444',
    water: '#06B6D4',
    primary: '#8B5CF6',
    secondary: '#10B981',
    accent: '#F59E0B'
  };

  const PIE_COLORS = ['#3B82F6', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6', '#10B981'];

  // Get individual meter data for detailed analysis
  const getIndividualMeterData = (meterId) => {
    const meter = meters.find(m => m.id === parseInt(meterId));
    if (!meter || !meterReadings[meterId]) return [];
    
    const readings = meterReadings[meterId];
    const cutoffDate = getDateRangeFilter();
    
    return readings
      .filter(reading => {
        try {
          return parseISO(reading.date) >= cutoffDate;
        } catch {
          return false;
        }
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((reading, index, arr) => {
        const consumption = index > 0 ? reading.value - arr[index - 1].value : 0;
        return {
          date: format(parseISO(reading.date), 'MMM dd'),
          value: reading.value,
          consumption: Math.max(0, consumption),
          meter: meter.serial_number,
          type: meter.type
        };
      });
  };

  // Get facility comparison data
  const getFacilityComparisonData = () => {
    const facilityData = {};
    
    meters.forEach(meter => {
      const facilityName = meter.facility_name || 'Unknown';
      if (!facilityData[facilityName]) {
        facilityData[facilityName] = {
          name: facilityName,
          electricity: 0,
          gas: 0,
          heating: 0,
          water: 0,
          totalMeters: 0
        };
      }
      
      facilityData[facilityName].totalMeters++;
      
      const readings = meterReadings[meter.id] || [];
      const cutoffDate = getDateRangeFilter();
      const recentReadings = readings.filter(r => {
        try {
          return parseISO(r.date) >= cutoffDate;
        } catch {
          return false;
        }
      });
      
      if (recentReadings.length > 1) {
        const consumption = recentReadings[recentReadings.length - 1].value - recentReadings[0].value;
        facilityData[facilityName][meter.type] += Math.max(0, consumption);
      }
    });
    
    return Object.values(facilityData);
  };

  // Get meter type distribution
  const getMeterTypeDistribution = () => {
    const distribution = {};
    const filteredMeters = selectedFacility === 'all' ? meters : 
      meters.filter(m => m.facility_id === parseInt(selectedFacility));
    
    filteredMeters.forEach(meter => {
      distribution[meter.type] = (distribution[meter.type] || 0) + 1;
    });
    
    return Object.entries(distribution).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
      color: COLORS[type] || COLORS.primary
    }));
  };

  // Get consumption trends with anomaly detection
  const getConsumptionTrendsWithAnomalies = () => {
    const trends = [];
    const cutoffDate = getDateRangeFilter();
    
    Object.entries(meterReadings).forEach(([meterId, readings]) => {
      const meter = meters.find(m => m.id === parseInt(meterId));
      if (!meter || (selectedFacility !== 'all' && meter.facility_id !== parseInt(selectedFacility))) return;
      
      // Filter readings by date and ensure they have valid values
      const recentReadings = readings.filter(r => {
        try {
          const readingDate = new Date(r.date);
          return readingDate >= cutoffDate && r.value != null && !isNaN(r.value);
        } catch {
          return false;
        }
      }).sort((a, b) => new Date(a.date) - new Date(b.date));
      
      if (recentReadings.length > 1) {
        const consumptions = [];
        for (let i = 1; i < recentReadings.length; i++) {
          const consumption = recentReadings[i].value - recentReadings[i-1].value;
          if (consumption >= 0 && consumption < 1000000) { // Reasonable upper limit
            consumptions.push(consumption);
          }
        }
        
        if (consumptions.length > 0) {
          const totalConsumption = consumptions.reduce((sum, c) => sum + c, 0);
          const avgConsumption = totalConsumption / consumptions.length;
          const maxConsumption = Math.max(...consumptions);
          
          // Simple anomaly detection - consumption > 2x average
          const hasAnomaly = maxConsumption > avgConsumption * 2 && avgConsumption > 0;
          
          trends.push({
            meter,
            totalConsumption,
            avgConsumption,
            maxConsumption,
            readingsCount: recentReadings.length,
            hasAnomaly,
            trend: consumptions.length > 1 ? 
              (consumptions[consumptions.length - 1] > consumptions[0] ? 'up' : 'down') : 'stable'
          });
        }
      }
    });
    
    return trends.sort((a, b) => b.totalConsumption - a.totalConsumption);
  };

  const getDateRangeFilter = () => {
    const now = new Date();
    switch (dateRange) {
      case '7':
        return subDays(now, 7);
      case '30':
        return subDays(now, 30);
      case '90':
        return subDays(now, 90);
      case '180':
        return subDays(now, 180);
      case '365':
        return subDays(now, 365);
      default:
        return subDays(now, 30);
    }
  };

  // Filter data based on selected facility
  const filteredHeating = heating.filter(item => 
    selectedFacility === 'all' || item.facility_id === parseInt(selectedFacility)
  );
  
  const filteredMeters = meters.filter(item => 
    selectedFacility === 'all' || item.facility_id === parseInt(selectedFacility)
  );

  // Calculate statistics
  const heatingStats = {
    total: filteredHeating.length,
    active: filteredHeating.filter(h => h.status === 'active').length,
    maintenance: filteredHeating.filter(h => h.status === 'maintenance').length,
    inactive: filteredHeating.filter(h => h.status === 'inactive').length,
    maintenanceDue: filteredHeating.filter(h => {
      if (!h.next_check) return false;
      try {
        return new Date() > parseISO(h.next_check);
      } catch {
        return false;
      }
    }).length
  };

  const meterStats = {
    total: filteredMeters.length,
    active: filteredMeters.filter(m => m.status === 'active').length,
    inactive: filteredMeters.filter(m => m.status === 'inactive').length,
    electric: filteredMeters.filter(m => m.type === 'electric').length,
    gas: filteredMeters.filter(m => m.type === 'gas').length,
    water: filteredMeters.filter(m => m.type === 'water').length
  };

  // Get recent readings within date range
  const getRecentReadings = () => {
    const cutoffDate = getDateRangeFilter();
    const recentReadings = [];
    
    Object.entries(meterReadings).forEach(([meterId, readings]) => {
      const meter = meters.find(m => m.id === parseInt(meterId));
      if (!meter || (selectedFacility !== 'all' && meter.facility_id !== parseInt(selectedFacility))) return;
      
      readings.forEach(reading => {
        try {
          const readingDate = parseISO(reading.date);
          if (readingDate >= cutoffDate) {
            recentReadings.push({
              ...reading,
              meter: meter,
              parsedDate: readingDate
            });
          }
        } catch (err) {
          console.error('Error parsing reading date:', err);
        }
      });
    });
    
    return recentReadings.sort((a, b) => b.parsedDate - a.parsedDate);
  };

  const recentReadings = getRecentReadings();

  // Calculate consumption trends
  const getConsumptionTrends = () => {
    const trends = {};
    
    filteredMeters.forEach(meter => {
      const readings = meterReadings[meter.id] || [];
      const sortedReadings = readings
        .filter(r => {
          try {
            return parseISO(r.date) >= getDateRangeFilter();
          } catch {
            return false;
          }
        })
        .sort((a, b) => parseISO(a.date) - parseISO(b.date));
      
      if (sortedReadings.length >= 2) {
        const firstReading = sortedReadings[0];
        const lastReading = sortedReadings[sortedReadings.length - 1];
        const consumption = lastReading.value - firstReading.value;
        const days = Math.ceil((parseISO(lastReading.date) - parseISO(firstReading.date)) / (1000 * 60 * 60 * 24));
        const dailyAverage = days > 0 ? consumption / days : 0;
        
        trends[meter.id] = {
          meter,
          consumption,
          dailyAverage,
          readingsCount: sortedReadings.length,
          firstReading,
          lastReading
        };
      }
    });
    
    return trends;
  };

  const consumptionTrends = getConsumptionTrends();

  // Enhanced Export Functions
  const exportToJSON = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      dateRange,
      selectedFacility: selectedFacility === 'all' ? 'All Facilities' : facilities.find(f => f.id === parseInt(selectedFacility))?.name,
      heatingStats,
      meterStats,
      recentReadings: recentReadings.slice(0, 50),
      consumptionTrends: Object.values(consumptionTrends),
      energyData: energyData.slice(0, 100)
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    downloadFile(blob, `facility-report-${format(new Date(), 'yyyy-MM-dd')}.json`);
  };

  const exportToCSV = () => {
    const csvData = [];
    csvData.push(['Date', 'Facility', 'Meter ID', 'Type', 'Reading', 'Consumption']);
    
    recentReadings.slice(0, 100).forEach(reading => {
      csvData.push([
        format(reading.parsedDate, 'yyyy-MM-dd'),
        reading.meter?.facility?.name || 'Unknown',
        reading.meter?.id || 'N/A',
        reading.meter?.type || 'Unknown',
        reading.value || 0,
        reading.consumption || 0
      ]);
    });
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    downloadFile(blob, `facility-data-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  const exportToPDF = () => {
    // Create a comprehensive HTML report for PDF conversion
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Facility Management Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .stats { display: flex; justify-content: space-around; margin: 20px 0; }
          .stat-card { text-align: center; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .section { margin: 30px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Facility Management Report</h1>
          <p>Generated on ${format(new Date(), 'PPP')}</p>
          <p>Date Range: ${dateRange} | Facility: ${selectedFacility === 'all' ? 'All Facilities' : facilities.find(f => f.id === parseInt(selectedFacility))?.name}</p>
        </div>
        
        <div class="stats">
          <div class="stat-card">
            <h3>${meters.length}</h3>
            <p>Total Meters</p>
          </div>
          <div class="stat-card">
            <h3>${heating.length}</h3>
            <p>Heating Systems</p>
          </div>
          <div class="stat-card">
            <h3>${facilities.length}</h3>
            <p>Facilities</p>
          </div>
          <div class="stat-card">
            <h3>${recentReadings.length}</h3>
            <p>Recent Readings</p>
          </div>
        </div>
        
        <div class="section">
          <h2>Recent Meter Readings</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Facility</th>
                <th>Meter ID</th>
                <th>Type</th>
                <th>Reading</th>
              </tr>
            </thead>
            <tbody>
              ${recentReadings.slice(0, 20).map(reading => `
                <tr>
                  <td>${format(reading.parsedDate, 'yyyy-MM-dd')}</td>
                  <td>${reading.meter?.facility?.name || 'Unknown'}</td>
                  <td>${reading.meter?.id || 'N/A'}</td>
                  <td>${reading.meter?.type || 'Unknown'}</td>
                  <td>${reading.value || 0}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;
    
    const blob = new Blob([reportHTML], { type: 'text/html' });
    downloadFile(blob, `facility-report-${format(new Date(), 'yyyy-MM-dd')}.html`);
  };

  const downloadFile = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // State for export dropdown and chart controls
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [chartAnimation, setChartAnimation] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportMenu && !event.target.closest('.export-dropdown')) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Quick Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              📊 Charts & Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Comprehensive analytics and reporting for heating systems and electric meters
            </p>
            
            {/* Quick Stats Row */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  {meters.length} Total Meters
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  {heating.length} Heating Systems
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  {facilities.length} Facilities
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="btn btn-secondary flex items-center"
              title="Print Report"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            {/* Enhanced Export Dropdown */}
            <div className="relative export-dropdown">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="btn btn-primary flex items-center"
              >
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Export Report
                <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                      📊 Export Formats
                    </div>
                    
                    <button
                      onClick={() => {
                        exportToJSON();
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">{ }</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">JSON Report</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Complete data export with all metrics</div>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => {
                        exportToCSV();
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-green-600 dark:text-green-400 text-sm font-bold">📊</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">CSV Data</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Spreadsheet-compatible format</div>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => {
                        exportToPDF();
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-red-600 dark:text-red-400 text-sm font-bold">📄</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">HTML Report</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Printable formatted report</div>
                        </div>
                      </div>
                    </button>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                      <button
                        onClick={() => {
                          window.print();
                          setShowExportMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mr-3">
                            <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">🖨️ Quick Print</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Print current view directly</div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Smart Filters */}
      <div className="card border-l-4 border-l-blue-500">
        <div className="card-header bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FunnelIcon className="h-5 w-5 text-blue-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Smart Filters & Controls
              </h3>
            </div>
            <button
              onClick={() => {
                setDateRange('30');
                setSelectedFacility('all');
                setSelectedMeter('all');
                setChartType('line');
                setChartFilter('daily');
                setSelectedChart('energy');
              }}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Reset Filters
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <label className="form-label flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="form-select"
              >
                <option value="7">📅 Last 7 days</option>
                <option value="30">📅 Last 30 days</option>
                <option value="90">📅 Last 3 months</option>
                <option value="180">📅 Last 6 months</option>
                <option value="365">📅 Last year</option>
              </select>
            </div>
            
            <div>
              <label className="form-label flex items-center">
                <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                Facility
              </label>
              <select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                className="form-select"
              >
                <option value="all">🏢 All Facilities ({facilities.length})</option>
                {facilities.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    🏢 {facility.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="form-label flex items-center">
                <BoltIcon className="h-4 w-4 mr-1" />
                Individual Meter
              </label>
              <select
                value={selectedMeter}
                onChange={(e) => setSelectedMeter(e.target.value)}
                className="form-select"
              >
                <option value="all">⚡ All Meters ({meters.filter(meter => selectedFacility === 'all' || meter.facility_id === parseInt(selectedFacility)).length})</option>
                {meters
                  .filter(meter => selectedFacility === 'all' || meter.facility_id === parseInt(selectedFacility))
                  .map(meter => (
                    <option key={meter.id} value={meter.id}>
                      {meter.type === 'electric' ? '⚡' : meter.type === 'gas' ? '🔥' : '💧'} {meter.serial_number} ({meter.type})
                    </option>
                  ))
                }
              </select>
            </div>
            
            <div>
              <label className="form-label flex items-center">
                <ChartBarIcon className="h-4 w-4 mr-1" />
                Chart Type
              </label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="form-select"
              >
                <option value="line">📈 Line Chart</option>
                <option value="area">📊 Area Chart</option>
                <option value="bar">📊 Bar Chart</option>
                <option value="composed">🔄 Combined</option>
              </select>
            </div>
            
            <div>
              <label className="form-label flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Time Period
              </label>
              <select
                value={chartFilter}
                onChange={(e) => setChartFilter(e.target.value)}
                className="form-select"
              >
                <option value="daily">📅 Daily</option>
                <option value="weekly">📅 Weekly</option>
                <option value="monthly">📅 Monthly</option>
                <option value="yearly">📅 Yearly</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => setComparisonMode(!comparisonMode)}
                className={`btn w-full transition-all duration-200 ${
                  comparisonMode 
                    ? 'btn-primary shadow-lg transform scale-105' 
                    : 'btn-secondary hover:shadow-md'
                }`}
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                {comparisonMode ? '✅ Compare Mode' : '🔍 Compare Mode'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <svg className="h-5 w-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics Dashboard
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Choose your analysis view below
          </p>
        </div>
        <nav className="flex flex-wrap gap-2 p-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center ${
              activeTab === 'overview'
                ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('individual')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center ${
              activeTab === 'individual'
                ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            🔍 Individual Analysis
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center ${
              activeTab === 'comparison'
                ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            🏢 Facility Comparison
          </button>
          <button
            onClick={() => setActiveTab('heating')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center ${
              activeTab === 'heating'
                ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            🔥 Heating Analytics
          </button>
          <button
            onClick={() => setActiveTab('meters')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center ${
              activeTab === 'meters'
                ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            ⚡ Meter Analytics
          </button>
          <button
            onClick={() => setActiveTab('individual-meters')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center ${
              activeTab === 'individual-meters'
                ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            🔍 Individual Meters
          </button>
          <button
            onClick={() => setActiveTab('meter-comparison')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center ${
              activeTab === 'meter-comparison'
                ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            📊 Meter Comparison
          </button>
        </nav>
      </div>

      {/* Enhanced Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards with Trends */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FireIcon className="h-8 w-8 text-red-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Heating</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{heatingStats.total}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-green-600 dark:text-green-400 flex items-center">
                      <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                      Active: {heatingStats.active}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BoltIcon className="h-8 w-8 text-blue-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Meters</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{meterStats.total}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      E:{meterStats.electric} G:{meterStats.gas}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CalendarIcon className="h-8 w-8 text-yellow-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Maintenance Due</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{heatingStats.maintenanceDue}</p>
                    </div>
                  </div>
                  {heatingStats.maintenanceDue > 0 && (
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                  )}

      {/* Meter Comparison Tab */}
      {activeTab === 'meter-comparison' && (
        <div className="space-y-6">
          {/* Comparison Header */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Meter Comparison Analysis
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Compare multiple meters side by side with advanced filtering and visualization options
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Comparing {meters.filter(meter => {
                  const facilityMatch = selectedFacility === 'all' || meter.facility_id === parseInt(selectedFacility);
                  const typeMatch = selectedMeter === 'all' || meter.type === selectedMeter;
                  return facilityMatch && typeMatch;
                }).length} meters
                {selectedFacility !== 'all' && ` from ${facilities.find(f => f.id === parseInt(selectedFacility))?.name || 'selected facility'}`}
              </div>
            </div>
          </div>

          {/* Comparison Filter Controls */}
          <div className="card">
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Facility Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Facility
                  </label>
                  <select
                    value={selectedFacility}
                    onChange={(e) => setSelectedFacility(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="all">All Facilities</option>
                    {facilities.map(facility => (
                      <option key={facility.id} value={facility.id}>
                        {facility.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Meter Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meter Type
                  </label>
                  <select
                    value={selectedMeter}
                    onChange={(e) => setSelectedMeter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="all">All Types</option>
                    <option value="electric">Electric</option>
                    <option value="gas">Gas</option>
                    <option value="water">Water</option>
                  </select>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date Range
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="90">Last 3 Months</option>
                    <option value="180">Last 6 Months</option>
                    <option value="365">Last 1 Year</option>
                  </select>
                </div>

                {/* Chart Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Chart Type
                  </label>
                  <select
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="line">Line Chart</option>
                    <option value="area">Area Chart</option>
                    <option value="bar">Bar Chart</option>
                  </select>
                </div>

                {/* Comparison Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    View Mode
                  </label>
                  <select
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="overlay">Overlay View</option>
                    <option value="separate">Separate Charts</option>
                    <option value="grid">Grid Layout</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {meters
              .filter(meter => {
                const facilityMatch = selectedFacility === 'all' || meter.facility_id === parseInt(selectedFacility);
                const typeMatch = selectedMeter === 'all' || meter.type === selectedMeter;
                return facilityMatch && typeMatch;
              })
              .map(meter => {
                const meterData = getIndividualMeterData(meter.id.toString());
                const readings = meterReadings[meter.id] || [];
                
                // Filter readings by date range
                const cutoffDate = subDays(new Date(), parseInt(dateRange));
                const filteredReadings = readings.filter(r => {
                  try {
                    return parseISO(r.date) >= cutoffDate;
                  } catch {
                    return false;
                  }
                }).sort((a, b) => new Date(a.date) - new Date(b.date));

                return (
                  <div key={meter.id} className="card">
                    <div className="card-header">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-3" 
                            style={{ backgroundColor: COLORS[meter.type] || COLORS.primary }}
                          ></div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                              {meter.serial_number}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {meter.facility_name} • {meter.type?.charAt(0).toUpperCase() + meter.type?.slice(1)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {filteredReadings.length} readings
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Status: {meter.status || 'Active'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="h-64">
                        {meterData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            {chartType === 'line' && (
                              <LineChart data={meterData}>
                                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                <XAxis 
                                  dataKey="date" 
                                  className="text-xs"
                                  tick={{ fontSize: 10 }}
                                />
                                <YAxis 
                                  className="text-xs"
                                  tick={{ fontSize: 10 }}
                                />
                                <Tooltip 
                                  contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '12px'
                                  }}
                                />
                                <Legend />
                                <Line 
                                  type="monotone" 
                                  dataKey="consumption" 
                                  stroke={COLORS[meter.type] || COLORS.primary} 
                                  strokeWidth={2}
                                  dot={{ fill: COLORS[meter.type] || COLORS.primary, strokeWidth: 2, r: 3 }}
                                  name={`Consumption (${meter.type === 'electric' ? 'kWh' : meter.type === 'gas' ? 'm³' : 'L'})`}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="value" 
                                  stroke={COLORS.secondary} 
                                  strokeWidth={1}
                                  strokeDasharray="5 5"
                                  dot={{ fill: COLORS.secondary, strokeWidth: 1, r: 2 }}
                                  name={`Total Reading (${meter.type === 'electric' ? 'kWh' : meter.type === 'gas' ? 'm³' : 'L'})`}
                                />
                              </LineChart>
                            )}
                            {chartType === 'area' && (
                              <AreaChart data={meterData}>
                                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                <XAxis 
                                  dataKey="date" 
                                  className="text-xs"
                                  tick={{ fontSize: 10 }}
                                />
                                <YAxis 
                                  className="text-xs"
                                  tick={{ fontSize: 10 }}
                                />
                                <Tooltip 
                                  contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '12px'
                                  }}
                                />
                                <Legend />
                                <Area 
                                  type="monotone" 
                                  dataKey="consumption" 
                                  stroke={COLORS[meter.type] || COLORS.primary} 
                                  fill={COLORS[meter.type] || COLORS.primary}
                                  fillOpacity={0.6}
                                  name={`Consumption (${meter.type === 'electric' ? 'kWh' : meter.type === 'gas' ? 'm³' : 'L'})`}
                                />
                              </AreaChart>
                            )}
                            {chartType === 'bar' && (
                              <BarChart data={meterData}>
                                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                <XAxis 
                                  dataKey="date" 
                                  className="text-xs"
                                  tick={{ fontSize: 10 }}
                                />
                                <YAxis 
                                  className="text-xs"
                                  tick={{ fontSize: 10 }}
                                />
                                <Tooltip 
                                  contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '12px'
                                  }}
                                />
                                <Legend />
                                <Bar 
                                  dataKey="consumption" 
                                  fill={COLORS[meter.type] || COLORS.primary}
                                  name={`Consumption (${meter.type === 'electric' ? 'kWh' : meter.type === 'gas' ? 'm³' : 'L'})`}
                                />
                              </BarChart>
                            )}
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                            <div className="text-center">
                              <ChartBarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                              <p>No data available</p>
                              <p className="text-sm mt-1">Add readings to see charts</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Comparison Statistics */}
                      {meterData.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {meterData.reduce((sum, item) => sum + (item.consumption || 0), 0).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Total Consumption
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {(meterData.reduce((sum, item) => sum + (item.consumption || 0), 0) / meterData.length).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Average
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {meterData[meterData.length - 1]?.consumption?.toFixed(2) || '0.00'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Latest
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* No Meters Message for Comparison */}
          {meters.filter(meter => {
            const facilityMatch = selectedFacility === 'all' || meter.facility_id === parseInt(selectedFacility);
            const typeMatch = selectedMeter === 'all' || meter.type === selectedMeter;
            return facilityMatch && typeMatch;
          }).length === 0 && (
            <div className="card">
              <div className="card-body">
                <div className="text-center py-8">
                  <ChartBarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No Meters Available for Comparison
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    No meters match the selected filters. Try adjusting your filter criteria to see comparison charts.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DocumentChartBarIcon className="h-8 w-8 text-green-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Readings</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{recentReadings.length}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {dateRange === '7' ? '7d' : dateRange === '30' ? '30d' : dateRange === '90' ? '3m' : dateRange === '180' ? '6m' : dateRange === '365' ? '1y' : '30d'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Insights Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Insights */}
            <div className="card border-l-4 border-l-green-500">
              <div className="card-header bg-green-50 dark:bg-green-900/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Performance Insights
                  </h3>
                  <button
                    onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
                    className="text-sm text-green-600 hover:text-green-800 dark:text-green-400"
                  >
                    {showAdvancedMetrics ? 'Hide' : 'Show'} Details
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Efficiency Score</span>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${getEfficiencyScore()}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {getEfficiencyScore().toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Consumption Trend</span>
                    <div className="flex items-center">
                      {getConsumptionTrend(energyData) === 'increasing' && (
                        <span className="text-red-500 flex items-center text-sm">
                          <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                          📈 Increasing
                        </span>
                      )}
                      {getConsumptionTrend(energyData) === 'decreasing' && (
                        <span className="text-green-500 flex items-center text-sm">
                          <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                          📉 Decreasing
                        </span>
                      )}
                      {getConsumptionTrend(energyData) === 'stable' && (
                        <span className="text-blue-500 flex items-center text-sm">
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                          </svg>
                          📊 Stable
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {showAdvancedMetrics && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-2">
                        <div>• Efficiency based on industry benchmarks</div>
                        <div>• Trend analysis over last 6 periods</div>
                        <div>• Real-time performance monitoring</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Anomaly Detection */}
            <div className="card border-l-4 border-l-yellow-500">
              <div className="card-header bg-yellow-50 dark:bg-yellow-900/20">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-yellow-500" />
                  Anomaly Detection
                </h3>
              </div>
              <div className="card-body">
                {getAnomalies().length > 0 ? (
                  <div className="space-y-3">
                    {getAnomalies().slice(0, 3).map((anomaly, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {anomaly.period}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {anomaly.type}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${
                            anomaly.severity === 'high' ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {anomaly.value.toFixed(0)} kWh
                          </div>
                          <div className={`text-xs px-2 py-1 rounded ${
                            anomaly.severity === 'high' 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          }`}>
                            {anomaly.severity.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-green-500 mb-2">
                      <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">✅ No anomalies detected</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">All systems operating normally</p>
                  </div>
                )}
              </div>
            </div>

            {/* Predictive Analytics */}
            <div className="card border-l-4 border-l-purple-500">
              <div className="card-header bg-purple-50 dark:bg-purple-900/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Predictive Analytics
                  </h3>
                  <button
                    onClick={() => setShowPredictions(!showPredictions)}
                    className={`text-sm px-3 py-1 rounded transition-all ${
                      showPredictions 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/20 dark:text-purple-400'
                    }`}
                  >
                    {showPredictions ? '🔮 ON' : '🔮 OFF'}
                  </button>
                </div>
              </div>
              <div className="card-body">
                {showPredictions ? (
                  <div className="space-y-3">
                    {getPredictedConsumption(energyData).map((prediction, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {prediction.name}
                        </div>
                        <div className="text-sm text-purple-600 dark:text-purple-400">
                          {(prediction.electricity + prediction.gas).toFixed(0)} kWh
                        </div>
                      </div>
                    ))}
                    <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        🤖 AI-powered predictions based on historical trends
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-purple-500 mb-2">
                      <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">🔮 Enable predictions</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Get AI-powered consumption forecasts</p>
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
              
              {/* Enhanced Chart Controls */}
              <div className="mt-4 space-y-3">
                {/* Time Period Filter */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 self-center mr-2">
                    📅 Period:
                  </span>
                  {[
                    { key: 'daily', label: 'Daily', emoji: '📊' },
                    { key: 'weekly', label: 'Weekly', emoji: '📈' },
                    { key: 'monthly', label: 'Monthly', emoji: '📉' },
                    { key: 'yearly', label: 'Yearly', emoji: '📋' }
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => setChartFilter(filter.key)}
                      className={`px-3 py-1 text-sm rounded-md transition-all duration-200 flex items-center ${
                        chartFilter === filter.key
                          ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 scale-105 shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-102'
                      }`}
                    >
                      <span className="mr-1">{filter.emoji}</span>
                      {filter.label}
                    </button>
                  ))}
                </div>
                
                {/* Advanced Chart Options */}
                <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      🎛️ Options:
                    </span>
                    
                    {/* Auto Refresh Toggle */}
                    <button
                      onClick={() => setAutoRefresh(!autoRefresh)}
                      className={`px-3 py-1 text-xs rounded-full transition-all duration-200 flex items-center ${
                        autoRefresh
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                      }`}></div>
                      {autoRefresh ? '🔄 Live' : '⏸️ Static'}
                    </button>
                    
                    {/* Animation Toggle */}
                    <button
                      onClick={() => setChartAnimation(!chartAnimation)}
                      className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
                        chartAnimation
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {chartAnimation ? '✨ Animated' : '🚫 Static'}
                    </button>
                    
                    {/* Grid Toggle */}
                    <button
                      onClick={() => setShowGrid(!showGrid)}
                      className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
                        showGrid
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {showGrid ? '🔲 Grid On' : '⬜ Grid Off'}
                    </button>
                  </div>
                  
                  {/* Manual Refresh Button */}
                  <button
                    onClick={() => {
                      // Trigger data refresh
                      window.location.reload();
                    }}
                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-full transition-all duration-200 flex items-center"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    🔄 Refresh
                  </button>
                  
                  {/* Data Points Counter */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                    📊 {getChartConfig().data.length} data points
                  </div>
                </div>
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
                      {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
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
                          animationDuration={chartAnimation ? 1000 : 0}
                          isAnimationActive={chartAnimation}
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
                  const total = data.reduce((sum, item) => sum + (item[line.key] || 0), 0);
                  const average = Math.round(total / data.length);
                  const latest = data[data.length - 1]?.[line.key] || 0;
                  
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

          {/* Meter Type Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Meter Distribution
                </h3>
              </div>
              <div className="card-body">
                <div className="h-64">
                  {getMeterTypeDistribution().length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getMeterTypeDistribution()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getMeterTypeDistribution().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                      <p>No meter data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Top Consumers */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Top Consumers
                </h3>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  {getConsumptionTrendsWithAnomalies().slice(0, 5).map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3`} style={{ backgroundColor: COLORS[trend.meter.type] || COLORS.primary }}></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {trend.meter.serial_number}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {trend.meter.facility_name} • {trend.meter.type}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {trend.totalConsumption.toFixed(2)} {trend.meter.type === 'electric' ? 'kWh' : trend.meter.type === 'gas' ? 'm³' : 'L'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Avg: {trend.avgConsumption.toFixed(2)}
                          </div>
                        </div>
                        {trend.hasAnomaly && (
                          <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 ml-2" title="Unusual consumption detected" />
                        )}
                        {trend.trend === 'up' ? (
                          <ArrowTrendingUpIcon className="h-4 w-4 text-red-500 ml-1" />
                        ) : trend.trend === 'down' ? (
                          <ArrowTrendingDownIcon className="h-4 w-4 text-green-500 ml-1" />
                        ) : null}
                      </div>
                    </div>
                  ))}
                  {getConsumptionTrendsWithAnomalies().length === 0 && (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      <p>No consumption trends available</p>
                      <p className="text-xs mt-1">
                        Meters: {meters.length}, Readings: {Object.keys(meterReadings).length}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Recent Meter Readings
              </h3>
            </div>
            <div className="card-body">
              {recentReadings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Meter
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Facility
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Reading
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {recentReadings.slice(0, 10).map((reading, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                            {reading.meter.serial_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {reading.meter.facility_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {reading.value} {reading.meter.type === 'electric' ? 'kWh' : reading.meter.type === 'gas' ? 'm³' : 'L'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(reading.date)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {reading.notes || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No recent readings found for the selected period.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Individual Analysis Tab */}
      {activeTab === 'individual' && (
        <div className="space-y-6">
          {selectedMeter === 'all' ? (
            <div className="card">
              <div className="card-body text-center py-12">
                <EyeIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Select a Meter for Individual Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Choose a specific meter from the filter above to see detailed consumption patterns, trends, and analytics.
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Showing {meters.filter(meter => selectedFacility === 'all' || meter.facility_id === parseInt(selectedFacility)).length} meters
                  {selectedFacility !== 'all' && ` from ${facilities.find(f => f.id === parseInt(selectedFacility))?.name || 'selected facility'}`}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  {meters
                    .filter(meter => selectedFacility === 'all' || meter.facility_id === parseInt(selectedFacility))
                    .map(meter => (
                      <button
                        key={meter.id}
                        onClick={() => setSelectedMeter(meter.id.toString())}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                      >
                        <div className="flex items-center mb-2">
                          <div className={`w-3 h-3 rounded-full mr-2`} style={{ backgroundColor: COLORS[meter.type] || COLORS.primary }}></div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{meter.serial_number}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{meter.facility_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 capitalize">{meter.type} meter</p>
                      </button>
                    ))
                  }
                </div>
              </div>
            </div>
          ) : (
            <>
              {(() => {
                const meter = meters.find(m => m.id === parseInt(selectedMeter));
                const meterData = getIndividualMeterData(selectedMeter);
                const readings = meterReadings[selectedMeter] || [];
                
                return (
                  <>
                    {/* Meter Info Header */}
                    <div className="card">
                      <div className="card-body">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-4 h-4 rounded-full mr-3`} style={{ backgroundColor: COLORS[meter?.type] || COLORS.primary }}></div>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                {meter?.serial_number} - Individual Analysis
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {meter?.facility_name} • {meter?.type?.charAt(0).toUpperCase() + meter?.type?.slice(1)} Meter
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {readings.length} readings
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Status: {meter?.status || 'Unknown'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Individual Meter Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Consumption Over Time */}
                      <div className="card">
                        <div className="card-header">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            Consumption Over Time
                          </h3>
                        </div>
                        <div className="card-body">
                          <div className="h-64">
                            {meterData.length > 0 ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={meterData}>
                                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                  <XAxis dataKey="date" className="text-xs" />
                                  <YAxis className="text-xs" />
                                  <Tooltip 
                                    contentStyle={{
                                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                      border: '1px solid #e5e7eb',
                                      borderRadius: '8px'
                                    }}
                                  />
                                  <Legend />
                                  <Line 
                                    type="monotone" 
                                    dataKey="consumption" 
                                    stroke={COLORS[meter?.type] || COLORS.primary} 
                                    strokeWidth={2} 
                                    name={`Consumption (${meter?.type === 'electric' ? 'kWh' : meter?.type === 'gas' ? 'm³' : 'L'})`}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            ) : (
                              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                                <div className="text-center">
                                  <ChartBarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                  <p>No consumption data available</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Cumulative Readings */}
                      <div className="card">
                        <div className="card-header">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            Cumulative Readings
                          </h3>
                        </div>
                        <div className="card-body">
                          <div className="h-64">
                            {meterData.length > 0 ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={meterData}>
                                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                  <XAxis dataKey="date" className="text-xs" />
                                  <YAxis className="text-xs" />
                                  <Tooltip 
                                    contentStyle={{
                                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                      border: '1px solid #e5e7eb',
                                      borderRadius: '8px'
                                    }}
                                  />
                                  <Legend />
                                  <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke={COLORS[meter?.type] || COLORS.primary} 
                                    fill={COLORS[meter?.type] || COLORS.primary}
                                    fillOpacity={0.6}
                                    name={`Total Reading (${meter?.type === 'electric' ? 'kWh' : meter?.type === 'gas' ? 'm³' : 'L'})`}
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            ) : (
                              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                                <div className="text-center">
                                  <ChartBarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                  <p>No reading data available</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Statistics */}
                    <div className="card">
                      <div className="card-header">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          Detailed Statistics
                        </h3>
                      </div>
                      <div className="card-body">
                        {meterData.length > 0 ? (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                  {meterData.reduce((sum, d) => sum + d.consumption, 0).toFixed(2)}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  Total Consumption ({meter?.type === 'electric' ? 'kWh' : meter?.type === 'gas' ? 'm³' : 'L'})
                                </div>
                              </div>
                              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                  {(meterData.reduce((sum, d) => sum + d.consumption, 0) / meterData.length).toFixed(2)}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  Average per Period
                                </div>
                              </div>
                              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                  {Math.max(...meterData.map(d => d.consumption)).toFixed(2)}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  Peak Consumption
                                </div>
                              </div>
                              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                  {Math.min(...meterData.map(d => d.consumption)).toFixed(2)}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  Minimum Consumption
                                </div>
                              </div>
                            </div>
                            
                            {/* Recent Readings Table */}
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                  <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Reading
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Consumption
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Notes
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                  {meterData.slice(0, 10).map((data, index) => (
                                    <tr key={index}>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        {data.date}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        {data.value.toFixed(2)} {meter?.type === 'electric' ? 'kWh' : meter?.type === 'gas' ? 'm³' : 'L'}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        {data.consumption.toFixed(2)} {meter?.type === 'electric' ? 'kWh' : meter?.type === 'gas' ? 'm³' : 'L'}
                                      </td>
                                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {readings.find(r => format(parseISO(r.date), 'MMM dd') === data.date)?.notes || '-'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <ChartBarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No data available for this meter</p>
                            <p className="text-sm mt-1">Add readings to see detailed statistics</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                );              })()}
            </>
          )}
        </div>
      )}

      {/* Facility Comparison Tab */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Facility Comparison
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Compare energy consumption across different facilities
              </p>
            </div>
            <div className="card-body">
              <div className="h-80">
                {getFacilityComparisonData().length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={getFacilityComparisonData()}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="name" className="text-xs" angle={-45} textAnchor="end" height={80} />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="electricity" fill={COLORS.electricity} name="Electricity (kWh)" />
                      <Bar dataKey="gas" fill={COLORS.gas} name="Gas (m³)" />
                      <Bar dataKey="heating" fill={COLORS.heating} name="Heating (kWh)" />
                      <Line type="monotone" dataKey="totalMeters" stroke={COLORS.primary} strokeWidth={2} name="Total Meters" />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <BuildingOfficeIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No facility data available</p>
                      <p className="text-sm mt-1">Add facilities and meters to see comparisons</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Facility Statistics Table */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Facility Statistics
              </h3>
            </div>
            <div className="card-body">
              {getFacilityComparisonData().length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Facility
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Total Meters
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Electricity (kWh)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Gas (m³)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Heating (kWh)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Total Consumption
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {getFacilityComparisonData().map((facility, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                            {facility.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {facility.totalMeters}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {facility.electricity.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {facility.gas.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {facility.heating.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                            {(facility.electricity + facility.gas + facility.heating).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <BuildingOfficeIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No facility data available</p>
                  <p className="text-sm mt-1">Add facilities and meters to see statistics</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Heating Analytics Tab */}
      {activeTab === 'heating' && (
        <div className="space-y-6">
          {/* Heating Status Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Status Distribution
                </h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${heatingStats.total > 0 ? (heatingStats.active / heatingStats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {heatingStats.active}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Maintenance</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{ width: `${heatingStats.total > 0 ? (heatingStats.maintenance / heatingStats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {heatingStats.maintenance}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Inactive</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                        <div 
                          className="bg-gray-500 h-2 rounded-full" 
                          style={{ width: `${heatingStats.total > 0 ? (heatingStats.inactive / heatingStats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {heatingStats.inactive}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Maintenance Schedule
                </h3>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <span className="text-sm font-medium text-red-800 dark:text-red-200">Overdue</span>
                    <span className="text-lg font-bold text-red-800 dark:text-red-200">
                      {heatingStats.maintenanceDue}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Due This Month</span>
                    <span className="text-lg font-bold text-yellow-800 dark:text-yellow-200">
                      {filteredHeating.filter(h => {
                        if (!h.next_check) return false;
                        try {
                          const nextCheck = parseISO(h.next_check);
                          const now = new Date();
                          return nextCheck >= startOfMonth(now) && nextCheck <= endOfMonth(now);
                        } catch {
                          return false;
                        }
                      }).length}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">Up to Date</span>
                    <span className="text-lg font-bold text-green-800 dark:text-green-200">
                      {heatingStats.total - heatingStats.maintenanceDue}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Heating Meters List */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Heating Meters Details
              </h3>
            </div>
            <div className="card-body">
              {filteredHeating.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          System
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Facility
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Last Check
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Next Check
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredHeating.map((system) => (
                        <tr key={system.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <FireIcon className="h-5 w-5 text-orange-500 mr-2" />
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {system.type}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {system.manufacturer} {system.model}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {system.facility_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              system.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              system.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            }`}>
                              {system.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(system.last_check)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <span className={`${
                              system.next_check && new Date() > parseISO(system.next_check) 
                                ? 'text-red-600 dark:text-red-400 font-medium' 
                                : ''
                            }`}>
                              {formatDate(system.next_check)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No heating meters found for the selected facility.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Meter Analytics Tab */}
      {activeTab === 'meters' && (
        <div className="space-y-6">
          {/* Meter Type Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Meter Types
                </h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Electric</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${meterStats.total > 0 ? (meterStats.electric / meterStats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {meterStats.electric}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Gas</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ width: `${meterStats.total > 0 ? (meterStats.gas / meterStats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {meterStats.gas}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Water</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                        <div 
                          className="bg-cyan-500 h-2 rounded-full" 
                          style={{ width: `${meterStats.total > 0 ? (meterStats.water / meterStats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {meterStats.water}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Consumption Trends
                </h3>
              </div>
              <div className="card-body">
                {Object.keys(consumptionTrends).length > 0 ? (
                  <div className="space-y-3">
                    {Object.values(consumptionTrends).slice(0, 5).map((trend, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {trend.meter.serial_number}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {trend.meter.facility_name}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {trend.consumption.toFixed(2)} {trend.meter.type === 'electric' ? 'kWh' : trend.meter.type === 'gas' ? 'm³' : 'L'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {trend.dailyAverage.toFixed(2)}/day avg
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No consumption data available for the selected period.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Consumption Table */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Detailed Consumption Analysis
              </h3>
            </div>
            <div className="card-body">
              {Object.keys(consumptionTrends).length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Meter
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Facility
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Total Consumption
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Daily Average
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Readings Count
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Period
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {Object.values(consumptionTrends).map((trend, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <BoltIcon className="h-5 w-5 text-blue-500 mr-2" />
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {trend.meter.serial_number}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                  {trend.meter.type}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {trend.meter.facility_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                            {trend.consumption.toFixed(2)} {trend.meter.type === 'electric' ? 'kWh' : trend.meter.type === 'gas' ? 'm³' : 'L'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {trend.dailyAverage.toFixed(2)} {trend.meter.type === 'electric' ? 'kWh' : trend.meter.type === 'gas' ? 'm³' : 'L'}/day
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {trend.readingsCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(trend.firstReading.date)} - {formatDate(trend.lastReading.date)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No consumption data available. Add meter readings to see analytics.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading and Error States */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )}

      {/* Individual Meters Tab */}
      {activeTab === 'individual-meters' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Filter Options
              </h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Facility Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Facility
                  </label>
                  <select
                    value={selectedFacility}
                    onChange={(e) => setSelectedFacility(e.target.value)}
                    className="form-select w-full"
                  >
                    <option value="all">All Facilities</option>
                    {facilities.map(facility => (
                      <option key={facility.id} value={facility.id}>
                        {facility.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Meter Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meter Type
                  </label>
                  <select
                    value={selectedMeter}
                    onChange={(e) => setSelectedMeter(e.target.value)}
                    className="form-select w-full"
                  >
                    <option value="all">All Types</option>
                    <option value="electric">Electric</option>
                    <option value="gas">Gas</option>
                    <option value="water">Water</option>
                  </select>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date Range
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="form-select w-full"
                  >
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="90">Last 3 Months</option>
                    <option value="180">Last 6 Months</option>
                    <option value="365">Last Year</option>
                  </select>
                </div>

                {/* Chart Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Chart Type
                  </label>
                  <select
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value)}
                    className="form-select w-full"
                  >
                    <option value="line">Line Chart</option>
                    <option value="area">Area Chart</option>
                    <option value="bar">Bar Chart</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Individual Meter Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {meters
              .filter(meter => {
                const facilityMatch = selectedFacility === 'all' || meter.facility_id === parseInt(selectedFacility);
                const typeMatch = selectedMeter === 'all' || meter.type === selectedMeter;
                return facilityMatch && typeMatch;
              })
              .map(meter => {
                const meterData = getIndividualMeterData(meter.id);
                const readings = meterReadings[meter.id] || [];
                const cutoffDate = getDateRangeFilter();
                const filteredReadings = readings.filter(r => {
                  try {
                    return parseISO(r.date) >= cutoffDate;
                  } catch {
                    return false;
                  }
                }).sort((a, b) => new Date(a.date) - new Date(b.date));

                return (
                  <div key={meter.id} className="card">
                    <div className="card-header">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-3" 
                            style={{ backgroundColor: COLORS[meter.type] || COLORS.primary }}
                          ></div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                              {meter.serial_number}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {meter.facility_name} • {meter.type?.charAt(0).toUpperCase() + meter.type?.slice(1)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {filteredReadings.length} readings
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Status: {meter.status || 'Active'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="h-64">
                        {meterData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            {chartType === 'line' && (
                              <LineChart data={meterData}>
                                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                <XAxis 
                                  dataKey="date" 
                                  className="text-xs"
                                  tick={{ fontSize: 10 }}
                                />
                                <YAxis 
                                  className="text-xs"
                                  tick={{ fontSize: 10 }}
                                />
                                <Tooltip 
                                  contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '12px'
                                  }}
                                />
                                <Legend />
                                <Line 
                                  type="monotone" 
                                  dataKey="consumption" 
                                  stroke={COLORS[meter.type] || COLORS.primary} 
                                  strokeWidth={2}
                                  dot={{ fill: COLORS[meter.type] || COLORS.primary, strokeWidth: 2, r: 3 }}
                                  name={`Consumption (${meter.type === 'electric' ? 'kWh' : meter.type === 'gas' ? 'm³' : 'L'})`}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="value" 
                                  stroke={COLORS.secondary} 
                                  strokeWidth={1}
                                  strokeDasharray="5 5"
                                  dot={{ fill: COLORS.secondary, strokeWidth: 1, r: 2 }}
                                  name={`Total Reading (${meter.type === 'electric' ? 'kWh' : meter.type === 'gas' ? 'm³' : 'L'})`}
                                />
                              </LineChart>
                            )}
                            {chartType === 'area' && (
                              <AreaChart data={meterData}>
                                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                <XAxis 
                                  dataKey="date" 
                                  className="text-xs"
                                  tick={{ fontSize: 10 }}
                                />
                                <YAxis 
                                  className="text-xs"
                                  tick={{ fontSize: 10 }}
                                />
                                <Tooltip 
                                  contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '12px'
                                  }}
                                />
                                <Legend />
                                <Area 
                                  type="monotone" 
                                  dataKey="consumption" 
                                  stroke={COLORS[meter.type] || COLORS.primary} 
                                  fill={COLORS[meter.type] || COLORS.primary}
                                  fillOpacity={0.6}
                                  name={`Consumption (${meter.type === 'electric' ? 'kWh' : meter.type === 'gas' ? 'm³' : 'L'})`}
                                />
                              </AreaChart>
                            )}
                            {chartType === 'bar' && (
                              <BarChart data={meterData}>
                                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                <XAxis 
                                  dataKey="date" 
                                  className="text-xs"
                                  tick={{ fontSize: 10 }}
                                />
                                <YAxis 
                                  className="text-xs"
                                  tick={{ fontSize: 10 }}
                                />
                                <Tooltip 
                                  contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '12px'
                                  }}
                                />
                                <Legend />
                                <Bar 
                                  dataKey="consumption" 
                                  fill={COLORS[meter.type] || COLORS.primary}
                                  name={`Consumption (${meter.type === 'electric' ? 'kWh' : meter.type === 'gas' ? 'm³' : 'L'})`}
                                />
                              </BarChart>
                            )}
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                            <div className="text-center">
                              <ChartBarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                              <p>No data available</p>
                              <p className="text-sm mt-1">Add readings to see charts</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Meter Statistics */}
                      {meterData.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {meterData.reduce((sum, item) => sum + (item.consumption || 0), 0).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Total Consumption
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {(meterData.reduce((sum, item) => sum + (item.consumption || 0), 0) / meterData.length).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Average
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {meterData[meterData.length - 1]?.consumption?.toFixed(2) || '0.00'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Latest
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* No Meters Message */}
          {meters.filter(meter => {
            const facilityMatch = selectedFacility === 'all' || meter.facility_id === parseInt(selectedFacility);
            const typeMatch = selectedMeter === 'all' || meter.type === selectedMeter;
            return facilityMatch && typeMatch;
          }).length === 0 && (
            <div className="card">
              <div className="card-body">
                <div className="text-center py-8">
                  <BoltIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No Meters Found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    No meters match the selected filters. Try adjusting your filter criteria.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error loading data
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartsReports;