import React, { useState, useEffect } from 'react';
import { Building2, Camera, Save, Globe, Mail, Briefcase, Calendar, Users } from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

const EmployerCompanyInfo = () => {
    const { user, login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        companyName: '',
        about: '',
        website: '',
        companyEmail: '',
        companyCategory: '',
        companyType: '',
        foundedYear: '',
        employeeCount: ''
    });

    const [profilePic, setProfilePic] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData({
                companyName: user.companyName || '',
                about: user.about || '',
                website: user.website || '',
                companyEmail: user.companyEmail || '',
                companyCategory: user.companyCategory || '',
                companyType: user.companyType || '',
                foundedYear: user.foundedYear || '',
                employeeCount: user.employeeCount || ''
            });
            if (user.profilePicture) {
                setPreview(user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:8000${user.profilePicture}`);
            }
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePic(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        const data = new FormData();
        data.append('companyName', formData.companyName);
        data.append('about', formData.about);
        data.append('website', formData.website);
        data.append('companyEmail', formData.companyEmail);
        data.append('companyCategory', formData.companyCategory);
        data.append('companyType', formData.companyType);
        data.append('foundedYear', formData.foundedYear);
        data.append('employeeCount', formData.employeeCount);
        
        if (profilePic) {
            data.append('profilePicture', profilePic);
        }

        try {
            const res = await api.put('/auth/profile', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            login(res.data); // Update context
            setMessage('Company info updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update company info');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-black mb-6">Company Information</h2>

            {message && (
                <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200 mb-6">
                    {message}
                </div>
            )}
            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Profile Picture / Logo section */}
                <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 pb-8 border-b border-gray-100">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                            {preview ? (
                                <img src={preview} alt="Company Logo" className="w-full h-full object-cover" />
                            ) : (
                                <Building2 className="w-12 h-12 text-gray-400" />
                            )}
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl cursor-pointer">
                            <Camera className="w-8 h-8 text-white" />
                            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                        </label>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-lg font-medium text-gray-900">Company Logo</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Upload your company logo. This will be displayed on your job posts and company profile.
                        </p>
                        <p className="text-xs text-gray-400 mt-2">JPG, PNG or GIF. Max 5MB.</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            placeholder="e.g. Acme Corp"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="url"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                placeholder="https://example.com"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Email ID</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                name="companyEmail"
                                value={formData.companyEmail}
                                onChange={handleChange}
                                placeholder="contact@example.com"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Category</label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <select
                                name="companyCategory"
                                value={formData.companyCategory}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                            >
                                <option value="">Select Category</option>
                                <option value="IT Services">IT Services</option>
                                <option value="Fintech">Fintech</option>
                                <option value="Healthcare">Healthcare</option>
                                <option value="Education">Education</option>
                                <option value="E-commerce">E-commerce</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Type</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <select
                                name="companyType"
                                value={formData.companyType}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                            >
                                <option value="">Select Type</option>
                                <option value="Private Limited">Private Limited</option>
                                <option value="Public Limited">Public Limited</option>
                                <option value="Startup">Startup</option>
                                <option value="Non-Profit">Non-Profit</option>
                                <option value="Government">Government</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Founded Year</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="number"
                                name="foundedYear"
                                value={formData.foundedYear}
                                onChange={handleChange}
                                placeholder="Year (e.g. 2020)"
                                min="1900"
                                max={new Date().getFullYear()}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <select
                                name="employeeCount"
                                value={formData.employeeCount}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                            >
                                <option value="">Select Size</option>
                                <option value="1-10">1-10 Employees</option>
                                <option value="11-50">11-50 Employees</option>
                                <option value="51-200">51-200 Employees</option>
                                <option value="201-500">201-500 Employees</option>
                                <option value="500+">500+ Employees</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">About Company</label>
                    <textarea
                        name="about"
                        value={formData.about}
                        onChange={handleChange}
                        rows="6"
                        placeholder="Tell us about your company..."
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-[#4169E1] text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EmployerCompanyInfo;
