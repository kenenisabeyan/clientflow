import { useState } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const currentMonthCells = Array.from({ length: 35 }, (_, i) => i - 2); // Quick mockup array for month cells

const events = [
  { day: 10, title: '8:00 AM\nTeam Meeting', color: 'rgba(59,130,246,0.1)', textCol: '#3b82f6', borderCol: '#3b82f6' },
  { day: 10, title: '2:30 PM\nClient Review', color: 'rgba(239,68,68,0.1)', textCol: '#ef4444', borderCol: '#ef4444' },
  { day: 12, title: 'Project Deadline', color: 'rgba(239,68,68,0.1)', textCol: '#ef4444', borderCol: '#ef4444', solid: true },
  { day: 19, title: '2:00 PM\nWebsite Design', color: 'rgba(59,130,246,0.1)', textCol: '#3b82f6', borderCol: '#3b82f6' },
  { day: 19, title: 'Launch Event', color: 'var(--primary)', textCol: '#fff', borderCol: 'transparent', solid: true },
];

export default function Calendar() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>Calendar</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>View your schedule and important dates.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button style={{ 
            padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--surface-border)', 
            borderRadius: '6px', color: 'var(--text-main)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500
          }}>
            Today
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 1rem' }}>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex' }}><ChevronLeft size={20}/></button>
            <span style={{ fontSize: '1.1rem', fontWeight: 600, minWidth: '130px', textAlign: 'center' }}>May 2024</span>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex' }}><ChevronRight size={20}/></button>
          </div>

          <div style={{ display: 'flex', background: 'var(--surface-border)', borderRadius: '8px', padding: '0.25rem' }}>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', padding: '0.35rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>Month</button>
            <button style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', color: 'var(--text-main)', padding: '0.35rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>Week</button>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', padding: '0.35rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>Day</button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={{ 
        background: 'var(--surface)', border: '1px solid var(--surface-border)', 
        borderRadius: 'var(--radius)', overflow: 'hidden'
      }}>
        {/* Days Header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--surface-border)' }}>
          {daysOfWeek.map(day => (
            <div key={day} style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', borderRight: '1px solid var(--surface-border)' }}>
              {day}
            </div>
          ))}
        </div>
        
        {/* Days Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {currentMonthCells.map((val, idx) => {
            const isCurrentMonth = val > 0 && val <= 31;
            const dayEvents = events.filter(e => e.day === val);
            
            return (
              <div key={idx} style={{ 
                minHeight: '120px', padding: '0.5rem', borderRight: '1px solid var(--surface-border)', borderBottom: '1px solid var(--surface-border)',
                background: val === 15 ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                color: isCurrentMonth ? 'var(--text-main)' : 'rgba(255,255,255,0.2)'
              }}>
                <div style={{ 
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', 
                  borderRadius: '50%', background: val === 15 ? 'var(--primary)' : 'transparent', 
                  color: val === 15 ? '#fff' : 'inherit', fontWeight: val === 15 ? 600 : 'normal', marginBottom: '0.5rem' 
                }}>
                  {isCurrentMonth ? val : (val <= 0 ? 30 + val : val - 31)}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {isCurrentMonth && dayEvents.map((ev, i) => (
                    <div key={i} style={{ 
                      background: ev.solid ? ev.color : ev.color, 
                      borderLeft: ev.solid ? 'none' : `3px solid ${ev.borderCol}`,
                      color: ev.textCol, padding: '0.35rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', 
                      fontWeight: 500, whiteSpace: 'pre-line', lineHeight: 1.3
                    }}>
                      {ev.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
