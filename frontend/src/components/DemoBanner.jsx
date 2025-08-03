import React from 'react';
import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const DemoBanner = () => {
  const isDemoMode = process.env.REACT_APP_DEMO_MODE === 'true' || process.env.NODE_ENV === 'production';
  
  if (!isDemoMode) {
    return null;
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
      <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="w-0 flex-1 flex items-center">
            <span className="flex p-2 rounded-lg bg-yellow-100 dark:bg-yellow-800">
              <InformationCircleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-300" aria-hidden="true" />
            </span>
            <p className="ml-3 font-medium text-yellow-800 dark:text-yellow-200 truncate">
              <span className="md:hidden">
                Demo Mode - Sample Data Only
              </span>
              <span className="hidden md:inline">
                🚀 Demo Version - This is a demonstration of the Facility Management App with sample data. 
                No real backend connection.
              </span>
            </p>
          </div>
          <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
            <a
              href="https://github.com/ruisoho/rynix-fm-management"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-yellow-800 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-800 hover:bg-yellow-200 dark:hover:bg-yellow-700 transition-colors"
            >
              View Source Code
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoBanner;