import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const MaintenanceFilters = ({ maintenance, onFilteredMaintenance, onClearFilters }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedSystemType, setSelectedSystemType] = useState('');
  const [selectedMaintenanceType, setSelectedMaintenanceType] = useState('');
  const [showOverdue, setShowOverdue] = useState(false);

  const systemTypes = [
    'HVAC', 'Electrical', 'Plumbing', 'Fire Safety', 'Security',
    'Elevator', 'Lighting', 'Ventilation', 'Heating', 'Cooling',
    'Generator', 'UPS', 'Network', 'Access Control', 'CCTV'
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const maintenanceTypeOptions = [
    { value: 'preventive', label: 'Preventive' },
    { value: 'corrective', label: 'Corrective' },
    { value: 'predictive', label: 'Predictive' },
    { value: 'emergency', label: 'Emergency' }
  ];

  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedStatus, selectedPriority, selectedSystemType, selectedMaintenanceType, showOverdue, maintenance]);

  const applyFilters = () => {
    let filtered = [...maintenance];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        (item.system && item.system.toLowerCase().includes(term)) ||
        (item.location && item.location.toLowerCase().includes(term)) ||
        (item.notes && item.notes.toLowerCase().includes(term)) ||
        (item.work_description && item.work_description.toLowerCase().includes(term)) ||
        (item.company_name && item.company_name.toLowerCase().includes(term))
      );
    }

    // Status filter
    if (selectedStatus) {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    // Priority filter
    if (selectedPriority) {
      filtered = filtered.filter(item => item.priority === selectedPriority);
    }

    // System type filter
    if (selectedSystemType) {
      filtered = filtered.filter(item => item.system_type === selectedSystemType);
    }

    // Maintenance type filter
    if (selectedMaintenanceType) {
      filtered = filtered.filter(item => item.maintenance_type === selectedMaintenanceType);
    }

    // Overdue filter
    if (showOverdue) {
      filtered = filtered.filter(item => {
        if (!item.next_maintenance) return false;
        return new Date(item.next_maintenance) < new Date() && item.status !== 'completed';
      });
    }

    onFilteredMaintenance(filtered);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedPriority('');
    setSelectedSystemType('');
    setSelectedMaintenanceType('');
    setShowOverdue(false);
    onClearFilters();
  };

  const hasActiveFilters = searchTerm || selectedStatus || selectedPriority || selectedSystemType || selectedMaintenanceType || showOverdue;

  return (
    <div className="card mb-6">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Filters</h3>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-4 w-4" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search maintenance..."
              className="form-input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              className="form-input"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              className="form-input"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              <option value="">All Priorities</option>
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* System Type Filter */}
          <div>
            <select
              className="form-input"
              value={selectedSystemType}
              onChange={(e) => setSelectedSystemType(e.target.value)}
            >
              <option value="">All System Types</option>
              {systemTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Maintenance Type Filter */}
          <div>
            <select
              className="form-input"
              value={selectedMaintenanceType}
              onChange={(e) => setSelectedMaintenanceType(e.target.value)}
            >
              <option value="">All Maintenance Types</option>
              {maintenanceTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Overdue Toggle */}
          <div className="flex items-center">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={showOverdue}
                onChange={(e) => setShowOverdue(e.target.checked)}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Show Overdue Only</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceFilters;