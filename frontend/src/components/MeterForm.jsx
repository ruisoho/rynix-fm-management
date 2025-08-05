import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const MeterForm = ({
  isOpen,
  onClose,
  meterType,
  isEditing,
  formData,
  onFormDataChange,
  facilities,
  onSubmit,
  loading
}) => {
  if (!isOpen) return null;

  const getModalTitle = () => {
    const action = isEditing ? 'Edit' : 'Create';
    const type = meterType.charAt(0).toUpperCase() + meterType.slice(1);
    return `${action} ${type} Meter`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const renderFormFields = () => {
    switch (meterType) {
      case 'electric':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Serial Number *
              </label>
              <input
                type="text"
                value={formData.serial_number || ''}
                onChange={(e) => onFormDataChange('serial_number', e.target.value)}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => onFormDataChange('location', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Installation Date
              </label>
              <input
                type="date"
                value={formData.installation_date || ''}
                onChange={(e) => onFormDataChange('installation_date', e.target.value)}
                className="input"
              />
            </div>
          </>
        );
      
      case 'gas':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Serial Number *
              </label>
              <input
                type="text"
                value={formData.serial_number || ''}
                onChange={(e) => onFormDataChange('serial_number', e.target.value)}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => onFormDataChange('location', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gas Type
              </label>
              <select
                value={formData.gas_type || ''}
                onChange={(e) => onFormDataChange('gas_type', e.target.value)}
                className="input"
              >
                <option value="">Select gas type</option>
                <option value="natural">Natural Gas</option>
                <option value="propane">Propane</option>
                <option value="butane">Butane</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Installation Date
              </label>
              <input
                type="date"
                value={formData.installation_date || ''}
                onChange={(e) => onFormDataChange('installation_date', e.target.value)}
                className="input"
              />
            </div>
          </>
        );
      
      case 'heating':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Serial Number / Manufacturer
              </label>
              <input
                type="text"
                value={formData.serial_number || formData.manufacturer || ''}
                onChange={(e) => {
                  onFormDataChange('serial_number', e.target.value);
                  onFormDataChange('manufacturer', e.target.value);
                }}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location / Notes
              </label>
              <input
                type="text"
                value={formData.location || formData.notes || ''}
                onChange={(e) => {
                  onFormDataChange('location', e.target.value);
                  onFormDataChange('notes', e.target.value);
                }}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Installation Date
              </label>
              <input
                type="date"
                value={formData.installation_date || ''}
                onChange={(e) => onFormDataChange('installation_date', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last Check
              </label>
              <input
                type="date"
                value={formData.last_check || ''}
                onChange={(e) => onFormDataChange('last_check', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Next Check
              </label>
              <input
                type="date"
                value={formData.next_check || ''}
                onChange={(e) => onFormDataChange('next_check', e.target.value)}
                className="input"
              />
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {getModalTitle()}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {renderFormFields()}
            
            {/* Common fields for all meter types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status *
              </label>
              <select
                value={formData.status || 'active'}
                onChange={(e) => onFormDataChange('status', e.target.value)}
                className="input"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="broken">Broken</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Facility *
              </label>
              <select
                value={formData.facility_id || ''}
                onChange={(e) => onFormDataChange('facility_id', e.target.value)}
                className="input"
                required
              >
                <option value="">Select a facility</option>
                {facilities.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Meter' : 'Create Meter')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeterForm;