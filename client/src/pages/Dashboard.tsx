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
          { title: 'New Customers', value: '25', change: '+8.1%', up: true, bg: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
          { title: 'Open Tasks', value: '12', change: '+15.2%', up: true, bg: 'linear-gradient(135deg, #f97316, #ea580c)' },
          { title: 'Completed Tasks', value: '30', change: '-2.3%', up: false, bg: 'linear-gradient(135deg, #10b981, #059669)' },
          { title: 'Notifications', value: '5', change: '+12.5%', up: true, bg: 'linear-gradient(135deg, #a855f7, #9333ea)' },
        ].map((stat, i) => (
          <div key={i} style={{ 
            background: stat.bg, color: 'white',
            borderRadius: 'var(--radius)', padding: '1.5rem', display: 'flex', flexDirection: 'column',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)', position: 'relative', overflow: 'hidden'
          }}>
            <h3 style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', fontWeight: 500, marginBottom: '0.5rem' }}>{stat.title}</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', zIndex: 1 }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>{stat.value}</span>
              <span style={{ 
                display: 'flex', alignItems: 'center', fontSize: '0.8rem', fontWeight: 600,
                color: 'white', background: 'rgba(255,255,255,0.2)',
                padding: '0.2rem 0.5rem', borderRadius: '4px', marginBottom: '0.25rem'
              }}>
                {stat.up ? <ArrowUpRight size={14} style={{ marginRight: '0.1rem' }}/> : <ArrowDownRight size={14} style={{ marginRight: '0.1rem' }}/>}
                {stat.change}
              </span>
            </div>
            {/* Soft decor graphic */}
            <div style={{ position: 'absolute', right: '-10%', bottom: '-20%', opacity: 0.1 }}>
              <FolderKanban size={100} />
            </div>
          </div>
        ))}
      </div>

      {/* Middle Tables Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Customers Table */}
        <div style={{ 
          background: 'var(--surface)', border: '1px solid var(--surface-border)', 
          borderRadius: 'var(--radius)', padding: '1.5rem', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Customers</h3>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <MoreHorizontal size={20} />
            </button>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-muted)' }}>
                <th style={{ paddingBottom: '0.75rem', fontWeight: 500 }}>Name</th>
                <th style={{ paddingBottom: '0.75rem', fontWeight: 500 }}>Phone</th>
                <th style={{ paddingBottom: '0.75rem', fontWeight: 500 }}>Status v</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'John Doe', phone: '123-456-7890', status: 'Contacted', sc: '#f59e0b', sbg: 'rgba(245, 158, 11, 0.1)' },
                { name: 'Jane Smith', phone: '987-654-3210', status: 'New', sc: '#10b981', sbg: 'rgba(16, 185, 129, 0.1)' },
                { name: 'Acme Corp', phone: '555-123-4567', status: 'Pending', sc: '#3b82f6', sbg: 'rgba(59, 130, 246, 0.1)' },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <td style={{ padding: '1rem 0', fontWeight: 500 }}>{row.name}</td>
                  <td style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>{row.phone}</td>
                  <td style={{ padding: '1rem 0' }}>
                    <span style={{ color: row.sc, background: row.sbg, padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tasks Table */}
        <div style={{ 
          background: 'var(--surface)', border: '1px solid var(--surface-border)', 
          borderRadius: 'var(--radius)', padding: '1.5rem', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Tasks</h3>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <MoreHorizontal size={20} />
            </button>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-muted)' }}>
                <th style={{ paddingBottom: '0.75rem', fontWeight: 500 }}>Task</th>
                <th style={{ paddingBottom: '0.75rem', fontWeight: 500 }}>Due Date v</th>
                <th style={{ paddingBottom: '0.75rem', fontWeight: 500 }}>Status v</th>
              </tr>
            </thead>
            <tbody>
              {[
                { task: 'Follow-up Call', date: 'April 20, 2024', status: 'Pending', sc: '#10b981', sbg: 'rgba(16, 185, 129, 0.1)' },
                { task: 'Send Proposal', date: 'April 18, 2024', status: 'Completed', sc: '#3b82f6', sbg: 'rgba(59, 130, 246, 0.1)' },
                { task: 'Review Contract', date: 'April 15, 2022', status: 'Overdue', sc: '#ef4444', sbg: 'rgba(239, 68, 68, 0.1)' },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <td style={{ padding: '1rem 0', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-muted)' }}></div>
                    {row.task}
                  </td>
                  <td style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>{row.date}</td>
                  <td style={{ padding: '1rem 0' }}>
                    <span style={{ color: row.sc, background: row.sbg, padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Bottom Row - Recent Activity */}
      <div style={{ 
          background: 'var(--surface)', border: '1px solid var(--surface-border)', 
          borderRadius: 'var(--radius)', padding: '1.5rem', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Recent Activity</h3>
            <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <span>&lt; &gt;</span>
                <span>=</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              { icon: Users, color: '#3b82f6', text: 'New customer added: Jane Smith', time: '1 hr' },
              { icon: CheckSquare, color: '#ef4444', text: 'Task "Review Contract" is overdue', time: '5 hr' },
              { icon: LayoutDashboard, color: '#10b981', text: 'System update scheduled tomorrow.', time: '6 hr' },
            ].map((activity, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: i === 2 ? 'none' : '1px solid var(--surface-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                   <div style={{ color: activity.color, background: `${activity.color}20`, padding: '0.4rem', borderRadius: '50%' }}>
                     <activity.icon size={16} />
                   </div>
                   <span style={{ fontSize: '0.9rem' }}>{activity.text}</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{activity.time}</span>
              </div>
            ))}
          </div>
      </div>
    </div>
  );
}