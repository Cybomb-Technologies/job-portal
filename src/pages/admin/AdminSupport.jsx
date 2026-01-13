import React from 'react';

const AdminSupport = () => {
    return (
        <div className="admin-page">
            <div className="page-header">
                <div>
                    <h1>Support</h1>
                    <p>Support tickets and inquiries will appear here.</p>
                </div>
            </div>
            <div className="dashboard-card" style={{ marginTop: '24px', padding: '60px', textAlign: 'center' }}>
                <h3 style={{ color: '#64748b' }}>Support module is currently empty</h3>
                <p style={{ color: '#94a3b8' }}>This feature will be implemented in a future update.</p>
            </div>
        </div>
    );
};

export default AdminSupport;
