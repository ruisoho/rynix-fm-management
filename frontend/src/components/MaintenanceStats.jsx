import React from 'react';
import {
  WrenchScrewdriverIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

const MaintenanceStats = ({ maintenance }) => {
  // Handle case when maintenance data is not yet loaded
  if (!maintenance || !Array.isArray(maintenance)) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const stats = {
    total: maintenance.length,
    pending: maintenance.filter(item => item.status === 'pending').length,
    inProgress: maintenance.filter(item => item.status === 'in_progress').length,
    completed: maintenance.filter(item => item.status === 'completed').length,
    overdue: maintenance.filter(item => {
      if (!item.next_maintenance) return false;
      return new Date(item.next_maintenance) < new Date() && item.status !== 'completed';
    }).length,
    totalCost: maintenance.reduce((sum, item) => {
      const cost = parseFloat(item.cost) || 0;
      return sum + cost;
    }, 0)
  };

  const statCards = [
    {
      title: 'Total Requests',
      value: stats.total,
      icon: WrenchScrewdriverIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      darkBgColor: 'dark:bg-blue-900'
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: ClockIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      darkBgColor: 'dark:bg-yellow-900'
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: WrenchScrewdriverIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      darkBgColor: 'dark:bg-blue-900'
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      darkBgColor: 'dark:bg-green-900'
    },
    {
      title: 'Overdue',
      value: stats.overdue,
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      darkBgColor: 'dark:bg-red-900'
    },
    {
      title: 'Total Cost',
      value: `$${stats.totalCost.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      darkBgColor: 'dark:bg-purple-900'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div key={index} className="card">
            <div className="card-body p-4">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-2 rounded-lg ${stat.bgColor} ${stat.darkBgColor}`}>
                  <IconComponent className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {stat.title}
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MaintenanceStats;