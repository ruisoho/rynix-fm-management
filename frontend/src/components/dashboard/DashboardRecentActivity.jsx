import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import {
  WrenchScrewdriverIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

/**
 * DashboardRecentActivity Component - Displays recent maintenance and tasks
 * Memoized for performance optimization
 */
const DashboardRecentActivity = memo(({ dashboardData }) => {
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'in_progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'completed': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      'on_hold': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    };

    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      statusClasses[status] || statusClasses['pending']
    }`;
  };

  const EmptyState = ({ icon: Icon, title, description }) => (
    <div className="empty-state py-8">
      <Icon className="empty-state-icon" />
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
    </div>
  );

  const ActivityItem = ({ item, type }) => (
    <div className="flex items-start justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate mb-1">
          {type === 'maintenance' ? item.facility_name : (item.facility_name || 'General Task')}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-2">
          {item.description || item.title}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          {formatDate(item.created_at)}
        </p>
      </div>
      <div className="flex-shrink-0">
        <span className={getStatusBadge(item.status)}>
          {item.status.replace('_', ' ')}
        </span>
      </div>
    </div>
  );

  if (!dashboardData) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loading skeleton for recent activities */}
        {[...Array(2)].map((_, index) => (
          <div key={index} className="card h-fit">
            <div className="card-header px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
              </div>
            </div>
            <div className="card-body px-6 py-4">
              <div className="space-y-4">
                {[...Array(3)].map((_, itemIndex) => (
                  <div key={itemIndex} className="flex items-start justify-between py-3">
                    <div className="flex-1 pr-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
                    </div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent maintenance requests */}
      <div className="card h-fit">
        <div className="card-header px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recent Maintenance
            </h3>
            <Link
              to="/maintenance"
              className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              View all →
            </Link>
          </div>
        </div>
        <div className="card-body px-6 py-4">
          {dashboardData?.recent?.maintenance?.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.recent.maintenance.map((item) => (
                <ActivityItem key={item.id} item={item} type="maintenance" />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={WrenchScrewdriverIcon}
              title="No maintenance requests"
              description="Create your first maintenance request to get started."
            />
          )}
        </div>
      </div>

      {/* Recent tasks */}
      <div className="card h-fit">
        <div className="card-header px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recent Tasks
            </h3>
            <Link
              to="/tasks"
              className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              View all →
            </Link>
          </div>
        </div>
        <div className="card-body px-6 py-4">
          {dashboardData?.recent?.tasks?.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.recent.tasks.map((item) => (
                <ActivityItem key={item.id} item={item} type="task" />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={DocumentTextIcon}
              title="No recent tasks"
              description="Create your first task to get started."
            />
          )}
        </div>
      </div>
    </div>
  );
});

DashboardRecentActivity.displayName = 'DashboardRecentActivity';

export default DashboardRecentActivity;