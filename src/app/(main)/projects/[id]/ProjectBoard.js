'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import { Flag, Calendar, UserIcon, Plus, UserPlus, Sparkles, Activity } from 'lucide-react';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ProjectBoard({ id }) {
  const { user } = useAuth();
  
  // Real-time polling
  const { data: boardData, mutate } = useSWR(`/api/projects/${id}/board`, fetcher, { refreshInterval: 3000 });
  const { data: activityData } = useSWR(`/api/activities?projectId=${id}`, fetcher, { refreshInterval: 3000 });

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', priority: 'Medium', dueDate: '', assignedTo: ''
  });

  if (!boardData) return <div style={{ padding: '2rem', fontWeight: 'bold' }}>LOADING SECURE DATALINK...</div>;
  if (boardData.error) return <div style={{ padding: '2rem', color: 'var(--error)' }}>ERROR: {boardData.error}</div>;

  const { project, tasks } = boardData;
  const activities = activityData?.data || [];
  const isAdmin = project.admin._id === user?.id || project.admin._id === user?._id;

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...taskForm, projectId: project._id })
    });
    
    if (res.ok) {
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', priority: 'Medium', dueDate: '', assignedTo: '' });
      mutate();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    const res = await fetch(`/api/projects/${project._id}/add-member`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: memberEmail })
    });
    
    const data = await res.json();
    if (data.success) {
      setShowMemberModal(false);
      setMemberEmail('');
      mutate();
    } else {
      alert(data.error);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    // Optimistic update
    mutate({ ...boardData, tasks: tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t) }, false);
    
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    
    mutate();
  };

  const generateAiSuggestions = async () => {
    setIsAiLoading(true);
    const res = await fetch(`/api/projects/${id}/ai-suggest`);
    const data = await res.json();
    setIsAiLoading(false);

    if (data.success) {
      // Auto-add the first suggestion to the form
      const suggestion = data.data[0];
      setTaskForm({
        title: suggestion.title,
        description: suggestion.description,
        priority: suggestion.priority,
        dueDate: '',
        assignedTo: ''
      });
      setShowTaskModal(true);
    } else {
      alert(data.error);
    }
  };

  const renderColumn = (status, columnTitle, color) => {
    const colTasks = tasks.filter(t => t.status === status);
    
    return (
      <div className="glass-panel" style={{ flex: 1, minWidth: '300px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: `4px solid ${color}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', textTransform: 'uppercase' }}>{columnTitle}</h3>
          <span style={{ backgroundColor: 'var(--foreground)', color: 'var(--background)', padding: '0.2rem 0.6rem', fontSize: '0.8rem', fontWeight: 'bold' }}>{colTasks.length}</span>
        </div>
        
        {colTasks.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#666', padding: '2rem 0', fontSize: '0.9rem', fontStyle: 'italic', textTransform: 'uppercase' }}>
            NO DATA
          </div>
        ) : (
          colTasks.map(task => (
            <div key={task._id} style={{ backgroundColor: 'var(--surface)', padding: '1rem', border: '1px solid var(--border)', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
              <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.05rem' }}>{task.title}</h4>
              {task.description && <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '1rem', lineHeight: '1.4' }}>{task.description}</p>}
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', padding: '0.3rem 0.6rem', border: '1px solid var(--border)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                  <Flag size={12} /> {task.priority}
                </span>
                {task.dueDate && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', padding: '0.3rem 0.6rem', border: '1px solid var(--border)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                    <Calendar size={12} /> {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#999', textTransform: 'uppercase' }}>
                  <div style={{ width: '24px', height: '24px', backgroundColor: 'var(--foreground)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--background)', fontWeight: 'bold', fontSize: '0.7rem' }}>
                    {task.assignedTo ? task.assignedTo.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  {task.assignedTo ? task.assignedTo.name : 'UNASSIGNED'}
                </div>
                <select 
                  value={task.status} 
                  onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)', outline: 'none', cursor: 'pointer', textTransform: 'uppercase', fontWeight: 'bold' }}
                >
                  <option value="To Do">TO DO</option>
                  <option value="In Progress">IN PROGRESS</option>
                  <option value="Done">DONE</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', borderBottom: '2px solid var(--border)', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '-1px' }}>{project.name}</h1>
          <p style={{ color: '#888', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
            ADMIN: {project.admin.name} • MEMBERS: {project.members.length}
          </p>
        </div>
        
        {isAdmin && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-outline" onClick={generateAiSuggestions} disabled={isAiLoading}>
              <Sparkles size={16} /> {isAiLoading ? 'GENERATING...' : 'AI SUGGEST'}
            </button>
            <button className="btn btn-outline" onClick={() => setShowMemberModal(true)}>
              <UserPlus size={16} /> ADD MEMBER
            </button>
            <button className="btn" onClick={() => setShowTaskModal(true)}>
              <Plus size={16} /> NEW TASK
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '3rem' }}>
        {renderColumn('To Do', 'TO DO', '#ffffff')}
        {renderColumn('In Progress', 'IN PROGRESS', '#888888')}
        {renderColumn('Done', 'DONE', '#444444')}
      </div>

      {/* Activity Log */}
      <div className="glass-panel" style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} /> PROJECT ACTIVITY
        </h3>
        {activities.length === 0 ? (
          <div style={{ color: '#666', fontStyle: 'italic', textTransform: 'uppercase' }}>No activity logged yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {activities.map(act => (
              <div key={act._id} style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', alignItems: 'flex-start' }}>
                <div style={{ color: '#666', fontSize: '0.8rem', marginTop: '0.1rem', minWidth: '120px' }}>
                  {new Date(act.createdAt).toLocaleString()}
                </div>
                <div>
                  <span style={{ fontWeight: 'bold' }}>{act.userId?.name || 'Unknown'}</span> {act.action}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showTaskModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem', backgroundColor: 'var(--background)' }}>
            <h2 style={{ marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>CREATE TASK</h2>
            <form onSubmit={handleCreateTask}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>TITLE</label>
                <input type="text" value={taskForm.title} onChange={(e) => setTaskForm({...taskForm, title: e.target.value})} required style={{ width: '100%' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>DESCRIPTION</label>
                <textarea value={taskForm.description} onChange={(e) => setTaskForm({...taskForm, description: e.target.value})} style={{ width: '100%', minHeight: '80px', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>PRIORITY</label>
                  <select value={taskForm.priority} onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})} style={{ width: '100%' }}>
                    <option value="Low">LOW</option>
                    <option value="Medium">MEDIUM</option>
                    <option value="High">HIGH</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>DUE DATE</label>
                  <input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})} style={{ width: '100%' }} />
                </div>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>ASSIGN TO</label>
                <select value={taskForm.assignedTo} onChange={(e) => setTaskForm({...taskForm, assignedTo: e.target.value})} style={{ width: '100%' }}>
                  <option value="">UNASSIGNED</option>
                  <option value={project.admin._id}>{project.admin.name} (ADMIN)</option>
                  {project.members.map(m => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowTaskModal(false)}>ABORT</button>
                <button type="submit" className="btn">EXECUTE</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMemberModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem', backgroundColor: 'var(--background)' }}>
            <h2 style={{ marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>ADD OPERATIVE</h2>
            <form onSubmit={handleAddMember}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>EMAIL ADDRESS</label>
                <input type="email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} required style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowMemberModal(false)}>ABORT</button>
                <button type="submit" className="btn">AUTHORIZE</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
