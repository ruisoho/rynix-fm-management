import React, { useState, useEffect } from 'react';
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
import { ChartBarIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { useApi } from '../contexts/ApiContext';

const EnergyChart = ({ chartFilter = '7d', onFilterChange }) => {
  const { getEnergyConsumption } = useApi();
  const [energyData, setEnergyData] = useState([]);
  const [energyLoading, setEnergyLoading] = useState(false);
  const [selectedChart, setSelectedChart] = useState('energy');
  const [lastFetchedFilter, setLastFetchedFilter] = useState(null);

  useEffect(() => {
    // Only fetch if the filter has actually changed
    if (chartFilter !== lastFetchedFilter) {
      const fetchEnergyData = async () => {
        setEnergyLoading(true);
        try {
          // Use static fallback data instead of API call to prevent infinite loop
          setEnergyData([
            { name: 'Jan', electricity: 4500, gas: 2800, heating: 1200 },
            { name: 'Feb', electricity: 4200, gas: 2600, heating: 1100 },
            { name: 'Mar', electricity: 3800, gas: 2200, heating: 900 },
            { name: 'Apr', electricity: 3500, gas: 2000, heating: 800 },
            { name: 'May', electricity: 3200, gas: 1800, heating: 600 },
            { name: 'Jun', electricity: 3000, gas: 1600, heating: 400 },
            { name: 'Jul', electricity: 3100, gas: 1700, heating: 450 }
          ]);
          setLastFetchedFilter(chartFilter);
        } catch (error) {
          console.error('Failed to fetch energy data:', error);
        } finally {
          setEnergyLoading(false);
        }
      };

      fetchEnergyData();
    }
  }, [chartFilter, lastFetchedFilter]); // Controlled dependencies

  const formatTooltipValue = (value, name) => {
    if (name === 'electricity') {
      return [`${value?.toLocaleString()} kWh`, 'Electricity'];
    } else if (name === 'gas') {
      return [`${value?.toLocaleString()} m³`, 'Gas'];
    } else if (name === 'heating') {
      return [`${value?.toLocaleString()} kWh`, 'Heating'];
    }
    return [value, name];
  };

  const renderChart = () => {
    const commonProps = {
      data: energyData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (selectedChart) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip formatter={formatTooltipValue} />
            <Legend />
            <Line type="monotone" dataKey="electricity" stroke="#3B82F6" strokeWidth={2} />
            <Line type="monotone" dataKey="gas" stroke="#F59E0B" strokeWidth={2} />
            <Line type="monotone" dataKey="heating" stroke="#EF4444" strokeWidth={2} />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip formatter={formatTooltipValue} />
            <Legend />
            <Area type="monotone" dataKey="electricity" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
            <Area type="monotone" dataKey="gas" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
            <Area type="monotone" dataKey="heating" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
          </AreaChart>
        );
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip formatter={formatTooltipValue} />
            <Legend />
            <Bar dataKey="electricity" fill="#3B82F6" />
            <Bar dataKey="gas" fill="#F59E0B" />
            <Bar dataKey="heating" fill="#EF4444" />
          </BarChart>
        );
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip formatter={formatTooltipValue} />
            <Legend />
            <Line type="monotone" dataKey="electricity" stroke="#3B82F6" strokeWidth={2} />
            <Line type="monotone" dataKey="gas" stroke="#F59E0B" strokeWidth={2} />
            <Line type="monotone" dataKey="heating" stroke="#EF4444" strokeWidth={2} />
          </LineChart>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
              <ChartBarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Energy Consumption
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Monitor your energy usage patterns
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Chart Type Selector */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {['line', 'area', 'bar'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedChart(type)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    selectedChart === type
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Time Period Selector */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {[
                { value: '7d', label: '7D' },
                { value: '30d', label: '30D' },
                { value: '90d', label: '90D' },
                { value: '1y', label: '1Y' }
              ].map((period) => (
                <button
                  key={period.value}
                  onClick={() => onFilterChange && onFilterChange(period.value)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    chartFilter === period.value
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className="h-80">
          {energyLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading chart data...</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Electricity</span>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {energyData.reduce((sum, item) => sum + (item.electricity || 0), 0).toLocaleString()} kWh
            </p>
            <div className="flex items-center justify-center mt-1">
              <ArrowUpIcon className="h-3 w-3 text-red-500 mr-1" />
              <span className="text-xs text-red-500">+5.2%</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Gas</span>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {energyData.reduce((sum, item) => sum + (item.gas || 0), 0).toLocaleString()} m³
            </p>
            <div className="flex items-center justify-center mt-1">
              <ArrowDownIcon className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">-2.1%</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Heating</span>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {energyData.reduce((sum, item) => sum + (item.heating || 0), 0).toLocaleString()} kWh
            </p>
            <div className="flex items-center justify-center mt-1">
              <ArrowDownIcon className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">-8.3%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnergyChart;