import React from 'react';
import {
  BoltIcon,
  FireIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  Bars3Icon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { format, isAfter, parseISO } from 'date-fns';

const MeterCard = ({ 
  meter, 
  index, 
  activeTab, 
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
  const getTabIcon = (tab) => {
    switch (tab) {
      case 'electric':
        return BoltIcon;
      case 'gas':
        return FireIcon;
      case 'heating':
        return WrenchScrewdriverIcon;
      default:
        return BoltIcon;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case 'inactive':
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
      case 'broken':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
      case 'maintenance':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const isMaintenanceDue = (dateString) => {
    if (!dateString) return false;
    try {
      return isAfter(new Date(), parseISO(dateString));
    } catch {
      return false;
    }
  };

  const Icon = getTabIcon(activeTab);
  const isDragOver = dragOverIndex === index;
  const isDragging = draggedMeter && draggedMeter.meter.id === meter.id;

  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, meter, index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => onDragOver(e, index)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, index)}
      className={`card hover:shadow-medium transition-all duration-200 cursor-move ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${
        isDragOver ? 'ring-2 ring-primary-500 ring-opacity-50 transform scale-105' : ''
      }`}
    >
      <div className="card-body relative">
        {/* Drag handle */}
        <div className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <Bars3Icon className="h-4 w-4" />
        </div>
        
        <div className="flex items-start justify-between mb-4 pr-8">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg mr-3">
              <Icon className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {activeTab === 'heating' ? 
                  (meter.location || meter.notes || 'Heating Meter') : 
                  `${meter.location || ''} ${meter.serial_number}`
                }
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {meter.facility_name}
              </p>
            </div>
          </div>
          <span className={getStatusBadge(meter.status)}>
            {meter.status}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          {activeTab === 'heating' ? (
            <>
              {(meter.serial_number || meter.manufacturer) && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Serial Number:</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">{meter.serial_number || meter.manufacturer}</span>
                </div>
              )}
              {(meter.location || meter.notes) && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Location:</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">{meter.location || meter.notes}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Installation:</span>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {formatDate(meter.installation_date)}
                </span>
              </div>
              {meter.last_check && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Last Check:</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {formatDate(meter.last_check)}
                  </span>
                </div>
              )}
              {meter.next_check && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Next Check:</span>
                  <span className={`text-sm ${
                    isMaintenanceDue(meter.next_check)
                      ? 'text-red-600 dark:text-red-400 font-medium'
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {formatDate(meter.next_check)}
                    {isMaintenanceDue(meter.next_check) && (
                      <ExclamationTriangleIcon className="h-4 w-4 inline ml-1" />
                    )}
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
              {meter.location && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Location:</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">{meter.location}</span>
                </div>
              )}
              {activeTab === 'gas' && meter.gas_type && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Gas Type:</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {meter.gas_type.charAt(0).toUpperCase() + meter.gas_type.slice(1)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Installation:</span>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {formatDate(meter.installation_date)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <button
              onClick={() => onViewReadings(meter)}
              className="btn-icon text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              title="View Readings"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onAddReading(meter)}
              className="btn-icon text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
              title="Add Reading"
            >
              <ChartBarIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(meter)}
              className="btn-icon text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              title="Edit Meter"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(meter)}
              className="btn-icon text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
              title="Delete Meter"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeterCard;