import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { Lock, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setError(null);

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match");
            setLoading(false);
            return;
        }

        try {
            await api.put('/auth/update-password', {
                oldPassword,
                newPassword
            });
            
            setMessage('Password updated successfully');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await api.delete('/auth/profile');
            logout();
            navigate('/', { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete account');
        }
    };

    return (
        <div className="space-y-8">
            {/* Change Password Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-xl font-bold text-black mb-6">Change Password</h2>

                {message && (
                    <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center mb-6">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        {message}
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center mb-6">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Current Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <input 
                                type="password" 
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                placeholder="Enter current password"
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169E1] focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                <input 
                                    type="password" 
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169E1] focus:border-transparent outline-none"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Confirm New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                <input 
                                    type="password" 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169E1] focus:border-transparent outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="bg-[#4169E1] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#3A5FCD] disabled:opacity-50"
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Delete Account Section */}
            <div className="bg-white rounded-xl shadow-sm border border-red-100 p-8">
                <h2 className="text-xl font-bold text-red-600 mb-4">Danger Zone</h2>
                <p className="text-gray-600 mb-6">
                    Once you delete your account, there is no going back. Please be certain.
                </p>

                {!showDeleteConfirm ? (
                     <button 
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-red-50 text-red-600 border border-red-200 px-6 py-2 rounded-lg font-semibold hover:bg-red-100 transition-colors"
                    >
                        Delete Account
                    </button>
                ) : (
                    <div className="bg-red-50 p-6 rounded-lg border border-red-100">
                        <div className="flex items-start mb-4">
                            <AlertTriangle className="w-6 h-6 text-red-600 mr-3 mt-1" />
                            <div>
                                <h3 className="text-lg font-bold text-red-700">Are you sure?</h3>
                                <p className="text-red-600 mt-1">
                                    This action will permanently delete your account and all associated data.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={handleDeleteAccount}
                                className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                            >
                                Yes, Delete My Account
                            </button>
                            <button 
                                onClick={() => setShowDeleteConfirm(false)}
                                className="text-gray-600 hover:text-gray-900 font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChangePassword;
