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
  const [dateRange, setDateRange] = useState('30days');
  const [selectedFacility, setSelectedFacility] = useState('all');
  const [selectedMeter, setSelectedMeter] = useState('all');
  const [reportType, setReportType] = useState('summary');
  const [energyData, setEnergyData] = useState([]);
  const [chartType, setChartType] = useState('line');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [chartFilter, setChartFilter] = useState('daily');
  const [selectedChart, setSelectedChart] = useState('energy');
  const [energyLoading, setEnergyLoading] = useState(false);

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

  // Get chart configuration based on selected chart type
  const getChartConfig = () => {
    const configs = {
      energy: {
        title: 'Energy Consumption Overview',
        data: energyData,
        lines: [
          { key: 'electricity', color: '#3B82F6', name: 'Electricity (kWh)' },
          { key: 'gas', color: '#F59E0B', name: 'Gas (m³)' },
          { key: 'heating', color: '#EF4444', name: 'Heating (MWh)' }
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
          lines: [{ key: 'heating', color: '#EF4444', name: 'Heating (MWh)' }]
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

  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      dateRange,
      selectedFacility: selectedFacility === 'all' ? 'All Facilities' : facilities.find(f => f.id === parseInt(selectedFacility))?.name,
      heatingStats,
      meterStats,
      recentReadings: recentReadings.slice(0, 50), // Limit to 50 most recent
      consumptionTrends: Object.values(consumptionTrends)
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `facility-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Charts & Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Analytics and reporting for heating systems and electric meters
          </p>
        </div>
        <button
          onClick={exportReport}
          className="btn btn-primary flex items-center"
        >
          <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
          Export Report
        </button>
      </div>

      {/* Enhanced Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="form-label">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="form-select"
              >
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="3months">Last 3 months</option>
                <option value="6months">Last 6 months</option>
                <option value="1year">Last year</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">Facility</label>
              <select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                className="form-select"
              >
                <option value="all">All Facilities</option>
                {facilities.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="form-label">Individual Meter</label>
              <select
                value={selectedMeter}
                onChange={(e) => setSelectedMeter(e.target.value)}
                className="form-select"
              >
                <option value="all">All Meters</option>
                {meters
                  .filter(meter => selectedFacility === 'all' || meter.facility_id === parseInt(selectedFacility))
                  .map(meter => (
                    <option key={meter.id} value={meter.id}>
                      {meter.serial_number} ({meter.type})
                    </option>
                  ))
                }
              </select>
            </div>
            
            <div>
              <label className="form-label">Chart Type</label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="form-select"
              >
                <option value="line">Line Chart</option>
                <option value="area">Area Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="composed">Combined</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => setComparisonMode(!comparisonMode)}
                className={`btn w-full ${
                  comparisonMode ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                {comparisonMode ? 'Exit Compare' : 'Compare Mode'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <ChartBarIcon className="h-5 w-5 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('individual')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'individual'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <EyeIcon className="h-5 w-5 inline mr-2" />
            Individual Analysis
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'comparison'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <BuildingOfficeIcon className="h-5 w-5 inline mr-2" />
            Facility Comparison
          </button>
          <button
            onClick={() => setActiveTab('heating')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'heating'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <FireIcon className="h-5 w-5 inline mr-2" />
            Heating Analytics
          </button>
          <button
            onClick={() => setActiveTab('meters')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'meters'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <BoltIcon className="h-5 w-5 inline mr-2" />
            Meter Analytics
          </button>
          <button
            onClick={() => setActiveTab('individual-meters')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'individual-meters'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <EyeIcon className="h-5 w-5 inline mr-2" />
            Individual Meters
          </button>
          <button
            onClick={() => setActiveTab('meter-comparison')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'meter-comparison'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <ChartBarIcon className="h-5 w-5 inline mr-2" />
            Meter Comparison
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
                      {dateRange.replace('days', 'd').replace('months', 'm').replace('year', 'y')}
                    </span>
                  </div>
                </div>
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
                        label={{ value: 'Heating (MWh)', angle: 90, position: 'insideRight' }}
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
                      <Bar dataKey="heating" fill={COLORS.heating} name="Heating (MWh)" />
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
                          Heating (MWh)
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
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="3months">Last 3 Months</option>
                    <option value="6months">Last 6 Months</option>
                    <option value="1year">Last Year</option>
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