'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { Search, Send, Phone, Video, MoreVertical, Hash, User } from 'lucide-react';
import toast from 'react-hot-toast';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  const { data: contactsRes } = useSWR('/api/messages/contacts', fetcher);
  const contacts = contactsRes?.data?.contacts || [];
  const projects = contactsRes?.data?.projects || [];

  const chatUrl = selectedChat 
    ? (selectedChat.isGroup ? `/api/messages?projectId=${selectedChat._id}` : `/api/messages?receiverId=${selectedChat._id}`)
    : null;

  const { data: messagesRes, mutate } = useSWR(chatUrl, fetcher, { refreshInterval: 3000 });
  const messages = messagesRes?.data || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;

    const payload = selectedChat.isGroup 
      ? { projectId: selectedChat._id, content: message }
      : { receiverId: selectedChat._id, content: message };

    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      setMessage('');
      mutate();
    } else {
      toast.error('Failed to send message');
    }
  };

  const allChats = [...projects, ...contacts];
  const filteredChats = allChats.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div style={{ height: 'calc(100vh - 150px)', display: 'grid', gridTemplateColumns: '350px 1fr', gap: '1px', backgroundColor: 'var(--border)', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border)' }}>
      
      {/* Sidebar */}
      <div style={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)' }}>
        <div style={{ padding: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1.5rem' }}>Messages</h1>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Search chats..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: '3rem', height: '50px', borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--background)' }} 
            />
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 1rem 2rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', padding: '0 1rem 1rem', letterSpacing: '1px' }}>Recent Conversations</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filteredChats.map(chat => (
              <div 
                key={chat._id} 
                onClick={() => setSelectedChat(chat)}
                style={{ 
                  padding: '1.2rem', 
                  borderRadius: '16px', 
                  cursor: 'pointer', 
                  backgroundColor: selectedChat?._id === chat._id ? 'rgba(72,163,255,0.08)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'all 0.2s ease'
                }}
                className="hover-scale"
              >
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '15px', 
                  backgroundColor: chat.isGroup ? (chat.color || 'var(--primary)') : '#F1F3F5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: chat.isGroup ? 'white' : 'var(--text-secondary)',
                  fontWeight: '700',
                  fontSize: '1.2rem'
                }}>
                  {chat.isGroup ? <Hash size={24} /> : chat.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#1A1A1A' }}>{chat.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{chat.isGroup ? 'Project Chat' : 'Member'}</div>
                </div>
                {selectedChat?._id === chat._id && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                  <div style={{ width: '45px', height: '45px', borderRadius: '12px', backgroundColor: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     {selectedChat.isGroup ? <Hash size={22} style={{ color: selectedChat.color }} /> : <User size={22} />}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{selectedChat.name}</h2>
                    <p style={{ fontSize: '0.75rem', color: '#4CAF50', fontWeight: '600' }}>Online Now</p>
                  </div>
               </div>
               <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)' }}>
                  <Phone size={20} style={{ cursor: 'pointer' }} />
                  <Video size={20} style={{ cursor: 'pointer' }} />
                  <MoreVertical size={20} style={{ cursor: 'pointer' }} />
               </div>
            </div>

            {/* Chat Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {messages.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', opacity: 0.5 }}>
                   <Send size={40} style={{ marginBottom: '1rem' }} />
                   <p>No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((m, i) => {
                  const isMine = m.senderId._id === contactsRes?.currentUserId || m.senderId.name === 'You'; // Fallback check
                  // Simplified check for now since we don't have current user ID easily here, 
                  // but we can assume if the name matches the logged-in user or similar.
                  // For a real app, I'd pass user.id from context.
                  
                  return (
                    <div key={m._id} style={{ alignSelf: m.senderId.name === 'You' ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                       <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.4rem', textAlign: m.senderId.name === 'You' ? 'right' : 'left' }}>
                         {m.senderId.name}
                       </div>
                       <div style={{ 
                         padding: '1.2rem 1.8rem', 
                         borderRadius: '20px', 
                         backgroundColor: m.senderId.name === 'You' ? 'var(--primary)' : 'var(--background)', 
                         color: m.senderId.name === 'You' ? 'white' : '#1A1A1A',
                         boxShadow: '0 5px 15px rgba(0,0,0,0.02)',
                         fontSize: '0.95rem',
                         lineHeight: '1.6'
                       }}>
                         {m.content}
                       </div>
                       <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.5rem', textAlign: m.senderId.name === 'You' ? 'right' : 'left' }}>
                         {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div style={{ padding: '2.5rem', borderTop: '1px solid var(--border)' }}>
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '1.2rem' }}>
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..." 
                  style={{ flex: 1, height: '60px', padding: '0 1.8rem', borderRadius: '18px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', fontSize: '1rem' }} 
                />
                <button type="submit" className="btn" style={{ width: '60px', height: '60px', padding: 0, borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Send size={24} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
             <div style={{ width: '120px', height: '120px', borderRadius: '40px', backgroundColor: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
                <Hash size={60} style={{ opacity: 0.1 }} />
             </div>
             <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1A1A1A', marginBottom: '0.5rem' }}>Your Workstation Chat</h2>
             <p>Select a contact or a project group to start collaborating.</p>
          </div>
        )}
      </div>
    </div>
  );
}
