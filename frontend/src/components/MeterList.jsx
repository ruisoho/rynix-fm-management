import React from 'react';
import MeterCard from './MeterCard';

const MeterList = ({
  meters,
  activeTab,
  statusFilter,
  loading,
  draggedMeter,
  dragOverIndex,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onViewReadings,
  onEdit,
  onDelete,
  onAddReading
}) => {
  // Filter meters based on status
  const filteredMeters = statusFilter === 'all' 
    ? meters 
    : meters.filter(meter => meter.status === statusFilter);

  // Loading skeleton
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="card animate-pulse">
            <div className="card-body">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg mr-3"></div>
                  <div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-16"></div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-28"></div>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (filteredMeters.length === 0) {
    const getEmptyMessage = () => {
      if (statusFilter === 'all') {
        switch (activeTab) {
          case 'electric':
            return 'No electric meters found. Add your first electric meter to get started.';
          case 'gas':
            return 'No gas meters found. Add your first gas meter to get started.';
          case 'heating':
            return 'No heating meters found. Add your first heating meter to get started.';
          default:
            return 'No meters found.';
        }
      } else {
        return `No ${statusFilter} meters found.`;
      }
    };

    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          {getEmptyMessage()}
        </h3>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredMeters.map((meter, index) => (
        <MeterCard
          key={meter.id}
          meter={meter}
          index={index}
          activeTab={activeTab}
          draggedMeter={draggedMeter}
          dragOverIndex={dragOverIndex}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onViewReadings={onViewReadings}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddReading={onAddReading}
        />
      ))}
    </div>
  );
};

export default MeterList;