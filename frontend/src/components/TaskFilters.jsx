import React from 'react';

const TaskFilters = ({ filter, onFilterChange, statusCounts }) => {
  const filterTabs = [
    { key: 'all', label: 'All', count: statusCounts.all },
    { key: 'todo', label: 'To Do', count: statusCounts.todo },
    { key: 'in_progress', label: 'In Progress', count: statusCounts.in_progress },
    { key: 'completed', label: 'Completed', count: statusCounts.completed },
    { key: 'overdue', label: 'Overdue', count: statusCounts.overdue }
  ];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="-mb-px flex space-x-8">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onFilterChange(tab.key)}
            className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
              filter === tab.key
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
            <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
              tab.key === 'overdue' && tab.count > 0
                ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TaskFilters;