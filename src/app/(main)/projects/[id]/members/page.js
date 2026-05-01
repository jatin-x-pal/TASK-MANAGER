'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import { User, Shield, UserMinus, UserPlus, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function MembersPage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const { data: boardData, mutate } = useSWR(`/api/projects/${id}/board`, fetcher);
  const [memberEmail, setMemberEmail] = useState('');

  if (!boardData) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading members...</div>;
  const { project } = boardData;
  const isAdmin = project.admin._id === currentUser?.id || project.admin._id === currentUser?._id;

  const handleAddMember = async (e) => {
    e.preventDefault();
    const res = await fetch(`/api/projects/${id}/add-member`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: memberEmail })
    });
    const data = await res.json();
    if (data.success) {
      setMemberEmail('');
      mutate();
    } else {
      alert(data.error);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href={`/projects/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontWeight: '600' }}>
          <ArrowLeft size={18} /> Back to Board
        </Link>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '700' }}>Team Members</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage access and roles for {project.name}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {/* Admin Card */}
          <MemberCard member={project.admin} role="Admin" />
          
          {/* Member Cards */}
          {project.members.map(m => (
            <MemberCard key={m._id} member={m} role="Member" canRemove={isAdmin} />
          ))}
        </div>

        <div>
          {isAdmin && (
            <div className="card" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <UserPlus size={20} style={{ color: 'var(--primary)' }} /> Invite Member
              </h3>
              <form onSubmit={handleAddMember}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="email" 
                      value={memberEmail} 
                      onChange={(e) => setMemberEmail(e.target.value)} 
                      required 
                      style={{ width: '100%', paddingLeft: '2.5rem' }} 
                      placeholder="colleague@example.com" 
                    />
                    <Mail size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  </div>
                </div>
                <button type="submit" className="btn" style={{ width: '100%', borderRadius: '100px' }}>Send Invitation</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MemberCard({ member, role, canRemove }) {
  return (
    <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
      <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: role === 'Admin' ? 'var(--primary)' : 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: role === 'Admin' ? 'white' : 'var(--text-secondary)', fontWeight: '700', fontSize: '1.2rem' }}>
        {member.name.charAt(0).toUpperCase()}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{member.name}</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{member.email}</div>
        <span style={{ 
          fontSize: '0.75rem', 
          padding: '0.2rem 0.6rem', 
          borderRadius: '100px', 
          backgroundColor: role === 'Admin' ? 'rgba(72,163,255,0.1)' : 'var(--background)', 
          color: role === 'Admin' ? 'var(--primary)' : 'var(--text-secondary)',
          fontWeight: '600',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.3rem'
        }}>
          {role === 'Admin' ? <Shield size={12} /> : <User size={12} />} {role}
        </span>
      </div>
      {canRemove && (
        <button style={{ color: 'var(--accent-pink)', padding: '0.5rem' }}>
          <UserMinus size={18} />
        </button>
      )}
    </div>
  );
}
