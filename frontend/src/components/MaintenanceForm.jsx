import React, { useState, useEffect } from 'react';
import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

const MaintenanceForm = ({ isOpen, onClose, onSubmit, loading, initialData = null }) => {
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
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
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

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        lastMaintenance: initialData.lastMaintenance || new Date()
      });
    }
  }, [initialData]);

  const calculateNextMaintenance = (lastMaintenance, cycleType, customDays) => {
    const lastDate = new Date(lastMaintenance);
    let daysToAdd = 30;
    
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

  const getNextMaintenanceDate = () => {
    return calculateNextMaintenance(
      formData.lastMaintenance,
      formData.cycle.type,
      formData.cycle.customDays
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const resetForm = () => {
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
      priority: 'medium',
      cost: '',
      location: '',
      notes: '',
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
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 sm:mx-0 sm:h-10 sm:w-10">
                  <WrenchScrewdriverIcon className="h-6 w-6 text-primary-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:mr-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-black">
                    {initialData ? 'Edit Maintenance Request' : 'New Maintenance Request'}
                  </h3>
                  <div className="mt-4 space-y-4 max-h-96 overflow-y-auto">
                    {/* Basic Information */}
                    <div>
                      <label className="form-label text-black">System Name *</label>
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
                      <label className="form-label text-black">System Type *</label>
                      <select
                        required
                        className="form-input"
                        value={formData.systemType}
                        onChange={(e) => setFormData({ ...formData, systemType: e.target.value })}
                      >
                        {systemTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="form-label text-black">Location</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="System location"
                      />
                    </div>
                    
                    {/* Maintenance Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label text-black">Maintenance Cycle *</label>
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
                            <option key={cycle.value} value={cycle.value}>{cycle.label}</option>
                          ))}
                        </select>
                      </div>
                      
                      {formData.cycle.type === 'custom' && (
                        <div>
                          <label className="form-label text-black">Custom Days</label>
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
                    </div>
                    
                    {/* Priority and Type */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label text-black">Priority *</label>
                        <select
                          required
                          className="form-input"
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        >
                          {priorities.map((priority) => (
                            <option key={priority.value} value={priority.value}>{priority.label}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="form-label text-black">Maintenance Type *</label>
                        <select
                          required
                          className="form-input"
                          value={formData.maintenanceType}
                          onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value })}
                        >
                          {maintenanceTypes.map((type) => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    {/* Work Description */}
                    <div>
                      <label className="form-label text-black">Work Description *</label>
                      <textarea
                        required
                        className="form-input"
                        rows={3}
                        value={formData.workDescription}
                        onChange={(e) => setFormData({ ...formData, workDescription: e.target.value })}
                        placeholder="Detailed description of work to be performed"
                      />
                    </div>
                    
                    {/* Cost and Duration */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label text-black">Cost</label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.cost}
                          onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                          placeholder="Maintenance cost"
                        />
                      </div>
                      
                      <div>
                        <label className="form-label text-black">Estimated Duration</label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.estimatedDuration}
                          onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                          placeholder="e.g., 2 hours, 1 day"
                        />
                      </div>
                    </div>
                    
                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label text-black">Last Maintenance</label>
                        <input
                          type="date"
                          className="form-input"
                          value={formData.lastMaintenance.toISOString().split('T')[0]}
                          onChange={(e) => setFormData({ ...formData, lastMaintenance: new Date(e.target.value) })}
                        />
                      </div>
                      
                      <div>
                        <label className="form-label text-black">Next Maintenance</label>
                        <input
                          type="date"
                          className="form-input bg-gray-100"
                          value={getNextMaintenanceDate().toISOString().split('T')[0]}
                          readOnly
                          disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Automatically calculated
                        </p>
                      </div>
                    </div>
                    
                    {/* Additional Notes */}
                    <div>
                      <label className="form-label text-black">Notes</label>
                      <textarea
                        className="form-input"
                        rows={2}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Additional notes or comments"
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
                    {initialData ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  initialData ? 'Update Request' : 'Create Request'
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="btn-outline w-full sm:w-auto mt-3 sm:mt-0"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceForm;