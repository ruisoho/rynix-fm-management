import React from 'react';
import {
  BuildingOfficeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

const FacilityStats = ({ facilities }) => {
  const calculateStats = () => {
    const total = facilities.length;
    const active = facilities.filter(f => f.status?.toLowerCase() === 'active').length;
    const underMaintenance = facilities.filter(f => 
      f.status?.toLowerCase() === 'under renovation' || 
      f.status?.toLowerCase() === 'under construction'
    ).length;
    const inactive = facilities.filter(f => 
      f.status?.toLowerCase() === 'inactive' || 
      f.status?.toLowerCase() === 'decommissioned'
    ).length;
    
    const totalArea = facilities.reduce((sum, f) => {
      const area = parseFloat(f.area) || 0;
      return sum + area;
    }, 0);

    return {
      total,
      active,
      underMaintenance,
      inactive,
      totalArea: totalArea.toLocaleString()
    };
  };

  const stats = calculateStats();

  const statCards = [
    {
      title: 'Total Facilities',
      value: stats.total,
      icon: BuildingOfficeIcon,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Active',
      value: stats.active,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Under Maintenance',
      value: stats.underMaintenance,
      icon: WrenchScrewdriverIcon,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      title: 'Inactive',
      value: stats.inactive,
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-600 dark:text-red-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <IconComponent className={`h-6 w-6 ${stat.textColor}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Total Area Card */}
      {stats.totalArea > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:col-span-2 lg:col-span-4">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Total Managed Area
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalArea} m²
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilityStats;