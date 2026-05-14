'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Toaster } from 'react-hot-toast';
import { 
  LayoutDashboard, 
  LogOut, 
  Home, 
  Bell, 
  User, 
  Briefcase, 
  Calendar, 
  BarChart3, 
  Settings,
  Search,
  MessageSquare,
  CheckSquare,
  ChevronDown,
  UserCircle
} from 'lucide-react';

export default function MainLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const clearAll = async () => {
    try {
      const res = await fetch('/api/notifications', { method: 'DELETE' });
      if (res.ok) {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Failed to clear notifications', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const formatTime = (dateString) => {
    if (!dateString) return 'Just now';
    const now = new Date();
    const past = new Date(dateString);
    const diff = Math.floor((now - past) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };


  const searchSuggestions = [
    { title: 'Dashboard Redesign', type: 'Project' },
    { title: 'API Integration', type: 'Task' },
    { title: 'Alex Johnson', type: 'User' }
  ].filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>Loading...</div>;

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <Toaster position="top-right" />
      
      {/* Sidebar */}
      <aside style={{ 
        width: '100px', 
        backgroundColor: 'var(--surface)', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        padding: '2.5rem 0', 
        borderRight: '1px solid var(--border)', 
        position: 'fixed', 
        height: '100vh', 
        zIndex: 100,
        boxShadow: '4px 0 20px rgba(0,0,0,0.02)'
      }}>
        {/* Logo Section */}
        <Link href="/dashboard" style={{ marginBottom: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', textDecoration: 'none' }}>
          <div style={{ 
            width: '55px', 
            height: '55px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            position: 'relative'
          }}>
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
              {/* Lightbulb Outline */}
              <path d="M50 15C35 15 25 25 25 40C25 50 32 58 35 65C38 72 38 80 50 80C62 80 62 72 65 65C68 58 75 50 75 40C75 25 65 15 50 15Z" fill="none" stroke="#FF9F43" strokeWidth="5" />
              <path d="M40 85H60M42 90H58M45 95H55" fill="none" stroke="#FF9F43" strokeWidth="3" strokeLinecap="round" />
              
              {/* Inner 'T' and Bullet Points */}
              <path d="M42 35H55M48.5 35V60" fill="none" stroke="#FF9F43" strokeWidth="5" strokeLinecap="round" />
              <circle cx="62" cy="40" r="3" fill="#FF9F43" />
              <path d="M68 40H75" fill="none" stroke="#FF9F43" strokeWidth="3" strokeLinecap="round" />
              <circle cx="62" cy="50" r="3" fill="#FF9F43" />
              <path d="M68 50H75" fill="none" stroke="#FF9F43" strokeWidth="3" strokeLinecap="round" />
              <circle cx="62" cy="60" r="3" fill="#FF9F43" />
              <path d="M68 60H75" fill="none" stroke="#FF9F43" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </Link>
        
        {/* Navigation Icons */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <SidebarLink icon={<LayoutDashboard size={24} />} href="/dashboard" active={pathname === '/dashboard'} label="Dashboard" />
          <SidebarLink icon={<Briefcase size={24} />} href="/projects" active={pathname.includes('/projects')} label="Projects" />
          <SidebarLink icon={<CheckSquare size={24} />} href="/tasks" active={pathname === '/tasks'} label="Tasks" />
          <SidebarLink icon={<Calendar size={24} />} href="/calendar" active={pathname === '/calendar'} label="Calendar" />
          <SidebarLink icon={<MessageSquare size={24} />} href="/messages" active={pathname === '/messages'} label="Messages" />
          <SidebarLink icon={<Settings size={24} />} href="/settings" active={pathname === '/settings'} label="Settings" />
        </nav>

        <div style={{ marginTop: 'auto' }}>
           <button onClick={handleLogout} style={{ color: 'var(--text-secondary)', padding: '1rem', cursor: 'pointer', border: 'none', background: 'transparent' }}><LogOut size={24} /></button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ marginLeft: '100px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* TOP BAR */}
        <header style={{ 
          height: '100px', 
          backgroundColor: 'var(--surface)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0 3.5rem',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          zIndex: 90
        }}>
          {/* Greeting Text */}
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--foreground)' }}>Good Morning {user?.name.split(' ')[0] || 'User'}!</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Explore your productivity metrics and tasks</p>
          </div>

          {/* Search, Notifications, Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
            
            {/* Search Bar */}
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Search tasks, projects..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchSuggestions(e.target.value.length > 0);
                }}
                onFocus={() => setShowSearchSuggestions(searchQuery.length > 0)}
                style={{ 
                  backgroundColor: 'var(--background)', 
                  border: '1px solid transparent', 
                  padding: '0.85rem 1.5rem 0.85rem 3.2rem', 
                  borderRadius: '100px', 
                  width: '320px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }} 
              />
              <Search size={18} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              
              {showSearchSuggestions && (
                <div className="card animate-fade-in" style={{ position: 'absolute', top: '55px', left: 0, right: 0, padding: '1rem', zIndex: 200, boxShadow: '0 15px 40px rgba(0,0,0,0.1)' }}>
                   <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.8rem', textTransform: 'uppercase' }}>Suggestions</div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {searchSuggestions.length > 0 ? searchSuggestions.map((s, i) => (
                        <div key={i} className="search-suggestion-item" style={{ padding: '0.6rem 1rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setShowSearchSuggestions(false)}>
                           <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{s.title}</span>
                           <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '700' }}>{s.type}</span>
                        </div>
                      )) : <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '0.5rem' }}>No results found</div>}
                   </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
                style={{ position: 'relative', color: 'var(--foreground)', cursor: 'pointer', border: 'none', background: 'transparent' }}
              >
                <Bell size={24} />
                <span style={{ position: 'absolute', top: '-5px', right: '-4px', width: '12px', height: '12px', backgroundColor: '#FF6B6B', borderRadius: '50%', border: '2.5px solid var(--surface)' }}></span>
              </button>

              {showNotifications && (
                <div className="card animate-fade-in" style={{ position: 'absolute', top: '50px', right: '-50px', width: '340px', padding: '1.5rem', zIndex: 200, boxShadow: '0 15px 40px rgba(0,0,0,0.12)', backgroundColor: 'var(--surface)', borderRadius: '20px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                     <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Notifications</h3>
                     <span 
                       onClick={clearAll}
                       style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}
                     >
                       Clear all
                     </span>
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                      {notifications.length > 0 ? notifications.map(n => (
                        <div key={n._id} style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                           <div style={{ 
                             width: '10px', 
                             height: '10px', 
                             borderRadius: '50%', 
                             backgroundColor: n.type === 'success' ? '#4CAF50' : n.type === 'warning' ? '#FF9F43' : '#48A3FF', 
                             marginTop: '4px',
                             flexShrink: 0
                           }}></div>
                           <div style={{ flex: 1 }}>
                             <p style={{ fontSize: '0.85rem', marginBottom: '0.2rem', lineHeight: '1.4', color: 'var(--foreground)' }}>{n.text}</p>
                             <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{formatTime(n.createdAt)}</span>
                           </div>
                        </div>
                      )) : (
                        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          No new notifications
                        </div>
                      )}
                   </div>

                </div>
              )}
            </div>

            {/* Profile Avatar & Menu */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                  <div style={{ width: '48px', height: '48px', borderRadius: '16px', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.1rem', overflow: 'hidden', boxShadow: '0 6px 12px rgba(72,163,255,0.2)' }}>
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      user?.name?.charAt(0) || 'U'
                    )}
                  </div>
                 <ChevronDown size={18} style={{ color: 'var(--text-secondary)', transition: 'transform 0.2s', transform: showProfileMenu ? 'rotate(180deg)' : 'none' }} />
              </button>

              {showProfileMenu && (
                <div className="card animate-fade-in" style={{ position: 'absolute', top: '60px', right: 0, width: '220px', padding: '0.8rem', zIndex: 200, boxShadow: '0 15px 40px rgba(0,0,0,0.12)', backgroundColor: 'var(--surface)', borderRadius: '18px' }}>
                   <div style={{ padding: '0.8rem', borderBottom: '1px solid var(--border)', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{user?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user?.email}</div>
                   </div>
                   <Link href="/profile" className="dropdown-item">My Profile</Link>
                   <Link href="/settings" className="dropdown-item">Account Settings</Link>
                   <button onClick={handleLogout} className="dropdown-item" style={{ color: '#FF6B6B', width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>Logout</button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* PAGE CONTENT */}
        <div style={{ padding: '3rem 3.5rem', flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ icon, href, active, label }) {
  return (
    <Link href={href} title={label} style={{ 
      color: active ? '#FF9F43' : '#A0AEC0', 
      backgroundColor: active ? 'rgba(255,159,67,0.08)' : 'transparent',
      padding: '1rem',
      borderRadius: '16px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textDecoration: 'none'
    }}>
      {icon}
    </Link>
  );
}
