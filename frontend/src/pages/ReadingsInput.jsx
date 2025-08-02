import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  FireIcon,
  BoltIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useApi } from '../contexts/ApiContext';
import { format, isAfter, parseISO } from 'date-fns';

const ReadingsInput = () => {
  const { 
    getHeating, 
    getMeters, 
    getFacilities, 
    createHeating, 
    createMeter, 
    createMeterReading,
    loading, 
    error 
  } = useApi();
  
  const [heating, setHeating] = useState([]);
  const [meters, setMeters] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [activeTab, setActiveTab] = useState('heating');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReadingModal, setShowReadingModal] = useState(false);
  const [selectedMeter, setSelectedMeter] = useState(null);
  
  // Form states
  const [heatingFormData, setHeatingFormData] = useState({
    facility_id: '',
    type: '',
    model: '',
    manufacturer: '',
    installation_date: '',
    status: 'active',
    last_check: '',
    next_check: '',
    notes: ''
  });
  
  const [meterFormData, setMeterFormData] = useState({
    facility_id: '',
    serial_number: '',
    type: 'electric',
    location: '',
    installation_date: '',
    status: 'active'
  });
  
  const [readingData, setReadingData] = useState({
    value: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    try {
      const [heatingData, metersData, facilitiesData] = await Promise.all([
        getHeating(),
        getMeters(),
        getFacilities()
      ]);
      setHeating(Array.isArray(heatingData) ? heatingData : []);
      setMeters(Array.isArray(metersData) ? metersData : []);
      setFacilities(Array.isArray(facilitiesData) ? facilitiesData : []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setHeating([]);
      setMeters([]);
      setFacilities([]);
    }
  };

  // Heating functions
  const handleHeatingSubmit = async (e) => {
    e.preventDefault();
    try {
      await createHeating(heatingFormData);
      setShowCreateModal(false);
      setHeatingFormData({
        facility_id: '',
        type: '',
        model: '',
        manufacturer: '',
        installation_date: '',
        status: 'active',
        last_check: '',
        next_check: '',
        notes: ''
      });
      fetchData();
    } catch (err) {
      console.error('Failed to create heating meter:', err);
    }
  };

  // Meter functions
  const handleMeterSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMeter(meterFormData);
      setShowCreateModal(false);
      setMeterFormData({
        facility_id: '',
        serial_number: '',
        type: 'electric',
        location: '',
        installation_date: '',
        status: 'active'
      });
      fetchData();
    } catch (err) {
      console.error('Failed to create meter:', err);
    }
  };

  const handleReadingSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMeterReading(selectedMeter.id, readingData);
      setShowReadingModal(false);
      setReadingData({
        value: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      setSelectedMeter(null);
    } catch (err) {
      console.error('Failed to create meter reading:', err);
    }
  };

  const openReadingModal = (meter) => {
    setSelectedMeter(meter);
    setShowReadingModal(true);
  };

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const isMaintenanceDue = (nextCheckDate) => {
    if (!nextCheckDate) return false;
    try {
      return isAfter(new Date(), parseISO(nextCheckDate));
    } catch {
      return false;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Active' },
      inactive: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', label: 'Inactive' },
      maintenance: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', label: 'Maintenance' },
      error: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: 'Error' }
    };
    const config = statusConfig[status] || statusConfig.inactive;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <div className="w-2 h-2 bg-green-400 rounded-full"></div>;
      case 'maintenance':
        return <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>;
      case 'error':
        return <div className="w-2 h-2 bg-red-400 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
    }
  };

  // Filter data
  const safeHeating = Array.isArray(heating) ? heating : [];
  const safeMeters = Array.isArray(meters) ? meters : [];
  
  const filteredHeating = safeHeating.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'active') return item.status === 'active';
    if (filter === 'maintenance') return item.status === 'maintenance' || isMaintenanceDue(item.next_check);
    if (filter === 'inactive') return item.status === 'inactive';
    return true;
  });

  const filteredMeters = safeMeters.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'active') return item.status === 'active';
    if (filter === 'inactive') return item.status === 'inactive';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Readings Input
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage heating systems and electric meters data input
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add {activeTab === 'heating' ? 'Heating System' : 'Electric Meter'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('heating')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'heating'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <FireIcon className="h-5 w-5 inline mr-2" />
            Heating Systems
          </button>
          <button
            onClick={() => setActiveTab('meters')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'meters'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <BoltIcon className="h-5 w-5 inline mr-2" />
            Electric Meters
          </button>
        </nav>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="form-select"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="maintenance">Maintenance Due</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'heating' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHeating.map((item) => (
            <div key={item.id} className="card hover:shadow-lg transition-shadow">
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <FireIcon className="h-8 w-8 text-orange-500 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {item.type || 'Heating System'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.facility_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(item.status)}
                    {isMaintenanceDue(item.next_check) && (
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                    {getStatusBadge(item.status)}
                  </div>
                  
                  {item.model && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Model:</span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">{item.model}</span>
                    </div>
                  )}
                  
                  {item.manufacturer && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Manufacturer:</span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">{item.manufacturer}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Installation:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {formatDate(item.installation_date)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Last Check:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {formatDate(item.last_check)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Next Check:</span>
                    <span className={`text-sm ${
                      isMaintenanceDue(item.next_check) 
                        ? 'text-red-600 dark:text-red-400 font-medium' 
                        : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {formatDate(item.next_check)}
                    </span>
                  </div>
                </div>

                {item.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'meters' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeters.map((meter) => (
            <div key={meter.id} className="card hover:shadow-lg transition-shadow">
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <BoltIcon className="h-8 w-8 text-blue-500 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {meter.serial_number}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {meter.facility_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(meter.status)}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                    {getStatusBadge(meter.status)}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Type:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100 capitalize">{meter.type}</span>
                  </div>
                  
                  {meter.location && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Location:</span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">{meter.location}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Installation:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {formatDate(meter.installation_date)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => openReadingModal(meter)}
                    className="btn-secondary w-full flex items-center justify-center"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Reading
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md">
            <div className="modal-header">
              <h3 className="modal-title">
                Add New {activeTab === 'heating' ? 'Heating System' : 'Electric Meter'}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={activeTab === 'heating' ? handleHeatingSubmit : handleMeterSubmit}>
              <div className="modal-body space-y-4">
                <div>
                  <label className="form-label">Facility</label>
                  <select
                    value={activeTab === 'heating' ? heatingFormData.facility_id : meterFormData.facility_id}
                    onChange={(e) => {
                      if (activeTab === 'heating') {
                        setHeatingFormData({ ...heatingFormData, facility_id: e.target.value });
                      } else {
                        setMeterFormData({ ...meterFormData, facility_id: e.target.value });
                      }
                    }}
                    className="form-select"
                    required
                  >
                    <option value="">Select facility</option>
                    {facilities.map((facility) => (
                      <option key={facility.id} value={facility.id}>
                        {facility.name}
                      </option>
                    ))}
                  </select>
                </div>

                {activeTab === 'heating' ? (
                  <>
                    <div>
                      <label className="form-label">Type</label>
                      <input
                        type="text"
                        value={heatingFormData.type}
                        onChange={(e) => setHeatingFormData({ ...heatingFormData, type: e.target.value })}
                        className="form-input"
                        placeholder="e.g., Boiler, Heat Pump"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Model</label>
                      <input
                        type="text"
                        value={heatingFormData.model}
                        onChange={(e) => setHeatingFormData({ ...heatingFormData, model: e.target.value })}
                        className="form-input"
                        placeholder="Model number"
                      />
                    </div>
                    <div>
                      <label className="form-label">Manufacturer</label>
                      <input
                        type="text"
                        value={heatingFormData.manufacturer}
                        onChange={(e) => setHeatingFormData({ ...heatingFormData, manufacturer: e.target.value })}
                        className="form-input"
                        placeholder="Manufacturer name"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="form-label">Serial Number</label>
                      <input
                        type="text"
                        value={meterFormData.serial_number}
                        onChange={(e) => setMeterFormData({ ...meterFormData, serial_number: e.target.value })}
                        className="form-input"
                        placeholder="Meter serial number"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Type</label>
                      <select
                        value={meterFormData.type}
                        onChange={(e) => setMeterFormData({ ...meterFormData, type: e.target.value })}
                        className="form-select"
                      >
                        <option value="electric">Electric</option>
                        <option value="gas">Gas</option>
                        <option value="water">Water</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        value={meterFormData.location}
                        onChange={(e) => setMeterFormData({ ...meterFormData, location: e.target.value })}
                        className="form-input"
                        placeholder="Meter location"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="form-label">Installation Date</label>
                  <input
                    type="date"
                    value={activeTab === 'heating' ? heatingFormData.installation_date : meterFormData.installation_date}
                    onChange={(e) => {
                      if (activeTab === 'heating') {
                        setHeatingFormData({ ...heatingFormData, installation_date: e.target.value });
                      } else {
                        setMeterFormData({ ...meterFormData, installation_date: e.target.value });
                      }
                    }}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Status</label>
                  <select
                    value={activeTab === 'heating' ? heatingFormData.status : meterFormData.status}
                    onChange={(e) => {
                      if (activeTab === 'heating') {
                        setHeatingFormData({ ...heatingFormData, status: e.target.value });
                      } else {
                        setMeterFormData({ ...meterFormData, status: e.target.value });
                      }
                    }}
                    className="form-select"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                {activeTab === 'heating' && (
                  <>
                    <div>
                      <label className="form-label">Last Check Date</label>
                      <input
                        type="date"
                        value={heatingFormData.last_check}
                        onChange={(e) => setHeatingFormData({ ...heatingFormData, last_check: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="form-label">Next Check Date</label>
                      <input
                        type="date"
                        value={heatingFormData.next_check}
                        onChange={(e) => setHeatingFormData({ ...heatingFormData, next_check: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="form-label">Notes</label>
                      <textarea
                        value={heatingFormData.notes}
                        onChange={(e) => setHeatingFormData({ ...heatingFormData, notes: e.target.value })}
                        className="form-textarea"
                        rows={3}
                        placeholder="Additional notes..."
                      />
                    </div>
                  </>
                )}
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reading Modal */}
      {showReadingModal && selectedMeter && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md">
            <div className="modal-header">
              <h3 className="modal-title">
                Add Reading - {selectedMeter.serial_number}
              </h3>
              <button
                onClick={() => setShowReadingModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleReadingSubmit}>
              <div className="modal-body space-y-4">
                <div>
                  <label className="form-label">Reading Value</label>
                  <input
                    type="number"
                    step="0.01"
                    value={readingData.value}
                    onChange={(e) => setReadingData({ ...readingData, value: e.target.value })}
                    className="form-input"
                    placeholder="Enter meter reading"
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">Reading Date</label>
                  <input
                    type="date"
                    value={readingData.date}
                    onChange={(e) => setReadingData({ ...readingData, date: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">Notes (Optional)</label>
                  <textarea
                    value={readingData.notes}
                    onChange={(e) => setReadingData({ ...readingData, notes: e.target.value })}
                    className="form-textarea"
                    rows={3}
                    placeholder="Additional notes about this reading..."
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowReadingModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Reading'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loading and Error States */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error loading data
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingsInput;