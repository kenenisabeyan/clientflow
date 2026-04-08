import { useState, useEffect } from 'react';
import axios from 'axios';

export default function UserManagement() {
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data.users);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`/api/users/${userId}`, { role: newRole });
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDelete = async (userId) => {
    if (confirm('Delete this user? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/users/${userId}`);
        loadUsers();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  return (
    <div className="user-management-page">
      <h2>User Management</h2>
      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <select value={user.role} onChange={(e) => handleRoleChange(user._id, e.target.value)}>
                    <option value="client">Client</option>
                    <option value="admin">Admin</option>
                    <option value="developer">Developer</option>
                  </select>
                </td>
                <td>
                  <button onClick={() => handleDelete(user._id)} className="delete-user">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}