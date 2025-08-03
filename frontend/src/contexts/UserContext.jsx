import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: 'Local User',
    role: 'Administrator',
    initials: 'LU'
  });

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
      }
    }
  }, []);

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  const updateUser = (updates) => {
    setUser(prevUser => {
      const updatedUser = { ...prevUser, ...updates };
      
      // Auto-generate initials if name changes
      if (updates.name) {
        const nameParts = updates.name.trim().split(' ');
        const initials = nameParts.length > 1 
          ? nameParts[0][0] + nameParts[nameParts.length - 1][0]
          : nameParts[0][0] + (nameParts[0][1] || '');
        updatedUser.initials = initials.toUpperCase();
      }
      
      return updatedUser;
    });
  };

  const value = {
    user,
    updateUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};