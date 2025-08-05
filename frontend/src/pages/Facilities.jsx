import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { useApi } from '../contexts/ApiContext';
import FacilityForm from '../components/FacilityForm';
import FacilityCard from '../components/FacilityCard';
import FacilityStats from '../components/FacilityStats';
import FacilityFilters from '../components/FacilityFilters';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const Facilities = () => {
  const { getFacilities, deleteFacility, loading, error } = useApi();
  const [facilities, setFacilities] = useState([]);
  const [filteredFacilities, setFilteredFacilities] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchFacilities();
  }, []);

  useEffect(() => {
    setFilteredFacilities(facilities);
  }, [facilities]);

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

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    
    setDeleteLoading(true);
    try {
      await deleteFacility(deleteConfirm);
      setDeleteConfirm(null);
      fetchFacilities();
    } catch (err) {
      console.error('Failed to delete facility:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFilteredFacilities = (filtered) => {
    setFilteredFacilities(filtered);
  };

  const handleClearFilters = () => {
    setFilteredFacilities(facilities);
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

      {/* Facility Statistics */}
      {facilities.length > 0 && (
        <FacilityStats facilities={facilities} />
      )}

      {/* Facility Filters */}
      {facilities.length > 0 && (
        <FacilityFilters 
          facilities={facilities}
          onFilteredFacilities={handleFilteredFacilities}
          onClearFilters={handleClearFilters}
        />
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
      ) : filteredFacilities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFacilities.map((facility) => (
            <FacilityCard
              key={facility.id}
              facility={facility}
              onEdit={handleEdit}
              onDelete={setDeleteConfirm}
            />
          ))}
        </div>
      ) : facilities.length > 0 ? (
        <div className="empty-state">
          <BuildingOfficeIcon className="empty-state-icon" />
          <h3 className="empty-state-title">No facilities match your filters</h3>
          <p className="empty-state-description">
            Try adjusting your search criteria or clear the filters.
          </p>
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
      <DeleteConfirmationModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Facility"
        message="Are you sure you want to delete this facility? This action cannot be undone and will also delete all associated rooms, maintenance requests, and other related data."
        loading={deleteLoading}
      />
    </div>
  );
};

export default Facilities;