import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  deleteAccount: (email: string) => void;
  getAllUsers: () => { email: string; name: string }[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string; // In production, hash this!
}

const USERS_KEY = 'ecoplay_users';
const CURRENT_USER_KEY = 'ecoplay_current_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const getUsers = (): StoredUser[] => {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  };

  const saveUsers = (users: StoredUser[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const register = (name: string, email: string, password: string): boolean => {
    const users = getUsers();
    
    if (users.find(u => u.email === email)) {
      return false; // Email already exists
    }

    const newUser: StoredUser = {
      id: email.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name,
      email,
      password // WARNING: In production, hash this with bcrypt or similar!
    };

    users.push(newUser);
    saveUsers(users);

    const userSession: User = { id: newUser.id, name: newUser.name, email: newUser.email };
    setUser(userSession);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userSession));

    return true;
  };

  const login = (email: string, password: string): boolean => {
    const users = getUsers();
    const found = users.find(u => u.email === email && u.password === password);

    if (!found) {
      return false; // Invalid credentials
    }

    const userSession: User = { id: found.id, name: found.name, email: found.email };
    setUser(userSession);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userSession));

    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const deleteAccount = (email: string) => {
    const users = getUsers();
    const filtered = users.filter(u => u.email !== email);
    saveUsers(filtered);

    // Also delete user's game data
    const deletedUser = users.find(u => u.email === email);
    if (deletedUser) {
      localStorage.removeItem(`ecoplay_state_${deletedUser.id}`);
    }

    if (user?.email === email) {
      logout();
    }
  };

  const getAllUsers = () => {
    return getUsers().map(u => ({ email: u.email, name: u.name }));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, deleteAccount, getAllUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};