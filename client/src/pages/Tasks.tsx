import { Plus, Filter, MoreHorizontal, Clock } from 'lucide-react';

const tasksData = {
  todo: [
    { id: 1, title: 'Design Homepage', project: 'Acme Corp', priority: 'High', date: 'Today', avatar: 'U1' },
    { id: 2, title: 'User Research', project: 'Globex Inc', priority: 'Medium', date: 'Oct 12', avatar: 'U2' },
    { id: 3, title: 'Content Strategy', project: 'Stark Industries', priority: 'High', date: 'Oct 15', avatar: 'U3' },
    { id: 4, title: 'Bug Fixes', project: 'Initech', priority: 'Low', date: 'Oct 16', avatar: 'U4' },
  ],
  inProgress: [
    { id: 5, title: 'Frontend Development', project: 'Acme Corp', priority: 'High', date: 'Today', avatar: 'U5' },
    { id: 6, title: 'API Integration', project: 'Globex Inc', priority: 'Medium', date: 'Tomorrow', avatar: 'U6' },
    { id: 7, title: 'Logo Design', project: 'Wayne Enterprises', priority: 'Low', date: 'Oct 18', avatar: 'U7' },
  ],
  done: [
    { id: 8, title: 'Project Setup', project: 'Acme Corp', priority: 'Medium', date: 'Oct 01', avatar: 'U8' },
    { id: 9, title: 'Wireframing', project: 'Globex Inc', priority: 'High', date: 'Oct 05', avatar: 'U9' },
    { id: 10, title: 'Client Meeting', project: 'Wayne Enterprises', priority: 'Medium', date: 'Oct 08', avatar: 'U10' },
  ]
};

const ColumnHeader = ({ title, count, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
    <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{title}</h3>
    <span style={{ 
      background: 'rgba(255,255,255,0.05)', border: '1px solid var(--surface-border)', 
      padding: '0.1rem 0.5rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 
    }}>{count}</span>
  </div>
);

const TaskCard = ({ task }) => {
  const isHigh = task.priority === 'High';
  const isMedium = task.priority === 'Medium';
  const pColor = isHigh ? '#ef4444' : isMedium ? '#f59e0b' : '#3b82f6';
  const pBg = isHigh ? 'rgba(239,68,68,0.1)' : isMedium ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)';

  return (
    <div style={{ 
      background: 'var(--surface)', border: '1px solid var(--surface-border)', 
      borderRadius: 'var(--radius)', padding: '1.25rem', marginBottom: '1rem',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)', cursor: 'grab'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.4 }}>{task.title}</h4>
        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
          <MoreHorizontal size={18} />
        </button>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>{task.project}</p>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span style={{ 
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            background: pBg, color: pColor, border: \`1px solid \${pColor}40\`,
            padding: '0.25rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: pColor }}></div>
            {task.priority}
          </span>
          <span style={{ 
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid var(--surface-border)',
            padding: '0.25rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 500
          }}>
            <Clock size={12} /> {task.date}
          </span>
        </div>
        <div style={{ 
          width: '24px', height: '24px', borderRadius: '50%', 
          background: 'linear-gradient(135deg, var(--primary), var(--accent))', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 'bold' 
        }}>
          {task.avatar}
        </div>
      </div>
    </div>
  );
};

export default function Tasks() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.4s ease-out', height: '100%' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>Tasks</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Organize and track your tasks.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', 
            background: 'transparent', border: '1px solid var(--surface-border)', 
            borderRadius: '8px', color: 'var(--text-main)', cursor: 'pointer' 
          }}>
            <Filter size={16} /> Filter
          </button>
          
          <button className="btn-primary" style={{ marginTop: 0, width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem' }}>
            <Plus size={16} /> New Task
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', flex: 1, alignItems: 'flex-start' }}>
        
        {/* To Do Column */}
        <div style={{ background: 'rgba(15,23,42,0.4)', borderRadius: 'var(--radius)', padding: '1rem', border: '1px solid rgba(255,255,255,0.02)' }}>
          <ColumnHeader title="To Do" count="6" />
          {tasksData.todo.map(task => <TaskCard key={task.id} task={task} />)}
          <button style={{ 
            width: '100%', padding: '0.75rem', background: 'transparent', border: '1px dashed var(--surface-border)', 
            borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'
          }}>
            <Plus size={16} /> Add Task
          </button>
        </div>

        {/* In Progress Column */}
        <div style={{ background: 'rgba(15,23,42,0.4)', borderRadius: 'var(--radius)', padding: '1rem', border: '1px solid rgba(255,255,255,0.02)' }}>
          <ColumnHeader title="In Progress" count="11" />
          {tasksData.inProgress.map(task => <TaskCard key={task.id} task={task} />)}
          <button style={{ 
            width: '100%', padding: '0.75rem', background: 'transparent', border: '1px dashed var(--surface-border)', 
            borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'
          }}>
            <Plus size={16} /> Add Task
          </button>
        </div>

        {/* Done Column */}
        <div style={{ background: 'rgba(15,23,42,0.4)', borderRadius: 'var(--radius)', padding: '1rem', border: '1px solid rgba(255,255,255,0.02)' }}>
          <ColumnHeader title="Done" count="5" />
          {tasksData.done.map(task => <TaskCard key={task.id} task={task} />)}
          <button style={{ 
            width: '100%', padding: '0.75rem', background: 'transparent', border: '1px dashed var(--surface-border)', 
            borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'
          }}>
            <Plus size={16} /> Add Task
          </button>
        </div>

      </div>

    </div>
  );
}
