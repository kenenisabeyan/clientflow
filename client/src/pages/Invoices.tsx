import { useState } from 'react';
import { Search, Filter, Plus, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

const initialInvoices = [
  { id: 1, invoiceId: 'INV-001', client: 'Acme Corp', amount: '$5,000', status: 'Paid', dueDate: 'Apr 15, 2024' },
  { id: 2, invoiceId: 'INV-002', client: 'Globex Inc', amount: '$15,000', status: 'Pending', dueDate: 'May 10, 2024' },
  { id: 3, invoiceId: 'INV-003', client: 'Stark Industries', amount: '$3,000', status: 'Overdue', dueDate: 'Apr 30, 2024' },
  { id: 4, invoiceId: 'INV-004', client: 'Wayne Enterprises', amount: '$8,500', status: 'Paid', dueDate: 'Apr 20, 2024' },
  { id: 5, invoiceId: 'INV-005', client: 'Initech', amount: '$10,000', status: 'Pending', dueDate: 'May 30, 2024' },
];

export default function Invoices() {
  const [invoices] = useState(initialInvoices);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvoices = invoices.filter(inv => inv.client.toLowerCase().includes(searchTerm.toLowerCase()) || inv.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>Invoices</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Manage your invoices and payments.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ 
            display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', 
            padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--surface-border)', width: '250px' 
          }}>
            <Search size={16} style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }} />
            <input 
              type="text" 
              placeholder="Search invoices..." 
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

          <button style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', 
            background: 'transparent', border: '1px solid var(--surface-border)', 
            borderRadius: '8px', color: 'var(--text-main)', cursor: 'pointer' 
          }}>
            Sort <ChevronDown size={16} /> 
          </button>
          
          <button className="btn-primary" style={{ marginTop: 0, width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem' }}>
            <Plus size={16} /> New Invoice
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
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>Invoice</th>
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>Client</th>
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>Amount</th>
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>Status</th>
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>Due Date</th>
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((inv) => (
              <tr key={inv.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'var(--transition)' }}>
                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>
                  {inv.invoiceId}
                </td>
                <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-main)', fontWeight: 500 }}>
                  {inv.client}
                </td>
                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>
                  {inv.amount}
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 500,
                    background: inv.status === 'Paid' ? 'rgba(16, 185, 129, 0.1)' : 
                                inv.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: inv.status === 'Paid' ? '#10b981' : 
                          inv.status === 'Pending' ? '#f59e0b' : '#ef4444',
                    border: `1px solid ${
                      inv.status === 'Paid' ? 'rgba(16, 185, 129, 0.2)' : 
                      inv.status === 'Pending' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                    }`
                  }}>
                    {inv.status}
                  </span>
                </td>
                <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)' }}>
                  {inv.dueDate}
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
            Showing 1 to {filteredInvoices.length} of 24 invoices
          </div>
          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '0.25rem' }}><ChevronLeft size={18}/></button>
            <button style={{ background: 'var(--primary)', border: 'none', color: 'white', borderRadius: '4px', width: '28px', height: '28px', cursor: 'pointer', fontWeight: 500 }}>1</button>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', borderRadius: '4px', width: '28px', height: '28px', cursor: 'pointer' }}>2</button>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', borderRadius: '4px', width: '28px', height: '28px', cursor: 'pointer' }}>3</button>
            <span style={{ color: 'var(--text-muted)', margin: '0 0.25rem' }}>...</span>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', borderRadius: '4px', width: '28px', height: '28px', cursor: 'pointer' }}>5</button>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '0.25rem' }}><ChevronRight size={18}/></button>
          </div>
        </div>
      </div>

    </div>
  );
}
