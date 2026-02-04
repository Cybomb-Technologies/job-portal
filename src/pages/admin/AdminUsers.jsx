import React, { useState, useEffect } from 'react';
import api from '../../api';
import Swal from 'sweetalert2';
import { FiSearch, FiMail, FiMapPin, FiCalendar, FiUserX, FiUserCheck } from 'react-icons/fi';
import './AdminTable.css';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await api.get('/admin/job-seekers');
                setUsers(data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleToggleStatus = async (userId, currentStatus) => {
        const action = currentStatus ? 'block' : 'unblock';
        
        const result = await Swal.fire({
            title: `Are you sure?`,
            text: `You want to ${action} this user?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: `Yes, ${action} them!`
        });

        if (!result.isConfirmed) return;

        try {
            const { data } = await api.put(`/admin/user/${userId}/toggle-status`);
            setUsers(users.map(u => u._id === userId ? { ...u, isActive: data.isActive } : u));
            Swal.fire(
                'Updated!',
                `User has been ${action}ed.`,
                'success'
            );
        } catch (err) {
            Swal.fire(
                'Error',
                err.response?.data?.message || 'Failed to update user status',
                'error'
            );
        }
    };

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="admin-loading">Loading Job Seekers...</div>;
    if (error) return <div className="admin-error">Error: {error}</div>;

    return (
        <div className="admin-page">
            <div className="page-header">
                <div>
                    <h1>Job Seekers</h1>
                    <p>Manage and monitor all registered candidates on the platform.</p>
                </div>
                <div className="header-actions">
                    <div className="search-bar">
                        <FiSearch />
                        <input 
                            type="text" 
                            placeholder="Search by name or email..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Current Location</th>
                            <th>Skills</th>
                            <th>Joined Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                            <tr key={user._id}>
                                <td>
                                    <div className="user-info-cell">
                                        <div className="user-avatar-sm">
                                            {user.profilePicture ? (
                                                <img src={user.profilePicture.startsWith('http') ? user.profilePicture : `${import.meta.env.VITE_SERVER_URL}${user.profilePicture}`} alt="" />
                                            ) : (
                                                user.name.charAt(0)
                                            )}
                                        </div>
                                        <div>
                                            <div className="user-name">{user.name}</div>
                                            <div className="user-email"><FiMail /> {user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="location-cell">
                                        <FiMapPin /> {user.currentLocation || 'N/A'}
                                    </div>
                                </td>
                                <td>
                                    <div className="skills-wrap">
                                        {user.skills && user.skills.slice(0, 3).map((skill, i) => (
                                            <span key={i} className="skill-tag">{skill}</span>
                                        ))}
                                        {user.skills && user.skills.length > 3 && (
                                            <span className="skill-tag-more">+{user.skills.length - 3}</span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div className="date-cell">
                                        <FiCalendar /> {new Date(user.createdAt).toLocaleDateString()}
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-badge ${user.isActive !== false ? 'active' : 'inactive'}`}>
                                        {user.isActive !== false ? 'Active' : 'Blocked'}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button 
                                            className={`btn-action ${user.isActive !== false ? 'btn-block' : 'btn-unblock'}`}
                                            title={user.isActive !== false ? 'Block User' : 'Unblock User'}
                                            onClick={() => handleToggleStatus(user._id, user.isActive !== false)}
                                        >
                                            {user.isActive !== false ? <FiUserX /> : <FiUserCheck />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="empty-table">No job seekers found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
