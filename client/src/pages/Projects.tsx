import { useState, useEffect } from 'react';
import { Search, Filter, Plus, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import api from '../api/axios';

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        const formattedProjects = res.data.projects.map((p: any) => ({
          id: p._id,
          name: p.title,
          client: p.client?.name || 'Unknown',
          status: p.status === 'pending' ? 'Planning' : p.status === 'in-progress' ? 'In Progress' : 'Completed',
          progress: p.status === 'completed' ? 100 : p.status === 'in-progress' ? 50 : 10,
          deadline: new Date(p.updatedAt).toLocaleDateString(),
          icon: p.title.charAt(0).toUpperCase()
        }));
        setProjects(formattedProjects);
      } catch (err) {
        console.error('Failed to fetch projects', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>Projects</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Track and manage all your projects.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ 
            display: 'flex', alignItems: 'center', background: 'var(--surface-border)', 
            padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--surface-border)', width: '250px' 
          }}>
            <Search size={16} style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }} />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '0.9rem' }} 
            />
          </div>
          
          <button style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', 
            background: 'transparent', border: '1px solid var(--surface-border)', 
            borderRadius: '8px', color: 'var(--text-main)', cursor: 'pointer' 
          }}>
            <Filter size={16} /> Filter
          </button>

          <button style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', 
            background: 'transparent', border: '1px solid var(--surface-border)', 
            borderRadius: '8px', color: 'var(--text-main)', cursor: 'pointer' 
          }}>
            Sort <ChevronDown size={16} /> 
          </button>
          
          <button className="btn-primary" style={{ marginTop: 0, width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem' }}>
            <Plus size={16} /> New Project
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div style={{ 
        background: 'var(--surface)', backdropFilter: 'var(--blur)', 
        border: '1px solid var(--surface-border)', borderRadius: 'var(--radius)', 
        overflow: 'hidden', boxShadow: 'var(--glass-shadow)' 
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>Project</th>
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>Client</th>
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>Status</th>
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>Progress</th>
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>Deadline</th>
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((project) => (
              <tr key={project.id} style={{ borderBottom: '1px solid var(--surface-border)', transition: 'var(--transition)' }}>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      width: '36px', height: '36px', borderRadius: '8px', 
                      background: 'var(--surface-border)', border: '1px solid var(--surface-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem' 
                    }}>
                      {project.icon}
                    </div>
                    <div style={{ fontWeight: 600 }}>{project.name}</div>
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)' }}>
                  {project.client}
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 500,
                    background: project.status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : 
                                project.status === 'In Progress' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: project.status === 'Completed' ? '#10b981' : 
                          project.status === 'In Progress' ? '#3b82f6' : '#f59e0b',
                    border: `1px solid ${
                      project.status === 'Completed' ? 'rgba(16, 185, 129, 0.2)' : 
                      project.status === 'In Progress' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)'
                    }`
                  }}>
                    {project.status}
                  </span>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '100px', height: '6px', background: 'var(--surface-border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', width: `${project.progress}%`, borderRadius: '3px',
                        background: project.status === 'Completed' ? '#10b981' : 'var(--primary)'
                      }}></div>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{project.progress}%</span>
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)' }}>
                  {project.deadline}
                </td>
                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                  <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <MoreHorizontal size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid var(--surface-border)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Showing 1 to {filteredProjects.length} of 22 projects
          </div>
          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '0.25rem' }}><ChevronLeft size={18}/></button>
            <button style={{ background: 'var(--primary)', border: 'none', color: '#fff', borderRadius: '4px', width: '28px', height: '28px', cursor: 'pointer', fontWeight: 500 }}>1</button>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', borderRadius: '4px', width: '28px', height: '28px', cursor: 'pointer' }}>2</button>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', borderRadius: '4px', width: '28px', height: '28px', cursor: 'pointer' }}>3</button>
            <span style={{ color: 'var(--text-muted)', margin: '0 0.25rem' }}>...</span>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', borderRadius: '4px', width: '28px', height: '28px', cursor: 'pointer' }}>9</button>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '0.25rem' }}><ChevronRight size={18}/></button>
          </div>
        </div>
      </div>

    </div>
  );
}