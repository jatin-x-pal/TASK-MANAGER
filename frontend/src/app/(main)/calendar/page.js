'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, X, Calendar as CalendarIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function CalendarPage() {
  const [date, setDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', type: 'Meeting', startTime: '', location: '' });

  const month = date.getMonth();
  const year = date.getFullYear();

  const { data: scheduleRes, mutate } = useSWR(`/api/schedules?month=${month}&year=${year}`, fetcher);
  const events = scheduleRes?.data || [];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => setDate(new Date(year, month - 1, 1));
  const nextMonth = () => setDate(new Date(year, month + 1, 1));
  const setToday = () => setDate(new Date());

  const handleAddEvent = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventForm)
    });

    if (res.ok) {
      toast.success('Event added to calendar');
      setShowAddModal(false);
      setEventForm({ title: '', type: 'Meeting', startTime: '', location: '' });
      mutate();
    }
  };

  const upcomingEvents = events
    .filter(e => new Date(e.startTime) >= new Date())
    .slice(0, 5);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Calendar</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Manage your schedules and upcoming deadlines</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <button className="btn btn-outline" onClick={setToday} style={{ borderRadius: '12px', padding: '0.8rem 1.5rem' }}>Today</button>
           <button className="btn" onClick={() => setShowAddModal(true)} style={{ borderRadius: '100px', padding: '0.8rem 1.8rem' }}><Plus size={18} /> Add Event</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
        {/* Main Calendar Grid */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
             <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>{date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
             <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-outline" onClick={prevMonth} style={{ padding: '0.5rem', borderRadius: '10px' }}><ChevronLeft size={20} /></button>
                <button className="btn btn-outline" onClick={nextMonth} style={{ padding: '0.5rem', borderRadius: '10px' }}><ChevronRight size={20} /></button>
             </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-secondary)', paddingBottom: '1rem' }}>{d}</div>
            ))}
            
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} style={{ height: '110px', opacity: 0.1 }}></div>
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = events.filter(e => new Date(e.startTime).getDate() === day);
              const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

              return (
                <div key={day} style={{ 
                  height: '110px', 
                  border: '1px solid var(--border)', 
                  borderRadius: '15px', 
                  padding: '0.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  backgroundColor: isToday ? 'rgba(72,163,255,0.08)' : 'transparent',
                  borderColor: isToday ? 'var(--primary)' : 'var(--border)',
                  transition: 'all 0.2s ease'
                }} className="hover-scale">
                  <span style={{ fontWeight: '800', fontSize: '0.9rem', color: isToday ? 'var(--primary)' : 'inherit' }}>{day}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', overflowY: 'auto' }}>
                    {dayEvents.map((e, idx) => (
                      <div key={idx} style={{ 
                        fontSize: '0.65rem', 
                        padding: '0.3rem 0.6rem', 
                        backgroundColor: e.type === 'Meeting' ? '#48A3FF' : '#E91E63', 
                        color: 'white', 
                        borderRadius: '6px',
                        fontWeight: '700',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {e.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Upcoming Events */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
           <div className="card" style={{ padding: '1.8rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.8rem' }}>Upcoming Events</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                 {upcomingEvents.length === 0 ? (
                   <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>No upcoming events.</p>
                 ) : (
                   upcomingEvents.map((e, i) => (
                     <div key={i} style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ width: '4px', backgroundColor: e.type === 'Meeting' ? '#48A3FF' : '#E91E63', borderRadius: '10px' }}></div>
                        <div>
                           <div style={{ fontSize: '0.95rem', fontWeight: '700' }}>{e.title}</div>
                           <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.3rem' }}>
                             <Clock size={12} /> {new Date(e.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(e.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                           </div>
                        </div>
                     </div>
                   ))
                 )}
              </div>
           </div>

           <div className="card" style={{ padding: '2rem', backgroundColor: 'rgba(255,159,67,0.06)', border: '1px dashed rgba(255,159,67,0.3)', textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem', color: '#FF9F43' }}>
                 <CalendarIcon size={24} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#1A1A1A', marginBottom: '0.8rem' }}>Connect Calendar</h3>
              <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.6', marginBottom: '1.5rem' }}>Sync your external calendars to manage everything in one place.</p>
              <button className="btn" style={{ width: '100%', backgroundColor: '#FF9F43', fontWeight: '700', borderRadius: '100px' }}>Connect Now</button>
           </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, backdropFilter: 'blur(8px)' }}>
          <div className="card animate-fade-in" style={{ width: '90%', maxWidth: '500px', padding: '2.5rem', backgroundColor: 'white' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Schedule Event</h2>
                <button onClick={() => setShowAddModal(false)}><X size={24} /></button>
             </div>
             <form onSubmit={handleAddEvent}>
                <div style={{ marginBottom: '1.2rem' }}>
                   <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem' }}>EVENT TITLE</label>
                   <input type="text" placeholder="e.g. Quarterly Review" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} required style={{ width: '100%' }} />
                </div>
                
                <div style={{ display: 'flex', gap: '1.2rem', marginBottom: '1.2rem' }}>
                   <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem' }}>TYPE</label>
                      <select value={eventForm.type} onChange={e => setEventForm({...eventForm, type: e.target.value})} style={{ width: '100%' }}>
                         <option>Meeting</option>
                         <option>Event</option>
                      </select>
                   </div>
                   <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem' }}>TIME</label>
                      <input type="datetime-local" value={eventForm.startTime} onChange={e => setEventForm({...eventForm, startTime: e.target.value})} required style={{ width: '100%' }} />
                   </div>
                </div>

                <div style={{ marginBottom: '2.5rem' }}>
                   <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem' }}>LOCATION / LINK</label>
                   <div style={{ position: 'relative' }}>
                      <input type="text" placeholder="Add location or link" value={eventForm.location} onChange={e => setEventForm({...eventForm, location: e.target.value})} style={{ width: '100%', paddingLeft: '2.5rem' }} />
                      <MapPin size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                   </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                   <button type="submit" className="btn" style={{ flex: 1, borderRadius: '100px', padding: '1rem' }}>Create Event</button>
                   <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)} style={{ flex: 1, borderRadius: '100px', padding: '1rem' }}>Cancel</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
