import React from 'react';
import { Link } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  MapPinIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const FacilityCard = ({ facility, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'under construction':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'under renovation':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'decommissioned':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="card hover:shadow-medium transition-shadow duration-200">
      <div className="card-body">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center flex-1">
            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <BuildingOfficeIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {facility.name}
                </h3>
                {facility.status && (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    getStatusColor(facility.status)
                  }`}>
                    {facility.status}
                  </span>
                )}
              </div>
              {facility.address && (
                <div className="flex items-center mt-1">
                  <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {facility.address}
                  </p>
                </div>
              )}
              {facility.type && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {facility.type}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Facility Details */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          {facility.area && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">Area:</span>
              <span className="ml-1 text-gray-900 dark:text-gray-100">
                {facility.area} m²
              </span>
            </div>
          )}
          {facility.floors && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">Floors:</span>
              <span className="ml-1 text-gray-900 dark:text-gray-100">
                {facility.floors}
              </span>
            </div>
          )}
          {facility.manager && (
            <div className="col-span-2">
              <span className="text-gray-500 dark:text-gray-400">Manager:</span>
              <span className="ml-1 text-gray-900 dark:text-gray-100">
                {facility.manager}
              </span>
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-400 dark:text-gray-500 mb-4">
          Created: {formatDate(facility.created_at)}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Link
              to={`/facilities/${facility.id}`}
              className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <EyeIcon className="h-3 w-3 mr-1" />
              View
            </Link>
            <button 
              onClick={() => onEdit(facility)}
              className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <PencilIcon className="h-3 w-3 mr-1" />
              Edit
            </button>
          </div>
          <button
            onClick={() => onDelete(facility.id)}
            className="inline-flex items-center px-3 py-1 border border-red-300 dark:border-red-600 text-xs font-medium rounded text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
          >
            <TrashIcon className="h-3 w-3 mr-1" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacilityCard;