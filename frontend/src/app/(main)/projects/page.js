'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { Plus, Folder, User, Users, Search, MoreVertical, X, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ProjectsPage() {
  const { data: projectsRes, mutate } = useSWR('/api/projects', fetcher);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', description: '', color: '#48A3FF' });
  const [searchQuery, setSearchQuery] = useState('');

  const projects = projectsRes?.data || [];
  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleCreateProject = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectForm)
    });
    
    if (res.ok) {
      toast.success('Project created successfully!');
      setShowCreateModal(false);
      setProjectForm({ name: '', description: '', color: '#48A3FF' });
      mutate();
    } else {
      const data = await res.json();
      toast.error(data.error || 'Failed to create project');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1A1A1A' }}>Projects</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.4rem' }}>Manage your workspace and collaborative teams</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn" style={{ borderRadius: '100px', padding: '1rem 2.2rem', boxShadow: '0 8px 20px rgba(72,163,255,0.25)' }}>
          <Plus size={20} /> Create Project
        </button>
      </div>

      {/* Search and Filters */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem' }}>
         <div style={{ position: 'relative', flex: 1 }}>
            <input 
              type="text" 
              placeholder="Search projects by name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: '3.5rem', height: '60px', borderRadius: '18px', border: '1px solid var(--border)', fontSize: '1rem' }} 
            />
            <Search size={22} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
         </div>
      </div>

      {/* Projects Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
        {filteredProjects.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>
            <Folder size={64} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
            <h3>No projects found</h3>
            <p>Try searching for something else or create a new project.</p>
          </div>
        ) : (
          filteredProjects.map(project => (
            <Link key={project._id} href={`/projects/${project._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card hover-scale" style={{ padding: '2rem', position: 'relative', borderTop: `6px solid ${project.color || 'var(--primary)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div style={{ width: '45px', height: '45px', borderRadius: '14px', backgroundColor: `${project.color}15` || 'rgba(72,163,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: project.color || 'var(--primary)' }}>
                    <Folder size={24} />
                  </div>
                  <MoreVertical size={18} style={{ color: 'var(--text-secondary)' }} />
                </div>
                
                <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.8rem' }}>{project.name}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '2rem', minHeight: '45px' }}>
                  {project.description || 'Manage tasks and collaborate with your team in this project space.'}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={16} style={{ color: 'var(--text-secondary)' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{project.members?.length + 1} Members</span>
                   </div>
                   <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                      {new Date(project.createdAt).toLocaleDateString()}
                   </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, backdropFilter: 'blur(10px)' }}>
          <div className="card animate-fade-in" style={{ width: '90%', maxWidth: '500px', padding: '2.5rem', backgroundColor: 'white', position: 'relative' }}>
             <button onClick={() => setShowCreateModal(false)} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', border: 'none', background: 'transparent', cursor: 'pointer' }}>
               <X size={24} />
             </button>

             <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '2rem' }}>New Project</h2>
             
             <form onSubmit={handleCreateProject}>
                <div style={{ marginBottom: '1.5rem' }}>
                   <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.6rem' }}>PROJECT NAME</label>
                   <input 
                     type="text" 
                     value={projectForm.name} 
                     onChange={e => setProjectForm({...projectForm, name: e.target.value})} 
                     required 
                     placeholder="e.g. Website Redesign"
                     style={{ width: '100%', height: '50px' }} 
                   />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                   <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.6rem' }}>DESCRIPTION</label>
                   <textarea 
                     value={projectForm.description} 
                     onChange={e => setProjectForm({...projectForm, description: e.target.value})} 
                     placeholder="What is this project about?"
                     style={{ width: '100%', minHeight: '100px', padding: '1rem' }} 
                   />
                </div>
                <div style={{ marginBottom: '2.5rem' }}>
                   <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '1rem' }}>THEME COLOR</label>
                   <div style={{ display: 'flex', gap: '0.8rem' }}>
                      {['#48A3FF', '#FF9F43', '#4CAF50', '#FF6B6B', '#9C27B0', '#F48FB1'].map(color => (
                        <div 
                          key={color} 
                          onClick={() => setProjectForm({...projectForm, color})}
                          style={{ 
                            width: '32px', 
                            height: '32px', 
                            borderRadius: '50%', 
                            backgroundColor: color, 
                            cursor: 'pointer',
                            border: projectForm.color === color ? '3px solid #1A1A1A' : '3px solid transparent',
                            transform: projectForm.color === color ? 'scale(1.1)' : 'none',
                            transition: 'all 0.2s ease'
                          }}
                        ></div>
                      ))}
                   </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                   <button type="submit" className="btn" style={{ flex: 1, borderRadius: '100px', height: '55px', fontWeight: '700' }}>Create Project</button>
                   <button type="button" className="btn btn-outline" onClick={() => setShowCreateModal(false)} style={{ flex: 1, borderRadius: '100px', height: '55px', fontWeight: '700' }}>Cancel</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
