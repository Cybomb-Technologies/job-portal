import React, { useState, useEffect } from 'react';
import api from '../../api';
import { FiSearch, FiMail, FiMapPin, FiCalendar, FiBriefcase, FiCheckCircle, FiXCircle, FiClock, FiUserCheck, FiUserX } from 'react-icons/fi';
import './AdminTable.css';

const AdminEmployers = () => {
    const [employers, setEmployers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEmployers = async () => {
            try {
                const { data } = await api.get('/admin/employers');
                setEmployers(data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };

        fetchEmployers();
    }, []);

    const handleToggleStatus = async (userId, currentStatus) => {
        const action = currentStatus ? 'block' : 'unblock';
        if (!window.confirm(`Are you sure you want to ${action} this employer?`)) return;

        try {
            const { data } = await api.put(`/admin/user/${userId}/toggle-status`);
            setEmployers(employers.map(emp => emp._id === userId ? { ...emp, isActive: data.isActive } : emp));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update employer status');
        }
    };

    const filteredEmployers = employers.filter(emp => 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.companyName && emp.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Verified': return <span className="status-badge verified"><FiCheckCircle /> Verified</span>;
            case 'Pending': return <span className="status-badge pending"><FiClock /> Pending</span>;
            case 'Rejected': return <span className="status-badge rejected"><FiXCircle /> Rejected</span>;
            default: return <span className="status-badge unverified">Unverified</span>;
        }
    };

    if (loading) return <div className="admin-loading">Loading Employers...</div>;
    if (error) return <div className="admin-error">Error: {error}</div>;

    return (
        <div className="admin-page">
            <div className="page-header">
                <div>
                    <h1>Employers</h1>
                    <p>View and manage employer profiles and their verification status.</p>
                </div>
                <div className="header-actions">
                    <div className="search-bar">
                        <FiSearch />
                        <input 
                            type="text" 
                            placeholder="Search by name, company or email..." 
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
                            <th>Employer / Company</th>
                            <th>Contact Details</th>
                            <th>Location</th>
                            <th>Verification</th>
                            <th>Account Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployers.length > 0 ? filteredEmployers.map((emp) => (
                            <tr key={emp._id}>
                                <td>
                                    <div className="user-info-cell">
                                        <div className="user-avatar-sm">
                                            {emp.profilePicture ? (
                                                <img src={emp.profilePicture.startsWith('http') ? emp.profilePicture : `http://localhost:8000${emp.profilePicture}`} alt="" />
                                            ) : (
                                                emp.name.charAt(0)
                                            )}
                                        </div>
                                        <div>
                                            <div className="user-name">{emp.name}</div>
                                            <div className="company-text"><FiBriefcase /> {emp.companyName || 'No Company'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="contact-info">
                                        <div className="info-item"><FiMail /> {emp.email}</div>
                                        {emp.companyEmail && <div className="info-item-sub">{emp.companyEmail}</div>}
                                    </div>
                                </td>
                                <td>
                                    <div className="info-item"><FiMapPin /> {emp.companyLocation || emp.currentLocation || 'N/A'}</div>
                                </td>
                                <td>
                                    {getStatusBadge(emp.employerVerification?.status)}
                                </td>
                                <td>
                                    <span className={`status-badge ${emp.isActive !== false ? 'active' : 'inactive'}`}>
                                        {emp.isActive !== false ? 'Active' : 'Blocked'}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button 
                                            className={`btn-action ${emp.isActive !== false ? 'btn-block' : 'btn-unblock'}`}
                                            title={emp.isActive !== false ? 'Block Employer' : 'Unblock Employer'}
                                            onClick={() => handleToggleStatus(emp._id, emp.isActive !== false)}
                                        >
                                            {emp.isActive !== false ? <FiUserX /> : <FiUserCheck />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="empty-table">No employers found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminEmployers;
