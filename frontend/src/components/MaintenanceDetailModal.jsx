import React from 'react';
import { WrenchScrewdriverIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const MaintenanceDetailModal = ({ isOpen, onClose, maintenance }) => {
  if (!isOpen || !maintenance) return null;

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
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

  const capitalizePriority = (priority) => {
    if (!priority) return 'Medium';
    return priority.charAt(0).toUpperCase() + priority.slice(1);
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <WrenchScrewdriverIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Maintenance Request Details
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className={getStatusBadge(maintenance.status)}>
                      {maintenance.status ? maintenance.status.replace('_', ' ') : 'Unknown'}
                    </span>
                    <span className={getPriorityBadge(maintenance.priority)}>
                      {capitalizePriority(maintenance.priority)}
                    </span>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                {/* Key Information Section - Highlighted */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="text-lg font-semibold text-blue-900 mb-4">Key Maintenance Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-blue-700">System Name</label>
                      <p className="text-sm font-semibold text-gray-900">{maintenance.system || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-blue-700">Maintenance Type</label>
                      <p className="text-sm font-semibold text-gray-900">{maintenance.maintenance_type || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-blue-700">System Type</label>
                      <p className="text-sm font-semibold text-gray-900">{maintenance.system_type || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-blue-700">Location</label>
                      <p className="text-sm font-semibold text-gray-900">{maintenance.location || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-blue-700">Last Maintenance</label>
                      <p className="text-sm font-semibold text-gray-900">{maintenance.last_maintenance ? formatDate(maintenance.last_maintenance) : 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-blue-700">Next Maintenance</label>
                      <p className="text-sm font-semibold text-gray-900">{maintenance.next_maintenance ? formatDate(maintenance.next_maintenance) : 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* System Information */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Additional System Details</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Equipment Condition</label>
                        <p className="text-sm text-gray-900">{maintenance.equipment_condition || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Maintenance Cycle</label>
                        <p className="text-sm text-gray-900">{maintenance.cycle_type || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Cost</label>
                        <p className="text-sm text-gray-900">{maintenance.cost || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Norms/Standards</label>
                        <p className="text-sm text-gray-900">{maintenance.norms || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Maintenance Details */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Maintenance Details</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Urgency Level</label>
                        <p className="text-sm text-gray-900">{maintenance.urgency_level || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Estimated Duration</label>
                        <p className="text-sm text-gray-900">{maintenance.estimated_duration || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Assigned Technician</label>
                        <p className="text-sm text-gray-900">{maintenance.assigned_technician || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Access Requirements</label>
                        <p className="text-sm text-gray-900">{maintenance.access_requirements || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Work Description */}
                  <div className="md:col-span-2 space-y-4">
                    <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Work Description</h4>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                      {maintenance.work_description || maintenance.notes || 'No description available'}
                    </p>
                  </div>

                  {/* Required Parts/Materials */}
                  {maintenance.required_parts && (
                    <div className="space-y-4">
                      <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Required Parts/Materials</h4>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                        {maintenance.required_parts}
                      </p>
                    </div>
                  )}

                  {/* Safety Requirements */}
                  {maintenance.safety_requirements && (
                    <div className="space-y-4">
                      <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Safety Requirements</h4>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                        {maintenance.safety_requirements}
                      </p>
                    </div>
                  )}

                  {/* Completion Criteria */}
                  {maintenance.completion_criteria && (
                    <div className="md:col-span-2 space-y-4">
                      <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Completion Criteria</h4>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                        {maintenance.completion_criteria}
                      </p>
                    </div>
                  )}

                  {/* Company Information */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Company Information</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Company Name</label>
                        <p className="text-sm text-gray-900">{maintenance.company_name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Contact Person</label>
                        <p className="text-sm text-gray-900">{maintenance.company_contact || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Phone</label>
                        <p className="text-sm text-gray-900">{maintenance.company_phone || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <p className="text-sm text-gray-900">{maintenance.company_email || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Timeline</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Created</label>
                        <p className="text-sm text-gray-900">{maintenance.created_at ? formatDate(maintenance.created_at) : 'Unknown'}</p>
                      </div>
                      {maintenance.updated_at !== maintenance.created_at && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Last Updated</label>
                          <p className="text-sm text-gray-900">{maintenance.updated_at ? formatDate(maintenance.updated_at) : 'Unknown'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-primary w-full sm:w-auto"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceDetailModal;