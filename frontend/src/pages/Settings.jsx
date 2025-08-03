import React, { useState } from 'react';
import {
  CogIcon,
  MoonIcon,
  SunIcon,
  ComputerDesktopIcon,
  InformationCircleIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

const Settings = () => {
  const { theme, setTheme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'data', name: 'Data Management', icon: DocumentArrowDownIcon },
    { id: 'about', name: 'About', icon: InformationCircleIcon }
  ];

  const themeOptions = [
    {
      value: 'light',
      label: 'Light',
      description: 'Light theme for daytime use',
      icon: SunIcon
    },
    {
      value: 'dark',
      label: 'Dark',
      description: 'Dark theme for low-light environments',
      icon: MoonIcon
    },
    {
      value: 'system',
      label: 'System',
      description: 'Follow system preference',
      icon: ComputerDesktopIcon
    }
  ];

  const handleExportData = () => {
    // This would typically call an API endpoint to export data
    alert('Export functionality would be implemented here');
  };

  const handleImportData = () => {
    // This would typically open a file picker and call an API endpoint
    alert('Import functionality would be implemented here');
  };

  const handleBackupData = () => {
    // This would create a backup of the SQLite database
    alert('Backup functionality would be implemented here');
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your application preferences and data
        </p>
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
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* Theme settings */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Appearance
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Customize the look and feel of the application
                </p>
              </div>
              <div className="card-body">
                <div>
                  <label className="form-label mb-3">
                    Theme
                  </label>
                  <div className="space-y-3">
                    {themeOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = theme === option.value || 
                        (option.value === 'system' && !localStorage.getItem('theme'));
                      
                      return (
                        <div key={option.value} className="flex items-center">
                          <input
                            type="radio"
                            id={`theme-${option.value}`}
                            name="theme"
                            value={option.value}
                            checked={isSelected}
                            onChange={() => {
                              if (option.value === 'system') {
                                localStorage.removeItem('theme');
                                const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                                setTheme(systemPrefersDark ? 'dark' : 'light');
                              } else {
                                setTheme(option.value);
                              }
                            }}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600"
                          />
                          <label
                            htmlFor={`theme-${option.value}`}
                            className="ml-3 flex items-center cursor-pointer"
                          >
                            <Icon className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {option.label}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {option.description}
                              </div>
                            </div>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Application settings */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Application
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  General application preferences
                </p>
              </div>
              <div className="card-body space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Auto-save changes
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Automatically save changes as you type
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Show notifications
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Display system notifications for important events
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Compact view
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Use a more compact layout to show more information
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-6">
            {/* Data export/import */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Data Management
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Export, import, and backup your facility data
                </p>
              </div>
              <div className="card-body space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    onClick={handleExportData}
                    className="btn-outline flex items-center justify-center"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Export Data
                  </button>
                  
                  <button
                    onClick={handleImportData}
                    className="btn-outline flex items-center justify-center"
                  >
                    <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
                    Import Data
                  </button>
                  
                  <button
                    onClick={handleBackupData}
                    className="btn btn-primary flex items-center justify-center"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Create Backup
                  </button>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-md p-4">
                  <div className="flex">
                    <InformationCircleIcon className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
                    <div className="text-sm text-yellow-700 dark:text-yellow-200">
                      <p className="font-medium mb-1">Data Management Tips:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Export your data regularly to prevent data loss</li>
                        <li>Backup files are stored locally and can be restored if needed</li>
                        <li>Import functionality supports JSON and CSV formats</li>
                        <li>All data is stored locally on your device for privacy</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Database information */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Database Information
                </h3>
              </div>
              <div className="card-body">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Database Type
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      SQLite (Local)
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Storage Location
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      Local Device
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Data Encryption
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      Not Enabled
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Offline Mode
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      Always Available
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-6">
            {/* Application info */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  About Facility Manager
                </h3>
              </div>
              <div className="card-body">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                    <CogIcon className="h-8 w-8 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      Facility Manager
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400">
                      Offline-first facility management desktop application
                    </p>
                  </div>
                </div>
                
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Version
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      1.0.0
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Platform
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      Web Application
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Frontend
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      React + Tailwind CSS
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Backend
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      Node.js + Express
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Database
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      SQLite (Local)
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      License
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      MIT
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Features */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Features
                </h3>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Core Features</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Facility Management</li>
                      <li>• Maintenance Tracking</li>
                      <li>• Task Management</li>
                      <li>• Heating System Monitoring</li>
                      <li>• Electric Meter Readings</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Technical Features</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Offline-first Architecture</li>
                      <li>• Local SQLite Database</li>
                      <li>• Cross-platform Desktop App</li>
                      <li>• Dark/Light Theme Support</li>
                      <li>• Data Export/Import</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* System information */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  System Information
                </h3>
              </div>
              <div className="card-body">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Operating System
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {navigator.platform}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Browser Engine
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      Web Browser
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Screen Resolution
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {window.screen.width} × {window.screen.height}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Color Scheme
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {isDark ? 'Dark' : 'Light'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;