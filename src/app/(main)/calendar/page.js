'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock } from 'lucide-react';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState('May 2026');
  
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const events = [
    { day: 5, title: 'Team Sync', time: '10:00 AM', color: '#48A3FF' },
    { day: 12, title: 'Product Launch', time: '2:00 PM', color: '#FF9F43' },
    { day: 18, title: 'Design Review', time: '4:30 PM', color: '#4CAF50' },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Calendar</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Manage your schedules and upcoming deadlines</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <button className="btn btn-outline" style={{ borderRadius: '12px', padding: '0.8rem 1.5rem' }}>Today</button>
           <button className="btn" style={{ borderRadius: '100px', padding: '0.8rem 1.8rem' }}><Plus size={18} /> Add Event</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        {/* Main Calendar Grid */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
             <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>{currentMonth}</h2>
             <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: '10px' }}><ChevronLeft size={20} /></button>
                <button className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: '10px' }}><ChevronRight size={20} /></button>
             </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-secondary)', paddingBottom: '1rem' }}>{d}</div>
            ))}
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`empty-${i}`} style={{ height: '100px', opacity: 0.3 }}></div>
            ))}
            {days.map(day => {
              const dayEvents = events.filter(e => e.day === day);
              return (
                <div key={day} style={{ 
                  height: '110px', 
                  border: '1px solid var(--border)', 
                  borderRadius: '15px', 
                  padding: '0.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  backgroundColor: day === 1 ? 'rgba(72,163,255,0.05)' : 'transparent',
                  transition: 'all 0.2s ease'
                }} className="hover-scale">
                  <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{day}</span>
                  {dayEvents.map((e, idx) => (
                    <div key={idx} style={{ 
                      fontSize: '0.7rem', 
                      padding: '0.3rem 0.5rem', 
                      backgroundColor: e.color, 
                      color: 'white', 
                      borderRadius: '6px',
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {e.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Upcoming Events */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
           <div className="card" style={{ padding: '1.8rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.5rem' }}>Upcoming Events</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                 {events.map((e, i) => (
                   <div key={i} style={{ display: 'flex', gap: '1rem' }}>
                      <div style={{ width: '4px', backgroundColor: e.color, borderRadius: '10px' }}></div>
                      <div>
                         <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>{e.title}</div>
                         <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                           <Clock size={12} /> {e.time} • May {e.day}
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="card" style={{ padding: '1.8rem', backgroundColor: 'rgba(255,159,67,0.05)', border: '1px dashed #FF9F43' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#FF9F43', marginBottom: '0.8rem' }}>Pro Tip</h3>
              <p style={{ fontSize: '0.85rem', color: '#444', lineHeight: '1.5' }}>Sync your Google Calendar to see all your meetings in TaskFlow!</p>
              <button className="btn" style={{ width: '100%', marginTop: '1.2rem', backgroundColor: '#FF9F43', fontSize: '0.85rem' }}>Connect Now</button>
           </div>
        </div>
      </div>
    </div>
  );
}
