import React from 'react';
import {
  BuildingOfficeIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const MaintenanceCard = ({ maintenance, onViewDetails }) => {
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      in_progress: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      completed: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return statusClasses[status] || 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  };

  const getPriorityBadge = (priority) => {
    const priorityClasses = {
      low: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      medium: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      high: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      urgent: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return priorityClasses[priority] || 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  };

  const getPriorityIcon = (priority) => {
    if (priority === 'urgent' || priority === 'high') {
      return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const capitalizePriority = (priority) => {
    if (!priority) return 'Medium';
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  return (
    <div 
      className="card hover:shadow-medium transition-shadow duration-200 cursor-pointer"
      onClick={() => onViewDetails(maintenance)}
    >
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <BuildingOfficeIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {maintenance.facility_name || maintenance.system || 'Unknown System'}
              </h3>
              {getPriorityIcon(maintenance.priority)}
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              {maintenance.description || maintenance.notes || 'No description available'}
            </p>
            
            {/* Key Maintenance Information */}
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">System Name:</span>
                <span className="ml-1 text-gray-600 dark:text-gray-400">{maintenance.system || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Maintenance Type:</span>
                <span className="ml-1 text-gray-600 dark:text-gray-400">{maintenance.maintenance_type || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">System Type:</span>
                <span className="ml-1 text-gray-600 dark:text-gray-400">{maintenance.system_type || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Location:</span>
                <span className="ml-1 text-gray-600 dark:text-gray-400">{maintenance.location || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Last Maintenance:</span>
                <span className="ml-1 text-gray-600 dark:text-gray-400">{maintenance.last_maintenance ? formatDate(maintenance.last_maintenance) : 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Next Maintenance:</span>
                <span className="ml-1 text-gray-600 dark:text-gray-400">{maintenance.next_maintenance ? formatDate(maintenance.next_maintenance) : 'N/A'}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <CalendarIcon className="h-3 w-3 mr-1" />
                Created: {maintenance.created_at ? formatDate(maintenance.created_at) : 'Unknown'}
              </div>
              {maintenance.updated_at !== maintenance.created_at && (
                <div className="flex items-center">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  Updated: {maintenance.updated_at ? formatDate(maintenance.updated_at) : 'Unknown'}
                </div>
              )}
            </div>
          </div>
          
          <div className="ml-4 flex-shrink-0 space-y-2">
            <div className="flex flex-col items-end space-y-1">
              <span className={getStatusBadge(maintenance.status)}>
                {maintenance.status ? maintenance.status.replace('_', ' ') : 'Unknown'}
              </span>
              <span className={getPriorityBadge(maintenance.priority)}>
                {capitalizePriority(maintenance.priority)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceCard;