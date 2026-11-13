import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Invoices from './pages/Invoices';
import Calendar from './pages/Calendar';
import Messages from './pages/Messages';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function LoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'var(--bg-color)',
      color: 'var(--text-main)',
      fontFamily: 'var(--font-main)'
    }}>
      <div style={{
        width: '42px',
        height: '42px',
        border: '3px solid var(--surface-border)',
        borderTopColor: 'var(--primary)',
        borderRadius: '50%',
        animation: 'spin 0.75s linear infinite',
        marginBottom: '1rem'
      }} />
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
        Loading ClientFlow...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="projects" element={<Projects />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="messages" element={<Messages />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;