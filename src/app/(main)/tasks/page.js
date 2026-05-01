'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Search, Filter, Calendar, Flag, Folder, MoreVertical, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function TasksPage() {
  const { data: tasksRes, mutate } = useSWR('/api/tasks', fetcher);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const tasks = tasksRes?.data || [];
  
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const updateStatus = async (taskId, status) => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    
    if (res.ok) {
      toast.success(`Moved to ${status}`);
      mutate();
    }
  };

  const renderColumn = (status, title, color) => {
    const colTasks = filteredTasks.filter(t => t.status === status);
    
    return (
      <div className="card" style={{ flex: 1, minWidth: '320px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', backgroundColor: 'var(--surface)', borderTop: `6px solid ${color}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h3 style={{ fontWeight: '700', fontSize: '1.1rem' }}>{title}</h3>
          <span style={{ backgroundColor: 'var(--background)', padding: '0.2rem 0.8rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '700' }}>{colTasks.length}</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {colTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No tasks found</div>
          ) : (
            colTasks.map(task => (
              <div key={task._id} className="card hover-scale" style={{ padding: '1.2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: task.projectId?.color || 'var(--primary)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                      <Folder size={12} /> {task.projectId?.name || 'Project'}
                   </div>
                   <MoreVertical size={16} style={{ color: 'var(--text-secondary)' }} />
                </div>
                
                <h4 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.8rem', lineHeight: '1.4' }}>{task.title}</h4>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.2rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', padding: '0.2rem 0.6rem', backgroundColor: 'var(--background)', borderRadius: '100px', fontWeight: '600' }}>
                    <Flag size={12} style={{ color: task.priority === 'High' ? 'var(--accent-pink)' : 'var(--accent-orange)' }} /> {task.priority}
                  </span>
                  {task.dueDate && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', padding: '0.2rem 0.6rem', backgroundColor: 'var(--background)', borderRadius: '100px', fontWeight: '600' }}>
                      <Calendar size={12} /> {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                   <select 
                     value={task.status} 
                     onChange={(e) => updateStatus(task._id, e.target.value)}
                     style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', height: '32px', border: 'none', backgroundColor: '#F8F9FA' }}
                   >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                   </select>
                   {task.status === 'Done' ? <CheckCircle2 size={18} style={{ color: '#4CAF50' }} /> : null}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>My Tasks</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem' }}>View and manage all tasks assigned to you across projects</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: 'white', padding: '0.5rem 1rem', borderRadius: '100px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Priority:</span>
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={{ border: 'none', fontWeight: '600', outline: 'none' }}>
                 <option value="All">All</option>
                 <option value="High">High</option>
                 <option value="Medium">Medium</option>
                 <option value="Low">Low</option>
              </select>
           </div>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: '3rem' }}>
         <input 
           type="text" 
           placeholder="Search tasks by title..." 
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           style={{ width: '100%', paddingLeft: '3.5rem', height: '60px', borderRadius: '18px', border: '1px solid var(--border)', fontSize: '1rem' }} 
         />
         <Search size={22} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
      </div>

      <div style={{ display: 'flex', gap: '2rem', overflowX: 'auto', paddingBottom: '2rem' }}>
        {renderColumn('To Do', 'To Do', '#48A3FF')}
        {renderColumn('In Progress', 'In Progress', '#FF9F43')}
        {renderColumn('Done', 'Done', '#4CAF50')}
      </div>
    </div>
  );
}
