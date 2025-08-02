import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useApi } from '../contexts/ApiContext';

const RoomForm = ({ facilityId, floorId, floors = [], room, onClose, onSave }) => {
  const { createRoom, createFloorRoom, updateRoom } = useApi();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    room_number: '',
    room_type: '',
    area: '',
    description: '',
    floor_id: floorId || ''
  });
  const isEditing = !!room;

  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name || '',
        room_number: room.room_number || '',
        room_type: room.room_type || '',
        area: room.area || '',
        description: room.description || '',
        floor_id: room.floor_id || ''
      });
    }
  }, [room]);

  const roomTypes = [
    'Office',
    'Conference Room',
    'Storage',
    'Bathroom',
    'Kitchen',
    'Lobby',
    'Server Room',
    'Utility Room',
    'Break Room',
    'Reception',
    'Other'
  ];

  useEffect(() => {
    if (floorId) {
      setFormData(prev => ({ ...prev, floor_id: floorId }));
    }
  }, [floorId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Room name is required';
    }
    
    if (formData.area && isNaN(formData.area)) {
      newErrors.area = 'Area must be a valid number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const roomData = {
        name: formData.name,
        room_number: formData.room_number || null,
        room_type: formData.room_type || null,
        area: formData.area ? parseFloat(formData.area) : null,
        description: formData.description || null
      };
      
      let result;
      if (isEditing) {
        // Update existing room
        result = await updateRoom(room.id, {
          ...roomData,
          floor_id: formData.floor_id || null
        });
      } else if (formData.floor_id) {
        // Create room on specific floor
        result = await createFloorRoom(formData.floor_id, roomData);
      } else {
        // Create room directly on facility (backward compatibility)
        result = await createRoom(facilityId, {
          ...roomData,
          floor_id: null
        });
      }
      
      onSave(result);
      onClose();
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} room:`, error);
      setErrors({ submit: error.message || `Failed to ${isEditing ? 'update' : 'create'} room` });
    } finally {
      setLoading(false);
    }
  };

  const onCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onCancel}></div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {isEditing ? 'Edit Room' : 'Add Room'}
                    </h3>
                    <button
                      type="button"
                      onClick={onCancel}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  
                  {errors.submit && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                      {errors.submit}
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Room Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter room name"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>
                    
                    {floors.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Floor
                        </label>
                        <select
                          name="floor_id"
                          value={formData.floor_id}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select a floor (optional)</option>
                          {floors.map(floor => (
                            <option key={floor.id} value={floor.id}>
                              {floor.name} {floor.floor_number !== null ? `(Floor ${floor.floor_number})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Room Number
                      </label>
                      <input
                        type="text"
                        name="room_number"
                        value={formData.room_number}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter room number (e.g., 101, A-12)"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Room Type
                      </label>
                      <select
                        name="room_type"
                        value={formData.room_type}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select room type</option>
                        {roomTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Area (sq ft)
                      </label>
                      <input
                        type="number"
                        name="area"
                        value={formData.area}
                        onChange={handleChange}
                        step="0.01"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.area ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter room area"
                      />
                      {errors.area && (
                        <p className="mt-1 text-sm text-red-600">{errors.area}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter room description (optional)"
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
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditing ? 'Update Room' : 'Create Room'
                )}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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

export default RoomForm;