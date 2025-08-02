import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  ChartBarIcon,
  BoltIcon,
  CogIcon,
  PresentationChartBarIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon },
  { name: 'Facilities', href: '/facilities', icon: BuildingOfficeIcon },
  { name: 'Maintenance', href: '/maintenance', icon: WrenchScrewdriverIcon },
  { name: 'Tasks', href: '/tasks', icon: CheckCircleIcon },
  { name: 'Meter Management', href: '/meters', icon: BoltIcon },
  { name: 'Apartments', href: '/apartments', icon: HomeIcon },
  { name: 'Charts & Reports', href: '/charts-reports', icon: PresentationChartBarIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

const Sidebar = ({ onNavigate }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-light-border dark:border-dark-border">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <BuildingOfficeIcon className="h-8 w-8 text-accent dark:text-accent-dark" />
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-semibold text-light-text dark:text-dark-text">
              Facility Manager
            </h1>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
              Offline-first management
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onNavigate}
              className={({ isActive }) =>
                isActive
                  ? 'sidebar-link sidebar-link-active'
                  : 'sidebar-link sidebar-link-inactive'
              }
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 px-4 py-4 border-t border-light-border dark:border-dark-border">
        <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
          <div className="flex items-center justify-between mb-1">
            <span>Version 1.0.0</span>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
              <span>Online</span>
            </div>
          </div>
          <div className="text-center">
            <p>© 2024 Facility Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;