import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get('/api/projects');
        setProjects(res.data.projects);
      } catch (error) {
        console.error('Failed to load projects', error);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="projects-page">
      <div className="page-header">
        <h2>All Projects</h2>
        {user?.role === 'admin' && (
          <Link to="/create-project" className="btn-primary">+ New Project</Link>
        )}
      </div>
      {projects.length === 0 ? (
        <p>No projects yet. Create your first project!</p>
      ) : (
        <div className="project-grid">
          {projects.map(p => (
            <div key={p._id} className="project-card" onClick={() => window.location.href=`/projects/${p._id}`}>
              <h3>{p.title}</h3>
              <p>{p.description || 'No description'}</p>
              <span className={`status-badge ${p.status}`}>{p.status.replace('-', ' ')}</span>
              <div className="project-client">Assigned to: {p.client?.name || 'Unknown'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}