import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useApi } from '../contexts/ApiContext';
import { format } from 'date-fns';
import FacilityForm from '../components/FacilityForm';

const Facilities = () => {
  const { getFacilities, deleteFacility, loading, error } = useApi();
  const [facilities, setFacilities] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      const data = await getFacilities();
      setFacilities(data);
    } catch (err) {
      console.error('Failed to fetch facilities:', err);
    }
  };

  const handleFacilitySave = (savedFacility) => {
    fetchFacilities();
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedFacility(null);
  };

  const handleEdit = (facility) => {
    setSelectedFacility(facility);
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteFacility(id);
      setDeleteConfirm(null);
      fetchFacilities();
    } catch (err) {
      console.error('Failed to delete facility:', err);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Facilities
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your buildings and facilities
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Facility
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Facilities grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="card-body">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : facilities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((facility) => (
            <div key={facility.id} className="card hover:shadow-medium transition-shadow duration-200">
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                      <BuildingOfficeIcon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {facility.name}
                      </h3>
                      {facility.address && (
                        <div className="flex items-center mt-1">
                          <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {facility.address}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                  Created: {formatDate(facility.created_at)}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Link
                      to={`/facilities/${facility.id}`}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <EyeIcon className="h-3 w-3 mr-1" />
                      View
                    </Link>
                    <button 
                      onClick={() => handleEdit(facility)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <PencilIcon className="h-3 w-3 mr-1" />
                      Edit
                    </button>
                  </div>
                  <button
                    onClick={() => setDeleteConfirm(facility.id)}
                    className="inline-flex items-center px-3 py-1 border border-red-300 dark:border-red-600 text-xs font-medium rounded text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900"
                  >
                    <TrashIcon className="h-3 w-3 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <BuildingOfficeIcon className="empty-state-icon" />
          <h3 className="empty-state-title">No facilities yet</h3>
          <p className="empty-state-description">
            Get started by creating your first facility.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary mt-4"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Facility
          </button>
        </div>
      )}

      {/* Create facility modal */}
      {showCreateModal && (
        <FacilityForm
          facility={null}
          onClose={() => setShowCreateModal(false)}
          onSave={handleFacilitySave}
        />
      )}

      {/* Edit facility modal */}
      {showEditModal && selectedFacility && (
        <FacilityForm
          facility={selectedFacility}
          onClose={() => {
            setShowEditModal(false);
            setSelectedFacility(null);
          }}
          onSave={handleFacilitySave}
        />
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setDeleteConfirm(null)}></div>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                    <TrashIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                      Delete Facility
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete this facility? This action cannot be undone and will also delete all associated rooms, maintenance requests, and other related data.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={loading}
                  className="btn-danger w-full sm:w-auto sm:ml-3"
                >
                  {loading ? (
                    <>
                      <div className="spinner mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="btn-outline w-full sm:w-auto mt-3 sm:mt-0"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Facilities;