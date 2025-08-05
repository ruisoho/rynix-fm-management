import React from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';

const MeterReadings = ({
  isOpen,
  onClose,
  selectedMeter,
  readings,
  loading,
  showAddReadingModal,
  onShowAddReading,
  onCloseAddReading,
  readingFormData,
  onReadingFormChange,
  onSubmitReading,
  submittingReading
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid date';
    }
  };

  const handleSubmitReading = (e) => {
    e.preventDefault();
    onSubmitReading();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Meter Readings - {selectedMeter?.serial_number || selectedMeter?.location || 'Unknown Meter'}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={onShowAddReading}
              className="btn-primary flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Reading
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
                    </div>
                    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : readings.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                No readings found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Add the first reading for this meter.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {readings.map((reading, index) => (
                <div key={reading.id || index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Reading: {reading.reading_value || reading.value || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(reading.reading_date || reading.date)}
                          </p>
                        </div>
                        {reading.notes && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Notes: {reading.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    {index === 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Latest
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Add Reading Modal */}
        {showAddReadingModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-60 flex items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Add Reading
                </h3>
                <button
                  onClick={onCloseAddReading}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmitReading} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reading Value *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={readingFormData.reading_value || ''}
                      onChange={(e) => onReadingFormChange('reading_value', e.target.value)}
                      className="input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reading Date *
                    </label>
                    <input
                      type="datetime-local"
                      value={readingFormData.reading_date || ''}
                      onChange={(e) => onReadingFormChange('reading_date', e.target.value)}
                      className="input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={readingFormData.notes || ''}
                      onChange={(e) => onReadingFormChange('notes', e.target.value)}
                      className="input"
                      rows={3}
                      placeholder="Optional notes about this reading..."
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={onCloseAddReading}
                    className="btn-secondary"
                    disabled={submittingReading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={submittingReading}
                  >
                    {submittingReading ? 'Adding...' : 'Add Reading'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeterReadings;