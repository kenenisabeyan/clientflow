import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, CheckCircle, Clock, AlertCircle, TrendingUp, Activity } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0, pending: 0 });
  const [activities, setActivities] = useState([]);
  
  // Example calculation for an imaginary progress bar
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectsRes = await axios.get('/api/projects');
        const projects = projectsRes.data.projects || [];
        setStats({
          total: projects.length,
          completed: projects.filter(p => p.status === 'completed').length,
          inProgress: projects.filter(p => p.status === 'in-progress').length,
          pending: projects.filter(p => p.status === 'pending').length,
        });

        const activityRes = await axios.get('/api/activity?limit=5');
        setActivities(activityRes.data.activities || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <div className="welcome-banner">
        <div>
          <h2>Welcome back, <span>{user?.name || 'User'}</span> 👋</h2>
          <p>Here's what's happening with your projects today.</p>
        </div>
        <div className="banner-stats">
          <TrendingUp className="trend-icon" size={28} />
          <div className="trend-details">
            <span className="trend-label">Project Health</span>
            <span className="trend-value">{completionRate}% Done</span>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <h3>Total Projects</h3>
            <LayoutDashboard size={20} className="icon-total" />
          </div>
          <p>{stats.total}</p>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <h3>Completed</h3>
            <CheckCircle size={20} className="icon-success" />
          </div>
          <p>{stats.completed}</p>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <h3>In Progress</h3>
            <Clock size={20} className="icon-progress" />
          </div>
          <p>{stats.inProgress}</p>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <h3>Pending</h3>
            <AlertCircle size={20} className="icon-pending" />
          </div>
          <p>{stats.pending}</p>
        </div>
      </div>

      <div className="recent-activity">
        <div className="activity-header">
          <h2>Recent Activity</h2>
          <Activity size={20} className="icon-activity" />
        </div>
        
        {activities.length === 0 ? (
          <div className="empty-state">
            <Activity size={40} className="empty-icon" />
            <p>No recent activity detected.</p>
          </div>
        ) : (
          <div className="activity-list">
            {activities.map(a => (
              <div key={a._id} className="activity-item">
                <div className="activity-content">
                  <div className="activity-avatar">
                    {a.user?.name ? a.user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="activity-text">
                    <strong>{a.user?.name || 'A user'}</strong> {a.action}
                  </div>
                </div>
                <div className="activity-time">
                  {new Date(a.timestamp).toLocaleString(undefined, {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}