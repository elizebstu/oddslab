import { createContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/authService';
import { otpService } from '../services/otpService';
import type { User } from '../services/authService';
import type { AuthResponse } from '../services/authService';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithOtp: (email: string, code: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      setUser(JSON.parse(userStr));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { token, user } = await authService.login(email, password);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const loginWithOtp = async (email: string, code: string) => {
    const response: AuthResponse = await otpService.loginWithOtp(email, code);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
  };

  const register = async (email: string, password: string) => {
    const { token, user } = await authService.register(email, password);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithOtp, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
