import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../features/auth/services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = authService.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data);
    return data;
  };

  const signup = async (fullName, email, password, mobileNumber) => {
    return await authService.signup(fullName, email, password, mobileNumber);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    // Navigate will be handled by components using the logout function
  };

  const isAdmin = () => {
    return user?.roles?.includes('ROLE_ADMIN') || false;
  };

  const hasRole = (role) => {
    return user?.roles?.includes(role) || false;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isAdmin, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
