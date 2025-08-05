import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const TaskForm = ({ 
  isOpen,
  isEditing,
  formData,
  facilities,
  maintenance,
  loading,
  onSubmit,
  onClose,
  onFormDataChange,
  onMarkAsDone
}) => {
  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form onSubmit={onSubmit}>
            <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 sm:mx-0 sm:h-10 sm:w-10">
                  <CheckCircleIcon className="h-6 w-6 text-primary-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                    {isEditing ? 'Edit Task' : 'New Task'}
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="form-label">
                        Task Title *
                      </label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Enter task title"
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">
                        Description
                      </label>
                      <textarea
                        className="form-input"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Describe the task"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">
                          Assigned To
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.assigned_to}
                          onChange={(e) => handleInputChange('assigned_to', e.target.value)}
                          placeholder="Person responsible"
                        />
                      </div>
                      
                      <div>
                        <label className="form-label">
                          Due Date
                        </label>
                        <input
                          type="date"
                          className="form-input"
                          value={formData.due_date}
                          onChange={(e) => handleInputChange('due_date', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">
                          Status
                        </label>
                        <select
                          className="form-input"
                          value={formData.status}
                          onChange={(e) => handleInputChange('status', e.target.value)}
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="form-label">
                          Priority
                        </label>
                        <select
                          className="form-input"
                          value={formData.priority}
                          onChange={(e) => handleInputChange('priority', e.target.value)}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">
                          Related Facility
                        </label>
                        <select
                          className="form-input"
                          value={formData.facility_id}
                          onChange={(e) => handleInputChange('facility_id', e.target.value)}
                        >
                          <option value="">Select facility (optional)</option>
                          {facilities.map((facility) => (
                            <option key={facility.id} value={facility.id}>
                              {facility.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="form-label">
                          Related Maintenance
                        </label>
                        <select
                          className="form-input"
                          value={formData.maintenance_id}
                          onChange={(e) => handleInputChange('maintenance_id', e.target.value)}
                        >
                          <option value="">Select maintenance (optional)</option>
                          {maintenance.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.facility_name} - {item.description ? item.description.substring(0, 50) + '...' : 'No description'}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full sm:w-auto sm:ml-3"
              >
                {loading ? (
                  <>
                    <div className="spinner mr-2"></div>
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditing ? 'Update Task' : 'Create Task'
                )}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={onMarkAsDone}
                  disabled={loading}
                  className="btn bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto sm:ml-3 mt-3 sm:mt-0"
                >
                  {loading ? (
                    <>
                      <div className="spinner mr-2"></div>
                      Marking Done...
                    </>
                  ) : (
                    'Mark as Done'
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
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

export default TaskForm;