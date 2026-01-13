import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { FiLock, FiMail, FiShield, FiAlertCircle } from 'react-icons/fi';
import './AdminLogin.css';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login, user } = useAuth();

    useEffect(() => {
        if (user && user.role === 'Admin') {
            navigate('/admin/dashboard');
        }
    }, [navigate, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/auth/login', { 
                email, 
                password,
                role: 'Admin'
            });
            
            if (data.role !== 'Admin') {
                setError('Access denied. Only administrators can login here.');
                setLoading(false);
                return;
            }

            login(data);
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-card">
                <div className="admin-login-header">
                    <div className="admin-logo-badge">
                        <FiShield />
                    </div>
                    <h1>Admin Central</h1>
                    <p>Enter your credentials to access the command center.</p>
                </div>

                {error && (
                    <div className="admin-login-error">
                        <FiAlertCircle />
                        <span>{error}</span>
                    </div>
                )}

                <form className="admin-login-form" onSubmit={handleSubmit}>
                    <div className="form-group-admin">
                        <label>Email Address</label>
                        <div className="input-with-icon">
                            <FiMail />
                            <input 
                                type="email" 
                                placeholder="admin@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group-admin">
                        <label>Password</label>
                        <div className="input-with-icon">
                            <FiLock />
                            <input 
                                type="password" 
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="admin-login-btn" disabled={loading}>
                        {loading ? 'Authenticating...' : 'Secure Login'}
                    </button>
                </form>

                <div className="admin-login-footer">
                    <p>Protected by platform security systems.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
