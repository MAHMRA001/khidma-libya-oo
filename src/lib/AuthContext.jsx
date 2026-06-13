import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

const guestUser = {
  id: 'guest',
  email: '',
  full_name: 'Guest User',
  account_type: 'client',
  role: 'guest',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(guestUser);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(true);
  const [appPublicSettings, setAppPublicSettings] = useState({
    id: 'public',
    public_settings: {},
  });

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkAppState = async () => {
    setIsLoadingPublicSettings(false);
    setAppPublicSettings({
      id: 'public',
      public_settings: {},
    });
  };

  const checkUserAuth = async () => {
    const currentUser = await base44.auth.me();

    setUser(currentUser);
    setIsAuthenticated(Boolean(currentUser.email));
    setIsLoadingAuth(false);
    setAuthChecked(true);
    setAuthError(null);
  };

  const loginWithEmail = async (email) => {
    const loggedInUser = await base44.auth.loginWithEmail(email);

    setUser(loggedInUser);
    setIsAuthenticated(true);
    setAuthError(null);

    return loggedInUser;
  };

  const logout = () => {
    base44.auth.logout();
    setUser(guestUser);
    setIsAuthenticated(false);
  };

  const navigateToLogin = () => {
    window.location.hash = '#/login';
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
        loginWithEmail,
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