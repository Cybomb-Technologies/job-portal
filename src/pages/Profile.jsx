import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { User, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';

const Profile = () => {
    const { user, login } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [title, setTitle] = useState('');
    const [skills, setSkills] = useState('');
    const [experience, setExperience] = useState('');
    const [education, setEducation] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setTitle(user.title || '');
            setSkills(user.skills ? user.skills.join(', ') : '');
            setExperience(user.experience || '');
            setEducation(user.education || '');
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const { data } = await api.put('/auth/profile', {
                name,
                email,
                title,
                skills, // Backend splits by comma
                experience,
                education,
                password: password || undefined,
            });
            
            // Update local user context
            login(data);
            
            setMessage('Profile updated successfully');
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="py-12 bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <h1 className="text-3xl font-bold text-black mb-2">My Profile</h1>
                    <p className="text-gray-600 mb-8">Manage your account settings and professional details.</p>

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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169E1] focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169E1] focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Professional Details */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Professional Title</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Senior Frontend Developer"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169E1] focus:border-transparent outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Skills (Comma separated)</label>
                            <input 
                                type="text" 
                                placeholder="React, Node.js, TypeScript..."
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169E1] focus:border-transparent outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Experience & Bio</label>
                            <textarea 
                                placeholder="Tell us about your work experience..."
                                value={experience}
                                onChange={(e) => setExperience(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169E1] focus:border-transparent outline-none h-32 resize-none"
                            ></textarea>
                        </div>
                        
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Education</label>
                             <input 
                                type="text" 
                                placeholder="e.g. BS in Computer Science, University of X"
                                value={education}
                                onChange={(e) => setEducation(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169E1] focus:border-transparent outline-none"
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">New Password (Optional)</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                        <input 
                                            type="password" 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Leave blank to keep current password"
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
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169E1] focus:border-transparent outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="bg-[#4169E1] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#3A5FCD] disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
