import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateSettings: (settings: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('@ZapClick:user');
    const storedToken = localStorage.getItem('@ZapClick:token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem('@ZapClick:token', token);
      localStorage.setItem('@ZapClick:user', JSON.stringify(user));

      setUser(user);
      setToken(token);

      router.push('/dashboard');
    } catch (error) {
      throw new Error('Falha no login');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/register', { name, email, password });
      const { token, user } = response.data;

      localStorage.setItem('@ZapClick:token', token);
      localStorage.setItem('@ZapClick:user', JSON.stringify(user));

      setUser(user);
      setToken(token);

      router.push('/dashboard');
    } catch (error) {
      throw new Error('Falha no registro');
    }
  };

  const logout = () => {
    localStorage.removeItem('@ZapClick:token');
    localStorage.removeItem('@ZapClick:user');
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  const updateSettings = async (settings: any) => {
    try {
      const response = await axios.put('/api/auth/settings', settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedUser = response.data;

      localStorage.setItem('@ZapClick:user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      throw new Error('Falha ao atualizar configurações');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, login, register, logout, updateSettings }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
} 