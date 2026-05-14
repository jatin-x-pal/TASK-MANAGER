'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { User, Bell, Shield, Globe, Monitor, Mail, Lock, Trash2, Save, ChevronRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Profile');
  const { data: profileRes, mutate } = useSWR('/api/user/profile', fetcher);
  const { updateUser } = useAuth();

  const tabs = [
    { name: 'Profile', icon: <User size={20} /> },
    { name: 'Notifications', icon: <Bell size={20} /> },
    { name: 'Security', icon: <Shield size={20} /> },
    { name: 'Appearance', icon: <Monitor size={20} /> },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Manage your account preferences and settings</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '3rem' }}>
        <div className="card" style={{ padding: '1rem', alignSelf: 'start' }}>
           {tabs.map(tab => (
             <button 
               key={tab.name}
               onClick={() => setActiveTab(tab.name)}
               style={{ 
                 width: '100%', 
                 display: 'flex', 
                 alignItems: 'center', 
                 gap: '1rem', 
                 padding: '1.2rem', 
                 borderRadius: '15px', 
                 backgroundColor: activeTab === tab.name ? 'rgba(72,163,255,0.08)' : 'transparent', 
                 color: activeTab === tab.name ? 'var(--primary)' : 'var(--text-secondary)', 
                 fontWeight: '700', 
                 fontSize: '0.95rem',
                 border: 'none',
                 cursor: 'pointer',
                 transition: 'all 0.2s ease',
                 marginBottom: '0.5rem'
               }}
             >
                {tab.icon} {tab.name}
                <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: activeTab === tab.name ? 1 : 0 }} />
             </button>
           ))}
        </div>

        <div className="card" style={{ padding: '3rem' }}>
           {activeTab === 'Profile' && <ProfileSettings profile={profileRes?.data} mutate={mutate} updateUser={updateUser} />}
           {activeTab === 'Notifications' && <NotificationSettings profile={profileRes?.data} mutate={mutate} updateUser={updateUser} />}
           {activeTab === 'Security' && <SecuritySettings />}
           {activeTab === 'Appearance' && <AppearanceSettings profile={profileRes?.data} mutate={mutate} updateUser={updateUser} />}
        </div>
      </div>
    </div>
  );
}

function ProfileSettings({ profile, mutate, updateUser }) {
  const [formData, setFormData] = useState({ name: '', jobTitle: '', company: '', bio: '', email: '', profileImage: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) setFormData(profile);
  }, [profile]);

  const handleSave = async () => {
    setLoading(true);
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      toast.success('Profile updated successfully');
      updateUser(formData);
      mutate();
    } else {
      toast.error('Failed to update profile');
    }
    setLoading(false);
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
       <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem' }}>Profile Information</h2>
       <div style={{ display: 'flex', gap: '2.5rem', marginBottom: '3rem', alignItems: 'center' }}>
          <div style={{ 
            width: '100px', 
            height: '100px', 
            borderRadius: '30px', 
            backgroundColor: 'var(--primary)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'white', 
            fontSize: '2rem', 
            fontWeight: '800',
            overflow: 'hidden',
            border: '4px solid white',
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
          }}>
            {formData.profileImage ? (
              <img src={formData.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              formData.name?.charAt(0) || 'U'
            )}
          </div>
          <div>
             <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn" onClick={() => document.getElementById('profileInput').click()} style={{ padding: '0.8rem 1.5rem', fontSize: '0.85rem' }}>Change Photo</button>
                <button className="btn btn-outline" onClick={() => setFormData({...formData, profileImage: ''})} style={{ padding: '0.8rem 1.5rem', fontSize: '0.85rem' }}>Remove</button>
                <input 
                  id="profileInput" 
                  type="file" 
                  accept="image/*" 
                  hidden 
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      if (file.size > 1024 * 1024) {
                        return toast.error('Image is too large. Max 1MB allowed.');
                      }
                      const reader = new FileReader();
                      reader.onloadend = async () => {
                        const base64 = reader.result;
                        setFormData(prev => ({...prev, profileImage: base64}));
                        // Auto-save the profile pic
                        const res = await fetch('/api/user/profile', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ ...formData, profileImage: base64 })
                        });
                        if (res.ok) {
                          toast.success('Profile picture updated');
                          updateUser({ profileImage: base64 });
                          mutate();
                        } else {
                          toast.error('Failed to save profile picture');
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }} 
                />
             </div>
             <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.8rem' }}>Allowed JPG, GIF or PNG. Max size of 800kB</p>
          </div>
       </div>

       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <SettingInput label="Full Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} placeholder="e.g. John Doe" />
          <SettingInput label="Email Address" value={formData.email} disabled placeholder="john@example.com" icon={<Mail size={18} />} />
          <SettingInput label="Job Title" value={formData.jobTitle} onChange={v => setFormData({...formData, jobTitle: v})} placeholder="Product Designer" />
          <SettingInput label="Company" value={formData.company} onChange={v => setFormData({...formData, company: v})} placeholder="Task Flow" />
       </div>

       <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border)', paddingTop: '2.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={() => setFormData(profile)} style={{ borderRadius: '100px', padding: '0.8rem 2rem' }}>Discard</button>
          <button className="btn" onClick={handleSave} disabled={loading} style={{ borderRadius: '100px', padding: '0.8rem 2.5rem' }}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
       </div>
    </div>
  );
}

function NotificationSettings({ profile, mutate, updateUser }) {
  const handleToggle = async (key, val) => {
    // Ensure we have the latest state from profile or defaults
    const currentNotifications = profile?.notifications || { tasks: true, deadlines: true, mentions: true, updates: false };
    const newNotifications = { ...currentNotifications, [key]: val };
    
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notifications: newNotifications })
    });
    
    if (res.ok) {
      toast.success('Preference updated');
      updateUser({ notifications: newNotifications });
      mutate();
    } else {
      toast.error('Failed to update preference');
    }
  };

  if (!profile) return <Loader2 className="animate-spin" />;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
       <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem' }}>Notification Preferences</h2>
       <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <ToggleItem 
            title="Task Assignments" 
            desc="Notify me when I am assigned to a new task" 
            checked={profile.notifications?.tasks} 
            onChange={v => handleToggle('tasks', v)}
          />
          <ToggleItem 
            title="Deadline Reminders" 
            desc="Notify me when a task deadline is approaching" 
            checked={profile.notifications?.deadlines} 
            onChange={v => handleToggle('deadlines', v)}
          />
          <ToggleItem 
            title="Team Mentions" 
            desc="Notify me when someone mentions me in comments" 
            checked={profile.notifications?.mentions} 
            onChange={v => handleToggle('mentions', v)}
          />
          <ToggleItem 
            title="Project Updates" 
            desc="Notify me about general project changes" 
            checked={profile.notifications?.updates} 
            onChange={v => handleToggle('updates', v)}
          />
       </div>
    </div>
  );
}

function SecuritySettings() {
  const router = useRouter();
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    const res = await fetch('/api/user/security', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new })
    });
    const data = await res.json();
    if (res.ok) {
      toast.success('Password updated successfully');
      setPasswords({ current: '', new: '', confirm: '' });
    } else {
      toast.error(data.error || 'Failed to update password');
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you absolutely sure? This action cannot be undone.')) {
      const res = await fetch('/api/user/security', { method: 'DELETE' });
      if (res.ok) {
        toast.success('Account deleted');
        router.push('/login');
      }
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
       <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem' }}>Security & Access</h2>
       <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <SettingInput label="Current Password" type="password" value={passwords.current} onChange={v => setPasswords({...passwords, current: v})} icon={<Lock size={18} />} />
          <SettingInput label="New Password" type="password" value={passwords.new} onChange={v => setPasswords({...passwords, new: v})} icon={<Lock size={18} />} />
          <SettingInput label="Confirm New Password" type="password" value={passwords.confirm} onChange={v => setPasswords({...passwords, confirm: v})} icon={<Lock size={18} />} />
          <button type="submit" className="btn" disabled={loading} style={{ alignSelf: 'flex-start', padding: '0.8rem 2rem' }}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
       </form>
       <div style={{ marginTop: '4rem', padding: '2rem', backgroundColor: 'rgba(255,107,107,0.05)', borderRadius: '20px', border: '1px solid rgba(255,107,107,0.2)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#FF6B6B', marginBottom: '0.8rem' }}>Delete Account</h3>
          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1.5rem' }}>Once you delete your account, there is no going back. Please be certain.</p>
          <button className="btn" onClick={handleDeleteAccount} style={{ backgroundColor: '#FF6B6B', padding: '0.8rem 2rem' }}><Trash2 size={18} /> Delete Account</button>
       </div>
    </div>
  );
}

function AppearanceSettings({ profile, mutate, updateUser }) {
  const setTheme = async (theme) => {
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appearance: theme })
    });
    if (res.ok) {
      toast.success(`Theme set to ${theme}`);
      updateUser({ appearance: theme });
      mutate();
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
       <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem' }}>App Appearance</h2>
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          <AppearanceCard label="Light Mode" active={profile?.appearance === 'light' || !profile?.appearance} onClick={() => setTheme('light')} />
          <AppearanceCard label="Dark Mode" active={profile?.appearance === 'dark'} onClick={() => setTheme('dark')} />
       </div>
    </div>
  );
}

function SettingInput({ label, placeholder, icon, type="text", value, onChange, disabled }) {
  return (
    <div>
       <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.6rem' }}>{label}</label>
       <div style={{ position: 'relative' }}>
          {icon && <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>{icon}</div>}
          <input 
            type={type} 
            placeholder={placeholder} 
            value={value || ''} 
            onChange={e => onChange?.(e.target.value)}
            disabled={disabled}
            style={{ width: '100%', paddingLeft: icon ? '3rem' : '1rem', backgroundColor: disabled ? '#F8F9FA' : 'white', cursor: disabled ? 'not-allowed' : 'text' }} 
          />
       </div>
    </div>
  );
}

function ToggleItem({ title, desc, checked, onChange }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem', backgroundColor: 'var(--background)', borderRadius: '15px' }}>
       <div>
          <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{title}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{desc}</div>
       </div>
       <div 
         onClick={() => onChange(!checked)}
         style={{ 
           width: '50px', 
           height: '26px', 
           backgroundColor: checked ? 'var(--primary)' : 'var(--border)', 
           borderRadius: '100px', 
           position: 'relative', 
           cursor: 'pointer',
           transition: 'all 0.3s ease'
         }}
       >
          <div style={{ 
            width: '20px', 
            height: '20px', 
            backgroundColor: 'white', 
            borderRadius: '50%', 
            position: 'absolute', 
            top: '3px', 
            left: checked ? '27px' : '3px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}></div>
       </div>
    </div>
  );
}

function AppearanceCard({ label, active, onClick }) {
  return (
    <div 
      onClick={onClick}
      style={{ 
        padding: '2rem', 
        borderRadius: '20px', 
        border: active ? '2px solid var(--primary)' : '1px solid var(--border)', 
        backgroundColor: active ? 'rgba(72,163,255,0.05)' : 'white',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }} 
      className="hover-scale"
    >
       <div style={{ height: '80px', backgroundColor: label === 'Dark Mode' ? '#1A1A1A' : '#F1F3F5', borderRadius: '10px', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: label === 'Dark Mode' ? 'white' : '#A0AEC0' }}>
          <Monitor size={32} />
       </div>
       <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{label}</div>
    </div>
  );
}
