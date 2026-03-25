import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [comment, setComment] = useState('');
  const [file, setFile] = useState(null);

  const loadProject = async () => {
    try {
      const res = await axios.get(`/api/projects/${id}`);
      setProject(res.data.project);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await axios.post('/api/comments', { text: comment, projectId: id });
      setComment('');
      loadProject();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post comment');
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post(`/api/projects/${id}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFile(null);
      loadProject();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload file');
    }
  };

  if (!project) return <div>Loading...</div>;

  return (
    <div id="project-detail">
      <h2>{project.title}</h2>
      <p>{project.description || 'No description'}</p>
      <span className={`status-badge ${project.status}`}>{project.status.replace('-', ' ')}</span>
      <div>Client: {project.client?.name}</div>

      <div className="comment-section">
        <h3>Comments</h3>
        {project.comments?.map(c => (
          <div key={c._id} className="activity-item">
            <div><strong>{c.user.name}</strong>: {c.text}</div>
            <div className="activity-time">{new Date(c.createdAt).toLocaleString()}</div>
          </div>
        ))}
        <form onSubmit={handleComment}>
          <textarea placeholder="Add a comment..." value={comment} onChange={(e) => setComment(e.target.value)} required />
          <button type="submit" className="btn-primary">Post Comment</button>
        </form>
      </div>

      <div className="file-section">
        <h3>Files</h3>
        {project.files?.map(f => (
          <div key={f._id} className="activity-item">
            <a href={`/api/projects/${id}/files/${f.filename}`} download>{f.filename}</a>
            <div className="activity-time">Uploaded by {f.uploadedBy?.name}</div>
          </div>
        ))}
        <form onSubmit={handleFileUpload} encType="multipart/form-data">
          <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
          <button type="submit" className="btn-primary">Upload File</button>
        </form>
      </div>
    </div>
  );
}