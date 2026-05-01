'use client';
import { useState } from 'react';
import { MessageSquare, Send, Search, MoreVertical, Phone, Video, User, CheckCheck } from 'lucide-react';

export default function MessagesPage() {
  const [activeChat, setActiveChat] = useState(1);
  const [message, setMessage] = useState('');

  const contacts = [
    { id: 1, name: 'Alex Johnson', lastMsg: 'I have updated the design files.', time: '10:24 AM', unread: 2, online: true },
    { id: 2, name: 'Team Design', lastMsg: 'Sarah: Let\'s meet at 2 PM', time: 'Yesterday', unread: 0, online: false },
    { id: 3, name: 'Michael Chen', lastMsg: 'The API is ready for testing.', time: 'Monday', unread: 0, online: true },
    { id: 4, name: 'Project Etheria', lastMsg: 'New member joined the group', time: 'May 10', unread: 0, online: true },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.5s ease', height: 'calc(100vh - 180px)', display: 'grid', gridTemplateColumns: '360px 1fr', gap: '0' }}>
       
       {/* Sidebar: Contacts */}
       <div className="card" style={{ borderRadius: '24px 0 0 24px', borderRight: '1px solid var(--border)', padding: '0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '2rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1.5rem' }}>Messages</h1>
            <div style={{ position: 'relative' }}>
               <input type="text" placeholder="Search chats..." style={{ width: '100%', paddingLeft: '3rem', height: '50px', borderRadius: '15px' }} />
               <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '0 1rem' }}>
             {contacts.map(contact => (
               <div 
                 key={contact.id} 
                 onClick={() => setActiveChat(contact.id)}
                 style={{ 
                   display: 'flex', 
                   gap: '1rem', 
                   padding: '1.2rem', 
                   borderRadius: '20px', 
                   backgroundColor: activeChat === contact.id ? 'rgba(72,163,255,0.08)' : 'transparent',
                   cursor: 'pointer',
                   marginBottom: '0.5rem',
                   transition: 'all 0.2s ease'
                 }}
                 className="hover-scale"
               >
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '16px', backgroundColor: '#F1F3F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: 'var(--primary)' }}>
                       {contact.name.charAt(0)}
                    </div>
                    {contact.online && (
                      <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '14px', height: '14px', backgroundColor: '#4CAF50', borderRadius: '50%', border: '3px solid white' }}></div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{contact.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{contact.time}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{contact.lastMsg}</p>
                      {contact.unread > 0 && (
                        <span style={{ backgroundColor: 'var(--primary)', color: 'white', fontSize: '0.7rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '10px' }}>{contact.unread}</span>
                      )}
                    </div>
                  </div>
               </div>
             ))}
          </div>
       </div>

       {/* Chat Area */}
       <div className="card" style={{ borderRadius: '0 24px 24px 0', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--background)' }}>
          {/* Chat Header */}
          <div style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', borderRadius: '0 24px 0 0' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '14px', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                   {contacts.find(c => c.id === activeChat)?.name.charAt(0)}
                </div>
                <div>
                   <div style={{ fontWeight: '700' }}>{contacts.find(c => c.id === activeChat)?.name}</div>
                   <div style={{ fontSize: '0.75rem', color: '#4CAF50', fontWeight: '600' }}>Active Now</div>
                </div>
             </div>
             <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)' }}>
                <Phone size={20} style={{ cursor: 'pointer' }} />
                <Video size={22} style={{ cursor: 'pointer' }} />
                <MoreVertical size={20} style={{ cursor: 'pointer' }} />
             </div>
          </div>

          {/* Messages List */}
          <div style={{ flex: 1, padding: '2.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             <Message bubble="Hey team, how is the progress on the new dashboard?" sender="me" time="10:15 AM" />
             <Message bubble="We have just finalized the project section. Looking good!" sender="them" name="Alex" time="10:18 AM" />
             <Message bubble="Great! I'll check it out and provide feedback." sender="me" time="10:20 AM" />
             <Message bubble="I have updated the design files." sender="them" name="Alex" time="10:24 AM" />
          </div>

          {/* Input Area */}
          <div style={{ padding: '1.5rem 2.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1.5rem', backgroundColor: 'white', borderRadius: '0 0 24px 0' }}>
             <input 
               type="text" 
               placeholder="Write your message here..." 
               value={message}
               onChange={(e) => setMessage(e.target.value)}
               style={{ flex: 1, height: '55px', borderRadius: '15px', border: '1px solid var(--border)', padding: '0 1.5rem' }} 
             />
             <button className="btn" style={{ width: '55px', height: '55px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={22} />
             </button>
          </div>
       </div>
    </div>
  );
}

function Message({ bubble, sender, name, time }) {
  const isMe = sender === 'me';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', maxWidth: '100%' }}>
       {!isMe && <div style={{ fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.4rem', marginLeft: '0.5rem' }}>{name}</div>}
       <div style={{ 
         padding: '1rem 1.5rem', 
         borderRadius: isMe ? '20px 20px 0 20px' : '20px 20px 20px 0', 
         backgroundColor: isMe ? 'var(--primary)' : 'white', 
         color: isMe ? 'white' : '#1A1A1A',
         boxShadow: '0 5px 15px rgba(0,0,0,0.03)',
         maxWidth: '70%',
         fontSize: '0.95rem',
         lineHeight: '1.5'
       }}>
         {bubble}
       </div>
       <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
          {time} {isMe && <CheckCheck size={12} style={{ color: 'var(--primary)' }} />}
       </div>
    </div>
  );
}
