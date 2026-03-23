import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Activity() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await axios.get('/api/activity');
        setActivities(res.data.activities);
      } catch (error) {
        console.error('Failed to load activity', error);
      }
    };
    fetchActivities();
  }, []);

  return (
    <div className="activity-page">
      <h2>Activity Log</h2>
      {activities.length === 0 ? (
        <p>No activity yet.</p>
      ) : (
        activities.map(a => (
          <div key={a._id} className="activity-item">
            <div><strong>{a.user?.name}</strong> {a.action}</div>
            <div className="activity-time">{new Date(a.timestamp).toLocaleString()}</div>
          </div>
        ))
      )}
    </div>
  );
}