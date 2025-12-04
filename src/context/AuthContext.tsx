import { createContext, useState, useContext, ReactNode } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  age: number;
  weight: number;
  gender: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  userProfile: UserProfile | null;
  login: (email: string) => void;
  logout: () => void;
  updateProfile: (profile: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_PROFILE: UserProfile = {
  name: 'Jelani Adebayo',
  email: 'user@test.com',
  age: 34,
  weight: 82,
  gender: 'Male',
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const login = (email: string) => {
    setIsAuthenticated(true);
    setUserEmail(email);
    // Load profile from localStorage or use default
    const storedProfile = localStorage.getItem(`profile_${email}`);
    if (storedProfile) {
      setUserProfile(JSON.parse(storedProfile));
    } else {
      setUserProfile({ ...DEFAULT_PROFILE, email });
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserEmail(null);
    setUserProfile(null);
  };

  const updateProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    if (userEmail) {
      localStorage.setItem(`profile_${userEmail}`, JSON.stringify(profile));
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userEmail, userProfile, login, logout, updateProfile }}>
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