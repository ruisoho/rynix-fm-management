import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  DocumentChartBarIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  FireIcon,
  BoltIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { useApi } from '../contexts/ApiContext';
import { format, parseISO, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const ChartsReports = () => {
  const { getHeating, getMeters, getMeterReadings, getFacilities, loading, error } = useApi();
  const [heating, setHeating] = useState([]);
  const [meters, setMeters] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [meterReadings, setMeterReadings] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30days');
  const [selectedFacility, setSelectedFacility] = useState('all');
  const [reportType, setReportType] = useState('summary');

  useEffect(() => {
    fetchData();
  }, []);

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

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const getDateRangeFilter = () => {
    const now = new Date();
    switch (dateRange) {
      case '7days':
        return subDays(now, 7);
      case '30days':
        return subDays(now, 30);
      case '3months':
        return subMonths(now, 3);
      case '6months':
        return subMonths(now, 6);
      case '1year':
        return subMonths(now, 12);
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

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <label className="form-label">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="form-select"
              >
                <option value="summary">Summary</option>
                <option value="detailed">Detailed</option>
                <option value="trends">Trends</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <ChartBarIcon className="h-5 w-5 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('heating')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
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
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <FireIcon className="h-8 w-8 text-orange-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Heating</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{heatingStats.total}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <BoltIcon className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Meters</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{meterStats.total}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <CalendarIcon className="h-8 w-8 text-yellow-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Maintenance Due</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{heatingStats.maintenanceDue}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <DocumentChartBarIcon className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Readings</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{recentReadings.length}</p>
                  </div>
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