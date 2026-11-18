// AuthContext using React Query
import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, QueryClient } from '@tanstack/react-query';
import api from '../api/axios';

const AuthContext = createContext<any>(null);
export const useAuth = () => useContext(AuthContext);

// Shared query client (provided by App)
const queryClient = new QueryClient();

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // ----- USER -----
  const { data: user, isLoading: loading } = useQuery(['me'], async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const res = await api.get('/auth/me');
    return res.data.user;
  }, { retry: false, staleTime: 5 * 60_000 });

  // ----- MUTATIONS -----
  const loginMut = useMutation(
    ({ email, password }: { email: string; password: string }) =>
      api.post('/auth/login', { email, password })
  );

  const registerMut = useMutation(
    ({ name, email, password }: { name: string; email: string; password?: string }) =>
      api.post('/auth/register', { name, email, password: password ?? '123456', role: 'admin' })
  );

  const login = async (email: string, password: string) => {
    const result = await loginMut.mutateAsync({ email, password });
    localStorage.setItem('token', result.data.token);
    queryClient.invalidateQueries(['me']);
    return { success: true };
  };

  const register = async (name: string, email: string, password?: string) => {
    const result = await registerMut.mutateAsync({ name, email, password });
    localStorage.setItem('token', result.data.token);
    queryClient.invalidateQueries(['me']);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('token');
    queryClient.setQueryData(['me'], null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
