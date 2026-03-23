import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function CreateProject() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState('pending');
  const [clients, setClients] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get('/api/users?role=client');
        setClients(res.data.users);
      } catch (error) {
        console.error('Failed to load clients', error);
      }
    };
    fetchClients();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientId) {
      alert('Please select a client');
      return;
    }
    try {
      await axios.post('/api/projects', { title, description, clientId, status });
      alert('Project created successfully!');
      navigate('/projects');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create project');
    }
  };

  return (
    <div className="create-project-page">
      <h2>Create New Project</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Project Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="clientId">Assign to Client</label>
          <select id="clientId" value={clientId} onChange={(e) => setClientId(e.target.value)} required>
            <option value="">Select a client...</option>
            {clients.map(c => (
              <option key={c._id} value={c._id}>{c.name} ({c.email})</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <button type="submit" className="btn-primary">Create Project</button>
      </form>
    </div>
  );
}