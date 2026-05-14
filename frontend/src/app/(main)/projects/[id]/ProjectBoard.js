'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import { Flag, Calendar, UserIcon, Plus, UserPlus, Sparkles, Activity, MoreVertical, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ProjectBoard({ id }) {
  const { user } = useAuth();
  
  // Real-time polling
  const { data: boardData, mutate } = useSWR(`/api/projects/${id}/board`, fetcher, { refreshInterval: 3000 });
  const { data: activityData } = useSWR(`/api/activities?projectId=${id}`, fetcher, { refreshInterval: 3000 });

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null); // For viewing details
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [filter, setFilter] = useState({ priority: 'All', status: 'All' });
  
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', priority: 'Medium', dueDate: '', assignedTo: ''
  });

  if (!boardData) return <div style={{ padding: '2rem', textAlign: 'center', fontWeight: '500' }}>Loading project data...</div>;
  if (boardData.error) return <div style={{ padding: '2rem', color: 'var(--accent-pink)' }}>Error: {boardData.error}</div>;

  const { project, tasks } = boardData;
  const activities = activityData?.data || [];
  const isAdmin = project.admin._id === user?.id || project.admin._id === user?._id;

  const filteredTasks = tasks.filter(t => {
    const priorityMatch = filter.priority === 'All' || t.priority === filter.priority;
    const statusMatch = filter.status === 'All' || t.status === filter.status;
    return priorityMatch && statusMatch;
  });

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

  const handleAddComment = async (taskId, text) => {
    if (!text.trim()) return;
    const res = await fetch(`/api/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (res.ok) mutate();
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    const res = await fetch(`/api/projects/${project._id}/add-member`, {
      method: 'PUT',
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

  const updateTaskAssignee = async (taskId, userId) => {
    mutate({ ...boardData, tasks: tasks.map(t => t._id === taskId ? { ...t, assignedTo: { ...t.assignedTo, _id: userId } } : t) }, false);
    
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignedTo: userId })
    });
    
    mutate();
  };

  const generateAiSuggestions = async () => {
    setIsAiLoading(true);
    const res = await fetch(`/api/projects/${id}/ai-suggest`);
    const data = await res.json();
    setIsAiLoading(false);
 
    if (data.success) {
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
    const colTasks = filteredTasks.filter(t => t.status === status);
    
    return (
      <div className="card" style={{ flex: 1, minWidth: '320px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', backgroundColor: 'var(--surface)', borderTop: `6px solid ${color}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem' }}>
          <h3 style={{ fontWeight: '600', fontSize: '1.1rem' }}>{columnTitle}</h3>
          <span style={{ backgroundColor: 'var(--background)', color: 'var(--text-secondary)', padding: '0.2rem 0.8rem', fontSize: '0.85rem', fontWeight: '600', borderRadius: '100px' }}>{colTasks.length}</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {colTasks.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem 0', fontSize: '0.9rem' }}>
              No tasks here yet
            </div>
          ) : (
            colTasks.map(task => (
              <div key={task._id} className="card" style={{ padding: '1.2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => setSelectedTask(task)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontWeight: '600', fontSize: '1rem', lineHeight: '1.4' }}>{task.title}</h4>
                  <MoreVertical size={16} style={{ color: 'var(--text-secondary)' }} />
                </div>
                {task.description && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.5' }}>{task.description.length > 80 ? task.description.substring(0, 80) + '...' : task.description}</p>}
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.2rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', padding: '0.2rem 0.6rem', backgroundColor: 'var(--background)', borderRadius: '100px', fontWeight: '500' }}>
                    <Flag size={12} style={{ color: task.priority === 'High' ? 'var(--accent-pink)' : 'var(--accent-orange)' }} /> {task.priority}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.75rem' }}>
                      {task.assignedTo ? task.assignedTo.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{task.comments?.length || 0} Comments</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease', position: 'relative', minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>{project.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <span>Admin: <strong>{project.admin.name}</strong></span>
            <span>•</span>
            <Link href={`/projects/${id}/members`} style={{ color: 'var(--primary)', fontWeight: '600' }}>View {project.members.length} Members</Link>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          {isAdmin && (
            <button className="btn btn-outline" onClick={() => setShowMemberModal(true)} style={{ borderRadius: '100px' }}>
              <UserPlus size={18} /> Invite Member
            </button>
          )}
          <button className="btn btn-outline" onClick={generateAiSuggestions} disabled={isAiLoading} style={{ borderRadius: '100px' }}>
            <Sparkles size={18} style={{ color: 'var(--primary)' }} /> AI Insights
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Priority:</span>
          {['All', 'High', 'Medium', 'Low'].map(p => (
            <button key={p} onClick={() => setFilter({...filter, priority: p})} className={`btn btn-outline`} style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', borderRadius: '100px', backgroundColor: filter.priority === p ? 'var(--primary)' : 'white', color: filter.priority === p ? 'white' : 'inherit' }}>{p}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Status:</span>
          {['All', 'To Do', 'In Progress', 'Done'].map(s => (
            <button key={s} onClick={() => setFilter({...filter, status: s})} className={`btn btn-outline`} style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', borderRadius: '100px', backgroundColor: filter.status === s ? 'var(--primary)' : 'white', color: filter.status === s ? 'white' : 'inherit' }}>{s}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', overflowX: 'auto', paddingBottom: '2rem' }}>
        {renderColumn('To Do', 'To Do', '#48A3FF')}
        {renderColumn('In Progress', 'In Progress', '#FF9F43')}
        {renderColumn('Done', 'Done', '#4CAF50')}
      </div>

      {/* Floating Add Button */}
      {isAdmin && (
        <button 
          onClick={() => setShowTaskModal(true)}
          style={{ 
            position: 'fixed', 
            bottom: '3rem', 
            right: '3rem', 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--primary)', 
            color: 'white', 
            boxShadow: 'var(--shadow-lg)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            zIndex: 150
          }}
        >
          <Plus size={32} />
        </button>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
          onUpdateStatus={updateTaskStatus}
          onUpdateAssignee={updateTaskAssignee}
          onAddComment={handleAddComment}
          members={[project.admin, ...project.members]}
          isAdmin={isAdmin}
          currentUserId={user?.id || user?._id}
        />
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(6px)' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '550px', padding: '2.5rem', backgroundColor: 'white' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>Task Title</label>
                <input type="text" value={taskForm.title} onChange={(e) => setTaskForm({...taskForm, title: e.target.value})} required style={{ width: '100%' }} placeholder="e.g. Design Landing Page" />
              </div>
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>Description</label>
                <textarea value={taskForm.description} onChange={(e) => setTaskForm({...taskForm, description: e.target.value})} style={{ width: '100%', minHeight: '100px', resize: 'vertical' }} placeholder="Add more details about this task..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.2rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>Priority</label>
                  <select value={taskForm.priority} onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})} style={{ width: '100%' }}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>Due Date</label>
                  <input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})} style={{ width: '100%' }} />
                </div>
              </div>
              {isAdmin && (
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>Assign To</label>
                  <select value={taskForm.assignedTo} onChange={(e) => setTaskForm({...taskForm, assignedTo: e.target.value})} style={{ width: '100%' }}>
                    <option value="">Unassigned</option>
                    <option value={project.admin._id}>{project.admin.name} (Admin)</option>
                    {project.members.map(m => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowTaskModal(false)} style={{ borderRadius: '100px' }}>Cancel</button>
                <button type="submit" className="btn" style={{ borderRadius: '100px', padding: '0.8rem 2.5rem' }}>Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMemberModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(6px)' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem', backgroundColor: 'white' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>Invite Member</h2>
            <form onSubmit={handleAddMember}>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>Email Address</label>
                <input type="email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} required style={{ width: '100%' }} placeholder="colleague@example.com" />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowMemberModal(false)} style={{ borderRadius: '100px' }}>Cancel</button>
                <button type="submit" className="btn" style={{ borderRadius: '100px', padding: '0.8rem 2.5rem' }}>Send Invitation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskDetailModal({ task, onClose, onUpdateStatus, onUpdateAssignee, onAddComment, members, isAdmin, currentUserId }) {
  const [commentText, setCommentText] = useState('');
  
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, backdropFilter: 'blur(8px)' }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '800px', padding: 0, backgroundColor: 'white', display: 'grid', gridTemplateColumns: '1.5fr 1fr', overflow: 'hidden', maxHeight: '90vh' }}>
        
        {/* Left: Content */}
        <div style={{ padding: '2.5rem', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
             <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--primary)', textTransform: 'uppercase' }}>Task Details</span>
             <button onClick={onClose}><Plus size={24} style={{ transform: 'rotate(45deg)' }} /></button>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '1rem' }}>{task.title}</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '2rem' }}>{task.description || 'No description provided.'}</p>
          
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>Comments</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '1.5rem' }}>
              {(task.comments || []).map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>U</div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>User</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{c.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input 
                type="text" 
                placeholder="Write a comment..." 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                style={{ flex: 1 }} 
              />
              <button className="btn" onClick={() => { onAddComment(task._id, commentText); setCommentText(''); }}>Send</button>
            </div>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div style={{ backgroundColor: 'var(--background)', padding: '2.5rem', borderLeft: '1px solid var(--border)' }}>
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.8rem' }}>STATUS</label>
            <select 
              value={task.status} 
              onChange={(e) => onUpdateStatus(task._id, e.target.value)} 
              disabled={!isAdmin && task.assignedTo?._id !== currentUserId}
              style={{ width: '100%', backgroundColor: 'white', opacity: (!isAdmin && task.assignedTo?._id !== currentUserId) ? 0.6 : 1 }}
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
            {!isAdmin && task.assignedTo?._id !== currentUserId && (
              <p style={{ fontSize: '0.7rem', color: 'var(--accent-pink)', marginTop: '0.4rem' }}>Only the assignee can update status.</p>
            )}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.8rem' }}>ASSIGNEE</label>
            {isAdmin ? (
              <select 
                value={task.assignedTo?._id || ''} 
                onChange={(e) => onUpdateAssignee(task._id, e.target.value)}
                style={{ width: '100%', backgroundColor: 'white' }}
              >
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                 <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700' }}>
                   {task.assignedTo ? task.assignedTo.name.charAt(0).toUpperCase() : '?'}
                 </div>
                 <span style={{ fontWeight: '600' }}>{task.assignedTo ? task.assignedTo.name : 'Unassigned'}</span>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.8rem' }}>DUE DATE</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
              <Calendar size={18} /> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date set'}
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.8rem' }}>PRIORITY</label>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', borderRadius: '100px', backgroundColor: 'white', fontSize: '0.85rem', fontWeight: '600' }}>
               <Flag size={14} style={{ color: task.priority === 'High' ? 'var(--accent-pink)' : 'var(--accent-orange)' }} /> {task.priority}
            </span>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.8rem' }}>ATTACHMENTS</label>
            <button className="btn btn-outline" style={{ width: '100%', borderStyle: 'dashed' }}>
               <Plus size={16} /> Add File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
