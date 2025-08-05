import React, { useState, useEffect, useCallback } from 'react';
import {
  PlusIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  BoltIcon,
  FireIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { format, isAfter, parseISO } from 'date-fns';
import { useApi } from '../contexts/ApiContext';
import MeterTabs from '../components/MeterTabs';
import MeterFilters from '../components/MeterFilters';
import MeterList from '../components/MeterList';
import MeterForm from '../components/MeterForm';
import MeterReadings from '../components/MeterReadings';

const Meters = () => {
  const { 
    getMeters, 
    getHeating, 
    getFacilities, 
    createMeter, 
    createHeating,
    updateMeter,
    updateHeating,
    getMeterReadings, 
    createMeterReading, 
    getHeatingReadings,
    createHeatingReading,
    deleteMeter,
    deleteHeating,
    loading, 
    error 
  } = useApi();
  
  const [electricMeters, setElectricMeters] = useState([]);
  const [gasMeters, setGasMeters] = useState([]);
  const [heatingMeters, setHeatingMeters] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [activeTab, setActiveTab] = useState('electric');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReadingModal, setShowReadingModal] = useState(false);
  const [showReadingsModal, setShowReadingsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingMeter, setEditingMeter] = useState(null);
  const [selectedMeter, setSelectedMeter] = useState(null);
  const [readings, setReadings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // CSV Upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadResults, setUploadResults] = useState(null);
  
  // Drag and drop state
  const [draggedMeter, setDraggedMeter] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [meterOrder, setMeterOrder] = useState({});
  
  // Form data for different meter types
  const [electricFormData, setElectricFormData] = useState({
    facility_id: '',
    serial_number: '',
    type: 'electric',
    location: '',
    installation_date: '',
    status: 'active'
  });
  
  const [gasFormData, setGasFormData] = useState({
    facility_id: '',
    serial_number: '',
    type: 'gas',
    location: '',
    installation_date: '',
    status: 'active',
    gas_type: 'natural'
  });
  
  const [heatingFormData, setHeatingFormData] = useState({
    facility_id: '',
    serial_number: '',
    type: 'heating',
    location: '',
    installation_date: '',
    status: 'active',
    heating_type: 'boiler'
  });
  
  const [readingData, setReadingData] = useState({
    value: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Unified form data state
  const [formData, setFormData] = useState({});

  // Form data handler
  const handleFormDataChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Reading form data
  const [readingFormData, setReadingFormData] = useState({
    reading_value: '',
    reading_date: new Date().toISOString().slice(0, 16),
    notes: ''
  });

  const handleReadingFormChange = (field, value) => {
    setReadingFormData(prev => ({ ...prev, [field]: value }));
  };

  const fetchData = useCallback(async () => {
    try {
      const [metersData, heatingData, facilitiesData] = await Promise.all([
        getMeters(),
        getHeating(),
        getFacilities()
      ]);
      
      // Debug: Log raw API data
      console.log('Raw API data:', { metersData, heatingData, facilitiesData });
      
      // Separate meters by type
      const allMeters = Array.isArray(metersData) ? metersData : [];
      const electricFiltered = allMeters.filter(meter => meter.type === 'electric');
      const gasFiltered = allMeters.filter(meter => meter.type === 'gas');
      const heatingFiltered = Array.isArray(heatingData) ? heatingData : [];
      
      console.log('Filtered meters:', { electricFiltered, gasFiltered, heatingFiltered });
      
      setElectricMeters(electricFiltered);
      setGasMeters(gasFiltered);
      setHeatingMeters(heatingFiltered);
      setFacilities(Array.isArray(facilitiesData) ? facilitiesData : []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setElectricMeters([]);
      setGasMeters([]);
      setHeatingMeters([]);
      setFacilities([]);
    }
  }, [getMeters, getHeating, getFacilities]);
  
  useEffect(() => {
    fetchData();
    
    // Load saved meter order from localStorage
    const savedOrder = localStorage.getItem('meterOrder');
    if (savedOrder) {
      try {
        setMeterOrder(JSON.parse(savedOrder));
      } catch (err) {
        console.error('Failed to parse saved meter order:', err);
      }
    }
  }, [fetchData]);
  
  // Add a separate effect to ensure data is loaded
  useEffect(() => {
    if (electricMeters.length === 0 && gasMeters.length === 0 && heatingMeters.length === 0) {
      console.log('No meters loaded, retrying...');
      fetchData();
    }
  }, [electricMeters, gasMeters, heatingMeters, fetchData]);
  
  // Force refresh heating data when switching to heating tab
  useEffect(() => {
    if (activeTab === 'heating' && heatingMeters.length === 0) {
      console.log('Heating tab selected but no heating meters, refreshing...');
      fetchData();
    }
  }, [activeTab, heatingMeters.length, fetchData]);

  const handleElectricSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMeter(electricFormData);
      setShowCreateModal(false);
      setElectricFormData({
        facility_id: '',
        serial_number: '',
        type: 'electric',
        location: '',
        installation_date: '',
        status: 'active'
      });
      fetchData();
    } catch (err) {
      console.error('Failed to create electric meter:', err);
    }
  };

  const handleGasSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMeter(gasFormData);
      setShowCreateModal(false);
      setGasFormData({
        facility_id: '',
        serial_number: '',
        type: 'gas',
        location: '',
        installation_date: '',
        status: 'active',
        gas_type: 'natural'
      });
      fetchData();
    } catch (err) {
      console.error('Failed to create gas meter:', err);
    }
  };

  const handleHeatingSubmit = async (e) => {
    e.preventDefault();
    try {
      await createHeating(heatingFormData);
      setShowCreateModal(false);
      setHeatingFormData({
        facility_id: '',
        serial_number: '',
        type: 'heating',
        location: '',
        installation_date: '',
        status: 'active',
        heating_type: 'boiler'
      });
      fetchData();
    } catch (err) {
      console.error('Failed to create heating system:', err);
    }
  };

  const handleReadingSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'heating') {
        await createHeatingReading(selectedMeter.id, readingData);
      } else {
        await createMeterReading(selectedMeter.id, readingData);
      }
      setShowReadingModal(false);
      setReadingData({
        value: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      setSelectedMeter(null);
    } catch (err) {
      console.error('Failed to create reading:', err);
    }
  };

  const handleViewReadings = async (meter) => {
    try {
      let readingsData;
      if (activeTab === 'heating') {
        readingsData = await getHeatingReadings(meter.id);
      } else {
        readingsData = await getMeterReadings(meter.id);
      }
      setReadings(Array.isArray(readingsData) ? readingsData : []);
      setSelectedMeter(meter);
      setShowReadingsModal(true);
    } catch (err) {
      console.error('Failed to fetch readings:', err);
      setReadings([]);
    }
  };

  const handleDelete = async () => {
    try {
      if (activeTab === 'heating') {
        await deleteHeating(selectedMeter.id);
      } else {
        await deleteMeter(selectedMeter.id);
      }
      setShowDeleteModal(false);
      setSelectedMeter(null);
      fetchData();
    } catch (err) {
      console.error('Failed to delete meter:', err);
    }
  };

  // CSV Upload handlers
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      setUploadFile(file);
      setUploadStatus('');
      setUploadResults(null);
    } else {
      setUploadStatus('Please select a valid CSV file.');
    }
  };

  const handleCSVUpload = async () => {
    if (!uploadFile) {
      setUploadStatus('Please select a CSV file first.');
      return;
    }

    setUploadProgress(0);
    setUploadStatus('Processing CSV file...');

    try {
      const formData = new FormData();
      formData.append('csvFile', uploadFile);

      const response = await fetch('/api/meters/upload-csv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      setUploadResults(result);
      setUploadStatus('Upload completed successfully!');
      setUploadProgress(100);
      
      // Refresh the meters list
      fetchData();
      
    } catch (error) {
      console.error('CSV upload error:', error);
      setUploadStatus(`Upload failed: ${error.message}`);
      setUploadProgress(0);
    }
  };

  const resetUploadModal = () => {
    setUploadFile(null);
    setUploadProgress(0);
    setUploadStatus('');
    setUploadResults(null);
    setShowUploadModal(false);
  };

  const handleEdit = (meter) => {
    setEditingMeter(meter);
    
    // Populate form data based on meter type
    if (activeTab === 'electric') {
      setElectricFormData({
        facility_id: meter.facility_id || '',
        serial_number: meter.serial_number || '',
        type: meter.type || 'electric',
        location: meter.location || '',
        installation_date: meter.installation_date || '',
        status: meter.status || 'active'
      });
    } else if (activeTab === 'gas') {
      setGasFormData({
        facility_id: meter.facility_id || '',
        serial_number: meter.serial_number || '',
        type: meter.type || 'gas',
        location: meter.location || '',
        installation_date: meter.installation_date || '',
        status: meter.status || 'active',
        gas_type: meter.gas_type || 'natural'
      });
    } else if (activeTab === 'heating') {
      setHeatingFormData({
        facility_id: meter.facility_id || '',
        serial_number: meter.manufacturer || '',
        type: meter.type || 'heating',
        location: meter.notes || '',
        installation_date: meter.installation_date || '',
        status: meter.status || 'active',
        heating_type: meter.model || 'boiler'
      });
    }
    
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'electric') {
        await updateMeter(editingMeter.id, electricFormData);
      } else if (activeTab === 'gas') {
        await updateMeter(editingMeter.id, gasFormData);
      } else if (activeTab === 'heating') {
        await updateHeating(editingMeter.id, heatingFormData);
      }
      
      setShowEditModal(false);
      setEditingMeter(null);
      fetchData();
      
      // If readings modal is open and showing the edited meter, refresh its data
      if (showReadingsModal && selectedMeter && selectedMeter.id === editingMeter.id) {
        try {
          let readingsData;
          if (activeTab === 'heating') {
            readingsData = await getHeatingReadings(selectedMeter.id);
          } else {
            readingsData = await getMeterReadings(selectedMeter.id);
          }
          setReadings(Array.isArray(readingsData) ? readingsData : []);
          
          // Update the selectedMeter with the edited data to reflect changes in modal
          const updatedMeter = {
            ...selectedMeter,
            ...(activeTab === 'electric' ? electricFormData : 
                activeTab === 'gas' ? gasFormData : heatingFormData)
          };
          setSelectedMeter(updatedMeter);
        } catch (err) {
          console.error('Failed to refresh readings after edit:', err);
        }
      }
    } catch (err) {
      console.error('Failed to update meter:', err);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
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
    const statusClasses = {
      active: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      inactive: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      broken: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      maintenance: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    };
    return statusClasses[status] || 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  };

  const getCurrentMeters = () => {
    switch (activeTab) {
      case 'electric':
        return electricMeters;
      case 'gas':
        return gasMeters;
      case 'heating':
        return heatingMeters;
      default:
        return [];
    }
  };

  const getFilteredMeters = () => {
    const currentMeters = getCurrentMeters();
    const filtered = filter === 'all' ? currentMeters : currentMeters.filter(meter => meter.status === filter);
    
    // Apply custom ordering if exists
    const orderKey = `${activeTab}_${filter}`;
    if (meterOrder[orderKey]) {
      return filtered.sort((a, b) => {
        const aIndex = meterOrder[orderKey].indexOf(a.id);
        const bIndex = meterOrder[orderKey].indexOf(b.id);
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
    }
    
    return filtered;
  };

  const getStatusCounts = () => {
    const currentMeters = getCurrentMeters();
    return {
      all: currentMeters.length,
      active: currentMeters.filter(meter => meter.status === 'active').length,
      inactive: currentMeters.filter(meter => meter.status === 'inactive').length,
      broken: currentMeters.filter(meter => meter.status === 'broken').length,
      maintenance: currentMeters.filter(meter => meter.status === 'maintenance').length
    };
  };

  // Drag and drop handlers
  const handleDragStart = (e, meter, index) => {
    setDraggedMeter({ meter, index });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedMeter(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (!draggedMeter || draggedMeter.index === dropIndex) {
      setDragOverIndex(null);
      return;
    }

    const filteredMeters = getFilteredMeters();
    const newOrder = [...filteredMeters];
    const [draggedItem] = newOrder.splice(draggedMeter.index, 1);
    newOrder.splice(dropIndex, 0, draggedItem);

    // Save the new order
    const orderKey = `${activeTab}_${filter}`;
    const newMeterOrder = {
      ...meterOrder,
      [orderKey]: newOrder.map(meter => meter.id)
    };
    
    setMeterOrder(newMeterOrder);
    
    // Save to localStorage for persistence
    localStorage.setItem('meterOrder', JSON.stringify(newMeterOrder));
    
    setDragOverIndex(null);
  };

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

  const getTabLabel = (tab) => {
    switch (tab) {
      case 'electric':
        return 'Electric Meters';
      case 'gas':
        return 'Natural Gas';
      case 'heating':
        return 'Heating Meters';
      default:
        return 'Electric Meters';
    }
  };

  const statusCounts = getStatusCounts();
  const filteredMeters = getFilteredMeters();
  
  // Debug: Log meter data
  console.log('Debug - Current meters data:', {
    activeTab,
    electricMeters: electricMeters.length,
    gasMeters: gasMeters.length, 
    heatingMeters: heatingMeters.length,
    filteredMeters: filteredMeters.length,
    filter,
    loading
  });
  
  // Temporary alert for debugging
  if (filteredMeters.length === 0 && !loading) {
    console.warn('No filtered meters found!', {
      electricMeters,
      gasMeters,
      heatingMeters,
      activeTab,
      filter
    });
    // Show alert for debugging
    alert(`Debug: No meters showing. Electric: ${electricMeters.length}, Gas: ${gasMeters.length}, Heating: ${heatingMeters.length}, Active Tab: ${activeTab}, Filter: ${filter}`);
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Meter Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage electric, gas, and heating systems across all facilities
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn btn-outline"
            disabled={activeTab !== 'electric'}
            title={activeTab !== 'electric' ? 'CSV upload is only available for electric meters' : 'Upload CSV data'}
          >
            <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
            Upload CSV
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add {getTabLabel(activeTab).slice(0, -1)}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      


      {/* Meter type tabs */}
      <MeterTabs
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setFilter('all');
        }}
        electricMeters={electricMeters}
        gasMeters={gasMeters}
        heatingMeters={heatingMeters}
      />

      {/* Status filter tabs */}
      <MeterFilters
        statusFilter={filter}
        onStatusFilterChange={setFilter}
        meters={getCurrentMeters()}
      />

      {/* Meters List */}
      <MeterList
        meters={filteredMeters}
        activeTab={activeTab}
        statusFilter={filter}
        loading={loading}
        onViewReadings={handleViewReadings}
        onAddReading={(meter) => {
          setSelectedMeter(meter);
          setShowReadingModal(true);
        }}
        onEdit={handleEdit}
        onDelete={(meter) => {
          setSelectedMeter(meter);
          setShowDeleteModal(true);
        }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        draggedMeter={draggedMeter}
        dragOverIndex={dragOverIndex}
      />

      {/* Create/Edit Modal */}
      <MeterForm
        isOpen={showCreateModal || showEditModal}
        onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          setEditingMeter(null);
        }}
        meterType={activeTab}
        isEditing={showEditModal}
        editingMeter={editingMeter}
        formData={formData}
        onFormDataChange={handleFormDataChange}
        facilities={facilities}
        onSubmit={showEditModal ? handleEditSubmit : (activeTab === 'electric' ? handleElectricSubmit : activeTab === 'gas' ? handleGasSubmit : handleHeatingSubmit)}
      />

      {/* Edit Modal */}
      {showEditModal && editingMeter && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Edit {getTabLabel(activeTab).slice(0, -1)}</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingMeter(null);
                }}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <MeterForm
              type={activeTab}
              facilities={facilities}
              onSubmit={handleEditSubmit}
              onCancel={() => {
                setShowEditModal(false);
                setEditingMeter(null);
              }}
              initialData={editingMeter}
              isEdit={true}
            />
            

            

          </div>
        </div>
      )}

      {/* Reading Modal */}
      {showReadingModal && selectedMeter && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Add Reading - {selectedMeter.serial_number}</h3>
              <button
                onClick={() => {
                  setShowReadingModal(false);
                  setSelectedMeter(null);
                }}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleReadingSubmit}>
              <div className="modal-body">
                <div className="form-group">
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
                
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    value={readingData.date}
                    onChange={(e) => setReadingData({ ...readingData, date: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    value={readingData.notes}
                    onChange={(e) => setReadingData({ ...readingData, notes: e.target.value })}
                    className="form-input"
                    rows="3"
                    placeholder="Optional notes about this reading"
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setShowReadingModal(false);
                    setSelectedMeter(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Reading
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Readings History Modal */}
      {showReadingsModal && selectedMeter && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h3 className="modal-title">Reading History - {selectedMeter.serial_number}</h3>
              <button
                onClick={() => {
                  setShowReadingsModal(false);
                  setSelectedMeter(null);
                  setReadings([]);
                }}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {readings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Reading</th>
                        <th>Usage</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {readings.map((reading, index) => {
                        const previousReading = readings[index + 1];
                        const usage = previousReading 
                          ? (parseFloat(reading.value) - parseFloat(previousReading.value)).toFixed(2)
                          : '-';
                        
                        return (
                          <tr key={reading.id}>
                            <td>{formatDate(reading.date)}</td>
                            <td>{reading.value}</td>
                            <td>{usage}</td>
                            <td>{reading.notes || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <ChartBarIcon className="empty-state-icon" />
                  <h3 className="empty-state-title">No readings found</h3>
                  <p className="empty-state-description">
                    Add your first reading to start tracking usage.
                  </p>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => {
                  setShowReadingsModal(false);
                  setSelectedMeter(null);
                  setReadings([]);
                }}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedMeter && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Delete {getTabLabel(activeTab).slice(0, -1)}</h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedMeter(null);
                }}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to delete this {getTabLabel(activeTab).toLowerCase().slice(0, -1)}? 
                {activeTab !== 'heating' && ' All associated readings will also be deleted.'} 
                This action cannot be undone.
              </p>
              
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center">
                  {React.createElement(getTabIcon(activeTab), { className: "h-5 w-5 text-gray-500 mr-2" })}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {activeTab === 'heating' ? `${selectedMeter.type} ${selectedMeter.model}` : `Meter ${selectedMeter.serial_number}`}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedMeter.facility_name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedMeter(null);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-danger"
              >
                Delete {getTabLabel(activeTab).slice(0, -1)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl">
            <div className="modal-header">
              <h3 className="modal-title">Upload CSV Data</h3>
              <button
                onClick={resetUploadModal}
                className="modal-close"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="modal-body space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start">
                  <DocumentTextIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                      CSV Format Requirements
                    </h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• First row should contain headers</li>
                      <li>• Required columns: Meter Name/Serial, Date, Reading Value</li>
                      <li>• Date format: DD.MM.YYYY or MM/DD/YYYY or YYYY-MM-DD</li>
                      <li>• Meter names should contain serial numbers</li>
                      <li>• Only electric meter data is supported</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select CSV File
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                  <div className="space-y-1 text-center">
                    <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <label className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleFileSelect}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      CSV files only
                    </p>
                  </div>
                </div>
                {uploadFile && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Selected: {uploadFile.name}
                  </p>
                )}
              </div>

              {/* Progress Bar */}
              {uploadProgress > 0 && (
                <div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Upload Progress</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Status Message */}
              {uploadStatus && (
                <div className={`p-3 rounded-md ${
                  uploadStatus.includes('failed') || uploadStatus.includes('error')
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                    : uploadStatus.includes('successfully')
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                    : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                }`}>
                  <p className="text-sm">{uploadStatus}</p>
                </div>
              )}

              {/* Upload Results */}
              {uploadResults && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Upload Summary
                  </h4>
                  
                  {/* Debug Information */}
                  {uploadResults.debugInfo && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h5 className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-2">Debug Information</h5>
                      <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                        <div>Delimiter: {uploadResults.debugInfo.delimiter === ',' ? 'Comma' : uploadResults.debugInfo.delimiter === ';' ? 'Semicolon' : 'Tab'}</div>
                        <div>Headers ({uploadResults.debugInfo.headers?.length || 0}): {uploadResults.debugInfo.headers?.slice(0, 5).join(', ')}{uploadResults.debugInfo.headers?.length > 5 ? '...' : ''}</div>
                        <div>Total Rows: {uploadResults.debugInfo.totalRows}</div>
                        {uploadResults.debugInfo.firstDataRow && (
                          <div>First Row ({uploadResults.debugInfo.firstDataRow.length} columns): {uploadResults.debugInfo.firstDataRow.slice(0, 3).join(', ')}{uploadResults.debugInfo.firstDataRow.length > 3 ? '...' : ''}</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Meters Created:</span>
                      <span className="ml-2 font-medium text-green-600 dark:text-green-400">
                        {uploadResults.metersCreated || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Readings Added:</span>
                      <span className="ml-2 font-medium text-blue-600 dark:text-blue-400">
                        {uploadResults.readingsAdded || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Readings Updated:</span>
                      <span className="ml-2 font-medium text-yellow-600 dark:text-yellow-400">
                        {uploadResults.readingsUpdated || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Errors:</span>
                      <span className="ml-2 font-medium text-red-600 dark:text-red-400">
                        {uploadResults.errors || 0}
                      </span>
                    </div>
                  </div>
                  {uploadResults.errorMessages && uploadResults.errorMessages.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Errors:</p>
                      <ul className="text-xs text-red-500 dark:text-red-400 space-y-1 max-h-32 overflow-y-auto">
                        {uploadResults.errorMessages.slice(0, 10).map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                        {uploadResults.errorMessages.length > 10 && (
                          <li>• ... and {uploadResults.errorMessages.length - 10} more errors</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button
                onClick={resetUploadModal}
                className="btn btn-secondary"
              >
                {uploadResults ? 'Close' : 'Cancel'}
              </button>
              {!uploadResults && (
                <button
                  onClick={handleCSVUpload}
                  disabled={!uploadFile || uploadProgress > 0}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadProgress > 0 ? 'Uploading...' : 'Upload CSV'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Meters;