'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { LayoutDashboard, LogOut, Briefcase } from 'lucide-react';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function MainLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { data: projectsRes, mutate: mutateProjects } = useSWR(user ? '/api/projects' : null, fetcher);
  const projects = projectsRes?.data || [];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '2rem', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Floating Card Nav */}
      <nav className="glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', position: 'sticky', top: '2rem', zIndex: 100, boxShadow: '8px 8px 0px rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>TASKFLOW</h1>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/dashboard" className="nav-card" style={{ padding: '0.5rem 1rem' }}>
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', borderLeft: '1px solid var(--border)', paddingLeft: '1rem' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#666' }}>Projects:</span>
              {projects.map(p => (
                <Link key={p._id} href={`/projects/${p._id}`} className="nav-card" style={{ padding: '0.5rem 1rem' }}>
                  <Briefcase size={16} /> {p.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{user.name}</span>
          </div>
          <button onClick={logout} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
            <LogOut size={16} /> EXIT
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, paddingBottom: '4rem' }}>
        {children}
      </main>
    </div>
  );
}
