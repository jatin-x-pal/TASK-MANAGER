'use client';
import { useState } from 'react';
import { User, Bell, Shield, Globe, Monitor, Mail, Lock, Trash2, Save, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Profile');

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
        {/* Navigation Tabs */}
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

        {/* Content Area */}
        <div className="card" style={{ padding: '3rem' }}>
           {activeTab === 'Profile' && <ProfileSettings />}
           {activeTab === 'Notifications' && <NotificationSettings />}
           {activeTab === 'Security' && <SecuritySettings />}
           {activeTab === 'Appearance' && <AppearanceSettings />}
        </div>
      </div>
    </div>
  );
}

function ProfileSettings() {
  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
       <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem' }}>Profile Information</h2>
       <div style={{ display: 'flex', gap: '2.5rem', marginBottom: '3rem', alignItems: 'center' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '30px', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: '800' }}>U</div>
          <div>
             <button className="btn" style={{ padding: '0.8rem 1.5rem', fontSize: '0.85rem' }}>Change Photo</button>
             <button className="btn btn-outline" style={{ marginLeft: '1rem', padding: '0.8rem 1.5rem', fontSize: '0.85rem' }}>Remove</button>
             <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.8rem' }}>Allowed JPG, GIF or PNG. Max size of 800kB</p>
          </div>
       </div>

       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <SettingInput label="Full Name" placeholder="e.g. John Doe" />
          <SettingInput label="Email Address" placeholder="john@example.com" icon={<Mail size={18} />} />
          <SettingInput label="Job Title" placeholder="Product Designer" />
          <SettingInput label="Company" placeholder="Etheria AI" />
       </div>

       <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border)', paddingTop: '2.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button className="btn btn-outline" style={{ borderRadius: '100px', padding: '0.8rem 2rem' }}>Discard</button>
          <button className="btn" onClick={() => toast.success('Profile saved!')} style={{ borderRadius: '100px', padding: '0.8rem 2.5rem' }}>Save Changes</button>
       </div>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
       <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem' }}>Notification Preferences</h2>
       <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <ToggleItem title="Task Assignments" desc="Notify me when I am assigned to a new task" defaultChecked />
          <ToggleItem title="Deadline Reminders" desc="Notify me when a task deadline is approaching" defaultChecked />
          <ToggleItem title="Team Mentions" desc="Notify me when someone mentions me in comments" defaultChecked />
          <ToggleItem title="Project Updates" desc="Notify me about general project changes" />
       </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
       <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem' }}>Security & Access</h2>
       <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <SettingInput label="Current Password" type="password" icon={<Lock size={18} />} />
          <SettingInput label="New Password" type="password" icon={<Lock size={18} />} />
          <SettingInput label="Confirm New Password" type="password" icon={<Lock size={18} />} />
          <button className="btn" style={{ alignSelf: 'flex-start', padding: '0.8rem 2rem' }}>Update Password</button>
       </div>
       <div style={{ marginTop: '4rem', padding: '2rem', backgroundColor: 'rgba(255,107,107,0.05)', borderRadius: '20px', border: '1px solid rgba(255,107,107,0.2)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#FF6B6B', marginBottom: '0.8rem' }}>Delete Account</h3>
          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1.5rem' }}>Once you delete your account, there is no going back. Please be certain.</p>
          <button className="btn" style={{ backgroundColor: '#FF6B6B', padding: '0.8rem 2rem' }}><Trash2 size={18} /> Delete Account</button>
       </div>
    </div>
  );
}

function AppearanceSettings() {
  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
       <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem' }}>App Appearance</h2>
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          <AppearanceCard label="Light Mode" active />
          <AppearanceCard label="Dark Mode" />
          <AppearanceCard label="System" />
       </div>
    </div>
  );
}

function SettingInput({ label, placeholder, icon, type="text" }) {
  return (
    <div>
       <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.6rem' }}>{label}</label>
       <div style={{ position: 'relative' }}>
          {icon && <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>{icon}</div>}
          <input type={type} placeholder={placeholder} style={{ width: '100%', paddingLeft: icon ? '3rem' : '1rem' }} />
       </div>
    </div>
  );
}

function ToggleItem({ title, desc, defaultChecked }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem', backgroundColor: 'var(--background)', borderRadius: '15px' }}>
       <div>
          <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{title}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{desc}</div>
       </div>
       <div 
         onClick={() => setChecked(!checked)}
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
            height: '200px', 
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

function AppearanceCard({ label, active }) {
  return (
    <div style={{ 
      padding: '2rem', 
      borderRadius: '20px', 
      border: active ? '2px solid var(--primary)' : '1px solid var(--border)', 
      backgroundColor: active ? 'rgba(72,163,255,0.05)' : 'white',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }} className="hover-scale">
       <div style={{ height: '80px', backgroundColor: label === 'Dark Mode' ? '#1A1A1A' : '#F1F3F5', borderRadius: '10px', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: label === 'Dark Mode' ? 'white' : '#A0AEC0' }}>
          <Monitor size={32} />
       </div>
       <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{label}</div>
    </div>
  );
}
