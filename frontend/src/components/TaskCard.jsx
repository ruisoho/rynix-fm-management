import React from 'react';
import {
  CheckCircleIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { format, isAfter, parseISO } from 'date-fns';

const TaskCard = ({ 
  task, 
  onMarkAsDone, 
  onRevert, 
  onEdit, 
  onDelete,
  isCompleted = false 
}) => {
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

  const getPriorityBadge = (priority) => {
    const priorityClasses = {
      low: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      medium: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      high: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      urgent: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return priorityClasses[priority] || 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  };

  const overdue = task.due_date && isOverdue(task.due_date) && task.status !== 'completed';

  return (
    <div className={`card hover:shadow-medium transition-shadow duration-200 ${
      isCompleted ? 'opacity-75' : ''
    } ${
      overdue ? 'border-l-4 border-l-red-500' : ''
    }`}>
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className={`text-lg font-medium text-gray-900 dark:text-gray-100 ${
                isCompleted ? 'line-through' : ''
              }`}>
                {task.title}
              </h3>
              {overdue && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  Overdue
                </span>
              )}
              {isCompleted && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Completed
                </span>
              )}
            </div>
            
            {task.description && (
              <p className={`text-sm text-gray-600 dark:text-gray-300 mb-3 ${
                isCompleted ? 'line-through' : ''
              }`}>
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
              {isCompleted ? (
                <button
                  onClick={() => onRevert(task.id)}
                  className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
                  title="Revert to Not Completed"
                >
                  <ClockIcon className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => onMarkAsDone(task.id)}
                  className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                  title="Mark as Done"
                >
                  <CheckCircleIcon className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => onEdit(task)}
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                title="Edit Task"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(task.id)}
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
};

export default TaskCard;