import { useState } from 'react';
import { Search, Image, Paperclip, Send, MoreVertical, CheckCheck } from 'lucide-react';

const contacts = [
  { id: 1, name: 'Acme Corp', type: 'Client', lastMsg: 'Project update discussion', time: '2:30 PM', avatar: 'A', unread: 0 },
  { id: 2, name: 'Jane Smith', type: 'Team', lastMsg: 'Here is the file you requested.', time: '11:15 AM', avatar: 'J', unread: 2 },
  { id: 3, name: 'Team Channel', type: 'Group', lastMsg: 'Weekly sync at 4pm today', time: 'Yesterday', avatar: '#', unread: 0 },
  { id: 4, name: 'Globex Inc', type: 'Client', lastMsg: 'Contract signed.', time: 'Yesterday', avatar: 'G', unread: 0 },
  { id: 5, name: 'Mike Johnson', type: 'Client', lastMsg: 'Thanks for the update.', time: 'May 10', avatar: 'M', unread: 0 },
];

export default function Messages() {
  const [msgInput, setMsgInput] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.4s ease-out', height: '100%', maxHeight: 'calc(100vh - 120px)' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>Messages</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Communicate with team and clients.</p>
      </div>

      <div style={{ 
        display: 'flex', gap: '1px', background: 'var(--surface-border)', 
        borderRadius: 'var(--radius)', overflow: 'hidden', flex: 1, border: '1px solid var(--surface-border)' 
      }}>
        
        {/* Left Sidebar */}
        <div style={{ width: '300px', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--surface-border)' }}>
            <div style={{ 
              display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', 
              padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <Search size={16} style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }} />
              <input type="text" placeholder="Search chats..." style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%' }} />
            </div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {contacts.map(contact => (
              <div key={contact.id} style={{ 
                padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', cursor: 'pointer',
                background: contact.id === 1 ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                borderLeft: contact.id === 1 ? '3px solid var(--primary)' : '3px solid transparent',
                borderBottom: '1px solid rgba(255,255,255,0.02)'
              }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '50%', 
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' 
                  }}>{contact.avatar}</div>
                  {contact.id === 1 && <div style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', background: '#10b981', border: '2px solid var(--bg-color)', borderRadius: '50%' }}></div>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{contact.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{contact.time}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{contact.lastMsg}</span>
                    {contact.unread > 0 && (
                      <span style={{ background: 'var(--primary)', color: 'white', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '10px', fontWeight: 'bold' }}>{contact.unread}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
          
          {/* Chat Header */}
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' 
              }}>A</div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Acme Corp</h3>
                <span style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div> Online
                </span>
              </div>
            </div>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <MoreVertical size={20} />
            </button>
          </div>

          {/* Messages Stream */}
          <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ textAlign: 'center', margin: '1rem 0' }}>
              <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.75rem', borderRadius: '12px', color: 'var(--text-muted)' }}>Today, 2:30 PM</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', maxWidth: '70%' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>A</div>
              <div>
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.85rem 1rem', borderRadius: '0 12px 12px 12px', borderTopLeftRadius: 0 }}>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>Hi John, how's the website redesign coming along? Completed?</p>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'inline-block' }}>2:30 PM</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', maxWidth: '70%', alignSelf: 'flex-end', flexDirection: 'row-reverse' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>J</div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div style={{ background: 'var(--primary)', padding: '0.85rem 1rem', borderRadius: '12px 0 12px 12px' }}>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.5, color: '#fff' }}>Great! We've started the page design. Unveiling it tomorrow for review.</p>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  2:33 PM <CheckCheck size={14} color="var(--primary)"/>
                </span>
              </div>
            </div>
            
             <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', maxWidth: '70%', alignSelf: 'flex-end', flexDirection: 'row-reverse' }}>
              <div></div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div style={{ background: 'var(--primary)', padding: '0.85rem 1rem', borderRadius: '12px 0 12px 12px' }}>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.5, color: '#fff' }}>Sure, I'll share them now.</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', maxWidth: '70%' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>A</div>
              <div>
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.85rem 1rem', borderRadius: '0 12px 12px 12px' }}>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '0.75rem' }}>Can you send me some mockups?</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(15,23,42,0.5)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: '36px', height: '36px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      <Image size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>homepage-mockup.pdf</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>2.4 MB PDF</div>
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'inline-block' }}>2:35 PM</span>
              </div>
            </div>

          </div>

          {/* Input Area */}
          <div style={{ padding: '1.25rem', borderTop: '1px solid var(--surface-border)' }}>
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(15,23,42,0.6)', 
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '0.5rem 0.5rem 0.5rem 1.25rem' 
            }}>
              <input 
                type="text" 
                placeholder="Type a message..." 
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.9rem' }} 
              />
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Paperclip size={20} />
              </button>
              <button style={{ 
                background: 'var(--primary)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' 
              }}>
                <Send size={16} style={{ marginLeft: '2px' }} />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
