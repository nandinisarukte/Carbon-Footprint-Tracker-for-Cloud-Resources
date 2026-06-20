import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  isConfigured, 
  mockAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from '../utils/firebase';
import api from '../utils/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync auth state with PostgreSQL DB
  const checkInUser = async (firebaseUser) => {
    try {
      // In mock mode, we trigger request using mock token.
      // In standard mode, we use live firebase ID token.
      await api.post('/auth/check-in');
      console.log('PostgreSQL user registration checked-in successfully.');
    } catch (error) {
      console.error('Failed to check-in user in backend:', error);
    }
  };

  useEffect(() => {
    const authService = isConfigured ? auth : mockAuth;
    
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      if (user) {
        // Set temp user object
        setCurrentUser(user);
        // Call backend to sync postgres user details
        await checkInUser(user);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password) => {
    const authService = isConfigured ? auth : mockAuth;
    if (isConfigured) {
      return createUserWithEmailAndPassword(authService, email, password);
    } else {
      return mockAuth.createUserWithEmailAndPassword(email, password);
    }
  };

  const login = async (email, password) => {
    const authService = isConfigured ? auth : mockAuth;
    if (isConfigured) {
      return signInWithEmailAndPassword(authService, email, password);
    } else {
      return mockAuth.signInWithEmailAndPassword(email, password);
    }
  };

  const logout = async () => {
    const authService = isConfigured ? auth : mockAuth;
    if (isConfigured) {
      return signOut(authService);
    } else {
      return mockAuth.signOut();
    }
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    isMockAuth: !isConfigured
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
