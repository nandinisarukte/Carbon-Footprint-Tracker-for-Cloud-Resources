import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const isConfigured = !!firebaseConfig.apiKey;

let app;
let auth;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    console.log('Firebase Client initialized successfully.');
  } catch (error) {
    console.error('Error initializing Firebase Client:', error);
  }
} else {
  console.warn(
    'WARNING: Firebase client configuration is missing. Operating in Client Mock Auth Mode. ' +
    'To use live authentication, configure VITE_FIREBASE_API_KEY in your .env file.'
  );
}

// Mock auth client implementation for local testing
const mockAuth = {
  currentUser: null,
  listeners: [],
  onAuthStateChanged(callback) {
    this.listeners.push(callback);
    // Initial emission
    const savedUser = localStorage.getItem('mock_user');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  },
  async signInWithEmailAndPassword(email, password) {
    // Basic verification simulation
    if (!email.includes('@') || password.length < 6) {
      throw new Error('AuthError: Invalid email or password must be at least 6 characters.');
    }
    const user = {
      uid: `mock-uid-${email.replace(/[^a-zA-Z0-9]/g, '')}`,
      email,
      displayName: email.split('@')[0],
      getIdToken: async () => `mock-${email.replace(/[^a-zA-Z0-9]/g, '')}:${email}`
    };
    this.currentUser = user;
    localStorage.setItem('mock_user', JSON.stringify(user));
    this.listeners.forEach(cb => cb(user));
    return { user };
  },
  async createUserWithEmailAndPassword(email, password) {
    if (!email.includes('@') || password.length < 6) {
      throw new Error('AuthError: Invalid email or password must be at least 6 characters.');
    }
    const user = {
      uid: `mock-uid-${email.replace(/[^a-zA-Z0-9]/g, '')}`,
      email,
      displayName: email.split('@')[0],
      getIdToken: async () => `mock-${email.replace(/[^a-zA-Z0-9]/g, '')}:${email}`
    };
    this.currentUser = user;
    localStorage.setItem('mock_user', JSON.stringify(user));
    this.listeners.forEach(cb => cb(user));
    return { user };
  },
  async signOut() {
    this.currentUser = null;
    localStorage.removeItem('mock_user');
    this.listeners.forEach(cb => cb(null));
  }
};

export {
  auth,
  isConfigured,
  mockAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};
