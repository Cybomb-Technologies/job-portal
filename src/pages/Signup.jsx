import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Briefcase } from 'lucide-react';
import api from '../api';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Job Seeker',
    });
    const [error, setError] = useState('');
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
             // Step 1: Register and get OTP
             await api.post('/auth/signup', formData);
             setShowOtp(true);
             setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Signup Failed');
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await api.post('/auth/verify-otp', {
                email: formData.email,
                otp
            });
            login(data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'OTP Verification Failed');
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setError('');
        try {
            await api.post('/auth/resend-otp', { email: formData.email });
             Swal.fire({
                 icon: 'success',
                 title: 'OTP Resent',
                 text: 'A new OTP has been sent to your email.',
                 timer: 3000,
                 showConfirmButton: false
             });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
                <h2 className="text-3xl font-bold mb-6 text-center !text-white">Create Account</h2>
                
                {error && <div className="bg-red-500/20 text-red-500 p-3 rounded mb-4 text-center">{error}</div>}

                {!showOtp ? (
                    <form onSubmit={handleSignup} className="space-y-4">
                         <div>
                            <label className="block text-gray-400 mb-2 text-sm">Role</label>
                            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-700/50 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'Job Seeker' })}
                                    className={`flex items-center justify-center py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                                        formData.role === 'Job Seeker' 
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                    }`}
                                >
                                    <User className="w-4 h-4 mr-2" />
                                    Job Seeker
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'Employer' })}
                                    className={`flex items-center justify-center py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                                        formData.role === 'Employer' 
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                    }`}
                                >
                                    <Briefcase className="w-4 h-4 mr-2" />
                                    Employer
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-400 mb-1 text-sm">Full Name</label>
                            <input 
                                type="text" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange}
                                required 
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" 
                                placeholder="John Doe" 
                            />
                        </div>

                        <div>
                             <label className="block text-gray-400 mb-1 text-sm">Email Address</label>
                            <input 
                                type="email" 
                                name="email" 
                                value={formData.email}
                                onChange={handleChange}
                                required 
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" 
                                placeholder="john@example.com" 
                            />
                        </div>
                         <div>
                            <label className="block text-gray-400 mb-1 text-sm">Password</label>
                            <input 
                                type="password" 
                                name="password" 
                                value={formData.password}
                                onChange={handleChange}
                                required 
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" 
                                placeholder="••••••••" 
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow-lg hover:shadow-blue-500/30 ${loading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {loading ? 'Sending OTP...' : 'Create Account'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div className="text-center mb-4">
                            <p className="text-gray-400 text-sm">
                                We've sent a 6-digit OTP to <br/>
                                <span className="text-white font-medium">{formData.email}</span>
                            </p>
                        </div>

                        <div>
                            <label className="block text-gray-400 mb-1 text-sm">Enter OTP</label>
                            <input 
                                type="text" 
                                value={otp} 
                                onChange={(e) => setOtp(e.target.value)}
                                required 
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white text-center text-xl tracking-widest focus:outline-none focus:border-blue-500 uppercase" 
                                placeholder="123456" 
                                maxLength={6}
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition shadow-lg hover:shadow-green-500/30 ${loading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                             {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>

                        <div className="text-center mt-4">
                            <button 
                                type="button"
                                onClick={handleResendOtp}
                                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                Resend OTP
                            </button>
                        </div>
                        
                         <div className="text-center mt-2">
                            <button 
                                type="button"
                                onClick={() => setShowOtp(false)}
                                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                Change Email / Back
                            </button>
                        </div>
                    </form>
                )}

                <p className="mt-8 text-center text-gray-400 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
