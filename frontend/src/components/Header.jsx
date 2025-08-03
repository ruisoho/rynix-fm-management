import React from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import ThemeToggle from './ThemeToggle';
import { useUser } from '../contexts/UserContext';

const Header = ({ onMenuClick, showMenuButton = false }) => {
  const { user } = useUser();

  return (
    <header className="bg-light-card dark:bg-dark-card shadow-sm border-b border-light-border dark:border-dark-border transition-colors duration-300">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          {showMenuButton && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 lg:hidden"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          )}
          

        </div>

        <div className="flex items-center space-x-4">
          {/* Theme toggle */}
          <ThemeToggle />

          {/* User info */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-light-text dark:text-dark-text">
                {user.name}
              </p>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                {user.role}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-accent dark:bg-accent-dark flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user.initials}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;