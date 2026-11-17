import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, 
  CheckCircle2, AlertCircle, RefreshCw, X, FolderKanban, CheckSquare, 
  DollarSign, Download, Filter
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // e.g. "Apr 20, 2024" or ISO string
  type: 'project' | 'task' | 'invoice';
  status: string;
  priority?: string;
  entityName?: string;
}

export default function Calendar() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isDev = user?.role === 'developer';
  const isClient = user?.role === 'client';

  // Current calendar viewing month and year
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Raw data from APIs
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ day: number; events: CalendarEvent[] } | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | 'project' | 'task' | 'invoice'>('all');

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Fetch real deliverables and deadlines
  const fetchCalendarData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [projRes, taskRes, invRes] = await Promise.allSettled([
        api.get('/projects'),
        api.get('/tasks'),
        api.get('/invoices')
      ]);

      const parsedEvents: CalendarEvent[] = [];

      // 1. Projects Deadlines
      if (projRes.status === 'fulfilled' && projRes.value.data.projects) {
        projRes.value.data.projects.forEach((p: any) => {
          if (p.deadline) {
            parsedEvents.push({
              id: 'proj-' + p._id,
              title: `Project Due: ${p.title}`,
              date: p.deadline,
              type: 'project',
              status: p.status,
              entityName: p.client?.name ? `Client: ${p.client.name}` : undefined
            });
          }
        });
      }

      // 2. Tasks Due Dates
      if (taskRes.status === 'fulfilled' && taskRes.value.data) {
        const d = taskRes.value.data;
        const taskList = Array.isArray(d.tasks) ? d.tasks : [...(d.todo || []), ...(d.inProgress || []), ...(d.done || [])];
        taskList.forEach((t: any) => {
          if (t.date) {
            parsedEvents.push({
              id: 'task-' + (t._id || t.id),
              title: t.title,
              date: t.date,
              type: 'task',
              status: t.status,
              priority: t.priority,
              entityName: t.project
            });
          }
        });
      }

      // 3. Invoices Due Dates (For Admin and Client)
      if (invRes.status === 'fulfilled' && invRes.value.data.invoices) {
        invRes.value.data.invoices.forEach((inv: any) => {
          if (inv.dueDate) {
            parsedEvents.push({
              id: 'inv-' + (inv._id || inv.id),
              title: `Invoice ${inv.invoiceNumber} ($${inv.amount.toLocaleString()})`,
              date: inv.dueDate,
              type: 'invoice',
              status: inv.status,
              entityName: inv.client?.name ? `Client: ${inv.client.name}` : undefined
            });
          }
        });
      }

      setEvents(parsedEvents);
    } catch (err) {
      console.error('Failed to fetch calendar data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, []);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-11
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // First day of month & total days
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Helper to parse dates loosely and check if event matches a specific day of current month/year
  const getEventsForDay = (dayNum: number) => {
    return events.filter(e => {
      if (typeFilter !== 'all' && e.type !== typeFilter) return false;
      const parsed = new Date(e.date);
      if (!isNaN(parsed.getTime())) {
        return parsed.getFullYear() === year && parsed.getMonth() === month && parsed.getDate() === dayNum;
      }
      // If date string contains month abbreviation and day number (e.g. "Apr 20" or "Nov 16")
      const lowerDate = e.date.toLowerCase();
      const currentShortMonth = monthName.slice(0, 3).toLowerCase();
      return lowerDate.includes(currentShortMonth) && (lowerDate.includes(` ${dayNum},`) || lowerDate.includes(` ${dayNum} `) || lowerDate.endsWith(` ${dayNum}`));
    });
  };

  // Export schedule to CSV
  const handleExportSchedule = () => {
    if (events.length === 0) return;
    const headers = ['Event Type,Title,Date,Status,Entity'];
    const rows = events.map(e => `"${e.type.toUpperCase()}","${e.title.replace(/"/g, '""')}","${e.date}","${e.status}","${e.entityName || ''}"`);
    const blob = new Blob([[...headers, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ClientFlow_Calendar_${monthName}_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.4s ease-out', paddingBottom: '3rem' }}>
      
      {/* Top Header */}
      <div className="dashboard-banner-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              {isDev ? 'Developer Sprint Deadlines' : isClient ? 'Project Delivery Schedule' : 'Master ERP Calendar & Deadlines'}
            </h2>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '20px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
              {events.length} Scheduled Events
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0.25rem 0 0' }}>
            Live scheduling synchronized with MongoDB Atlas project delivery deadlines and task due dates.
          </p>
        </div>

        {/* Action Controls */}
        <div className="dashboard-action-controls" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Type Filter */}
          <select
            className="dashboard-action-select"
            value={typeFilter}
            onChange={(e: any) => setTypeFilter(e.target.value)}
            style={{
              background: 'var(--surface)',
              color: 'var(--text-main)',
              border: '1px solid var(--surface-border)',
              borderRadius: '8px',
              padding: '0.55rem 0.85rem',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Deliverables</option>
            <option value="task">Tasks & Sprints</option>
            <option value="project">Project Milestones</option>
            {!isDev && <option value="invoice">Invoice Due Dates</option>}
          </select>

          <button
            className="dashboard-action-btn"
            onClick={() => fetchCalendarData(true)}
            disabled={refreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 0.85rem',
              background: 'var(--surface)',
              border: '1px solid var(--surface-border)',
              borderRadius: '8px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            className="dashboard-action-btn"
            onClick={handleExportSchedule}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 0.85rem',
              background: 'var(--surface)',
              border: '1px solid var(--surface-border)',
              borderRadius: '8px',
              color: 'var(--text-main)',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            <Download size={14} /> Export Schedule
          </button>
        </div>
      </div>

      {/* Calendar Navigation & Month Bar */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--surface-border)',
        borderRadius: 'var(--radius)',
        padding: '1rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={handleToday}
            style={{
              padding: '0.45rem 0.9rem',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '6px',
              color: 'var(--primary)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            Today
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handlePrevMonth}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', padding: '0.3rem' }}
            >
              <ChevronLeft size={20} />
            </button>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, minWidth: '160px', textAlign: 'center', color: 'var(--text-main)' }}>
              {monthName} {year}
            </span>
            <button
              onClick={handleNextMonth}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', padding: '0.3rem' }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></span>
            <span>Sprint Tasks</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6' }}></span>
            <span>Projects</span>
          </div>
          {!isDev && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
              <span>Invoices</span>
            </div>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--surface-border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        boxShadow: 'var(--glass-shadow)',
        width: '100%'
      }}>
        <div className="table-responsive" style={{ overflowX: 'auto', width: '100%' }}>
          <div style={{ minWidth: '600px' }}>
            {/* Days Header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--surface-border)', background: 'rgba(0,0,0,0.02)' }}>
          {daysOfWeek.map(day => (
            <div key={day} style={{ padding: '0.85rem', textAlign: 'center', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {day}
            </div>
          ))}
        </div>

        {/* Days Matrix */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {/* Previous month trailing days */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => {
            const dayNumber = prevMonthDays - firstDayIndex + idx + 1;
            return (
              <div key={`prev-${idx}`} style={{ minHeight: '110px', padding: '0.5rem', borderRight: '1px solid var(--surface-border)', borderBottom: '1px solid var(--surface-border)', opacity: 0.35 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{dayNumber}</span>
              </div>
            );
          })}

          {/* Current month active days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const isToday = dayNum === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
            const dayEvents = getEventsForDay(dayNum);

            return (
              <div
                key={`curr-${dayNum}`}
                onClick={() => {
                  if (dayEvents.length > 0) {
                    setSelectedDayEvents({ day: dayNum, events: dayEvents });
                  }
                }}
                style={{
                  minHeight: '110px',
                  padding: '0.55rem',
                  borderRight: '1px solid var(--surface-border)',
                  borderBottom: '1px solid var(--surface-border)',
                  background: isToday ? 'rgba(59, 130, 246, 0.04)' : 'transparent',
                  cursor: dayEvents.length > 0 ? 'pointer' : 'default',
                  transition: 'background 0.15s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: isToday ? 700 : 500,
                    background: isToday ? 'var(--primary)' : 'transparent',
                    color: isToday ? '#fff' : 'var(--text-main)'
                  }}>
                    {dayNum}
                  </span>
                  {dayEvents.length > 0 && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700 }}>
                      {dayEvents.length} due
                    </span>
                  )}
                </div>

                {/* Event Pills */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {dayEvents.slice(0, 3).map((ev, i) => {
                    const color = ev.type === 'project' ? '#8b5cf6' : ev.type === 'invoice' ? '#10b981' : '#3b82f6';
                    return (
                      <div
                        key={i}
                        style={{
                          background: `${color}18`,
                          borderLeft: `3px solid ${color}`,
                          color: 'var(--text-main)',
                          padding: '0.2rem 0.4rem',
                          borderRadius: '3px',
                          fontSize: '0.72rem',
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {ev.title}
                      </div>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                      +{dayEvents.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
          </div>
        </div>
      </div>

      {/* SELECTED DAY EVENTS DRAWER */}
      {selectedDayEvents && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(3px)',
          zIndex: 90,
          display: 'flex',
          justifyContent: 'flex-end'
        }}
        onClick={() => setSelectedDayEvents(null)}
        >
          <div style={{
            width: '100%',
            maxWidth: '440px',
            background: 'var(--surface)',
            height: '100%',
            padding: '2rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
            animation: 'slideInRight 0.3s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                  Deliverables for {monthName} {selectedDayEvents.day}, {year}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {selectedDayEvents.events.length} item(s) due on this date
                </span>
              </div>
              <button
                onClick={() => setSelectedDayEvents(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {selectedDayEvents.events.map((ev, idx) => {
                const color = ev.type === 'project' ? '#8b5cf6' : ev.type === 'invoice' ? '#10b981' : '#3b82f6';
                const Icon = ev.type === 'project' ? FolderKanban : ev.type === 'invoice' ? DollarSign : CheckSquare;

                return (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-color)',
                      border: '1px solid var(--surface-border)',
                      borderRadius: '8px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        background: `${color}18`,
                        color,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        textTransform: 'uppercase'
                      }}>
                        <Icon size={12} /> {ev.type}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ev.status}</span>
                    </div>

                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>
                      {ev.title}
                    </h4>

                    {ev.entityName && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {ev.entityName}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
