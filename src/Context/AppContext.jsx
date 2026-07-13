/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
import React, { createContext, useContext, useState, useCallback } from "react";

export const AppContext = createContext();

const getStoredUser = () => {
  try {
    const stored = localStorage.getItem('AVR')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);

  const updateUser = useCallback((userData) => {
    setUser(userData)
    if (userData) {
      localStorage.setItem('AVR', JSON.stringify(userData))
    } else {
      localStorage.removeItem('AVR')
    }
  }, [])

  return (
    <AppContext.Provider value={{ user, setUser: updateUser }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  return useContext(AppContext);
};
