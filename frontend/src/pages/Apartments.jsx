import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  BuildingOfficeIcon,
  HomeIcon,
  WrenchScrewdriverIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MapPinIcon,
  CurrencyEuroIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useApi } from '../contexts/ApiContext';

const Apartments = () => {
  const { loading, error } = useApi();
  
  // Initial apartment data based on provided list
  const [apartments, setApartments] = useState([
    // TA's Apartments
    {
      id: 1,
      address: 'Boyen Str. 33, 10115 Berlin',
      apartmentNo: 'B.02.01, 2nd floor left',
      rooms: '5 rooms, 2 Bathrooms',
      rent: 3750.00,
      status: 'occupied',
      tenant: 'John Doe',
      tenants: ['John Doe', '', '', '', ''],
      tenantEmails: ['john.doe@email.com', '', '', '', ''],
      category: 'TA Apartments',
      stayStart: '2024-01-01',
      stayEnd: '2025-12-31'
    },
    {
      id: 2,
      address: 'Seume Str. 2, 10245 Berlin',
      apartmentNo: 'A.05.03, front house, 5th floor right. Entrance B B.05.01',
      rooms: '4 rooms, 2 Bathrooms',
      rent: 3200.00,
      status: 'occupied',
      tenant: 'Jane Smith',
      tenants: ['Jane Smith', '', '', ''],
      tenantEmails: ['jane.smith@email.com', '', '', ''],
      category: 'TA Apartments',
      stayStart: '2024-03-01',
      stayEnd: '2026-02-28'
    },
    {
      id: 3,
      address: 'Marthin Luther Str. 63, 10779 Berlin',
      apartmentNo: '1st floor, right',
      rooms: '3 rooms apart.',
      rent: 2890.00,
      status: 'available',
      tenant: null,
      tenants: ['', '', ''],
      tenantEmails: ['', '', ''],
      category: 'TA Apartments',
      stayStart: null,
      stayEnd: null
    },
    {
      id: 4,
      address: 'Symplon Str. 29, 10245 Berlin',
      apartmentNo: 'C.03.02, 3rd floor',
      rooms: '2 rooms apart.',
      rent: 1600.00,
      status: 'occupied',
      tenant: 'Mike Johnson',
      tenants: ['Mike Johnson', ''],
      tenantEmails: ['mike.johnson@email.com', ''],
      category: 'TA Apartments',
      stayStart: '2024-06-01',
      stayEnd: '2025-05-31'
    },
    {
      id: 5,
      address: 'Seume Str.1, 10245 berlin',
      apartmentNo: 'Apart. No. D.04.03, 4th floor right',
      rooms: '3 rooms apart.',
      rent: 2670.00,
      status: 'maintenance',
      tenant: null,
      tenants: ['', '', ''],
      tenantEmails: ['', '', ''],
      category: 'TA Apartments',
      leaseStart: null,
      leaseEnd: null
    },
    {
      id: 6,
      address: 'Symplon Str. 29, 10245 Berlin',
      apartmentNo: 'C.05.01, 5th. Floor left',
      rooms: '3 rooms apart.',
      rent: 2670.00,
      status: 'occupied',
      tenant: 'Sarah Wilson',
      tenants: ['Sarah Wilson', '', ''],
      tenantEmails: ['sarah.wilson@email.com', '', ''],
      category: 'TA Apartments',
      stayStart: '2024-02-15',
      stayEnd: '2025-02-14'
    },
    {
      id: 7,
      address: 'Rudolstädter Str. 24, 10713 Berlin',
      apartmentNo: '6th floor',
      rooms: 'Single Apartment',
      rent: 1290.00,
      status: 'available',
      tenant: null,
      tenants: [''],
      tenantEmails: [''],
      category: 'TA Apartments',
      leaseStart: null,
      leaseEnd: null
    },
    {
      id: 8,
      address: 'Mariendorfer Damm 190, 12107 Berlin',
      apartmentNo: '2nd floor left',
      rooms: '3 rooms apart.',
      rent: 2190.00,
      status: 'occupied',
      tenant: 'David Brown',
      tenants: ['David Brown', '', ''],
      tenantEmails: ['david.brown@email.com', '', ''],
      category: 'TA Apartments',
      stayStart: '2024-04-01',
      stayEnd: '2025-03-31'
    },
    // Berlin Staff Apartments
    {
      id: 9,
      address: 'Grünberger Str. 32 / Warschauer Str. 16, 10243 Berlin',
      apartmentNo: 'A.02.01, 2nd floor',
      rooms: 'Single Apartment',
      rent: 890.00,
      status: 'occupied',
      tenant: 'Staff Member A',
      tenants: ['Staff Member A'],
      tenantEmails: ['staffa@company.com'],
      category: 'Berlin Staff Apartments',
      stayStart: '2024-01-01',
      stayEnd: '2024-12-31'
    },
    {
      id: 10,
      address: 'Grünberger Str. 32 / Warschauer Str. 16, 10243 Berlin',
      apartmentNo: 'A.02.11, 2nd floor',
      rooms: 'Single Apartment',
      rent: 990.00,
      status: 'available',
      tenant: null,
      tenants: [''],
      tenantEmails: [''],
      category: 'Berlin Staff Apartments',
      leaseStart: null,
      leaseEnd: null
    },
    {
      id: 11,
      address: 'Grünberger Str. 32 / Warschauer Str. 16, 10243 Berlin',
      apartmentNo: 'A.03.01, 3rd floor',
      rooms: 'Single Apartment',
      rent: 790.00,
      status: 'occupied',
      tenant: 'Staff Member B',
      tenants: ['Staff Member B'],
      tenantEmails: ['staffb@company.com'],
      category: 'Berlin Staff Apartments',
      stayStart: '2024-05-01',
      stayEnd: '2024-12-31'
    },
    {
      id: 12,
      address: 'Eichborndamm 3, 13403 Berlin',
      apartmentNo: '2.OG',
      rooms: '3 rooms apart.',
      rent: 0.00,
      status: 'available',
      tenant: null,
      tenants: ['', '', ''],
      tenantEmails: ['', '', ''],
      category: 'Berlin Staff Apartments',
      leaseStart: null,
      leaseEnd: null
    },
    {
      id: 13,
      address: 'Eichborndamm 3, 13403 Berlin',
      apartmentNo: '3.OG',
      rooms: '3 rooms apart.',
      rent: 0.00,
      status: 'available',
      tenant: null,
      tenants: ['', '', ''],
      tenantEmails: ['', '', ''],
      category: 'Berlin Staff Apartments',
      leaseStart: null,
      leaseEnd: null
    },
    // Admin Apartments
    {
      id: 14,
      address: 'Leipziger Str. 43, 10117 Berlin',
      apartmentNo: '4th floor, apart. No. 8',
      rooms: '2 rooms apart.',
      rent: 1970.00,
      status: 'occupied',
      tenant: 'Admin Staff A',
      tenants: ['Admin Staff A', ''],
      tenantEmails: ['admin.staff@company.com', ''],
      category: 'Admin Apartments',
      stayStart: '2024-01-15',
      stayEnd: '2025-01-14'
    },
    {
      id: 15,
      address: 'Leipziger Str. 31',
      apartmentNo: '3rd. Floor, right',
      rooms: '2 rooms apart.',
      rent: 0.00,
      status: 'available',
      tenant: null,
      tenants: ['', ''],
      tenantEmails: ['', ''],
      category: 'Admin Apartments',
      leaseStart: null,
      leaseEnd: null
    }
  ]);
  
  const [repairs, setRepairs] = useState([
    {
      id: 1,
      apartmentId: 5,
      title: 'Plumbing Issue',
      description: 'Kitchen sink is leaking, needs immediate attention',
      priority: 'high',
      status: 'in-progress',
      reportedDate: '2025-01-15',
      assignedTo: 'Maintenance Team A',
      estimatedCost: 250.00,
      completionDate: null
    },
    {
      id: 2,
      apartmentId: 2,
      title: 'Heating System',
      description: 'Radiator not working in bedroom, tenant complaints',
      priority: 'medium',
      status: 'pending',
      reportedDate: '2025-01-20',
      assignedTo: null,
      estimatedCost: 180.00,
      completionDate: null
    },
    {
      id: 3,
      apartmentId: 8,
      title: 'Window Repair',
      description: 'Broken window lock in living room',
      priority: 'low',
      status: 'completed',
      reportedDate: '2025-01-10',
      assignedTo: 'Handyman Service',
      estimatedCost: 75.00,
      completionDate: '2025-01-18'
    }
  ]);
  
  const [activeTab, setActiveTab] = useState('apartments');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRepairModal, setShowRepairModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditRepairModal, setShowEditRepairModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Form states
  const [apartmentFormData, setApartmentFormData] = useState({
    address: '',
    apartmentNo: '',
    rooms: '',
    rent: '',
    status: 'available',
    tenants: [''],
    tenantEmails: [''],
    category: 'TA Apartments',
    stayStart: '',
    stayEnd: ''
  });

  // Helper function to get number of rooms from rooms string
  const getRoomCount = (roomsString) => {
    if (!roomsString) return 1;
    const match = roomsString.match(/(\d+)/);
    return match ? parseInt(match[1]) : 1;
  };

  // Update tenants array when rooms change
  const handleRoomsChange = (roomsValue) => {
    const roomCount = getRoomCount(roomsValue);
    const newTenants = Array(roomCount).fill('').map((_, index) => 
      apartmentFormData.tenants[index] || ''
    );
    const newTenantEmails = Array(roomCount).fill('').map((_, index) => 
      apartmentFormData.tenantEmails[index] || ''
    );
    setApartmentFormData({
      ...apartmentFormData,
      rooms: roomsValue,
      tenants: newTenants,
      tenantEmails: newTenantEmails
    });
  };

  // Update individual tenant
  const handleTenantChange = (index, value) => {
    const newTenants = [...apartmentFormData.tenants];
    newTenants[index] = value;
    setApartmentFormData({
      ...apartmentFormData,
      tenants: newTenants
    });
  };

  // Update individual tenant email
  const handleTenantEmailChange = (index, value) => {
    const newTenantEmails = [...apartmentFormData.tenantEmails];
    newTenantEmails[index] = value;
    setApartmentFormData({
      ...apartmentFormData,
      tenantEmails: newTenantEmails
    });
  };
  
  const [repairFormData, setRepairFormData] = useState({
    apartmentId: '',
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    assignedTo: '',
    estimatedCost: ''
  });
  
  // Filter apartments based on status and category
  const filteredApartments = apartments.filter(apartment => {
    const statusMatch = filter === 'all' || apartment.status === filter;
    const categoryMatch = categoryFilter === 'all' || apartment.category === categoryFilter;
    return statusMatch && categoryMatch;
  });
  
  // Filter repairs based on status
  const filteredRepairs = repairs.filter(repair => {
    if (filter === 'all') return true;
    return repair.status === filter;
  });
  
  // Statistics
  const stats = {
    total: apartments.length,
    occupied: apartments.filter(apt => apt.status === 'occupied').length,
    available: apartments.filter(apt => apt.status === 'available').length,
    maintenance: apartments.filter(apt => apt.status === 'maintenance').length,
    totalRent: apartments.reduce((sum, apt) => sum + (apt.status === 'occupied' ? apt.rent : 0), 0),
    pendingRepairs: repairs.filter(repair => repair.status === 'pending').length,
    activeRepairs: repairs.filter(repair => repair.status === 'in-progress').length
  };
  
  // Handle apartment form submission
  const handleApartmentSubmit = (e) => {
    e.preventDefault();
    const newApartment = {
      id: apartments.length + 1,
      ...apartmentFormData,
      rent: parseFloat(apartmentFormData.rent) || 0,
      // Keep both tenants array and single tenant for backward compatibility
      tenants: apartmentFormData.tenants,
      tenantEmails: apartmentFormData.tenantEmails,
      tenant: apartmentFormData.tenants.length > 0 ? apartmentFormData.tenants[0] : null
    };
    setApartments([...apartments, newApartment]);
    setShowCreateModal(false);
    resetApartmentForm();
  };
  
  // Handle repair form submission
  const handleRepairSubmit = (e) => {
    e.preventDefault();
    const newRepair = {
      id: repairs.length + 1,
      ...repairFormData,
      apartmentId: parseInt(repairFormData.apartmentId),
      reportedDate: new Date().toISOString().split('T')[0],
      estimatedCost: parseFloat(repairFormData.estimatedCost) || 0,
      completionDate: null
    };
    setRepairs([...repairs, newRepair]);
    setShowRepairModal(false);
    resetRepairForm();
  };
  
  // Reset forms
  const resetApartmentForm = () => {
    setApartmentFormData({
      address: '',
      apartmentNo: '',
      rooms: '',
      rent: '',
      status: 'available',
      tenants: [''],
      tenantEmails: [''],
      category: 'TA Apartments',
      stayStart: '',
      stayEnd: ''
    });
  };
  
  const resetRepairForm = () => {
    setRepairFormData({
      apartmentId: '',
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      assignedTo: '',
      estimatedCost: ''
    });
  };
  
  // Handle edit apartment
  const handleEditApartment = (apartment) => {
    setSelectedApartment(apartment);
    const roomCount = getRoomCount(apartment.rooms);
    const tenants = apartment.tenants || (apartment.tenant ? [apartment.tenant] : Array(roomCount).fill(''));
    const tenantEmails = apartment.tenantEmails || Array(roomCount).fill('');
    
    setApartmentFormData({
      address: apartment.address,
      apartmentNo: apartment.apartmentNo,
      rooms: apartment.rooms,
      rent: apartment.rent.toString(),
      status: apartment.status,
      tenants: tenants,
      tenantEmails: tenantEmails,
      category: apartment.category,
      stayStart: apartment.stayStart || '',
      stayEnd: apartment.stayEnd || ''
    });
    setShowEditModal(true);
  };
  
  // Handle update apartment
  const handleUpdateApartment = (e) => {
    e.preventDefault();
    const updatedApartmentData = {
      ...apartmentFormData,
      rent: parseFloat(apartmentFormData.rent) || 0,
      // Keep both tenants array and single tenant for backward compatibility
      tenants: apartmentFormData.tenants,
      tenantEmails: apartmentFormData.tenantEmails,
      tenant: apartmentFormData.tenants.length > 0 ? apartmentFormData.tenants[0] : null
    };
    
    const updatedApartments = apartments.map(apt => 
      apt.id === selectedApartment.id 
        ? { ...apt, ...updatedApartmentData }
        : apt
    );
    setApartments(updatedApartments);
    setShowEditModal(false);
    setSelectedApartment(null);
    resetApartmentForm();
  };
  
  // Handle delete apartment
  const handleDeleteApartment = (id) => {
    if (window.confirm('Are you sure you want to delete this apartment?')) {
      setApartments(apartments.filter(apt => apt.id !== id));
      setRepairs(repairs.filter(repair => repair.apartmentId !== id));
    }
  };
  
  // Handle view apartment details
  const handleViewDetails = (apartment) => {
    setSelectedApartment(apartment);
    setShowDetailsModal(true);
  };
  
  // Update repair status
  const updateRepairStatus = (repairId, newStatus) => {
    const updatedRepairs = repairs.map(repair => {
      if (repair.id === repairId) {
        return {
          ...repair,
          status: newStatus,
          completionDate: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null
        };
      }
      return repair;
    });
    setRepairs(updatedRepairs);
  };

  // Handle edit repair
  const handleEditRepair = (repair) => {
    setSelectedRepair(repair);
    setRepairFormData({
      apartmentId: repair.apartmentId.toString(),
      title: repair.title,
      description: repair.description,
      priority: repair.priority,
      status: repair.status,
      assignedTo: repair.assignedTo || '',
      estimatedCost: repair.estimatedCost.toString()
    });
    setShowEditRepairModal(true);
  };

  // Handle update repair
  const handleUpdateRepair = (e) => {
    e.preventDefault();
    const updatedRepairData = {
      ...selectedRepair,
      apartmentId: parseInt(repairFormData.apartmentId),
      title: repairFormData.title,
      description: repairFormData.description,
      priority: repairFormData.priority,
      status: repairFormData.status,
      assignedTo: repairFormData.assignedTo,
      estimatedCost: parseFloat(repairFormData.estimatedCost) || 0
    };
    
    const updatedRepairs = repairs.map(repair => 
      repair.id === selectedRepair.id 
        ? updatedRepairData
        : repair
    );
    setRepairs(updatedRepairs);
    setShowEditRepairModal(false);
    setSelectedRepair(null);
    resetRepairForm();
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'occupied': return 'bg-green-100 text-green-800';
      case 'available': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get category color
  const getCategoryColor = (category) => {
    switch (category) {
      case 'TA Apartments': return 'bg-blue-100 text-blue-800';
      case 'Berlin Staff Apartments': return 'bg-purple-100 text-purple-800';
      case 'Admin Apartments': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Apartment Management</h1>
        <p className="text-gray-600">Manage accommodations and repairs for all apartment categories</p>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <HomeIcon className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Apartments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <UserGroupIcon className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Occupied</p>
              <p className="text-2xl font-bold text-gray-900">{stats.occupied}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <CurrencyEuroIcon className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">€{stats.totalRent.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <WrenchScrewdriverIcon className="w-8 h-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Repairs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingRepairs}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('apartments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'apartments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <HomeIcon className="w-5 h-5 inline mr-2" />
              Apartments ({filteredApartments.length})
            </button>
            <button
              onClick={() => setActiveTab('repairs')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'repairs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <WrenchScrewdriverIcon className="w-5 h-5 inline mr-2" />
              Repairs & Maintenance ({filteredRepairs.length})
            </button>
          </nav>
        </div>
      </div>
      
      {/* Filters and Actions */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            {activeTab === 'apartments' ? (
              <>
                <option value="occupied">Occupied</option>
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
              </>
            ) : (
              <>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </>
            )}
          </select>
          
          {activeTab === 'apartments' && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Categories</option>
              <option value="TA Apartments">TA Apartments</option>
              <option value="Berlin Staff Apartments">Berlin Staff Apartments</option>
              <option value="Admin Apartments">Admin Apartments</option>
            </select>
          )}
        </div>
        
        <div className="flex space-x-3">
          {activeTab === 'apartments' ? (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Apartment
            </button>
          ) : (
            <button
              onClick={() => setShowRepairModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Report Repair
            </button>
          )}
        </div>
      </div>
      
      {/* Content based on active tab */}
      {activeTab === 'apartments' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApartments.map((apartment) => (
            <div key={apartment.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <HomeIcon className="w-6 h-6 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Apt #{apartment.id}</h3>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(apartment.status)}`}>
                    {apartment.status.charAt(0).toUpperCase() + apartment.status.slice(1)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(apartment.category)}`}>
                    {apartment.category.split(' ')[0]}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPinIcon className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{apartment.address}</p>
                    <p className="text-sm text-gray-600">{apartment.apartmentNo}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <BuildingOfficeIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{apartment.rooms}</span>
                </div>
                
                <div className="flex items-center">
                  <CurrencyEuroIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-900">
                    {apartment.rent > 0 ? `€${apartment.rent.toLocaleString()}/month` : 'Free'}
                  </span>
                </div>
                
                {(apartment.tenants || apartment.tenant) && (
                  <div className="flex items-center">
                    <UserGroupIcon className="w-4 h-4 text-gray-400 mr-2" />
                    <div className="text-sm text-gray-600">
                      {apartment.tenants ? (
                        apartment.tenants.filter(t => t.trim()).length > 0 ? (
                          <div className="space-y-1">
                            {apartment.tenants.map((tenant, index) => 
                              tenant.trim() && (
                                <div key={index} className="flex flex-col space-y-1 p-2 bg-gray-50 rounded">
                                  <div className="flex items-center">
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                                      Room {index + 1}
                                    </span>
                                    <span className="font-medium">{tenant}</span>
                                  </div>
                                  {apartment.tenantEmails && apartment.tenantEmails[index] && (
                                    <div className="text-xs text-gray-500 ml-2">
                                      📧 {apartment.tenantEmails[index]}
                                    </div>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">No tenants assigned</span>
                        )
                      ) : (
                        <span>{apartment.tenant}</span>
                      )}
                    </div>
                  </div>
                )}
                
                {apartment.stayEnd && (
                  <div className="flex items-center">
                    <ClockIcon className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Stay ends: {apartment.stayEnd}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => handleViewDetails(apartment)}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-md"
                  title="View Details"
                >
                  <EyeIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEditApartment(apartment)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                  title="Edit"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteApartment(apartment.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  title="Delete"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Not Completed Repairs */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <ClockIcon className="w-5 h-5 mr-2 text-orange-500" />
              Not Completed ({filteredRepairs.filter(repair => repair.status !== 'completed').length})
            </h2>
            {filteredRepairs.filter(repair => repair.status !== 'completed').length > 0 ? (
              <div className="space-y-4">
                {filteredRepairs.filter(repair => repair.status !== 'completed').map((repair) => {
                  const apartment = apartments.find(apt => apt.id === repair.apartmentId);
                  return (
                    <div key={repair.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{repair.title}</h3>
                          <p className="text-sm text-gray-600">
                            {apartment ? `${apartment.address} - ${apartment.apartmentNo}` : 'Unknown Apartment'}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(repair.priority)}`}>
                            {repair.priority.charAt(0).toUpperCase() + repair.priority.slice(1)} Priority
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(repair.status)}`}>
                            {repair.status.charAt(0).toUpperCase() + repair.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4">{repair.description}</p>
                      
                      <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                        <div className="space-y-1">
                          <div>Reported: {repair.reportedDate}</div>
                          {repair.assignedTo && <div>Assigned to: {repair.assignedTo}</div>}
                          {repair.estimatedCost > 0 && <div>Estimated Cost: €{repair.estimatedCost}</div>}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                         <div className="flex space-x-2">
                           {repair.status === 'pending' && (
                             <button
                               onClick={() => updateRepairStatus(repair.id, 'in-progress')}
                               className="px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700"
                             >
                               Start Work
                             </button>
                           )}
                           {repair.status === 'in-progress' && (
                             <button
                               onClick={() => updateRepairStatus(repair.id, 'completed')}
                               className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                             >
                               Mark Complete
                             </button>
                           )}
                         </div>
                         <button
                           onClick={() => handleEditRepair(repair)}
                           className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                           title="Edit Repair"
                         >
                           <PencilIcon className="w-4 h-4" />
                         </button>
                       </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <ClockIcon className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pending repairs</h3>
                <p className="text-gray-500">All repairs in this category are completed.</p>
              </div>
            )}
          </div>

          {/* Completed Repairs */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircleIcon className="w-5 h-5 mr-2 text-green-500" />
              Completed ({filteredRepairs.filter(repair => repair.status === 'completed').length})
            </h2>
            {filteredRepairs.filter(repair => repair.status === 'completed').length > 0 ? (
              <div className="space-y-4">
                {filteredRepairs.filter(repair => repair.status === 'completed').map((repair) => {
                  const apartment = apartments.find(apt => apt.id === repair.apartmentId);
                  return (
                    <div key={repair.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 opacity-75">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 line-through">{repair.title}</h3>
                          <p className="text-sm text-gray-600">
                            {apartment ? `${apartment.address} - ${apartment.apartmentNo}` : 'Unknown Apartment'}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(repair.priority)}`}>
                            {repair.priority.charAt(0).toUpperCase() + repair.priority.slice(1)} Priority
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completed
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4 line-through">{repair.description}</p>
                      
                      <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                        <div className="space-y-1">
                          <div>Reported: {repair.reportedDate}</div>
                          {repair.assignedTo && <div>Assigned to: {repair.assignedTo}</div>}
                          {repair.estimatedCost > 0 && <div>Estimated Cost: €{repair.estimatedCost}</div>}
                          {repair.completionDate && <div>Completed: {repair.completionDate}</div>}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => updateRepairStatus(repair.id, 'pending')}
                          className="px-3 py-1 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700"
                          title="Revert to Pending"
                        >
                          Revert to Pending
                        </button>
                        <button
                          onClick={() => handleEditRepair(repair)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                          title="Edit Repair"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No completed repairs</h3>
                <p className="text-gray-500">Completed repairs will appear here.</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Create Apartment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New Apartment</h2>
            <form onSubmit={handleApartmentSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={apartmentFormData.address}
                    onChange={(e) => setApartmentFormData({...apartmentFormData, address: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apartment No.</label>
                  <input
                    type="text"
                    value={apartmentFormData.apartmentNo}
                    onChange={(e) => setApartmentFormData({...apartmentFormData, apartmentNo: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rooms</label>
                  <input
                    type="text"
                    value={apartmentFormData.rooms}
                    onChange={(e) => handleRoomsChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rent (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={apartmentFormData.rent}
                    onChange={(e) => setApartmentFormData({...apartmentFormData, rent: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={apartmentFormData.category}
                    onChange={(e) => setApartmentFormData({...apartmentFormData, category: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="TA Apartments">TA Apartments</option>
                    <option value="Berlin Staff Apartments">Berlin Staff Apartments</option>
                    <option value="Admin Apartments">Admin Apartments</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={apartmentFormData.status}
                    onChange={(e) => setApartmentFormData({...apartmentFormData, status: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                {apartmentFormData.status === 'occupied' && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tenants ({apartmentFormData.tenants.length} {apartmentFormData.tenants.length === 1 ? 'room' : 'rooms'})
                    </label>
                    {apartmentFormData.tenants.map((tenant, index) => (
                      <div key={index} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                          Room {index + 1} Tenant
                        </label>
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={tenant}
                            onChange={(e) => handleTenantChange(index, e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            placeholder={`Tenant name for room ${index + 1}`}
                          />
                          <input
                            type="email"
                            value={apartmentFormData.tenantEmails[index] || ''}
                            onChange={(e) => handleTenantEmailChange(index, e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            placeholder={`Email for room ${index + 1} tenant`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Stay Start Date</label>
                   <input
                     type="date"
                     value={apartmentFormData.stayStart}
                     onChange={(e) => setApartmentFormData({...apartmentFormData, stayStart: e.target.value})}
                     className="w-full border border-gray-300 rounded-md px-3 py-2"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Stay End Date</label>
                   <input
                     type="date"
                     value={apartmentFormData.stayEnd}
                     onChange={(e) => setApartmentFormData({...apartmentFormData, stayEnd: e.target.value})}
                     className="w-full border border-gray-300 rounded-md px-3 py-2"
                   />
                 </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Apartment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Report Repair Modal */}
      {showRepairModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Report Repair</h2>
            <form onSubmit={handleRepairSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apartment</label>
                  <select
                    value={repairFormData.apartmentId}
                    onChange={(e) => setRepairFormData({...repairFormData, apartmentId: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Select Apartment</option>
                    {apartments.map(apt => (
                      <option key={apt.id} value={apt.id}>
                        {apt.address} - {apt.apartmentNo}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={repairFormData.title}
                    onChange={(e) => setRepairFormData({...repairFormData, title: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={repairFormData.description}
                    onChange={(e) => setRepairFormData({...repairFormData, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows="3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={repairFormData.priority}
                    onChange={(e) => setRepairFormData({...repairFormData, priority: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                  <input
                    type="text"
                    value={repairFormData.assignedTo}
                    onChange={(e) => setRepairFormData({...repairFormData, assignedTo: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={repairFormData.estimatedCost}
                    onChange={(e) => setRepairFormData({...repairFormData, estimatedCost: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowRepairModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Report Repair
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Apartment Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Apartment</h2>
            <form onSubmit={handleUpdateApartment}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={apartmentFormData.address}
                    onChange={(e) => setApartmentFormData({...apartmentFormData, address: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apartment No.</label>
                  <input
                    type="text"
                    value={apartmentFormData.apartmentNo}
                    onChange={(e) => setApartmentFormData({...apartmentFormData, apartmentNo: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rooms</label>
                  <input
                    type="text"
                    value={apartmentFormData.rooms}
                    onChange={(e) => handleRoomsChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rent (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={apartmentFormData.rent}
                    onChange={(e) => setApartmentFormData({...apartmentFormData, rent: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={apartmentFormData.category}
                    onChange={(e) => setApartmentFormData({...apartmentFormData, category: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="TA Apartments">TA Apartments</option>
                    <option value="Berlin Staff Apartments">Berlin Staff Apartments</option>
                    <option value="Admin Apartments">Admin Apartments</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={apartmentFormData.status}
                    onChange={(e) => setApartmentFormData({...apartmentFormData, status: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                {apartmentFormData.status === 'occupied' && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tenants ({apartmentFormData.tenants.length} {apartmentFormData.tenants.length === 1 ? 'room' : 'rooms'})
                    </label>
                    {apartmentFormData.tenants.map((tenant, index) => (
                      <div key={index} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                          Room {index + 1} Tenant
                        </label>
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={tenant}
                            onChange={(e) => handleTenantChange(index, e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            placeholder={`Tenant name for room ${index + 1}`}
                          />
                          <input
                            type="email"
                            value={apartmentFormData.tenantEmails[index] || ''}
                            onChange={(e) => handleTenantEmailChange(index, e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            placeholder={`Email for room ${index + 1} tenant`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Stay Start Date</label>
                   <input
                     type="date"
                     value={apartmentFormData.stayStart}
                     onChange={(e) => setApartmentFormData({...apartmentFormData, stayStart: e.target.value})}
                     className="w-full border border-gray-300 rounded-md px-3 py-2"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Stay End Date</label>
                   <input
                     type="date"
                     value={apartmentFormData.stayEnd}
                     onChange={(e) => setApartmentFormData({...apartmentFormData, stayEnd: e.target.value})}
                     className="w-full border border-gray-300 rounded-md px-3 py-2"
                   />
                 </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update Apartment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* View Details Modal */}
      {showDetailsModal && selectedApartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">Apartment Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Apt #{selectedApartment.id}</h3>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedApartment.status)}`}>
                    {selectedApartment.status.charAt(0).toUpperCase() + selectedApartment.status.slice(1)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedApartment.category)}`}>
                    {selectedApartment.category}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Address</label>
                  <p className="text-gray-900">{selectedApartment.address}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Apartment Number</label>
                  <p className="text-gray-900">{selectedApartment.apartmentNo}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Rooms</label>
                  <p className="text-gray-900">{selectedApartment.rooms}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Monthly Rent</label>
                  <p className="text-gray-900 font-semibold">
                    {selectedApartment.rent > 0 ? `€${selectedApartment.rent.toLocaleString()}/month` : 'Free'}
                  </p>
                </div>
                
                {(selectedApartment.tenants || selectedApartment.tenant) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Current Tenant{selectedApartment.tenants && selectedApartment.tenants.filter(t => t.trim()).length > 1 ? 's' : ''}
                    </label>
                    <div className="text-gray-900">
                      {selectedApartment.tenants ? (
                        selectedApartment.tenants.filter(t => t.trim()).length > 0 ? (
                          <div className="space-y-2">
                            {selectedApartment.tenants.map((tenant, index) => 
                              tenant.trim() && (
                                <div key={index} className="p-3 bg-gray-50 rounded border">
                                  <div className="flex items-center mb-2">
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mr-3 font-medium">
                                      Room {index + 1}
                                    </span>
                                    <span className="font-medium">{tenant}</span>
                                  </div>
                                  {selectedApartment.tenantEmails && selectedApartment.tenantEmails[index] && (
                                    <div className="text-sm text-gray-600 ml-2">
                                      <span className="font-medium">Email:</span> {selectedApartment.tenantEmails[index]}
                                    </div>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">No tenants assigned</span>
                        )
                      ) : (
                        <span>{selectedApartment.tenant}</span>
                      )}
                    </div>
                  </div>
                )}
                
                {selectedApartment.stayStart && (
                   <div>
                     <label className="block text-sm font-medium text-gray-500">Stay Start</label>
                     <p className="text-gray-900">{selectedApartment.stayStart}</p>
                   </div>
                 )}
                 
                 {selectedApartment.stayEnd && (
                   <div>
                     <label className="block text-sm font-medium text-gray-500">Stay End</label>
                     <p className="text-gray-900">{selectedApartment.stayEnd}</p>
                   </div>
                 )}
              </div>
              
              {/* Related Repairs */}
              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Related Repairs</h4>
                {repairs.filter(repair => repair.apartmentId === selectedApartment.id).length > 0 ? (
                  <div className="space-y-2">
                    {repairs.filter(repair => repair.apartmentId === selectedApartment.id).map(repair => (
                      <div key={repair.id} className="p-3 bg-gray-50 rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{repair.title}</p>
                            <p className="text-sm text-gray-600">{repair.description}</p>
                            <p className="text-xs text-gray-500 mt-1">Reported: {repair.reportedDate}</p>
                          </div>
                          <div className="flex space-x-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(repair.priority)}`}>
                              {repair.priority}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(repair.status)}`}>
                              {repair.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No repairs reported for this apartment.</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  handleEditApartment(selectedApartment);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit Apartment
              </button>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Repair Modal */}
      {showEditRepairModal && selectedRepair && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Repair</h2>
            <form onSubmit={handleUpdateRepair}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apartment</label>
                  <select
                    value={repairFormData.apartmentId}
                    onChange={(e) => setRepairFormData({...repairFormData, apartmentId: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Select Apartment</option>
                    {apartments.map(apt => (
                      <option key={apt.id} value={apt.id}>
                        {apt.address} - {apt.apartmentNo}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={repairFormData.title}
                    onChange={(e) => setRepairFormData({...repairFormData, title: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={repairFormData.description}
                    onChange={(e) => setRepairFormData({...repairFormData, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows="3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={repairFormData.priority}
                    onChange={(e) => setRepairFormData({...repairFormData, priority: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={repairFormData.status}
                    onChange={(e) => setRepairFormData({...repairFormData, status: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                  <input
                    type="text"
                    value={repairFormData.assignedTo}
                    onChange={(e) => setRepairFormData({...repairFormData, assignedTo: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={repairFormData.estimatedCost}
                    onChange={(e) => setRepairFormData({...repairFormData, estimatedCost: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditRepairModal(false);
                    setSelectedRepair(null);
                    resetRepairForm();
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update Repair
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Apartments;