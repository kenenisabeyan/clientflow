import { useAuth } from '../context/AuthContext';
import { 
  Users, FolderKanban, CheckSquare, DollarSign, 
  ArrowUpRight, ArrowDownRight, MoreHorizontal 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const revenueData = [
  { name: 'Jan', value: 12000 },
  { name: 'Feb', value: 19000 },
  { name: 'Mar', value: 15000 },
  { name: 'Apr', value: 22000 },
  { name: 'May', value: 18000 },
  { name: 'Jun', value: 24580 },
];

const tasksData = [
  { name: 'Done', value: 82, color: '#10b981' },
  { name: 'In Progress', value: 45, color: '#3b82f6' },
  { name: 'To Do', value: 29, color: '#f59e0b' },
];

const recentClients = [
  { id: 1, name: 'Acme Corp', avatar: 'A', role: 'Enterprise' },
  { id: 2, name: 'Globex Inc', avatar: 'G', role: 'Startup' },
  { id: 3, name: 'Stark Industries', avatar: 'S', role: 'Enterprise' },
];

const recentProjects = [
  { id: 1, name: 'Website Redesign', client: 'Acme Corp', status: 'In Progress' },
  { id: 2, name: 'Mobile App', client: 'Globex Inc', status: 'Planning' },
  { id: 3, name: 'Brand Identity', client: 'Stark Industries', status: 'Completed' },
];

const upcomingTasks = [
  { id: 1, name: 'Design Review', date: 'Today, 2:00 PM', priority: 'High' },
  { id: 2, name: 'Client Meeting', date: 'Tomorrow, 10:00 AM', priority: 'Medium' },
  { id: 3, name: 'Project Outline', date: 'May 15, 2024', priority: 'Low' },
];

export default function Dashboard() {
  const { user } = useAuth();
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* Header section similar to mockup */}
      <div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Welcome back, {user?.name || 'Jollie'}! Here's what's happening with your business today.
        </p>
      </div>

      {/* Top Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        {[ 
          { title: 'Clients', value: '128', change: '+8.1%', up: true },
          { title: 'Projects', value: '42', change: '+15.2%', up: true },
          { title: 'Tasks', value: '156', change: '-2.3%', up: false },
          { title: 'Revenue', value: '$24,580', change: '+12.5%', up: true },
        ].map((stat, i) => (
          <div key={i} style={{ 
            background: 'var(--surface)', border: '1px solid var(--surface-border)', 
            borderRadius: 'var(--radius)', padding: '1.5rem', display: 'flex', flexDirection: 'column'
          }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.5rem' }}>{stat.title}</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '2rem', fontWeight: 700 }}>{stat.value}</span>
              <span style={{ 
                display: 'flex', alignItems: 'center', fontSize: '0.8rem', fontWeight: 600,
                color: stat.up ? '#10b981' : '#ef4444', background: stat.up ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                padding: '0.2rem 0.5rem', borderRadius: '20px', marginBottom: '0.25rem'
              }}>
                {stat.up ? <ArrowUpRight size={14} style={{ marginRight: '0.1rem' }}/> : <ArrowDownRight size={14} style={{ marginRight: '0.1rem' }}/>}
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* Revenue Line Chart */}
        <div style={{ 
          background: 'var(--surface)', border: '1px solid var(--surface-border)', 
          borderRadius: 'var(--radius)', padding: '1.5rem', display: 'flex', flexDirection: 'column'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Revenue Overview</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-10} tickFormatter={(val) => `$${val/1000}K`} />
                <Tooltip 
                  contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 2, stroke: '#1e293b' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tasks Donut Chart */}
        <div style={{ 
          background: 'var(--surface)', border: '1px solid var(--surface-border)', 
          borderRadius: 'var(--radius)', padding: '1.5rem', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Tasks Overview</h3>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <MoreHorizontal size={20} />
            </button>
          </div>
          
          <div style={{ height: '220px', width: '100%', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={tasksData} innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
                  {tasksData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ 
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
              display: 'flex', flexDirection: 'column', alignItems: 'center' 
            }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>156</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Tasks</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            {tasksData.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }}></div>
                  <span style={{ color: 'var(--text-muted)' }}>{item.name}</span>
                </div>
                <span style={{ fontWeight: 600 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Lists Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        
        {/* Recent Clients */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Recent Clients</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentClients.map(client => (
              <div key={client.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {client.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{client.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{client.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Recent Projects</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentProjects.map(project => (
              <div key={project.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{project.name}</span>
                  <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>{project.status}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{project.client}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Upcoming Tasks</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {upcomingTasks.map(task => (
              <div key={task.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ marginTop: '0.2rem' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `2px solid ${task.priority === 'High' ? '#ef4444' : task.priority === 'Medium' ? '#f59e0b' : '#3b82f6'}` }}></div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{task.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{task.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}