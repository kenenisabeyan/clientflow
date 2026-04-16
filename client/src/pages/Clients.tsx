import { useState, useEffect } from 'react';
import { Search, Filter, Plus, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../context/AuthContext'; // Or typical axios instance

// Mock Data representing "dynamics data" for the Clients Page
const initialClients = [
  { id: 1, name: 'Acme Corp', email: 'contact@acmecorp.com', phone: '+1 555-0123', status: 'Active', avatar: 'A' },
  { id: 2, name: 'Globex Inc', email: 'info@globex.com', phone: '+1 555-0124', status: 'Active', avatar: 'G' },
  { id: 3, name: 'Stark Industries', email: 'hello@stark.com', phone: '+1 555-0125', status: 'Offline', avatar: 'S' },
  { id: 4, name: 'Wayne Enterprises', email: 'contact@wayne.com', phone: '+1 555-0126', status: 'Active', avatar: 'W' },
  { id: 5, name: 'Initech', email: 'hello@initech.com', phone: '+1 555-0127', status: 'Active', avatar: 'I' },
];

export default function Clients() {
  const [clients, setClients] = useState(initialClients);
  const [searchTerm, setSearchTerm] = useState('');

  // Future API Integration placeholder
  // useEffect(() => {
  //   api.get('/clients').then(res => setClients(res.data));
  // }, []);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>Clients</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Manage your client relationships.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ 
            display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', 
            padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--surface-border)', width: '250px' 
          }}>
            <Search size={16} style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }} />
            <input 
              type="text" 
              placeholder="Search clients..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%', fontSize: '0.9rem' }} 
            />
          </div>
          
          <button style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', 
            background: 'transparent', border: '1px solid var(--surface-border)', 
            borderRadius: '8px', color: 'var(--text-main)', cursor: 'pointer' 
          }}>
            <Filter size={16} /> Filter
          </button>
          
          <button className="btn-primary" style={{ marginTop: 0, width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem' }}>
            <Plus size={16} /> Add Client
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
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>Client</th>
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>Phone</th>
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>Status</th>
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <tr key={client.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'var(--transition)' }}>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '50%', 
                      background: 'linear-gradient(135deg, var(--primary), var(--accent))', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' 
                    }}>
                      {client.avatar}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{client.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{client.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)' }}>
                  {client.phone}
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 500,
                    background: client.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                    color: client.status === 'Active' ? '#10b981' : '#94a3b8',
                    border: \`1px solid \${client.status === 'Active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.2)'}\`
                  }}>
                    {client.status}
                  </span>
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
            Showing 1 to {filteredClients.length} of 28 clients
          </div>
          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '0.25rem' }}><ChevronLeft size={18}/></button>
            <button style={{ background: 'var(--primary)', border: 'none', color: 'white', borderRadius: '4px', width: '28px', height: '28px', cursor: 'pointer', fontWeight: 500 }}>1</button>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', borderRadius: '4px', width: '28px', height: '28px', cursor: 'pointer' }}>2</button>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', borderRadius: '4px', width: '28px', height: '28px', cursor: 'pointer' }}>3</button>
            <span style={{ color: 'var(--text-muted)', margin: '0 0.25rem' }}>...</span>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', borderRadius: '4px', width: '28px', height: '28px', cursor: 'pointer' }}>26</button>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '0.25rem' }}><ChevronRight size={18}/></button>
          </div>
        </div>
      </div>

    </div>
  );
}
