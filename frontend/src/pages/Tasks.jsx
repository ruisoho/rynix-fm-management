import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  CheckCircleIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useApi } from '../contexts/ApiContext';
import { format, isAfter, parseISO } from 'date-fns';

const Tasks = () => {
  const { getTasks, getFacilities, getMaintenance, createTask, updateTask, deleteTask, loading, error } = useApi();
  const [tasks, setTasks] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: '',
    due_date: '',
    status: 'todo',
    priority: 'medium',
    facility_id: '',
    maintenance_id: ''
  });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksData, facilitiesData, maintenanceData] = await Promise.all([
        getTasks(),
        getFacilities(),
        getMaintenance()
      ]);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setFacilities(Array.isArray(facilitiesData) ? facilitiesData : []);
      setMaintenance(Array.isArray(maintenanceData) ? maintenanceData : []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setTasks([]);
      setFacilities([]);
      setMaintenance([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        ...formData,
        facility_id: formData.facility_id || null,
        maintenance_id: formData.maintenance_id || null
      };
      
      if (editingTask) {
        await updateTask(editingTask.id, taskData);
        setShowEditModal(false);
        setEditingTask(null);
      } else {
        await createTask(taskData);
        setShowCreateModal(false);
      }
      
      setFormData({
        title: '',
        description: '',
        assigned_to: '',
        due_date: '',
        status: 'todo',
        priority: 'medium',
        facility_id: '',
        maintenance_id: ''
      });
      fetchData();
    } catch (err) {
      console.error('Failed to save task:', err);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      assigned_to: task.assigned_to || '',
      due_date: task.due_date || '',
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      facility_id: task.facility_id || '',
      maintenance_id: task.maintenance_id || ''
    });
    setShowEditModal(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        await deleteTask(taskId);
        fetchData();
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  const handleMarkTaskAsDone = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const taskData = {
          ...task,
          status: 'completed',
          facility_id: task.facility_id || null,
          maintenance_id: task.maintenance_id || null
        };
        await updateTask(taskId, taskData);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to mark task as done:', err);
    }
  };

  const handleRevertTask = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const taskData = {
          ...task,
          status: 'todo',
          facility_id: task.facility_id || null,
          maintenance_id: task.maintenance_id || null
        };
        await updateTask(taskId, taskData);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to revert task:', err);
    }
  };

  const handleMarkAsDone = async () => {
    if (editingTask) {
      try {
        const taskData = {
          ...formData,
          status: 'completed',
          facility_id: formData.facility_id || null,
          maintenance_id: formData.maintenance_id || null
        };
        await updateTask(editingTask.id, taskData);
        setShowEditModal(false);
        setEditingTask(null);
        setFormData({
          title: '',
          description: '',
          assigned_to: '',
          due_date: '',
          status: 'todo',
          priority: 'medium',
          facility_id: '',
          maintenance_id: ''
        });
        fetchData();
      } catch (err) {
        console.error('Failed to mark task as done:', err);
      }
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      assigned_to: '',
      due_date: '',
      status: 'todo',
      priority: 'medium',
      facility_id: '',
      maintenance_id: ''
    });
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const isOverdue = (dueDateString) => {
    if (!dueDateString) return false;
    try {
      return isAfter(new Date(), parseISO(dueDateString));
    } catch {
      return false;
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      todo: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      in_progress: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      completed: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return statusClasses[status] || 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  };

  const getPriorityBadge = (priority) => {
    const priorityClasses = {
      low: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      medium: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      high: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      urgent: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return priorityClasses[priority] || 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  };

  const filteredTasks = (tasks || []).filter(task => {
    if (filter === 'all') return true;
    if (filter === 'overdue') return task.due_date && isOverdue(task.due_date) && task.status !== 'completed';
    return task.status === filter;
  });

  const statusCounts = {
    all: (tasks || []).length,
    todo: (tasks || []).filter(task => task.status === 'todo').length,
    in_progress: (tasks || []).filter(task => task.status === 'in_progress').length,
    completed: (tasks || []).filter(task => task.status === 'completed').length,
    overdue: (tasks || []).filter(task => task.due_date && isOverdue(task.due_date) && task.status !== 'completed').length
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Tasks
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage and track your facility tasks
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Task
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Status filter tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'All', count: statusCounts.all },
            { key: 'todo', label: 'To Do', count: statusCounts.todo },
            { key: 'in_progress', label: 'In Progress', count: statusCounts.in_progress },
            { key: 'completed', label: 'Completed', count: statusCounts.completed },
            { key: 'overdue', label: 'Overdue', count: statusCounts.overdue }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                filter === tab.key
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
              <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                tab.key === 'overdue' && tab.count > 0
                  ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tasks list */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="card-body">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Not Completed Tasks */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-orange-500" />
              Not Completed ({filteredTasks.filter(task => task.status !== 'completed').length})
            </h2>
            {filteredTasks.filter(task => task.status !== 'completed').length > 0 ? (
              <div className="space-y-4">
                {filteredTasks.filter(task => task.status !== 'completed').map((task) => {
            const overdue = task.due_date && isOverdue(task.due_date) && task.status !== 'completed';
            
            return (
              <div key={task.id} className={`card hover:shadow-medium transition-shadow duration-200 ${
                overdue ? 'border-l-4 border-l-red-500' : ''
              }`}>
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {task.title}
                        </h3>
                        {overdue && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            Overdue
                          </span>
                        )}
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        {task.facility_name && (
                          <div className="flex items-center">
                            <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                            {task.facility_name}
                          </div>
                        )}
                        
                        {task.assigned_to && (
                          <div className="flex items-center">
                            <UserIcon className="h-3 w-3 mr-1" />
                            {task.assigned_to}
                          </div>
                        )}
                        
                        {task.due_date && (
                          <div className={`flex items-center ${
                            overdue ? 'text-red-600 dark:text-red-400' : ''
                          }`}>
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            Due: {formatDate(task.due_date)}
                          </div>
                        )}
                        
                        <div className="flex items-center">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          Created: {formatDate(task.created_at)}
                        </div>
                      </div>
                      
                      {task.maintenance_description && (
                        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Related to maintenance: </span>
                          <span className="text-gray-600 dark:text-gray-400">{task.maintenance_description}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 flex-shrink-0 space-y-2">
                      <div className="flex flex-col items-end space-y-1">
                        <span className={getPriorityBadge(task.priority)}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => handleMarkTaskAsDone(task.id)}
                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                          title="Mark as Done"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditTask(task)}
                          className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                          title="Edit Task"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                          title="Delete Task"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <ClockIcon className="empty-state-icon text-orange-500" />
          <h3 className="empty-state-title">No pending tasks</h3>
          <p className="empty-state-description">
            All tasks in this category are completed.
          </p>
        </div>
      )}
    </div>

    {/* Completed Tasks */}
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
        <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500" />
        Completed ({filteredTasks.filter(task => task.status === 'completed').length})
      </h2>
      {filteredTasks.filter(task => task.status === 'completed').length > 0 ? (
        <div className="space-y-4">
          {filteredTasks.filter(task => task.status === 'completed').map((task) => {
            const overdue = task.due_date && isOverdue(task.due_date) && task.status !== 'completed';
            
            return (
              <div key={task.id} className={`card hover:shadow-medium transition-shadow duration-200 opacity-75 ${overdue ? 'border-l-4 border-l-red-500' : ''}`}>
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 line-through">
                          {task.title}
                        </h3>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Completed
                        </span>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-through">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        {task.facility_name && (
                          <div className="flex items-center">
                            <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                            {task.facility_name}
                          </div>
                        )}
                        
                        {task.assigned_to && (
                          <div className="flex items-center">
                            <UserIcon className="h-3 w-3 mr-1" />
                            {task.assigned_to}
                          </div>
                        )}
                        
                        {task.due_date && (
                          <div className="flex items-center">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            Due: {formatDate(task.due_date)}
                          </div>
                        )}
                        
                        <div className="flex items-center">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          Created: {formatDate(task.created_at)}
                        </div>
                      </div>
                      
                      {task.maintenance_description && (
                        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Related to maintenance: </span>
                          <span className="text-gray-600 dark:text-gray-400">{task.maintenance_description}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 flex-shrink-0 space-y-2">
                      <div className="flex flex-col items-end space-y-1">
                        <span className={getPriorityBadge(task.priority)}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => handleRevertTask(task.id)}
                          className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
                          title="Revert to Not Completed"
                        >
                          <ClockIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditTask(task)}
                          className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                          title="Edit Task"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                          title="Delete Task"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <CheckCircleIcon className="empty-state-icon text-green-500" />
          <h3 className="empty-state-title">No completed tasks</h3>
          <p className="empty-state-description">
            Completed tasks will appear here.
          </p>
        </div>
      )}
    </div>
  </div>
)}

{/* Show general empty state only when no tasks exist at all */}
{!loading && filteredTasks.length === 0 && (
  <div className="empty-state">
    <CheckCircleIcon className="empty-state-icon" />
    <h3 className="empty-state-title">
      {filter === 'all' ? 'No tasks' : `No ${filter.replace('_', ' ')} tasks`}
    </h3>
    <p className="empty-state-description">
      {filter === 'all' 
        ? 'Create your first task to get started.'
        : `No tasks with ${filter.replace('_', ' ')} status.`
      }
    </p>
    {filter === 'all' && (
      <button
        onClick={() => setShowCreateModal(true)}
        className="btn btn-primary mt-4"
      >
        <PlusIcon className="h-4 w-4 mr-2" />
        New Task
      </button>
    )}
  </div>
)}

      {/* Create/Edit task modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 sm:mx-0 sm:h-10 sm:w-10">
                      <CheckCircleIcon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                        {editingTask ? 'Edit Task' : 'New Task'}
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
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
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
                              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
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
                              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
                              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
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
                              onChange={(e) => setFormData({ ...formData, facility_id: e.target.value })}
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
                              onChange={(e) => setFormData({ ...formData, maintenance_id: e.target.value })}
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
                        {editingTask ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      editingTask ? 'Update Task' : 'Create Task'
                    )}
                  </button>
                  {editingTask && (
                    <button
                      type="button"
                      onClick={handleMarkAsDone}
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
                    onClick={handleCloseModal}
                    className="btn-outline w-full sm:w-auto mt-3 sm:mt-0"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;