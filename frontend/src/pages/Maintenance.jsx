import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import { useApi } from '../contexts/ApiContext';
import MaintenanceCard from '../components/MaintenanceCard';
import MaintenanceStats from '../components/MaintenanceStats';
import MaintenanceFilters from '../components/MaintenanceFilters';
import MaintenanceForm from '../components/MaintenanceForm';
import MaintenanceDetailModal from '../components/MaintenanceDetailModal';

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
  const [filteredMaintenance, setFilteredMaintenance] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [filter, setFilter] = useState('all');
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

  // Initialize filtered maintenance with all maintenance data
  useEffect(() => {
    setFilteredMaintenance(maintenance);
  }, [maintenance]);

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

  const handleMaintenanceCreated = (newMaintenance) => {
    setMaintenance([...maintenance, newMaintenance]);
    setShowCreateModal(false);
  };

  const handleFilteredMaintenance = (filtered) => {
    setFilteredMaintenance(filtered);
  };

  const handleViewDetails = (maintenanceItem) => {
    setSelectedMaintenance(maintenanceItem);
    setShowDetailModal(true);
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

      {/* Statistics */}
      <MaintenanceStats maintenance={maintenance} />

      {/* Filters */}
      <MaintenanceFilters
        maintenance={maintenance}
        onFilteredMaintenance={handleFilteredMaintenance}
      />

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
            <MaintenanceCard
              key={item.id}
              maintenance={item}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <WrenchScrewdriverIcon className="empty-state-icon" />
          <h3 className="empty-state-title">No maintenance requests found</h3>
          <p className="empty-state-description">
            No maintenance requests match your current filters. Try adjusting your search criteria.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary mt-4"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Request
          </button>
        </div>
      )}


      {/* Create maintenance request modal */}
      {showCreateModal && (
        <MaintenanceForm
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onMaintenanceCreated={handleMaintenanceCreated}
          facilities={facilities}
        />
      )}

      {/* Maintenance detail modal */}
      {showDetailModal && selectedMaintenance && (
        <MaintenanceDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          maintenance={selectedMaintenance}
        />
      )}

    </div>
  );
};

export default Maintenance;