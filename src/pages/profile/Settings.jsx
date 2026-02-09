import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api';
import { Lock, AlertTriangle, CheckCircle, AlertCircle, Sun, Moon, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const { logout } = useAuth();
    const { theme, changeTheme } = useTheme();
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

    const themeOptions = [
        { value: 'light', label: 'Light', icon: Sun, description: 'Always use light theme' },
        { value: 'dark', label: 'Dark', icon: Moon, description: 'Always use dark theme' },
        { value: 'system', label: 'System Default', icon: Monitor, description: 'Follow system preferences' }
    ];

    return (
        <div className="space-y-8">
            {/* Theme Settings Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                <h2 className="text-xl font-bold text-black dark:text-white mb-6">Appearance</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Choose how the application looks to you. Select a theme or let it automatically match your system settings.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {themeOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = theme === option.value;
                        return (
                            <button
                                key={option.value}
                                onClick={() => changeTheme(option.value)}
                                className={`flex flex-col items-center p-6 rounded-xl border-2 transition-all ${
                                    isSelected
                                        ? 'border-[#4169E1] bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700'
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                                    isSelected 
                                        ? 'bg-[#4169E1] text-white' 
                                        : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                                }`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <span className={`font-semibold mb-1 ${
                                    isSelected ? 'text-[#4169E1]' : 'text-gray-800 dark:text-gray-200'
                                }`}>
                                    {option.label}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                    {option.description}
                                </span>
                                {isSelected && (
                                    <div className="mt-3">
                                        <CheckCircle className="w-5 h-5 text-[#4169E1]" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Change Password Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                <h2 className="text-xl font-bold text-black dark:text-white mb-6">Change Password</h2>

                {message && (
                    <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-4 rounded-lg flex items-center mb-6">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        {message}
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg flex items-center mb-6">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Current Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <input 
                                type="password" 
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                placeholder="Enter current password"
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4169E1] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                <input 
                                    type="password" 
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4169E1] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Confirm New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                <input 
                                    type="password" 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4169E1] focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-red-100 dark:border-red-900/50 p-8">
                <h2 className="text-xl font-bold text-red-600 dark:text-red-500 mb-4">Danger Zone</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Once you delete your account, there is no going back. Please be certain.
                </p>

                {!showDeleteConfirm ? (
                     <button 
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 px-6 py-2 rounded-lg font-semibold hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                    >
                        Delete Account
                    </button>
                ) : (
                    <div className="bg-red-50 dark:bg-red-900/30 p-6 rounded-lg border border-red-100 dark:border-red-800">
                        <div className="flex items-start mb-4">
                            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3 mt-1" />
                            <div>
                                <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Are you sure?</h3>
                                <p className="text-red-600 dark:text-red-400 mt-1">
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
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium"
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

export default Settings;
