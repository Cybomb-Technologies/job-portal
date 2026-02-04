import React, { useState, useEffect, useRef } from 'react';
import { Building2, Camera, Save, Globe, Mail, Briefcase, Calendar, Users, Search, MapPin, Shield } from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { commonCompanyCategories, commonCompanyTypes } from '../../utils/profileData';

const EmployerCompanyInfo = () => {
    const { user, login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isUpdateMode, setIsUpdateMode] = useState(false); // If true, we need to request approval
    
    const [formData, setFormData] = useState({
        companyName: '',
        about: '',
        website: '',
        companyEmail: '',
        companyLocation: '',
        companyCategory: '',
        companyType: '',
        foundedYear: '',
        employeeCount: '',
    });

    const [locationSuggestions, setLocationSuggestions] = useState([]);
    const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
    const [isLoadingLocations, setIsLoadingLocations] = useState(false);

    const [profilePic, setProfilePic] = useState(null);
    const [preview, setPreview] = useState(null);
    const [bannerPic, setBannerPic] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);

    // Autocomplete State
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [categorySuggestions, setCategorySuggestions] = useState([]);
    const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
    const [typeSuggestions, setTypeSuggestions] = useState([]);
    const [showTypeSuggestions, setShowTypeSuggestions] = useState(false);
    
    const wrapperRef = useRef(null);
    const categoryRef = useRef(null);
    const typeRef = useRef(null);
    const locationRef = useRef(null);

    useEffect(() => {
        const fetchLatestProfile = async () => {
            const userStr = localStorage.getItem('user');
            if (!userStr) return; // Don't fetch if not logged in

            try {
                const { data } = await api.get('/auth/profile');
                setFormData({
                    companyName: data.companyName || '',
                    about: data.about || '',
                    website: data.website || '',
                    companyEmail: data.companyEmail || '',
                    companyLocation: data.companyLocation || '',
                    companyCategory: data.companyCategory || '',
                    companyType: data.companyType || '',
                    foundedYear: data.foundedYear || '',
                    employeeCount: data.employeeCount || '',
                });
                
                // If company name exists, we interpret this as an established profile requiring approval for updates
                if (data.companyName && data.companyName.trim() !== '') {
                    setIsUpdateMode(true);
                }
                if (data.profilePicture) {
                    setPreview(data.profilePicture.startsWith('http') ? data.profilePicture : `${import.meta.env.VITE_SERVER_URL}${data.profilePicture}`);
                }
                if (data.bannerPicture) {
                    setBannerPreview(data.bannerPicture.startsWith('http') ? data.bannerPicture : `${import.meta.env.VITE_SERVER_URL}${data.bannerPicture}`);
                }
                // Keep the token from localStorage when updating context
                const currentUser = JSON.parse(userStr);
                login({ ...data, token: currentUser.token }); 
            } catch (err) {
                console.error("Failed to fetch latest profile", err);
            }
        };
        fetchLatestProfile();
    }, []);

    // Initial load from user context if available
    useEffect(() => {
        if (user && !formData.companyName) {
            setFormData({
                companyName: user.companyName || '',
                about: user.about || '',
                website: user.website || '',
                companyEmail: user.companyEmail || '',
                companyLocation: user.companyLocation || '',
                companyCategory: user.companyCategory || '',
                companyType: user.companyType || '',
                foundedYear: user.foundedYear || '',
                employeeCount: user.employeeCount || '',
            });
            if (user.profilePicture) {
                setPreview(user.profilePicture.startsWith('http') ? user.profilePicture : `${import.meta.env.VITE_SERVER_URL}${user.profilePicture}`);
            }
            if (user.bannerPicture) {
                setBannerPreview(user.bannerPicture.startsWith('http') ? user.bannerPicture : `${import.meta.env.VITE_SERVER_URL}${user.bannerPicture}`);
            }
        }
    }, [user]);

    // Location Suggestions Effect
    useEffect(() => {
        const fetchLocations = async () => {
            if (formData.companyLocation.length > 2) {
                setIsLoadingLocations(true);
                try {
                    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(formData.companyLocation)}&count=5&language=en&format=json`);
                    const data = await response.json();
                    setLocationSuggestions(data.results || []);
                } catch (err) { console.error(err); } 
                finally { setIsLoadingLocations(false); }
            }
        };
        const timer = setTimeout(fetchLocations, 400);
        return () => clearTimeout(timer);
    }, [formData.companyLocation]);

    // Close suggestions when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
            if (categoryRef.current && !categoryRef.current.contains(event.target)) {
                setShowCategorySuggestions(false);
            }
            if (typeRef.current && !typeRef.current.contains(event.target)) {
                setShowTypeSuggestions(false);
            }
            if (locationRef.current && !locationRef.current.contains(event.target)) {
                setShowLocationSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef, categoryRef, typeRef, locationRef]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'companyCategory') {
            const filtered = commonCompanyCategories.filter(cat => 
                cat.toLowerCase().includes(value.toLowerCase())
            );
            setCategorySuggestions(filtered);
            setShowCategorySuggestions(true);
        }

        if (name === 'companyType') {
            const filtered = commonCompanyTypes.filter(type => 
                type.toLowerCase().includes(value.toLowerCase())
            );
            setTypeSuggestions(filtered);
            setShowTypeSuggestions(true);
        }

        if (name === 'companyLocation') {
            setShowLocationSuggestions(true);
        }
    };

    const handleCompanyNameChange = async (e) => {
        const query = e.target.value;
        setFormData({ ...formData, companyName: query });
        
        if (query.length > 1) {
            try {
                const response = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${query}`);
                if (response.ok) {
                    const data = await response.json();
                    setSuggestions(data);
                    setShowSuggestions(true);
                }
            } catch (error) {
                console.error("Error fetching company suggestions:", error);
            }
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const selectCompany = (company) => {
        setFormData({
            ...formData,
            companyName: company.name,
            website: company.domain ? `https://${company.domain}` : formData.website,
        });
        
        if (!preview && company.logo) {
             setPreview(company.logo);
        }

        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePic(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBannerPic(file);
            setBannerPreview(URL.createObjectURL(file));
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
        data.append('companyLocation', formData.companyLocation);
        data.append('companyCategory', formData.companyCategory);
        data.append('companyType', formData.companyType);
        data.append('foundedYear', formData.foundedYear);
        data.append('employeeCount', formData.employeeCount);
        
        if (profilePic) {
            data.append('profilePicture', profilePic);
        }
        if (bannerPic) {
            data.append('bannerPicture', bannerPic);
        }

        try {
            if (isUpdateMode) {
                 const res = await api.post('/auth/company/update-request', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setMessage('Update request submitted for approval. You will be notified once reviewed.');
            } else {
                const res = await api.put('/auth/profile', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                login(res.data); // Update context
                setMessage('Company info updated successfully!');
                // Switch to update mode after successful first save
                setIsUpdateMode(true);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update company info');
        } finally {
            setLoading(false);
        }
    };

    const isRecruiter = user?.companyRole === 'Recruiter';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-xl font-bold text-black">Company Information</h2>
                    {isRecruiter && (
                        <p className="text-sm text-amber-600 mt-1 flex items-center gap-1">
                            <Shield size={14} /> Only company admins can edit these details.
                        </p>
                    )}
                </div>
            </div>

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
                        {!isRecruiter && (
                            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl cursor-pointer">
                                <Camera className="w-8 h-8 text-white" />
                                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                            </label>
                        )}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-lg font-medium text-gray-900">Company Logo</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Upload your company logo. This will be displayed on your job posts and company profile.
                        </p>
                        <p className="text-xs text-gray-400 mt-2">JPG, PNG or GIF. Max 5MB.</p>
                    </div>
                </div>

                <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 pb-8 border-b border-gray-100">
                    <div className="relative group">
                        <div className="w-64 h-32 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                            {bannerPreview ? (
                                <img src={bannerPreview} alt="Company Banner" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center">
                                    <Camera className="w-12 h-12 text-gray-400 mx-auto" />
                                    <span className="text-xs text-gray-400">Add Banner</span>
                                </div>
                            )}
                        </div>
                        {!isRecruiter && (
                            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl cursor-pointer">
                                <Camera className="w-8 h-8 text-white" />
                                <input type="file" className="hidden" onChange={handleBannerChange} accept="image/*" />
                            </label>
                        )}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-lg font-medium text-gray-900">Company Banner</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Upload a banner image for your company profile. Recommended size: 1200x400.
                        </p>
                        <p className="text-xs text-gray-400 mt-2">JPG, PNG or GIF. Max 5MB.</p>
                    </div>
                </div>

                <div ref={wrapperRef} className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleCompanyNameChange}
                            placeholder="e.g. Acme Corp"
                            autoComplete="off"
                            disabled={isRecruiter}
                            className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isRecruiter ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                        />
                         {showSuggestions && suggestions.length > 0 && !isRecruiter && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                                {suggestions.map((company, index) => (
                                    <div 
                                        key={index}
                                        onClick={() => selectCompany(company)}
                                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b border-gray-50 last:border-0"
                                    >
                                        {company.logo ? (
                                            <img src={company.logo} alt={company.name} className="w-6 h-6 object-contain" />
                                        ) : (
                                            <Building2 className="w-6 h-6 text-gray-400" />
                                        )}
                                        <div>
                                            <div className="font-medium text-gray-900">{company.name}</div>
                                            <div className="text-xs text-gray-500">{company.domain}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {!isRecruiter && <p className="text-xs text-gray-500 mt-1">Start typing to search for your company.</p>}
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
                                disabled={isRecruiter}
                                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isRecruiter ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                            />
                        </div>
                    </div>
                    <div>
                         {/* Spacer for grid or future Google info */}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                disabled={isRecruiter}
                                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isRecruiter ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                            />
                        </div>
                    </div>
                    <div>
                         {/* Spacer for grid */}
                    </div>
                </div>

                <div ref={locationRef} className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Location</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            name="companyLocation"
                            value={formData.companyLocation}
                            onChange={handleChange}
                            onFocus={() => !isRecruiter && setShowLocationSuggestions(true)}
                            placeholder="e.g. New York, USA"
                            autoComplete="off"
                            disabled={isRecruiter}
                            className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isRecruiter ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                        />
                        {showLocationSuggestions && locationSuggestions.length > 0 && !isRecruiter && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                                {locationSuggestions.map((loc, index) => (
                                    <div 
                                        key={index}
                                        onClick={() => {
                                            setFormData({ ...formData, companyLocation: `${loc.name}${loc.admin1 ? `, ${loc.admin1}` : ''}, ${loc.country}` });
                                            setShowLocationSuggestions(false);
                                        }}
                                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-gray-900 border-b border-gray-50 last:border-0 transition-colors"
                                    >
                                        <div className="font-medium text-gray-900">{loc.name}</div>
                                        <div className="text-xs text-gray-500">{loc.admin1 ? `${loc.admin1}, ` : ''}{loc.country}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {isLoadingLocations && !isRecruiter && (
                            <div className="absolute right-3 top-3">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div ref={categoryRef} className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Category</label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                name="companyCategory"
                                value={formData.companyCategory}
                                onChange={handleChange}
                                onFocus={() => {
                                    if (!isRecruiter) {
                                        setCategorySuggestions(commonCompanyCategories);
                                        setShowCategorySuggestions(true);
                                    }
                                }}
                                placeholder="e.g. IT Services, Healthcare, Fintech"
                                autoComplete="off"
                                disabled={isRecruiter}
                                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isRecruiter ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                            />
                            {showCategorySuggestions && categorySuggestions.length > 0 && !isRecruiter && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                                    {categorySuggestions.map((category, index) => (
                                        <div 
                                            key={index}
                                            onClick={() => {
                                                setFormData({ ...formData, companyCategory: category });
                                                setShowCategorySuggestions(false);
                                            }}
                                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-gray-900 border-b border-gray-50 last:border-0"
                                        >
                                            {category}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                     <div ref={typeRef} className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Type</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                name="companyType"
                                value={formData.companyType}
                                onChange={handleChange}
                                onFocus={() => {
                                    if (!isRecruiter) {
                                        setTypeSuggestions(commonCompanyTypes);
                                        setShowTypeSuggestions(true);
                                    }
                                }}
                                placeholder="e.g. Private Limited, Startup, NGO"
                                autoComplete="off"
                                disabled={isRecruiter}
                                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isRecruiter ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                            />
                            {showTypeSuggestions && typeSuggestions.length > 0 && !isRecruiter && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                                    {typeSuggestions.map((type, index) => (
                                        <div 
                                            key={index}
                                            onClick={() => {
                                                setFormData({ ...formData, companyType: type });
                                                setShowTypeSuggestions(false);
                                            }}
                                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-gray-900 border-b border-gray-50 last:border-0"
                                        >
                                            {type}
                                        </div>
                                    ))}
                                </div>
                            )}
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
                                disabled={isRecruiter}
                                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isRecruiter ? 'bg-gray-50 cursor-not-allowed' : ''}`}
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
                                disabled={isRecruiter}
                                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white ${isRecruiter ? 'bg-gray-50 cursor-not-allowed' : ''}`}
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
                        disabled={isRecruiter}
                        className={`w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isRecruiter ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    />
                </div>

                {!isRecruiter && (
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-2 text-white font-medium rounded-lg transition-colors flex items-center gap-2 ${isUpdateMode ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#4169E1] hover:bg-blue-700'}`}
                        >
                            {loading ? 'Processing...' : (
                                <>
                                    {isUpdateMode ? <Shield className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                                    {isUpdateMode ? 'Request Update' : 'Save Changes'}
                                </>
                            )}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default EmployerCompanyInfo;
