import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import UserAvatar from '../components/UserAvatar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  Search, Send, Hash, User as UserIcon, CheckCheck, 
  RefreshCw, Shield, Code2, Briefcase, AlertCircle
} from 'lucide-react';

interface MessageItem {
  _id?: string;
  sender: {
    _id: string;
    name: string;
    role: string;
    email: string;
    avatar?: string;
  };
  recipient?: {
    _id: string;
    name: string;
    role: string;
    email: string;
    avatar?: string;
  } | null;
  channel?: string;
  content: string;
  createdAt: string;
}

interface ContactUser {
  _id: string;
  name: string;
  role: 'admin' | 'client' | 'developer';
  email: string;
  company?: string;
  avatar?: string;
}

export default function Messages() {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active Chat State: either a channel ('general', 'client-support', 'dev-team') or direct user ID
  const [activeType, setActiveType] = useState<'channel' | 'direct'>('channel');
  const [activeChannel, setActiveChannel] = useState<string>('general');
  const [activeRecipient, setActiveRecipient] = useState<ContactUser | null>(null);

  // Data
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [contacts, setContacts] = useState<ContactUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [msgInput, setMsgInput] = useState('');
  const [searchContact, setSearchContact] = useState('');

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch users for direct messages
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await api.get('/users');
        if (res.data.users) {
          // Filter out current user from contacts list
          setContacts(res.data.users.filter((u: ContactUser) => u._id !== user?._id && u.email !== user?.email));
        }
      } catch (err) {
        console.error('Failed to load contacts', err);
      }
    };
    fetchContacts();
  }, [user]);

  // Fetch messages for active thread
  const fetchMessages = async () => {
    try {
      let url = '/messages';
      if (activeType === 'channel') {
        url = `/messages?channel=${activeChannel}`;
      } else if (activeRecipient) {
        url = `/messages?recipientId=${activeRecipient._id}`;
      }

      const res = await api.get(url);
      if (res.data.messages) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchMessages();
  }, [activeType, activeChannel, activeRecipient]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim() || sending) return;

    const content = msgInput.trim();
    setMsgInput('');
    setSending(true);

    // Optimistic message bubble
    const tempMessage: MessageItem = {
      _id: 'temp-' + Date.now(),
      sender: {
        _id: user?._id || 'me',
        name: user?.name || 'Me',
        role: user?.role || 'admin',
        email: user?.email || ''
      },
      recipient: activeType === 'direct' ? activeRecipient : null,
      channel: activeType === 'channel' ? activeChannel : 'direct',
      content,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempMessage]);

    try {
      const payload: any = { content };
      if (activeType === 'channel') {
        payload.channel = activeChannel;
      } else if (activeRecipient) {
        payload.recipient = activeRecipient._id;
      }

      const res = await api.post('/messages', payload);
      const savedMsg = res.data.message;

      // Replace optimistic message with server response
      setMessages(prev => prev.map(m => m._id === tempMessage._id ? savedMsg : m));
    } catch (err: any) {
      console.error('Failed to send message', err);
      // Remove optimistic message if failed
      setMessages(prev => prev.filter(m => m._id !== tempMessage._id));
    } finally {
      setSending(false);
    }
  };

  // Channel definitions
  const channels = [
    { id: 'general', name: 'general', desc: 'Agency-wide updates & team announcements', roleAccess: 'all' },
    { id: 'client-support', name: 'client-support', desc: 'Direct client inquiries & SLA escalations', roleAccess: 'all' },
    { id: 'dev-team', name: 'dev-team', desc: 'Engineering architecture & sprint discussions', roleAccess: 'dev-admin' }
  ];

  // Available channels for user role
  const availableChannels = channels.filter(c => {
    if (c.roleAccess === 'all') return true;
    if (c.roleAccess === 'dev-admin' && (user?.role === 'developer' || user?.role === 'admin')) return true;
    return false;
  });

  // Filter contacts by search
  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchContact.toLowerCase()) ||
    c.role.toLowerCase().includes(searchContact.toLowerCase()) ||
    c.email.toLowerCase().includes(searchContact.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>ADMIN</span>;
    }
    if (role === 'developer') {
      return <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>DEV</span>;
    }
    return <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>CLIENT</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 120px)', animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Communications & Chat</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.2rem 0 0' }}>
            Unified real-time messaging between Admin, Clients, and Engineering.
          </p>
        </div>
        <button
          onClick={fetchMessages}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 0.85rem',
            background: 'var(--surface)',
            border: '1px solid var(--surface-border)',
            borderRadius: '8px',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}
        >
          <RefreshCw size={14} /> Refresh Stream
        </button>
      </div>

      {/* Main Messaging Layout Box */}
      <div className="messages-layout-box">
        
        {/* Left Sidebar: Channels & Users */}
        <div className="messages-sidebar">
          {/* Contact Search */}
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--surface-border)' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-color)',
              padding: '0.55rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid var(--surface-border)'
            }}>
              <Search size={15} style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }} />
              <input
                type="text"
                placeholder="Search channels & users..."
                value={searchContact}
                onChange={(e) => setSearchContact(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', fontSize: '0.85rem', width: '100%' }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 0' }}>
            {/* Channels Header */}
            <div style={{ padding: '0.5rem 1rem 0.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Broadcast Channels
            </div>

            {availableChannels.map(c => {
              const isSelected = activeType === 'channel' && activeChannel === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setActiveType('channel');
                    setActiveChannel(c.id);
                    setActiveRecipient(null);
                  }}
                  style={{
                    padding: '0.7rem 1rem',
                    margin: '0.15rem 0.5rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                    color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                    fontWeight: isSelected ? 600 : 400,
                    transition: 'background 0.15s'
                  }}
                >
                  <Hash size={18} style={{ color: isSelected ? 'var(--primary)' : 'var(--text-muted)' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.9rem' }}>{c.name}</div>
                  </div>
                </div>
              );
            })}

            {/* Direct Messages Header */}
            <div style={{ padding: '1rem 1rem 0.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Direct Messages
            </div>

            {filteredContacts.length === 0 ? (
              <div style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                No contacts found
              </div>
            ) : (
              filteredContacts.map(c => {
                const isSelected = activeType === 'direct' && activeRecipient?._id === c._id;
                return (
                  <div
                    key={c._id}
                    onClick={() => {
                      setActiveType('direct');
                      setActiveRecipient(c);
                    }}
                    style={{
                      padding: '0.7rem 1rem',
                      margin: '0.15rem 0.5rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                      transition: 'background 0.15s'
                    }}
                  >
<UserAvatar avatar={c.avatar} name={c.name} size={32} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: isSelected ? 600 : 500, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.name}
                        </span>
                        {getRoleBadge(c.role)}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.company || c.email}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Chat Area */}
        <div className="messages-chat-area">
          {/* Active Chat Header */}
          <div style={{
            padding: '1rem 1.5rem',
            background: 'var(--surface)',
            borderBottom: '1px solid var(--surface-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {activeType === 'channel' ? (
                <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Hash size={20} />
                </div>
              ) : (
                <UserAvatar avatar={activeRecipient?.avatar} name={activeRecipient?.name} size={38} />
              )}
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                  {activeType === 'channel' ? `# ${activeChannel}` : activeRecipient?.name}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {activeType === 'channel' 
                    ? channels.find(c => c.id === activeChannel)?.desc 
                    : `${activeRecipient?.role?.toUpperCase()} • ${activeRecipient?.email}`}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '0.25rem 0.6rem', borderRadius: '20px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span> Live Feed
            </div>
          </div>

          {/* Messages Stream */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', gap: '0.5rem' }}>
                <RefreshCw size={20} className="animate-spin" /> Loading conversation...
              </div>
            ) : messages.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Start the Conversation</span>
                <span style={{ fontSize: '0.85rem' }}>Send a message to begin real-time collaboration.</span>
              </div>
            ) : (
              messages.map((m, idx) => {
                const isMe = m.sender?._id === user?._id || m.sender?.email === user?.email;
                const timeStr = m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now';

                return (
                  <div
                    key={m._id || idx}
                    style={{
                      display: 'flex',
                      flexDirection: isMe ? 'row-reverse' : 'row',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      maxWidth: '75%',
                      alignSelf: isMe ? 'flex-end' : 'flex-start'
                    }}
                  >
{!isMe && <UserAvatar avatar={m.sender?.avatar} name={m.sender?.name} size={32} />}

                    <div>
                      {!isMe && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>{m.sender?.name}</span>
                          {getRoleBadge(m.sender?.role || 'user')}
                        </div>
                      )}

                      <div style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        background: isMe ? 'var(--primary)' : 'var(--surface)',
                        color: isMe ? '#fff' : 'var(--text-main)',
                        border: isMe ? 'none' : '1px solid var(--surface-border)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        lineHeight: 1.5,
                        fontSize: '0.92rem',
                        wordBreak: 'break-word'
                      }}>
                        {m.content}
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        marginTop: '0.2rem',
                        justifyContent: isMe ? 'flex-end' : 'flex-start'
                      }}>
                        <span>{timeStr}</span>
                        {isMe && <CheckCheck size={13} style={{ color: 'var(--primary)' }} />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box */}
          <div style={{
            padding: '1rem 1.5rem',
            background: 'var(--surface)',
            borderTop: '1px solid var(--surface-border)'
          }}>
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input
                type="text"
                placeholder={activeType === 'channel' ? `Message #${activeChannel}...` : `Message ${activeRecipient?.name}...`}
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  background: 'var(--bg-color)',
                  border: '1px solid var(--surface-border)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
              <button
                type="submit"
                disabled={!msgInput.trim() || sending}
                className="btn-primary"
                style={{
                  marginTop: 0,
                  width: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.75rem 1.25rem',
                  fontWeight: 600,
                  opacity: !msgInput.trim() ? 0.6 : 1
                }}
              >
                <Send size={15} /> Send
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
}
