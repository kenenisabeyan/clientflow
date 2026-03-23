import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import CreateProject from './pages/CreateProject';
import ProjectDetail from './pages/ProjectDetail';
import Activity from './pages/Activity';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';

// Protected route wrapper
function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/projects" element={<PrivateRoute><Projects /></PrivateRoute>} />
            <Route path="/projects/:id" element={<PrivateRoute><ProjectDetail /></PrivateRoute>} />
            <Route path="/create-project" element={<PrivateRoute adminOnly><CreateProject /></PrivateRoute>} />
            <Route path="/activity" element={<PrivateRoute><Activity /></PrivateRoute>} />
            <Route path="/user-management" element={<PrivateRoute adminOnly><UserManagement /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;