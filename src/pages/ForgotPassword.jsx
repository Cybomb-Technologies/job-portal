import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const { data } = await api.post('/auth/forgot-password', { email });
            setMessage(data.data || 'Email Sent! Check your inbox.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
                <h2 className="text-3xl font-bold mb-6 text-center text-blue-500">Forgot Password</h2>
                <p className="text-gray-400 text-center mb-6 text-sm">
                    Enter your email address and we'll send you a link to reset your password.
                </p>

                {message && <div className="bg-green-500/20 text-green-500 p-3 rounded mb-4 text-center">{message}</div>}
                {error && <div className="bg-red-500/20 text-red-500 p-3 rounded mb-4 text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                         <label className="block text-gray-400 mb-1 text-sm">Email Address</label>
                        <input 
                            type="email" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" 
                            placeholder="john@example.com" 
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow-lg hover:shadow-blue-500/30 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <p className="mt-8 text-center text-gray-400 text-sm">
                    Remember your password?{' '}
                    <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
