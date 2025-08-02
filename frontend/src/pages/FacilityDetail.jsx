import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  PlusIcon,
  HomeIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  FireIcon,
  BoltIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { useApi } from '../contexts/ApiContext';
import { format } from 'date-fns';
import FloorForm from '../components/FloorForm';
import RoomForm from '../components/RoomForm';

const FacilityDetail = () => {
  const { id } = useParams();
  const { getFacility, deleteFloor, updateFloor, updateRoom, deleteRoom, loading, error } = useApi();
  const [facility, setFacility] = useState(null);
  const [showAddFloor, setShowAddFloor] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [selectedFloorId, setSelectedFloorId] = useState(null);
  const [expandedFloors, setExpandedFloors] = useState(new Set());
  const [activeTab, setActiveTab] = useState('overview');
  const [editingFloor, setEditingFloor] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);

  useEffect(() => {
    fetchFacility();
  }, [id]);

  const fetchFacility = async () => {
    try {
      const data = await getFacility(id);
      setFacility(data);
    } catch (err) {
      console.error('Failed to fetch facility:', err);
    }
  };

  const handleFloorSave = (floorData) => {
    if (editingFloor) {
      handleFloorEditSave(floorData);
    } else {
      fetchFacility();
    }
  };

  const handleRoomSave = (roomData) => {
    if (editingRoom) {
      handleRoomEditSave(roomData);
    } else {
      fetchFacility();
    }
  };

  const handleDeleteFloor = async (floorId) => {
    if (window.confirm('Are you sure you want to delete this floor? All rooms on this floor will also be deleted.')) {
      try {
        await deleteFloor(floorId);
        fetchFacility();
      } catch (err) {
        console.error('Failed to delete floor:', err);
      }
    }
  };

  const toggleFloorExpansion = (floorId) => {
    const newExpanded = new Set(expandedFloors);
    if (newExpanded.has(floorId)) {
      newExpanded.delete(floorId);
    } else {
      newExpanded.add(floorId);
    }
    setExpandedFloors(newExpanded);
  };

  const handleAddRoomToFloor = (floorId) => {
    setSelectedFloorId(floorId);
    setShowAddRoom(true);
  };

  const handleEditFloor = (floor) => {
    setEditingFloor(floor);
    setShowAddFloor(true);
  };

  const handleFloorEditSave = (updatedFloor) => {
    setFacility(prev => ({
      ...prev,
      floors: prev.floors.map(floor => 
        floor.id === updatedFloor.id ? updatedFloor : floor
      )
    }));
    setEditingFloor(null);
  };

  const handleFloorFormClose = () => {
    setShowAddFloor(false);
    setEditingFloor(null);
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setShowAddRoom(true);
  };

  const handleRoomEditSave = (updatedRoom) => {
    setFacility(prev => {
      const updatedFacility = { ...prev };
      
      // Update room in floors array
      if (updatedFacility.floors) {
        updatedFacility.floors = updatedFacility.floors.map(floor => ({
          ...floor,
          rooms: floor.rooms ? floor.rooms.map(room => 
            room.id === updatedRoom.id ? updatedRoom : room
          ) : []
        }));
      }
      
      // Update room in rooms array (backward compatibility)
      if (updatedFacility.rooms) {
        updatedFacility.rooms = updatedFacility.rooms.map(room => 
          room.id === updatedRoom.id ? updatedRoom : room
        );
      }
      
      return updatedFacility;
    });
    setEditingRoom(null);
  };

  const handleRoomFormClose = () => {
    setShowAddRoom(false);
    setSelectedFloorId(null);
    setEditingRoom(null);
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      try {
        await deleteRoom(roomId);
        fetchFacility();
      } catch (err) {
        console.error('Failed to delete room:', err);
      }
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusBadge = (status) => {
    if (!status) return 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    
    const statusClasses = {
      pending: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      in_progress: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      completed: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      todo: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      active: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      inactive: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      maintenance: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      broken: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      preventive: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      corrective: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      predictive: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      emergency: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return statusClasses[status.toLowerCase()] || 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BuildingOfficeIcon },
    { id: 'rooms', name: 'Rooms', icon: HomeIcon },
    { id: 'maintenance', name: 'Maintenance', icon: WrenchScrewdriverIcon },
    { id: 'tasks', name: 'Tasks', icon: CheckCircleIcon },
    { id: 'heating', name: 'Heating', icon: FireIcon },
    { id: 'meters', name: 'Meters', icon: BoltIcon }
  ];

  if (loading && !facility) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="card">
          <div className="card-body space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !facility) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Failed to load facility
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
        <Link to="/facilities" className="btn btn-primary">
          Back to Facilities
        </Link>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="text-center py-12">
        <BuildingOfficeIcon className="empty-state-icon" />
        <h3 className="empty-state-title">Facility not found</h3>
        <p className="empty-state-description">
          The facility you're looking for doesn't exist.
        </p>
        <Link to="/facilities" className="btn btn-primary mt-4">
          Back to Facilities
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/facilities"
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {facility.name}
            </h1>
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

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Facility Information
                  </h3>
                </div>
                <div className="card-body">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Name
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {facility.name}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Created
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {formatDate(facility.created_at)}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Address
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {facility.address || 'No address provided'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
            
            <div>
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Quick Stats
                  </h3>
                </div>
                <div className="card-body space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Rooms</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {facility.rooms?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Maintenance Requests</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {facility.maintenance?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Tasks</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {facility.tasks?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Heating Systems</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {facility.heating?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Electric Meters</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {facility.meters?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rooms' && (
          <div className="space-y-6">
            {/* Floors and Rooms */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Floors & Rooms
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowAddFloor(true)}
                      className="btn btn-secondary"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Floor
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFloorId(null);
                        setShowAddRoom(true);
                      }}
                      className="btn btn-primary"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Room
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-body">
                {facility.floors?.length > 0 ? (
                  <div className="space-y-4">
                    {facility.floors.map((floor) => (
                      <div key={floor.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => toggleFloorExpansion(floor.id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {expandedFloors.has(floor.id) ? (
                                <ChevronDownIcon className="h-5 w-5" />
                              ) : (
                                <ChevronRightIcon className="h-5 w-5" />
                              )}
                            </button>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {floor.name}
                                {floor.floor_number !== null && (
                                  <span className="ml-2 text-xs text-gray-500">
                                    (Floor {floor.floor_number})
                                  </span>
                                )}
                              </h4>
                              {floor.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {floor.description}
                                </p>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                              {floor.rooms?.length || 0} rooms
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleAddRoomToFloor(floor.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Add Room
                            </button>
                            <button
                              onClick={() => handleEditFloor(floor)}
                              className="text-gray-600 hover:text-gray-800"
                              title="Edit Floor"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteFloor(floor.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete Floor"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        {expandedFloors.has(floor.id) && (
                          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            {floor.rooms?.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {floor.rooms.map((room) => (
                                  <div key={room.id} className="border border-gray-200 dark:border-gray-600 rounded p-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        <HomeIcon className="h-4 w-4 text-gray-400 mr-2" />
                                        <div>
                                          <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {room.name}
                                            {room.room_number && (
                                              <span className="ml-1 text-xs text-gray-500">
                                                ({room.room_number})
                                              </span>
                                            )}
                                          </h5>
                                          {room.room_type && (
                                            <p className="text-xs text-gray-500">{room.room_type}</p>
                                          )}
                                          {room.area && (
                                            <p className="text-xs text-gray-500">{room.area} sq ft</p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <button
                                          onClick={() => handleEditRoom(room)}
                                          className="text-gray-600 hover:text-gray-800"
                                          title="Edit Room"
                                        >
                                          <PencilIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteRoom(room.id)}
                                          className="text-red-600 hover:text-red-800"
                                          title="Delete Room"
                                        >
                                          <TrashIcon className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <HomeIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">No rooms on this floor yet</p>
                                <button
                                  onClick={() => handleAddRoomToFloor(floor.id)}
                                  className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                                >
                                  Add the first room
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <BuildingOfficeIcon className="empty-state-icon" />
                    <h3 className="empty-state-title">No floors yet</h3>
                    <p className="empty-state-description">
                      Add floors to organize rooms in this facility.
                    </p>
                    <button
                      onClick={() => setShowAddFloor(true)}
                      className="btn btn-primary mt-4"
                    >
                      Add First Floor
                    </button>
                  </div>
                )}
                
                {/* Unassigned Rooms */}
                {facility.rooms?.some(room => !room.floor_id) && (
                  <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">
                      Unassigned Rooms
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {facility.rooms
                        .filter(room => !room.floor_id)
                        .map((room) => (
                          <div key={room.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <HomeIcon className="h-4 w-4 text-gray-400 mr-2" />
                                <div>
                                  <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {room.name}
                                    {room.room_number && (
                                      <span className="ml-1 text-xs text-gray-500">
                                        ({room.room_number})
                                      </span>
                                    )}
                                  </h5>
                                  {room.room_type && (
                                    <p className="text-xs text-gray-500">{room.room_type}</p>
                                  )}
                                  {room.area && (
                                    <p className="text-xs text-gray-500">{room.area} sq ft</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleEditRoom(room)}
                                  className="text-gray-600 hover:text-gray-800"
                                  title="Edit Room"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteRoom(room.id)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Delete Room"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Maintenance Requests ({facility.maintenance?.length || 0})
              </h3>
            </div>
            <div className="card-body">
              {facility.maintenance?.length > 0 ? (
                <div className="space-y-4">
                  {facility.maintenance.map((item) => (
                    <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {item.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Created: {formatDate(item.created_at)}
                          </p>
                        </div>
                        <span className={getStatusBadge(item.maintenance_type || 'preventive')}>
                          {(item.maintenance_type || 'preventive').replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <WrenchScrewdriverIcon className="empty-state-icon" />
                  <h3 className="empty-state-title">No maintenance requests</h3>
                  <p className="empty-state-description">
                    No maintenance requests for this facility yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Tasks ({facility.tasks?.length || 0})
              </h3>
            </div>
            <div className="card-body">
              {facility.tasks?.length > 0 ? (
                <div className="space-y-4">
                  {facility.tasks.map((task) => (
                    <div key={task.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {task.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Created: {formatDate(task.created_at)}
                          </p>
                        </div>
                        <span className={getStatusBadge(task.status || 'todo')}>
                          {(task.status || 'todo').replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <CheckCircleIcon className="empty-state-icon" />
                  <h3 className="empty-state-title">No tasks</h3>
                  <p className="empty-state-description">
                    No tasks assigned to this facility yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'heating' && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Heating Systems ({facility.heating?.length || 0})
              </h3>
            </div>
            <div className="card-body">
              {facility.heating?.length > 0 ? (
                <div className="space-y-4">
                  {facility.heating.map((system) => (
                    <div key={system.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {system.type}
                          </p>
                          {system.model && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Model: {system.model}
                            </p>
                          )}
                          {system.last_check && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Last check: {formatDate(system.last_check)}
                            </p>
                          )}
                        </div>
                        <span className={getStatusBadge(system.status || 'active')}>
                          {system.status || 'active'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FireIcon className="empty-state-icon" />
                  <h3 className="empty-state-title">No heating meters</h3>
                  <p className="empty-state-description">
                    No heating meters registered for this facility yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'meters' && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Electric Meters ({facility.meters?.length || 0})
              </h3>
            </div>
            <div className="card-body">
              {facility.meters?.length > 0 ? (
                <div className="space-y-4">
                  {facility.meters.map((meter) => (
                    <div key={meter.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {meter.serial_number}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Type: {meter.type}
                          </p>
                          {meter.location && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Location: {meter.location}
                            </p>
                          )}
                        </div>
                        <span className={getStatusBadge(meter.status || 'active')}>
                          {meter.status || 'active'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <BoltIcon className="empty-state-icon" />
                  <h3 className="empty-state-title">No electric meters</h3>
                  <p className="empty-state-description">
                    No electric meters registered for this facility yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit floor modal */}
      {showAddFloor && (
        <FloorForm
          facilityId={id}
          floor={editingFloor}
          onClose={handleFloorFormClose}
          onSave={handleFloorSave}
        />
      )}

      {/* Add/Edit room modal */}
      {showAddRoom && (
        <RoomForm
          facilityId={id}
          floorId={selectedFloorId}
          floors={facility?.floors || []}
          room={editingRoom}
          onClose={handleRoomFormClose}
          onSave={handleRoomSave}
        />
      )}
    </div>
  );
};

export default FacilityDetail;