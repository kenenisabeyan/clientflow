import { X } from 'lucide-react';

const ModalOverlay = ({ children, onClose }) => (
  <div style={{
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, animation: 'fadeIn 0.2s ease-out'
  }}>
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--surface-border)',
      borderRadius: 'var(--radius)', width: '100%', maxWidth: '500px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)', position: 'relative'
    }}>
      {children}
    </div>
  </div>
);

const Input = ({ label, required, placeholder, type="text" }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', width: '100%' }}>
    <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>
      {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
    </label>
    <input 
      type={type} 
      placeholder={placeholder} 
      style={{ 
        width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', 
        border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' 
      }} 
    />
  </div>
);

const Select = ({ label, required, placeholder }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', width: '100%' }}>
    <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>
      {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
    </label>
    <select 
      style={{ 
        width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', 
        border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', appearance: 'none' 
      }} 
    >
      <option value="">{placeholder}</option>
    </select>
  </div>
);

const Textarea = ({ label, placeholder }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', width: '100%' }}>
    <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>{label}</label>
    <textarea 
      placeholder={placeholder} 
      style={{ 
        width: '100%', padding: '0.75rem 1rem', background: 'var(--input-bg)', minHeight: '80px', resize: 'vertical',
        border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' 
      }} 
    />
  </div>
);


export const AddClientModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <ModalOverlay onClose={onClose}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Add New Client</h3>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
      </div>
      <div style={{ padding: '1.5rem' }}>
        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '1rem', fontWeight: 600 }}>Basic Information</h4>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Input label="Full Name" required placeholder="Enter name" />
          <Input label="Company Name" placeholder="Company Name" />
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Input label="Email" required placeholder="john.doe@example.com" type="email" />
          <Input label="Phone" placeholder="Phone" />
        </div>
        <Input label="Address" placeholder="123 Business St, New York, NY 10001" />
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Input label="Website" placeholder="www.example.com" />
          <Select label="Status" placeholder="Active" />
        </div>
      </div>
      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--surface-border)', padding: '0.75rem 1.5rem', borderRadius: '8px', color: 'var(--text-main)', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
        <button className="btn-primary" style={{ margin: 0, width: 'auto', padding: '0.75rem 1.5rem' }}>Add Client</button>
      </div>
    </ModalOverlay>
  );
};


export const AddProjectModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <ModalOverlay onClose={onClose}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Create New Project</h3>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
      </div>
      <div style={{ padding: '1.5rem' }}>
        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '1rem', fontWeight: 600 }}>Project Information</h4>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Input label="Project Name" required placeholder="Enter project title" />
          <Select label="Client" required placeholder="Select Client" />
        </div>
        <Textarea label="Description" placeholder="Describe the project goals and deliverables..." />
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Input label="Start Date" type="date" placeholder="05/01/2024" />
          <Input label="Deadline" type="date" placeholder="05/31/2024" />
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Input label="Budget" placeholder="$" />
          <Select label="Team Members" placeholder="Select members" />
        </div>
      </div>
      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--surface-border)', padding: '0.75rem 1.5rem', borderRadius: '8px', color: 'var(--text-main)', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
        <button className="btn-primary" style={{ margin: 0, width: 'auto', padding: '0.75rem 1.5rem' }}>Create Project</button>
      </div>
    </ModalOverlay>
  );
};


export const AddTaskModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <ModalOverlay onClose={onClose}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Add New Task</h3>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
      </div>
      <div style={{ padding: '1.5rem' }}>
        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '1rem', fontWeight: 600 }}>Task Information</h4>
        <Input label="Title" required placeholder="Enter task title" />
        <Textarea label="Description" placeholder="Enter task description..." />
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Select label="Project" required placeholder="Select Project" />
          <Select label="Priority" required placeholder="Medium" />
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Input label="Due Date" type="date" placeholder="05/10/2024" />
          <Select label="Assignee" placeholder="Select assignee" />
        </div>
      </div>
      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--surface-border)', padding: '0.75rem 1.5rem', borderRadius: '8px', color: 'var(--text-main)', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
        <button className="btn-primary" style={{ margin: 0, width: 'auto', padding: '0.75rem 1.5rem' }}>Add Task</button>
      </div>
    </ModalOverlay>
  );
};
