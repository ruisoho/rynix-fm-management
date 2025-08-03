import React, { memo, useState, useEffect } from 'react';
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
import {
  ChartBarIcon,
  FireIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { useApi } from '../../contexts/ApiContext';

/**
 * DashboardCharts Component - Displays energy consumption charts
 * Memoized for performance optimization
 */
const DashboardCharts = memo(() => {
  const { getEnergyConsumption } = useApi();
  const [chartFilter, setChartFilter] = useState('daily');
  const [selectedChart, setSelectedChart] = useState('energy');
  const [energyData, setEnergyData] = useState([]);
  const [energyLoading, setEnergyLoading] = useState(false);

  // Fetch energy data when chart filter changes
  useEffect(() => {
    fetchEnergyData(chartFilter);
  }, [chartFilter]);

  const fetchEnergyData = async (filter) => {
    setEnergyLoading(true);
    try {
      const data = await getEnergyConsumption(filter);
      setEnergyData(data || []);
    } catch (error) {
      console.error('Failed to fetch energy data:', error);
      setEnergyData([]);
    } finally {
      setEnergyLoading(false);
    }
  };

  const chartTypes = [
    {
      id: 'energy',
      name: 'Energy Overview',
      icon: ChartBarIcon,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      id: 'heating',
      name: 'Heating',
      icon: FireIcon,
      color: 'text-red-600 dark:text-red-400'
    },
    {
      id: 'electric',
      name: 'Electric',
      icon: LightBulbIcon,
      color: 'text-yellow-600 dark:text-yellow-400'
    }
  ];

  const filterOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const renderChart = () => {
    if (energyLoading) {
      return (
        <div className="flex items-center justify-center h-80">
          <div className="spinner"></div>
        </div>
      );
    }

    if (!energyData || energyData.length === 0) {
      return (
        <div className="flex items-center justify-center h-80">
          <div className="text-center">
            <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No energy data available</p>
          </div>
        </div>
      );
    }

    const commonProps = {
      data: energyData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (selectedChart) {
      case 'heating':
        return (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                className="text-xs fill-gray-500 dark:fill-gray-400"
              />
              <YAxis className="text-xs fill-gray-500 dark:fill-gray-400" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="heating"
                stackId="1"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.6}
                name="Heating (kWh)"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'electric':
        return (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                className="text-xs fill-gray-500 dark:fill-gray-400"
              />
              <YAxis className="text-xs fill-gray-500 dark:fill-gray-400" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar
                dataKey="electric"
                fill="#eab308"
                name="Electric (kWh)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                className="text-xs fill-gray-500 dark:fill-gray-400"
              />
              <YAxis className="text-xs fill-gray-500 dark:fill-gray-400" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="electric"
                stroke="#eab308"
                strokeWidth={3}
                dot={{ fill: '#eab308', strokeWidth: 2, r: 4 }}
                name="Electric (kWh)"
              />
              <Line
                type="monotone"
                dataKey="heating"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                name="Heating (kWh)"
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="card mb-8">
      <div className="card-header px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Energy Consumption
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Chart Type Selector */}
            <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
              {chartTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedChart(type.id)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedChart === type.id
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    <Icon className={`h-4 w-4 mr-2 ${type.color}`} />
                    {type.name}
                  </button>
                );
              })}
            </div>

            {/* Time Filter */}
            <select
              value={chartFilter}
              onChange={(e) => setChartFilter(e.target.value)}
              className="form-select text-sm"
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="card-body p-6">
        {renderChart()}
      </div>
    </div>
  );
});

DashboardCharts.displayName = 'DashboardCharts';

export default DashboardCharts;