import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext<any>(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<{name: string, email: string, role: string} | null>(null);
  const [loading, setLoading] = useState(true);

  // Auto-login bypass for frontend UI demonstration
  useEffect(() => {
    setTimeout(() => {
      setUser({
        name: 'Jollie Frontend',
        email: 'jollie@demo.com',
        role: 'Admin'
      });
      setLoading(false);
    }, 500);
  }, []);

  const login = async (email: string, password: string) => {
    setUser({ name: 'Jollie Frontend', email, role: 'Admin' });
    return { success: true };
  };

  const register = async (name: string, email: string) => {
    setUser({ name, email, role: 'Admin' });
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};