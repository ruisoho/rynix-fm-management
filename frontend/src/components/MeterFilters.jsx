import React from 'react';

const MeterFilters = ({ statusFilter, onStatusFilterChange, meters }) => {
  const getStatusCount = (status) => {
    if (status === 'all') return meters.length;
    return meters.filter(meter => meter.status === status).length;
  };

  const filters = [
    { key: 'all', label: 'All', color: 'gray' },
    { key: 'active', label: 'Active', color: 'green' },
    { key: 'inactive', label: 'Inactive', color: 'gray' },
    { key: 'broken', label: 'Broken', color: 'red' },
    { key: 'maintenance', label: 'Maintenance', color: 'yellow' }
  ];

  const getFilterClasses = (filter, isActive) => {
    const baseClasses = 'inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200';
    
    if (isActive) {
      switch (filter.color) {
        case 'green':
          return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
        case 'red':
          return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
        case 'yellow':
          return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
        default:
          return `${baseClasses} bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200`;
      }
    }
    
    return `${baseClasses} text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700`;
  };

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = statusFilter === filter.key;
          const count = getStatusCount(filter.key);
          
          return (
            <button
              key={filter.key}
              onClick={() => onStatusFilterChange(filter.key)}
              className={getFilterClasses(filter, isActive)}
            >
              {filter.label}
              <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                isActive
                  ? 'bg-white bg-opacity-20'
                  : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MeterFilters;