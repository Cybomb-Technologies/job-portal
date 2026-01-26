import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Briefcase, User, Mail, Lock } from 'lucide-react';
import api from '../api';

import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [role, setRole] = useState('Job Seeker');
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const { data } = await api.post('/auth/google-login', {
                token: credentialResponse.credential,
                role,
            });
            login(data);
            if (data.role === 'Employer') {
                navigate('/employer/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Google Login Failed');
        }
    };

    const handleGoogleError = () => {
        setError('Google Login Failed');
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }
        return true;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!validateForm()) return;

        setLoading(true);
        try {
             // Pass role to backend for validation
             const { data } = await api.post('/auth/login', { 
                 email: formData.email, 
                 password: formData.password,
                 role 
             });
             login(data);
             if (data.role === 'Employer') {
                 navigate('/employer/dashboard');
             } else {
                 navigate('/');
             }
        } catch (err) {
            setError(err.response?.data?.message || 'Login Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-6 flex items-center justify-center bg-gray-900 text-white p-4 relative overflow-hidden">
             {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>

            <div className="bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-700/50 relative z-10 transition-all duration-300 hover:shadow-blue-500/10 hover:border-blue-500/30">
                <div className="text-center mb-8">
                    
                    <h2 className="text-3xl font-bold !text-white mb-2">Welcome Back</h2>
                    <p className="text-gray-400">Please sign in to continue</p>
                </div>
                
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-center text-sm animate-pulse">
                        {error}
                    </div>
                )}

                <div className="mb-6 grid grid-cols-2 gap-2 p-1 bg-gray-700/50 rounded-xl">
                    <button
                        onClick={() => setRole('Job Seeker')}
                        className={`flex items-center justify-center py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                            role === 'Job Seeker' 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                            : 'text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                    >
                        <User className="w-4 h-4 mr-2" />
                        Job Seeker
                    </button>
                    <button
                        onClick={() => setRole('Employer')}
                        className={`flex items-center justify-center py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                            role === 'Employer' 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                            : 'text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                    >
                        <Briefcase className="w-4 h-4 mr-2" />
                        Employer
                    </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-5 mb-6">
                    <div className="space-y-2">
                         <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
                         <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type="email" 
                                name="email" 
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300" 
                                placeholder="name@example.com" 
                            />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                name="password" 
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl py-3 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300" 
                                placeholder="••••••••" 
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex justify-end">
                        <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                            Forgot Password?
                        </Link>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/30 transform hover:-translate-y-0.5 ${loading ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing in...
                            </span>
                        ) : 'Sign In'}
                    </button>
                </form>

                <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-600/50"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-gray-800 text-gray-400">Or continue with</span>
                    </div>
                </div>

                <div className="flex justify-center mb-8">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme="filled_black"
                        shape="pill"
                        size="large"
                    />
                </div>

                <p className="text-center text-gray-400 text-sm">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
