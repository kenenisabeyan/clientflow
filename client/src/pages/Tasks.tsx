import { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, Search } from 'lucide-react';
import api from '../api/axios';

export default function Tasks() {
  const [tasksData, setTasksData] = useState({ todo: [], inProgress: [], done: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await api.get('/tasks');
        setTasksData({
          todo: data.todo || [],
          inProgress: data.inProgress || [],
          done: data.done || []
        });
      } catch (err) {
        console.error('Failed to fetch tasks', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
        Loading tasks...
      </div>
    );
  }

  // Flatten tasks for table view
  const allTasks = [...tasksData.todo, ...tasksData.inProgress, ...tasksData.done];

  // Fallback data mapping if none
  const displayTasks = allTasks.length > 0 ? allTasks : [
    { id: '1', title: 'Acme Corp', project: 'Follow-up Call', date: 'April 20, 2024', priority: 'High', status: 'Pending', avatar: 'A' },
    { id: '2', title: 'John Doe', project: 'Send Proposal', date: 'April 18, 2024', priority: 'Medium', status: 'Completed', avatar: 'J' },
    { id: '3', title: 'Jane Corp', project: 'Review Contract', date: 'April 15, 2022', priority: 'Low', status: 'Contacted', avatar: 'J' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.4s ease-out', height: '100%' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>Tasks</h2>
        </div>
        <button className="btn-primary" style={{ marginTop: 0, width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem' }}>
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Table Container */}
      <div style={{ 
        background: 'var(--surface)', border: '1px solid var(--surface-border)', 
        borderRadius: 'var(--radius)', padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1
      }}>
        
        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
           <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-color)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--surface-border)', width: '300px' }}>
             <Search size={16} style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }} />
             <input type="text" placeholder="Search" style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem', width: '100%' }} />
           </div>
           
           <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>Tasks <MoreHorizontal size={14}/></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>Filter <MoreHorizontal size={14}/></div>
           </div>
        </div>

        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-muted)' }}>
              <th style={{ paddingBottom: '0.75rem', fontWeight: 500, width: '40px' }}><input type="checkbox" /></th>
              <th style={{ paddingBottom: '0.75rem', fontWeight: 500 }}>Name</th>
              <th style={{ paddingBottom: '0.75rem', fontWeight: 500 }}>Task</th>
              <th style={{ paddingBottom: '0.75rem', fontWeight: 500 }}>Due Date v</th>
              <th style={{ paddingBottom: '0.75rem', fontWeight: 500 }}>Priority v</th>
              <th style={{ paddingBottom: '0.75rem', fontWeight: 500 }}>Status v</th>
              <th style={{ paddingBottom: '0.75rem', fontWeight: 500 }}>Actions v</th>
            </tr>
          </thead>
          <tbody>
            {displayTasks.map((t, i) => {
              const isHigh = t.priority === 'High';
              const isMedium = t.priority === 'Medium';
              const pColor = isHigh ? '#ef4444' : isMedium ? '#f59e0b' : '#3b82f6';
              const pBg = `${pColor}20`; 
              
              const sColor = t.status === 'Completed' ? '#3b82f6' : t.status === 'Pending' ? '#10b981' : t.status === 'Overdue' ? '#ef4444' : '#f59e0b';
              const sBg = `${sColor}20`;
              
              return (
                <tr key={i} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <td style={{ padding: '1rem 0' }}><input type="checkbox" /></td>
                  <td style={{ padding: '1rem 0', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 'bold' }}>
                      {t.avatar}
                    </div>
                    {t.title}
                  </td>
                  <td style={{ padding: '1rem 0', color: 'var(--text-main)' }}>{t.project || 'General Task'}</td>
                  <td style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>{t.date}</td>
                  <td style={{ padding: '1rem 0' }}>
                    <span style={{ color: pColor, background: pBg, padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {t.priority}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 0' }}>
                    <span style={{ color: sColor, background: sBg, padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MoreHorizontal size={16} style={{ cursor: 'pointer' }} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Footer Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
           <div>Selected: 0</div>
           <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
             <span>1-3 of 3 entries</span>
             <button style={{ background: 'var(--surface-border)', border: 'none', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer', color: 'var(--text-main)' }}>&lt;</button>
             <button style={{ background: 'var(--surface-border)', border: 'none', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer', color: 'var(--text-main)' }}>&gt;</button>
           </div>
        </div>

      </div>
    </div>
  );
}
