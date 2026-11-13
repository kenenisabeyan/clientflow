import { ArrowUpRight, ArrowDownRight, Download, Calendar, MoreHorizontal } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const revenueData = [
  { name: 'Week 1', value: 4500 },
  { name: 'Week 2', value: 3000 },
  { name: 'Week 3', value: 8500 },
  { name: 'Week 4', value: 5000 },
];

const projectsData = [
  { name: 'Completed', value: 24, color: '#10b981' },
  { name: 'In Progress', value: 12, color: '#3b82f6' },
  { name: 'Planning', value: 6, color: '#f59e0b' },
];

const topClients = [
  { id: 1, name: 'Acme Corp', amount: '$10,000', avatar: 'A' },
  { id: 2, name: 'Globex Inc', amount: '$8,000', avatar: 'G' },
  { id: 3, name: 'Stark Industries', amount: '$6,500', avatar: 'S' },
];

const topProjects = [
  { id: 1, name: 'Website Redesign', amount: '$8,000', icon: 'W' },
  { id: 2, name: 'Mobile App', amount: '$5,000', icon: 'M' },
  { id: 3, name: 'Brand Identity', amount: '$4,000', icon: 'B' },
];

export default function Reports() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>Reports</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Analyze your business performance.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', 
            background: 'transparent', border: '1px solid var(--surface-border)', 
            borderRadius: '8px', color: 'var(--text-main)', cursor: 'pointer' 
          }}>
            <Download size={16} /> Export
          </button>

          <button style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', 
            background: 'transparent', border: '1px solid var(--surface-border)', 
            borderRadius: '8px', color: 'var(--text-main)', cursor: 'pointer' 
          }}>
            <Calendar size={16} /> Last 30 Days
          </button>
        </div>
      </div>

      {/* Top Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        {[ 
          { title: 'Total Revenue', value: '$24,580', change: '+12.5%', up: true },
          { title: 'Total Clients', value: '128', change: '+8.1%', up: true },
          { title: 'Total Projects', value: '42', change: '+15.2%', up: true },
          { title: 'Completion Rate', value: '78%', change: '+5.2%', up: true },
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
        
        {/* Revenue Bar Chart */}
        <div style={{ 
          background: 'var(--surface)', border: '1px solid var(--surface-border)', 
          borderRadius: 'var(--radius)', padding: '1.5rem', display: 'flex', flexDirection: 'column'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Revenue Chart</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-10} tickFormatter={(val) => `$${val/1000}K`} />
                <Tooltip 
                  cursor={{ fill: 'var(--surface-border)' }}
                  contentStyle={{ background: '#1e293b', border: '1px solid var(--surface-border)', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Projects Donut Chart */}
        <div style={{ 
          background: 'var(--surface)', border: '1px solid var(--surface-border)', 
          borderRadius: 'var(--radius)', padding: '1.5rem', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Projects by Status</h3>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <MoreHorizontal size={20} />
            </button>
          </div>
          
          <div style={{ height: '220px', width: '100%', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={projectsData} innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
                  {projectsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ 
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
              display: 'flex', flexDirection: 'column', alignItems: 'center' 
            }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>42</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            {projectsData.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }}></div>
                  <span style={{ color: 'var(--text-muted)' }}>{item.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 600 }}>{item.value}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({Math.round(item.value/42*100)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Lists Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Top Clients */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Top Clients</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {topClients.map(client => (
              <div key={client.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--surface-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {client.avatar}
                  </div>
                  <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{client.name}</div>
                </div>
                <div style={{ fontWeight: 600 }}>{client.amount}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Projects */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Top Projects</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {topProjects.map(project => (
              <div key={project.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--surface-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                   <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--surface-border)', border: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem' }}>
                      {project.icon}
                    </div>
                  <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{project.name}</div>
                </div>
                <div style={{ fontWeight: 600 }}>{project.amount}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
