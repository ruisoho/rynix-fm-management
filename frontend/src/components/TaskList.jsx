import React from 'react';
import { CheckCircleIcon, ClockIcon, PlusIcon } from '@heroicons/react/24/outline';
import TaskCard from './TaskCard';

const TaskList = ({ 
  tasks,
  filter,
  onMarkAsDone,
  onRevert,
  onEdit,
  onDelete,
  onCreateTask
}) => {
  if (!tasks || !Array.isArray(tasks)) {
    return (
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
    );
  }

  const notCompletedTasks = tasks.filter(task => task.status !== 'completed');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  // Show general empty state only when no tasks exist at all
  if (tasks.length === 0) {
    return (
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
            onClick={onCreateTask}
            className="btn btn-primary mt-4"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Task
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Not Completed Tasks */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <ClockIcon className="h-5 w-5 mr-2 text-orange-500" />
          Not Completed ({notCompletedTasks.length})
        </h2>
        {notCompletedTasks.length > 0 ? (
          <div className="space-y-4">
            {notCompletedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onMarkAsDone={onMarkAsDone}
                onEdit={onEdit}
                onDelete={onDelete}
                isCompleted={false}
              />
            ))}
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
          Completed ({completedTasks.length})
        </h2>
        {completedTasks.length > 0 ? (
          <div className="space-y-4">
            {completedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onRevert={onRevert}
                onEdit={onEdit}
                onDelete={onDelete}
                isCompleted={true}
              />
            ))}
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
  );
};

export default TaskList;