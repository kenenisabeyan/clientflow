import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0, pending: 0 });
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectsRes = await axios.get('/api/projects');
        const projects = projectsRes.data.projects;
        setStats({
          total: projects.length,
          completed: projects.filter(p => p.status === 'completed').length,
          inProgress: projects.filter(p => p.status === 'in-progress').length,
          pending: projects.filter(p => p.status === 'pending').length,
        });

        const activityRes = await axios.get('/api/activity?limit=5');
        setActivities(activityRes.data.activities);
      } catch (error) {
        console.error('Failed to load dashboard', error);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card"><h3>Total Projects</h3><p>{stats.total}</p></div>
        <div className="stat-card"><h3>Completed</h3><p>{stats.completed}</p></div>
        <div className="stat-card"><h3>In Progress</h3><p>{stats.inProgress}</p></div>
        <div className="stat-card"><h3>Pending</h3><p>{stats.pending}</p></div>
      </div>
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        {activities.length === 0 ? (
          <p>No recent activity.</p>
        ) : (
          activities.map(a => (
            <div key={a._id} className="activity-item">
              <div><strong>{a.user?.name}</strong> {a.action}</div>
              <div className="activity-time">{new Date(a.timestamp).toLocaleString()}</div>
            </div>
          ))
        )}
      </div>
    </>
  );
}