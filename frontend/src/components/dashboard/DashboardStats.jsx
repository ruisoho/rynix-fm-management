import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  BoltIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

/**
 * DashboardStats Component - Displays key statistics cards
 * Memoized for performance optimization
 */
const DashboardStats = memo(({ dashboardData }) => {
  if (!dashboardData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="card animate-pulse">
            <div className="card-body p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-gray-200 dark:bg-gray-700">
                    <div className="h-7 w-7 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  </div>
                  <div className="ml-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      name: 'Facilities',
      value: dashboardData.counts?.facilities || 0,
      description: 'Total managed facilities',
      icon: BuildingOfficeIcon,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      link: '/facilities'
    },
    {
      name: 'Maintenance',
      value: dashboardData.counts?.maintenance || 0,
      description: 'Active requests',
      icon: WrenchScrewdriverIcon,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      link: '/maintenance'
    },
    {
      name: 'Tasks',
      value: dashboardData.counts?.tasks || 0,
      description: 'Pending completion',
      icon: DocumentTextIcon,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      link: '/tasks'
    },
    {
      name: 'Meters',
      value: dashboardData.counts?.meters || 0,
      description: 'Installed meters',
      icon: BoltIcon,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      link: '/meters'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <Link
            key={stat.name}
            to={stat.link}
            className="card group hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
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
              
              <div className="flex items-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.description}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
});

DashboardStats.displayName = 'DashboardStats';

export default DashboardStats;