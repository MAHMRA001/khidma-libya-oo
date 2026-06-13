import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

const staticUser = {
  id: 'guest',
  email: 'guest@khedma313libya.com',
  full_name: 'Guest User',
  account_type: 'client',
  role: 'user',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(staticUser);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(true);
  const [appPublicSettings, setAppPublicSettings] = useState({
    id: 'public',
    public_settings: {},
  });

  useEffect(() => {
    setUser(staticUser);
    setIsAuthenticated(true);
    setIsLoadingAuth(false);
    setIsLoadingPublicSettings(false);
    setAuthError(null);
    setAuthChecked(true);
    setAppPublicSettings({
      id: 'public',
      public_settings: {},
    });
  }, []);

  const checkAppState = async () => {
    setUser(staticUser);
    setIsAuthenticated(true);
    setIsLoadingAuth(false);
    setIsLoadingPublicSettings(false);
    setAuthError(null);
    setAuthChecked(true);
    setAppPublicSettings({
      id: 'public',
      public_settings: {},
    });
  };

  const checkUserAuth = async () => {
    setUser(staticUser);
    setIsAuthenticated(true);
    setIsLoadingAuth(false);
    setAuthChecked(true);
    setAuthError(null);
  };

  const logout = () => {
    setUser(staticUser);
    setIsAuthenticated(true);
    window.location.hash = '#/welcome';
  };

  const navigateToLogin = () => {
    window.location.hash = '#/welcome';
  };

  return (
    <AuthContext.Provider
      value={{
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
        checkAppState,
      }}
    >
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