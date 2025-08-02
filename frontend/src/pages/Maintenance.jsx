import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  WrenchScrewdriverIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useApi } from '../contexts/ApiContext';
import { format } from 'date-fns';

const Maintenance = () => {
  const { getMaintenance, getFacilities, createMaintenance, loading, error } = useApi();
  
  const systemTypes = [
    'HVAC', 'Electrical', 'Plumbing', 'Fire Safety', 'Security',
    'Elevator', 'Lighting', 'Ventilation', 'Heating', 'Cooling',
    'Generator', 'UPS', 'Network', 'Access Control', 'CCTV'
  ];

  const cycleTypes = [
    { value: 'weekly', label: 'Weekly', days: 7 },
    { value: 'monthly', label: 'Monthly', days: 30 },
    { value: 'quarterly', label: 'Quarterly', days: 90 },
    { value: 'semi-annual', label: 'Semi-Annual', days: 180 },
    { value: 'annual', label: 'Annual', days: 365 },
    { value: 'custom', label: 'Custom', days: null }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-red-600' }
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low - Can wait' },
    { value: 'normal', label: 'Normal - Scheduled' },
    { value: 'urgent', label: 'Urgent - ASAP' },
    { value: 'emergency', label: 'Emergency - Immediate' }
  ];

  const maintenanceTypes = [
    { value: 'preventive', label: 'Preventive Maintenance' },
    { value: 'corrective', label: 'Corrective Maintenance' },
    { value: 'predictive', label: 'Predictive Maintenance' },
    { value: 'emergency', label: 'Emergency Repair' }
  ];

  const equipmentConditions = [
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' },
    { value: 'critical', label: 'Critical' }
  ];
  const [maintenance, setMaintenance] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [formData, setFormData] = useState({
    system: '',
    systemType: 'HVAC',
    cycle: {
      type: 'monthly',
      customDays: 30
    },
    company: {
      name: '',
      contact: '',
      phone: '',
      email: ''
    },
    norms: '',
    lastMaintenance: new Date(),
    priority: 'medium',
    cost: '',
    location: '',
    notes: '',
    // New detailed fields
    urgencyLevel: 'normal',
    estimatedDuration: '',
    requiredParts: '',
    assignedTechnician: '',
    workDescription: '',
    safetyRequirements: '',
    completionCriteria: '',
    maintenanceType: 'preventive',
    equipmentCondition: 'good',
    accessRequirements: ''
  });

  // Function to calculate next maintenance date
  const calculateNextMaintenance = (lastMaintenance, cycleType, customDays) => {
    const lastDate = new Date(lastMaintenance);
    let daysToAdd = 30; // default monthly
    
    switch (cycleType) {
      case 'weekly':
        daysToAdd = 7;
        break;
      case 'monthly':
        daysToAdd = 30;
        break;
      case 'quarterly':
        daysToAdd = 90;
        break;
      case 'semi-annual':
        daysToAdd = 180;
        break;
      case 'annual':
        daysToAdd = 365;
        break;
      case 'custom':
        daysToAdd = customDays || 30;
        break;
      default:
        daysToAdd = 30;
    }
    
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + daysToAdd);
    return nextDate;
  };

  // Get calculated next maintenance date
  const getNextMaintenanceDate = () => {
    return calculateNextMaintenance(
      formData.lastMaintenance,
      formData.cycle.type,
      formData.cycle.customDays
    );
  };
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [maintenanceData, facilitiesData] = await Promise.all([
        getMaintenance(),
        getFacilities()
      ]);
      setMaintenance(Array.isArray(maintenanceData) ? maintenanceData : []);
      setFacilities(Array.isArray(facilitiesData) ? facilitiesData : []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setMaintenance([]);
      setFacilities([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMaintenance(formData);
      setFormData({
        system: '',
        systemType: 'HVAC',
        cycle: {
          type: 'monthly',
          customDays: 30
        },
        company: {
          name: '',
          contact: '',
          phone: '',
          email: ''
        },
        norms: '',
        lastMaintenance: new Date(),
        nextMaintenance: new Date(),
        priority: 'medium',
        cost: '',
        location: '',
        notes: ''
      });
      setShowCreateModal(false);
      fetchData();
    } catch (err) {
      console.error('Failed to create maintenance request:', err);
    }
  };

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

  const filteredMaintenance = (maintenance || []).filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const statusCounts = {
    all: (maintenance || []).length,
    pending: (maintenance || []).filter(item => item.status === 'pending').length,
    in_progress: (maintenance || []).filter(item => item.status === 'in_progress').length,
    completed: (maintenance || []).filter(item => item.status === 'completed').length
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Maintenance Requests
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track and manage facility maintenance requests
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Request
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Status filter tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'All', count: statusCounts.all },
            { key: 'pending', label: 'Pending', count: statusCounts.pending },
            { key: 'in_progress', label: 'In Progress', count: statusCounts.in_progress },
            { key: 'completed', label: 'Completed', count: statusCounts.completed }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                filter === tab.key
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
              <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Maintenance requests list */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="card-body">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredMaintenance.length > 0 ? (
        <div className="space-y-4">
          {filteredMaintenance.map((item) => (
            <div 
              key={item.id} 
              className="card hover:shadow-medium transition-shadow duration-200 cursor-pointer"
              onClick={() => {
                setSelectedMaintenance(item);
                setShowDetailModal(true);
              }}
            >
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <BuildingOfficeIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {item.facility_name || item.system || 'Unknown System'}
                      </h3>
                      {getPriorityIcon(item.priority)}
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {item.description || item.notes || 'No description available'}
                    </p>
                    
                    {/* Key Maintenance Information */}
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">System Name:</span>
                        <span className="ml-1 text-gray-600 dark:text-gray-400">{item.system || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Maintenance Type:</span>
                        <span className="ml-1 text-gray-600 dark:text-gray-400">{item.maintenance_type || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">System Type:</span>
                        <span className="ml-1 text-gray-600 dark:text-gray-400">{item.system_type || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Location:</span>
                        <span className="ml-1 text-gray-600 dark:text-gray-400">{item.location || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Last Maintenance:</span>
                        <span className="ml-1 text-gray-600 dark:text-gray-400">{item.last_maintenance ? formatDate(item.last_maintenance) : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Next Maintenance:</span>
                        <span className="ml-1 text-gray-600 dark:text-gray-400">{item.next_maintenance ? formatDate(item.next_maintenance) : 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        Created: {item.created_at ? formatDate(item.created_at) : 'Unknown'}
                      </div>
                      {item.updated_at !== item.created_at && (
                        <div className="flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          Updated: {item.updated_at ? formatDate(item.updated_at) : 'Unknown'}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex-shrink-0 space-y-2">
                    <div className="flex flex-col items-end space-y-1">
                      <span className={getStatusBadge(item.status)}>
                        {item.status ? item.status.replace('_', ' ') : 'Unknown'}
                      </span>
                      <span className={getPriorityBadge(item.priority)}>
                        {capitalizePriority(item.priority)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <WrenchScrewdriverIcon className="empty-state-icon" />
          <h3 className="empty-state-title">
            {filter === 'all' ? 'No maintenance requests' : `No ${filter ? filter.replace('_', ' ') : 'unknown'} requests`}
          </h3>
          <p className="empty-state-description">
            {filter === 'all' 
              ? 'Create your first maintenance request to get started.'
              : `No maintenance requests with ${filter ? filter.replace('_', ' ') : 'unknown'} status.`
            }
          </p>
          {filter === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary mt-4"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Request
            </button>
          )}
        </div>
      )}

      {/* Create maintenance request modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCreateModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 sm:mx-0 sm:h-10 sm:w-10">
                      <WrenchScrewdriverIcon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:mr-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-black">
                        New Maintenance Request
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="form-label text-black">
                            System Name *
                          </label>
                          <input
                            type="text"
                            required
                            className="form-input"
                            value={formData.system}
                            onChange={(e) => setFormData({ ...formData, system: e.target.value })}
                            placeholder="Enter system name"
                          />
                        </div>
                        
                        <div>
                          <label className="form-label text-black">
                            System Type *
                          </label>
                          <select
                            required
                            className="form-input"
                            value={formData.systemType}
                            onChange={(e) => setFormData({ ...formData, systemType: e.target.value })}
                          >
                            {systemTypes.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="form-label text-black">
                            Location
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="System location"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="form-label text-black">
                              Maintenance Cycle *
                            </label>
                            <select
                              required
                              className="form-input"
                              value={formData.cycle.type}
                              onChange={(e) => setFormData({ 
                                ...formData, 
                                cycle: { ...formData.cycle, type: e.target.value }
                              })}
                            >
                              {cycleTypes.map((cycle) => (
                                <option key={cycle.value} value={cycle.value}>
                                  {cycle.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          {formData.cycle.type === 'custom' && (
                            <div>
                              <label className="form-label text-black">
                                Custom Days
                              </label>
                              <input
                                type="number"
                                className="form-input"
                                value={formData.cycle.customDays}
                                onChange={(e) => setFormData({ 
                                  ...formData, 
                                  cycle: { ...formData.cycle, customDays: parseInt(e.target.value) }
                                })}
                                placeholder="Number of days"
                              />
                            </div>
                          )}
                          
                          <div>
                            <label className="form-label text-black">
                              Cost
                            </label>
                            <input
                              type="text"
                              className="form-input"
                              value={formData.cost}
                              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                              placeholder="Maintenance cost"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="form-label text-black">
                            Norms/Standards
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            value={formData.norms}
                            onChange={(e) => setFormData({ ...formData, norms: e.target.value })}
                            placeholder="Applicable norms or standards"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="form-label text-black">
                              Last Maintenance
                            </label>
                            <input
                              type="date"
                              className="form-input"
                              value={formData.lastMaintenance.toISOString().split('T')[0]}
                              onChange={(e) => setFormData({ ...formData, lastMaintenance: new Date(e.target.value) })}
                            />
                          </div>
                          
                          <div>
                             <label className="form-label text-black">
                               Next Maintenance
                             </label>
                            <input
                              type="date"
                              className="form-input bg-gray-100"
                              value={getNextMaintenanceDate().toISOString().split('T')[0]}
                              readOnly
                              disabled
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Automatically calculated based on cycle and last maintenance
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h4 className="text-md font-medium text-black">Company Information</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="form-label text-black">
                                Company Name
                              </label>
                              <input
                                type="text"
                                className="form-input"
                                value={formData.company.name}
                                onChange={(e) => setFormData({ 
                                  ...formData, 
                                  company: { ...formData.company, name: e.target.value }
                                })}
                                placeholder="Company name"
                              />
                            </div>
                            
                            <div>
                              <label className="form-label text-black">
                                Contact Person
                              </label>
                              <input
                                type="text"
                                className="form-input"
                                value={formData.company.contact}
                                onChange={(e) => setFormData({ 
                                  ...formData, 
                                  company: { ...formData.company, contact: e.target.value }
                                })}
                                placeholder="Contact person"
                              />
                            </div>
                            
                            <div>
                              <label className="form-label text-black">
                                Phone
                              </label>
                              <input
                                type="tel"
                                className="form-input"
                                value={formData.company.phone}
                                onChange={(e) => setFormData({ 
                                  ...formData, 
                                  company: { ...formData.company, phone: e.target.value }
                                })}
                                placeholder="Phone number"
                              />
                            </div>
                            
                            <div>
                              <label className="form-label text-black">
                                Email
                              </label>
                              <input
                                type="email"
                                className="form-input"
                                value={formData.company.email}
                                onChange={(e) => setFormData({ 
                                  ...formData, 
                                  company: { ...formData.company, email: e.target.value }
                                })}
                                placeholder="Email address"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="form-label text-black">
                            Notes
                          </label>
                          <textarea
                            className="form-input"
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Additional notes or comments"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="form-label text-black">
                              Priority *
                            </label>
                            <select
                              required
                              className="form-input"
                              value={formData.priority}
                              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            >
                              {priorities.map((priority) => (
                                <option key={priority.value} value={priority.value}>
                                  {priority.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="form-label text-black">
                              Urgency Level *
                            </label>
                            <select
                              required
                              className="form-input"
                              value={formData.urgencyLevel}
                              onChange={(e) => setFormData({ ...formData, urgencyLevel: e.target.value })}
                            >
                              {urgencyLevels.map((level) => (
                                <option key={level.value} value={level.value}>
                                  {level.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="form-label text-black">
                              Maintenance Type *
                            </label>
                            <select
                              required
                              className="form-input"
                              value={formData.maintenanceType}
                              onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value })}
                            >
                              {maintenanceTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="form-label text-black">
                              Equipment Condition
                            </label>
                            <select
                              className="form-input"
                              value={formData.equipmentCondition}
                              onChange={(e) => setFormData({ ...formData, equipmentCondition: e.target.value })}
                            >
                              {equipmentConditions.map((condition) => (
                                <option key={condition.value} value={condition.value}>
                                  {condition.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="form-label text-black">
                              Estimated Duration
                            </label>
                            <input
                              type="text"
                              className="form-input"
                              value={formData.estimatedDuration}
                              onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                              placeholder="e.g., 2 hours, 1 day"
                            />
                          </div>
                          
                          <div>
                            <label className="form-label text-black">
                              Assigned Technician
                            </label>
                            <input
                              type="text"
                              className="form-input"
                              value={formData.assignedTechnician}
                              onChange={(e) => setFormData({ ...formData, assignedTechnician: e.target.value })}
                              placeholder="Technician name or ID"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="form-label text-black">
                            Work Description *
                          </label>
                          <textarea
                            required
                            className="form-input"
                            rows={3}
                            value={formData.workDescription}
                            onChange={(e) => setFormData({ ...formData, workDescription: e.target.value })}
                            placeholder="Detailed description of work to be performed"
                          />
                        </div>
                        
                        <div>
                          <label className="form-label text-black">
                            Required Parts/Materials
                          </label>
                          <textarea
                            className="form-input"
                            rows={2}
                            value={formData.requiredParts}
                            onChange={(e) => setFormData({ ...formData, requiredParts: e.target.value })}
                            placeholder="List of parts, tools, or materials needed"
                          />
                        </div>
                        
                        <div>
                          <label className="form-label text-black">
                            Safety Requirements
                          </label>
                          <textarea
                            className="form-input"
                            rows={2}
                            value={formData.safetyRequirements}
                            onChange={(e) => setFormData({ ...formData, safetyRequirements: e.target.value })}
                            placeholder="Safety precautions, PPE requirements, lockout procedures"
                          />
                        </div>
                        
                        <div>
                          <label className="form-label text-black">
                            Access Requirements
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            value={formData.accessRequirements}
                            onChange={(e) => setFormData({ ...formData, accessRequirements: e.target.value })}
                            placeholder="Special access needs, keys, permits"
                          />
                        </div>
                        
                        <div>
                          <label className="form-label text-black">
                            Completion Criteria
                          </label>
                          <textarea
                            className="form-input"
                            rows={2}
                            value={formData.completionCriteria}
                            onChange={(e) => setFormData({ ...formData, completionCriteria: e.target.value })}
                            placeholder="How to verify work is complete and successful"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full sm:w-auto sm:ml-3"
                  >
                    {loading ? (
                      <>
                        <div className="spinner mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      'Create Request'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-outline w-full sm:w-auto mt-3 sm:mt-0"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detailed maintenance information modal */}
      {showDetailModal && selectedMaintenance && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDetailModal(false)}></div>
            
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
                        <span className={getPriorityBadge(selectedMaintenance.priority)}>
                          {capitalizePriority(selectedMaintenance.priority)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Key Information Section - Highlighted */}
                     <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                       <h4 className="text-lg font-semibold text-blue-900 mb-4">Key Maintenance Information</h4>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div>
                           <label className="text-sm font-medium text-blue-700">System Name</label>
                           <p className="text-sm font-semibold text-gray-900">{selectedMaintenance.system || 'N/A'}</p>
                         </div>
                         <div>
                           <label className="text-sm font-medium text-blue-700">Maintenance Type</label>
                           <p className="text-sm font-semibold text-gray-900">{selectedMaintenance.maintenance_type || 'N/A'}</p>
                         </div>
                         <div>
                           <label className="text-sm font-medium text-blue-700">System Type</label>
                           <p className="text-sm font-semibold text-gray-900">{selectedMaintenance.system_type || 'N/A'}</p>
                         </div>
                         <div>
                           <label className="text-sm font-medium text-blue-700">Location</label>
                           <p className="text-sm font-semibold text-gray-900">{selectedMaintenance.location || 'N/A'}</p>
                         </div>
                         <div>
                           <label className="text-sm font-medium text-blue-700">Last Maintenance</label>
                           <p className="text-sm font-semibold text-gray-900">{selectedMaintenance.last_maintenance ? formatDate(selectedMaintenance.last_maintenance) : 'N/A'}</p>
                         </div>
                         <div>
                           <label className="text-sm font-medium text-blue-700">Next Maintenance</label>
                           <p className="text-sm font-semibold text-gray-900">{selectedMaintenance.next_maintenance ? formatDate(selectedMaintenance.next_maintenance) : 'N/A'}</p>
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
                             <p className="text-sm text-gray-900">{selectedMaintenance.equipment_condition || 'N/A'}</p>
                           </div>
                           <div>
                             <label className="text-sm font-medium text-gray-700">Maintenance Cycle</label>
                             <p className="text-sm text-gray-900">{selectedMaintenance.cycle_type || 'N/A'}</p>
                           </div>
                           <div>
                             <label className="text-sm font-medium text-gray-700">Cost</label>
                             <p className="text-sm text-gray-900">{selectedMaintenance.cost || 'N/A'}</p>
                           </div>
                         </div>
                       </div>

                       {/* Maintenance Details */}
                       <div className="space-y-4">
                         <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Maintenance Details</h4>
                         <div className="space-y-3">
                           <div>
                             <label className="text-sm font-medium text-gray-700">Urgency Level</label>
                             <p className="text-sm text-gray-900">{selectedMaintenance.urgency_level || 'N/A'}</p>
                           </div>
                           <div>
                             <label className="text-sm font-medium text-gray-700">Estimated Duration</label>
                             <p className="text-sm text-gray-900">{selectedMaintenance.estimated_duration || 'N/A'}</p>
                           </div>
                           <div>
                             <label className="text-sm font-medium text-gray-700">Assigned Technician</label>
                             <p className="text-sm text-gray-900">{selectedMaintenance.assigned_technician || 'N/A'}</p>
                           </div>
                         </div>
                       </div>

                      {/* Work Description */}
                      <div className="md:col-span-2 space-y-4">
                        <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Work Description</h4>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                          {selectedMaintenance.work_description || selectedMaintenance.notes || 'No description available'}
                        </p>
                      </div>

                      {/* Company Information */}
                      <div className="space-y-4">
                        <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Company Information</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Company Name</label>
                            <p className="text-sm text-gray-900">{selectedMaintenance.company_name || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Contact Person</label>
                            <p className="text-sm text-gray-900">{selectedMaintenance.company_contact || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Phone</label>
                            <p className="text-sm text-gray-900">{selectedMaintenance.company_phone || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <p className="text-sm text-gray-900">{selectedMaintenance.company_email || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Safety & Requirements */}
                      <div className="md:col-span-2 space-y-4">
                        <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Safety & Requirements</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Required Parts/Materials</label>
                            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                              {selectedMaintenance.required_parts || 'None specified'}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Access Requirements</label>
                            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                              {selectedMaintenance.access_requirements || 'None specified'}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Safety Requirements</label>
                            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                              {selectedMaintenance.safety_requirements || 'None specified'}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Completion Criteria</label>
                            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                              {selectedMaintenance.completion_criteria || 'None specified'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Standards & Timestamps */}
                      <div className="md:col-span-2 space-y-4">
                        <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Additional Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Norms/Standards</label>
                            <p className="text-sm text-gray-900">{selectedMaintenance.norms || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Created</label>
                            <p className="text-sm text-gray-900">{selectedMaintenance.created_at ? formatDate(selectedMaintenance.created_at) : 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Last Updated</label>
                            <p className="text-sm text-gray-900">{selectedMaintenance.updated_at ? formatDate(selectedMaintenance.updated_at) : 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="btn btn-primary w-full sm:w-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;