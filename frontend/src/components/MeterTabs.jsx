import React from 'react';
import { BoltIcon, FireIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

const MeterTabs = ({ activeTab, onTabChange, electricMeters, gasMeters, heatingMeters }) => {
  const getTabIcon = (tab) => {
    switch (tab) {
      case 'electric':
        return BoltIcon;
      case 'gas':
        return FireIcon;
      case 'heating':
        return WrenchScrewdriverIcon;
      default:
        return BoltIcon;
    }
  };

  const getTabLabel = (tab) => {
    switch (tab) {
      case 'electric':
        return 'Electric Meters';
      case 'gas':
        return 'Gas Meters';
      case 'heating':
        return 'Heating Meters';
      default:
        return 'Meters';
    }
  };

  const getTabCount = (tab) => {
    switch (tab) {
      case 'electric':
        return electricMeters.length;
      case 'gas':
        return gasMeters.length;
      case 'heating':
        return heatingMeters.length;
      default:
        return 0;
    }
  };

  const tabs = ['electric', 'gas', 'heating'];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const Icon = getTabIcon(tab);
          const isActive = activeTab === tab;
          const count = getTabCount(tab);
          
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`${
                isActive
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center transition-colors duration-200`}
            >
              <Icon className="h-5 w-5 mr-2" />
              {getTabLabel(tab)}
              <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                isActive
                  ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default MeterTabs;