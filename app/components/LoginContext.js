import React, { createContext, useContext, useState } from 'react';

const LoginContext = createContext();

export function LoginProvider({ children }) {
  const [userName, setUserName] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);

  const isAuthenticated = Boolean(sessionToken);

  const updateLoginState = (newUserName, newSessionToken) => {
    setUserName(newUserName);
    setSessionToken(newSessionToken);
  };

  const logout = () => {
    setUserName(null);
    setSessionToken(null);
  };

  return (
    <LoginContext.Provider value={{ userName, sessionToken, isAuthenticated, updateLoginState, logout }}>
      {children}
    </LoginContext.Provider>
  );
}

export function useLoginContext() {
  const context = useContext(LoginContext);
  if (context === undefined) {
    throw new Error('useLoginContext must be used within a LoginProvider');
  }
  return context;
}
