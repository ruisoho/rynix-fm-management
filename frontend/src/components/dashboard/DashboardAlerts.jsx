import React, { memo } from 'react';
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

/**
 * DashboardAlerts Component - Displays system alerts and notifications
 * Memoized for performance optimization
 */
const DashboardAlerts = memo(({ alerts, onDismissAlert }) => {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  const getAlertStyles = (type) => {
    switch (type) {
      case 'error':
        return {
          container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
          icon: 'text-red-600 dark:text-red-400',
          title: 'text-red-800 dark:text-red-200',
          message: 'text-red-700 dark:text-red-300',
          button: 'text-red-400 hover:text-red-600 dark:hover:text-red-200'
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
          icon: 'text-yellow-600 dark:text-yellow-400',
          title: 'text-yellow-800 dark:text-yellow-200',
          message: 'text-yellow-700 dark:text-yellow-300',
          button: 'text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-200'
        };
      case 'info':
      default:
        return {
          container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
          icon: 'text-blue-600 dark:text-blue-400',
          title: 'text-blue-800 dark:text-blue-200',
          message: 'text-blue-700 dark:text-blue-300',
          button: 'text-blue-400 hover:text-blue-600 dark:hover:text-blue-200'
        };
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error':
        return ExclamationCircleIcon;
      case 'warning':
        return ExclamationTriangleIcon;
      case 'info':
      default:
        return InformationCircleIcon;
    }
  };

  return (
    <div className="mb-6 space-y-4">
      {alerts.map((alert) => {
        const styles = getAlertStyles(alert.type);
        const IconComponent = alert.icon || getAlertIcon(alert.type);

        return (
          <div
            key={alert.id}
            className={`border rounded-lg p-4 ${styles.container} animate-in slide-in-from-top-2 duration-300`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <IconComponent className={`h-5 w-5 ${styles.icon}`} />
              </div>
              <div className="ml-3 flex-1">
                <h3 className={`text-sm font-medium ${styles.title}`}>
                  {alert.title}
                </h3>
                <p className={`mt-1 text-sm ${styles.message}`}>
                  {alert.message}
                </p>
              </div>
              {onDismissAlert && (
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      type="button"
                      onClick={() => onDismissAlert(alert.id)}
                      className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${styles.button}`}
                      aria-label={`Dismiss ${alert.title} alert`}
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});

DashboardAlerts.displayName = 'DashboardAlerts';

export default DashboardAlerts;