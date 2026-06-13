import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

const demoUser = {
  id: 'public-user',
  email: 'public@khedma313libya.com',
  full_name: 'Public User',
  account_type: 'client'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(demoUser);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(true);
  const [appPublicSettings, setAppPublicSettings] = useState({ id: 'public', public_settings: {} });

  useEffect(() => {
    setUser(demoUser);
    setIsAuthenticated(true);
    setIsLoadingAuth(false);
    setIsLoadingPublicSettings(false);
    setAuthError(null);
    setAuthChecked(true);
    setAppPublicSettings({ id: 'public', public_settings: {} });
  }, []);

  const checkUserAuth = async () => {
    setUser(demoUser);
    setIsAuthenticated(true);
    setIsLoadingAuth(false);
    setAuthChecked(true);
    setAuthError(null);
    return demoUser;
  };

  const checkAppState = async () => {
    setUser(demoUser);
    setIsAuthenticated(true);
    setIsLoadingAuth(false);
    setIsLoadingPublicSettings(false);
    setAuthError(null);
    setAuthChecked(true);
    setAppPublicSettings({ id: 'public', public_settings: {} });
  };

  const logout = () => {
    setUser(demoUser);
    setIsAuthenticated(true);
  };

  const navigateToLogin = () => {
    console.log('Login redirect disabled on GitHub Pages');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState
    }}>
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
