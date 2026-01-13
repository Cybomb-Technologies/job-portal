import React, { useState, useEffect } from 'react';
import api from '../../api';
import { 
    FiBriefcase, 
    FiUsers, 
    FiUserCheck, 
    FiLayers,
    FiTrendingUp
} from 'react-icons/fi';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/admin/stats');
                setStats(data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="admin-loading">Loading Dashboard Stats...</div>;
    if (error) return <div className="admin-error">Error: {error}</div>;

    const cards = [
        { title: 'Total Jobs', value: stats.totalJobs, icon: <FiBriefcase />, color: '#3b82f6' },
        { title: 'Job Seekers', value: stats.totalJobSeekers, icon: <FiUsers />, color: '#8b5cf6' },
        { title: 'Total Employers', value: stats.totalEmployers, icon: <FiUsers />, color: '#10b981' },
        { title: 'Verified Employers', value: stats.totalVerifiedEmployers, icon: <FiUserCheck />, color: '#f59e0b' },
        { title: 'Total Companies', value: stats.totalCompanies, icon: <FiLayers />, color: '#6366f1' },
    ];

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h1>Dashboard Overview</h1>
                <p>Monitor your platform's growth and activity at a glance.</p>
            </div>

            <div className="stats-grid">
                {cards.map((card, index) => (
                    <div key={index} className="stat-card" style={{ '--accent-color': card.color }}>
                        <div className="stat-icon" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
                            {card.icon}
                        </div>
                        <div className="stat-info">
                            <h3>{card.title}</h3>
                            <p className="stat-value">{card.value}</p>
                        </div>
                        <div className="stat-chart-stub">
                            <FiTrendingUp />
                            <span>+12%</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-sections">
                <div className="dashboard-card recent-activity">
                    <h3>Recent Platform Activity</h3>
                    <div className="empty-state">
                        <p>Detailed activity logs will appear here.</p>
                    </div>
                </div>
                <div className="dashboard-card platform-health">
                    <h3>System Status</h3>
                    <div className="health-item">
                        <span>API Server</span>
                        <span className="status-badge online">Online</span>
                    </div>
                    <div className="health-item">
                        <span>Database</span>
                        <span className="status-badge online">Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
