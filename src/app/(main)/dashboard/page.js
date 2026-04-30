'use client';

import { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { CheckCircle2, Clock, ListTodo, AlertTriangle, Plus, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Dashboard() {
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const { mutate } = useSWRConfig();
  const router = useRouter();

  // Real-time polling every 3 seconds
  const { data: statsRes, mutate: mutateStats } = useSWR('/api/dashboard', fetcher, { refreshInterval: 3000 });
  const { data: activityRes } = useSWR('/api/activities', fetcher, { refreshInterval: 3000 });

  const handleCreateProject = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: projectName })
    });
    
    const data = await res.json();
    if (data.success) {
      setShowModal(false);
      setProjectName('');
      mutateStats();
      mutate('/api/projects');
    } else {
      alert(data.error);
    }
  };

  if (!statsRes) return <div style={{ textAlign: 'center', marginTop: '4rem', fontWeight: 'bold' }}>LOADING SECURE DATALINK...</div>;
  const stats = statsRes.data;
  const activities = activityRes?.data || [];

  const cards = [
    { title: 'TOTAL TASKS', value: stats.totalTasks, icon: <ListTodo size={32} /> },
    { title: 'TO DO', value: stats.statusCounts.todo, icon: <Clock size={32} /> },
    { title: 'IN PROGRESS', value: stats.statusCounts.inProgress, icon: <Activity size={32} /> },
    { title: 'DONE', value: stats.statusCounts.done, icon: <CheckCircle2 size={32} /> },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', borderBottom: '2px solid var(--border)', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '-1px' }}>COMMAND CENTER</h1>
          <p style={{ color: '#888' }}>Real-time telemetry and project oversight.</p>
        </div>
        <button className="btn" onClick={() => setShowModal(true)}>
          <Plus size={20} /> NEW PROJECT
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {cards.map((card, i) => (
          <div key={i} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--foreground)' }}>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', lineHeight: '1' }}>{card.value}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', color: '#666', marginTop: '0.5rem' }}>{card.title}</div>
            </div>
            <div style={{ marginLeft: 'auto', opacity: 0.2 }}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Advanced Dashboard section */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>SYSTEM STATUS</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
                <span>OVERDUE CRITICAL TASKS</span>
                <span style={{ color: stats.overdue > 0 ? 'var(--foreground)' : '#666' }}>{stats.overdue} DETECTED</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border)' }}>
                <div style={{ width: stats.totalTasks ? `${Math.min((stats.overdue / stats.totalTasks) * 100, 100)}%` : '0%', height: '100%', backgroundColor: stats.overdue > 0 ? 'var(--foreground)' : 'transparent', transition: 'width 0.5s' }}></div>
              </div>
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
                <span>PROJECT COMPLETION METRIC</span>
                <span>{stats.totalTasks ? Math.round((stats.statusCounts.done / stats.totalTasks) * 100) : 0}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border)' }}>
                <div style={{ width: stats.totalTasks ? `${(stats.statusCounts.done / stats.totalTasks) * 100}%` : '0%', height: '100%', backgroundColor: 'var(--foreground)', transition: 'width 0.5s' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Log */}
        <div className="glass-panel" style={{ padding: '2rem', maxHeight: '400px', overflowY: 'auto' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>ACTIVITY LOG</h2>
          {activities.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic', fontSize: '0.9rem' }}>No recent activity detected.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activities.map(act => (
                <div key={act._id} style={{ borderLeft: '2px solid var(--border)', paddingLeft: '1rem' }}>
                  <div style={{ fontSize: '0.9rem' }}>
                    <span style={{ fontWeight: 'bold' }}>{act.userId?.name || 'Unknown'}</span> {act.action}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.2rem', textTransform: 'uppercase' }}>
                    {new Date(act.createdAt).toLocaleString()} • {act.projectId?.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem', backgroundColor: 'var(--background)' }}>
            <h2 style={{ marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>INITIALIZE PROJECT</h2>
            <form onSubmit={handleCreateProject}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>PROJECT DESIGNATION</label>
                <input 
                  type="text" 
                  value={projectName} 
                  onChange={(e) => setProjectName(e.target.value)} 
                  required 
                  style={{ width: '100%' }}
                  placeholder="e.g. OMEGA PROTOCOL"
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>ABORT</button>
                <button type="submit" className="btn">EXECUTE</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
