import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { DemoApiService } from '../services/demoData';

const ApiContext = createContext();

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

// Check if we're in demo mode - only enable when explicitly set
const isDemoMode = process.env.REACT_APP_DEMO_MODE === 'true';

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || '';
axios.defaults.timeout = 10000;

// Add request interceptor for logging
axios.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    // Handle common error scenarios
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Please try again.';
    } else if (error.response?.status === 404) {
      error.message = 'Resource not found.';
    } else if (error.response?.status >= 500) {
      error.message = 'Server error. Please try again later.';
    } else if (!error.response) {
      error.message = 'Network error. Please check your connection.';
    }
    
    return Promise.reject(error);
  }
);

export const ApiProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleApiCall = useCallback(async (apiCall, options = {}) => {
    const { showLoading = true, showError = true } = options;
    
    try {
      if (showLoading) setLoading(true);
      if (showError) setError(null);
      
      const result = await apiCall();
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An unexpected error occurred';
      
      if (showError) {
        setError(errorMessage);
      }
      
      throw new Error(errorMessage);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  // Dashboard API
  const getDashboardData = useCallback(() => {
    if (isDemoMode) {
      return handleApiCall(() => DemoApiService.getDashboard());
    }
    return handleApiCall(() => axios.get('/api/dashboard').then(res => res.data));
  }, [handleApiCall]);

  // Facilities API
  const getFacilities = useCallback(() => {
    if (isDemoMode) {
      return handleApiCall(() => DemoApiService.getFacilities());
    }
    return handleApiCall(() => axios.get('/api/facilities').then(res => res.data));
  }, [handleApiCall]);

  const getFacility = useCallback((id) => {
    return handleApiCall(() => axios.get(`/api/facilities/${id}`).then(res => res.data));
  }, [handleApiCall]);

  const createFacility = useCallback((data) => {
    return handleApiCall(() => axios.post('/api/facilities', data).then(res => res.data));
  }, [handleApiCall]);

  const updateFacility = useCallback((id, data) => {
    return handleApiCall(() => axios.put(`/api/facilities/${id}`, data).then(res => res.data));
  }, [handleApiCall]);

  const deleteFacility = useCallback((id) => {
    return handleApiCall(() => axios.delete(`/api/facilities/${id}`).then(res => res.data));
  }, [handleApiCall]);

  // Rooms API
  const getRooms = useCallback((facilityId) => {
    return handleApiCall(() => axios.get(`/api/facilities/${facilityId}/rooms`).then(res => res.data));
  }, [handleApiCall]);

  const createRoom = useCallback((facilityId, data) => {
    return handleApiCall(() => axios.post(`/api/facilities/${facilityId}/rooms`, data).then(res => res.data));
  }, [handleApiCall]);

  const updateRoom = useCallback((id, data) => {
    return handleApiCall(() => axios.put(`/api/rooms/${id}`, data).then(res => res.data));
  }, [handleApiCall]);

  const deleteRoom = useCallback((id) => {
    return handleApiCall(() => axios.delete(`/api/rooms/${id}`).then(res => res.data));
  }, [handleApiCall]);

  // Floors API
  const getFloors = useCallback((facilityId) => {
    return handleApiCall(() => axios.get(`/api/facilities/${facilityId}/floors`).then(res => res.data));
  }, [handleApiCall]);

  const createFloor = useCallback((facilityId, data) => {
    return handleApiCall(() => axios.post(`/api/facilities/${facilityId}/floors`, data).then(res => res.data));
  }, [handleApiCall]);

  const updateFloor = useCallback((id, data) => {
    return handleApiCall(() => axios.put(`/api/floors/${id}`, data).then(res => res.data));
  }, [handleApiCall]);

  const deleteFloor = useCallback((id) => {
    return handleApiCall(() => axios.delete(`/api/floors/${id}`).then(res => res.data));
  }, [handleApiCall]);

  const getFloorRooms = useCallback((floorId) => {
    return handleApiCall(() => axios.get(`/api/floors/${floorId}/rooms`).then(res => res.data));
  }, [handleApiCall]);

  const createFloorRoom = useCallback((floorId, data) => {
    return handleApiCall(() => axios.post(`/api/floors/${floorId}/rooms`, data).then(res => res.data));
  }, [handleApiCall]);

  // Maintenance API
  const getMaintenance = useCallback(() => {
    return handleApiCall(() => axios.get('/api/maintenance').then(res => res.data));
  }, [handleApiCall]);

  const createMaintenance = useCallback((data) => {
    return handleApiCall(() => axios.post('/api/maintenance', data).then(res => res.data));
  }, [handleApiCall]);

  const updateMaintenance = useCallback((id, data) => {
    return handleApiCall(() => axios.put(`/api/maintenance/${id}`, data).then(res => res.data));
  }, [handleApiCall]);

  // Tasks API
  const getTasks = useCallback(() => {
    return handleApiCall(() => axios.get('/api/tasks').then(res => res.data));
  }, [handleApiCall]);

  const createTask = useCallback((data) => {
    return handleApiCall(() => axios.post('/api/tasks', data).then(res => res.data));
  }, [handleApiCall]);

  const updateTask = useCallback((id, data) => {
    return handleApiCall(() => axios.put(`/api/tasks/${id}`, data).then(res => res.data));
  }, [handleApiCall]);

  const deleteTask = useCallback((id) => {
    return handleApiCall(() => axios.delete(`/api/tasks/${id}`).then(res => res.data));
  }, [handleApiCall]);

  // Heating API
  const getHeating = useCallback(() => {
    if (isDemoMode) {
      return handleApiCall(() => DemoApiService.getHeating());
    }
    return handleApiCall(() => axios.get('/api/heating').then(res => res.data));
  }, [handleApiCall]);

  const createHeating = useCallback((data) => {
    return handleApiCall(() => axios.post('/api/heating', data).then(res => res.data));
  }, [handleApiCall]);

  const updateHeating = useCallback((id, data) => {
    return handleApiCall(() => axios.put(`/api/heating/${id}`, data).then(res => res.data));
  }, [handleApiCall]);

  const deleteHeating = useCallback((id) => {
    return handleApiCall(() => axios.delete(`/api/heating/${id}`).then(res => res.data));
  }, [handleApiCall]);

  const getHeatingReadings = useCallback((heatingId) => {
    return handleApiCall(() => axios.get(`/api/heating/${heatingId}/readings`).then(res => res.data));
  }, [handleApiCall]);

  const createHeatingReading = useCallback((heatingId, data) => {
    return handleApiCall(() => axios.post(`/api/heating/${heatingId}/readings`, data).then(res => res.data));
  }, [handleApiCall]);

  // Meters API
  const getMeters = useCallback(() => {
    if (isDemoMode) {
      return handleApiCall(() => DemoApiService.getMeters());
    }
    return handleApiCall(() => axios.get('/api/meters').then(res => res.data));
  }, [handleApiCall]);

  const createMeter = useCallback((data) => {
    return handleApiCall(() => axios.post('/api/meters', data).then(res => res.data));
  }, [handleApiCall]);

  const updateMeter = useCallback((id, data) => {
    return handleApiCall(() => axios.put(`/api/meters/${id}`, data).then(res => res.data));
  }, [handleApiCall]);

  const getMeterReadings = useCallback((meterId) => {
    if (isDemoMode) {
      return handleApiCall(() => DemoApiService.getMeterReadings(meterId));
    }
    return handleApiCall(() => axios.get(`/api/meters/${meterId}/readings`).then(res => res.data));
  }, [handleApiCall]);

  const createMeterReading = useCallback((meterId, data) => {
    return handleApiCall(() => axios.post(`/api/meters/${meterId}/readings`, data).then(res => res.data));
  }, [handleApiCall]);

  const deleteMeter = useCallback((meterId) => {
    return handleApiCall(() => axios.delete(`/api/meters/${meterId}`).then(res => res.data));
  }, [handleApiCall]);

  // Energy Consumption API
  const getEnergyConsumption = useCallback((period = 'monthly') => {
    if (isDemoMode) {
      return handleApiCall(() => DemoApiService.getEnergyConsumption());
    }
    return handleApiCall(() => axios.get(`/api/energy-consumption?period=${period}`).then(res => res.data));
  }, [handleApiCall]);

  const value = {
    loading,
    error,
    clearError,
    
    // Dashboard
    getDashboardData,
    
    // Facilities
    getFacilities,
    getFacility,
    createFacility,
    updateFacility,
    deleteFacility,
    
    // Rooms
    getRooms,
    createRoom,
    updateRoom,
    deleteRoom,
    
    // Floors
    getFloors,
    createFloor,
    updateFloor,
    deleteFloor,
    getFloorRooms,
    createFloorRoom,
    
    // Maintenance
    getMaintenance,
    createMaintenance,
    updateMaintenance,
    
    // Tasks
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    
    // Heating
    getHeating,
    createHeating,
    updateHeating,
    deleteHeating,
    getHeatingReadings,
    createHeatingReading,
    
    // Meters
    getMeters,
    createMeter,
    updateMeter,
    getMeterReadings,
    createMeterReading,
    deleteMeter,
    
    // Energy Consumption
    getEnergyConsumption
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};