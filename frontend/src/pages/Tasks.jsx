import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useApi } from '../contexts/ApiContext';
import { isAfter, parseISO } from 'date-fns';
import TaskStats from '../components/TaskStats';
import TaskFilters from '../components/TaskFilters';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';

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

  const handleFormDataChange = (newFormData) => {
    setFormData(newFormData);
  };

  const isOverdue = (dueDateString) => {
    if (!dueDateString) return false;
    try {
      return isAfter(new Date(), parseISO(dueDateString));
    } catch {
      return false;
    }
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

      {/* Task Statistics */}
      <TaskStats tasks={tasks} />

      {/* Status filter tabs */}
      <TaskFilters 
        filter={filter}
        onFilterChange={setFilter}
        statusCounts={statusCounts}
      />

      {/* Tasks list */}
      <TaskList 
        tasks={filteredTasks}
        filter={filter}
        loading={loading}
        onMarkAsDone={handleMarkTaskAsDone}
        onRevert={handleRevertTask}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        onCreateTask={() => setShowCreateModal(true)}
      />

      {/* Create/Edit task modal */}
      <TaskForm
        isOpen={showCreateModal || showEditModal}
        editingTask={editingTask}
        formData={formData}
        facilities={facilities}
        maintenance={maintenance}
        loading={loading}
        onSubmit={handleSubmit}
        onFormDataChange={handleFormDataChange}
        onMarkAsDone={handleMarkAsDone}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Tasks;