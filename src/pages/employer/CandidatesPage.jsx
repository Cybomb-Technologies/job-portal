import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Briefcase, GraduationCap, Filter, User, Grid, List, XCircle, Lock, ShieldCheck, Mail, BookmarkPlus } from 'lucide-react';
import api from '../../api';

const CandidatesPage = () => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [restricted, setRestricted] = useState(false);
    const [filters, setFilters] = useState({
        keyword: '',
        location: '',
        title: '',
        skill: '',
        preferredLocation: ''
    });

    const fetchCandidates = async () => {
        setLoading(true);
        try {
            // Build query string
            const params = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                if (filters[key]) params.append(key, filters[key]);
            });

            const { data } = await api.get(`/candidates?${params.toString()}`);
            setCandidates(data);
            setRestricted(false);
        } catch (error) {
            console.error('Failed to fetch candidates', error);
            if (error.response && error.response.status === 403) {
                setRestricted(true);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Initial load

    const handleSearch = (e) => {
        e.preventDefault();
        fetchCandidates();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({
            keyword: '',
            location: '',
            title: '',
            skill: '',
            preferredLocation: ''
        });
        fetchCandidatesWithEmptyFilters();
    };

    const fetchCandidatesWithEmptyFilters = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/candidates');
            setCandidates(data);
        } catch (error) {
            console.error('Error', error);
            if (error.response && error.response.status === 403) {
                setRestricted(true);
            }
        } finally {
            setLoading(false);
        }
    };

    if (restricted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden text-center">
                    <div className="bg-red-50 p-6 border-b border-red-100">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Access Restricted</h2>
                    </div>
                    <div className="p-8 space-y-6">
                        <p className="text-gray-600">
                            Candidate search is exclusive to verified employers. Please verify your company identity to unlock this feature.
                        </p>
                        
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-left">
                            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" /> Why Verify?
                            </h3>
                            <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                                <li>Access generic candidate search</li>
                                <li>Post active job listings</li>
                                <li>Build trust with candidates</li>
                            </ul>
                        </div>

                        <Link 
                            to="/employer/verification"
                            className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/30"
                        >
                            Go to Verification Center
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Search Candidates</h1>
                    <p className="text-gray-600">Find the perfect talent for your open positions.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <div className="w-full lg:w-1/4">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-24">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <Filter className="w-5 h-5 text-[#4169E1]" />
                                    <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                                </div>
                                <button 
                                    onClick={clearFilters}
                                    className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                                >
                                    <XCircle className="w-4 h-4" /> Clear
                                </button>
                            </div>
                            
                            <form onSubmit={handleSearch} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name / Keyword</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            name="keyword"
                                            value={filters.keyword}
                                            onChange={handleChange}
                                            placeholder="Search by name..."
                                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Professional Title</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            name="title"
                                            value={filters.title}
                                            onChange={handleChange}
                                            placeholder="e.g. Frontend Dev"
                                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                                    <div className="relative">
                                        <GraduationCap className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            name="skill"
                                            value={filters.skill}
                                            onChange={handleChange}
                                            placeholder="e.g. React, Node.js"
                                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            name="location"
                                            value={filters.location}
                                            onChange={handleChange}
                                            placeholder="City, Country"
                                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            name="preferredLocation"
                                            value={filters.preferredLocation}
                                            onChange={handleChange}
                                            placeholder="Preferred City"
                                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-[#4169E1] text-white py-2 rounded-lg font-medium hover:bg-[#3A5FCD] transition-colors shadow-md"
                                >
                                    Apply Filters
                                </button>
                            </form>
                        </div>
                    </div>


                    {/* Results List */}
                    <div className="w-full lg:w-3/4">
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-gray-600">Showing <span className="font-bold text-black">{candidates.length}</span> candidates</p>
                            
                            {/* View Toggle */}
                            <div className="flex bg-white p-1 rounded-lg border border-gray-200 shrink-0">
                                <button 
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-gray-100 shadow-sm text-[#4169E1]' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <Grid className="w-5 h-5"/>
                                </button>
                                <button 
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-gray-100 shadow-sm text-[#4169E1]' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <List className="w-5 h-5"/>
                                </button>
                            </div>
                        </div>
                        {loading ? (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[1, 2, 3, 4].map((n) => (
                                    <div key={n} className="bg-white p-6 rounded-xl border border-gray-200 animate-pulse h-48"></div>
                                ))}
                            </div>
                        ) : candidates.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No candidates found</h3>
                                <p className="text-gray-500">Try adjusting your search filters to find what you're looking for.</p>
                            </div>
                        ) : (

                            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'flex flex-col gap-4'}>
                                {candidates.map((candidate) => (
                                    <div 
                                        key={candidate._id} 
                                        className={`bg-white rounded-xl shadow-sm border border-gray-200 transition-all hover:shadow-md ${
                                            viewMode === 'grid' ? 'p-6 flex flex-col items-center text-center' : 'p-6 flex flex-col md:flex-row items-center justify-between gap-6'
                                        }`}
                                    >
                                        <div className={`flex items-center gap-4 ${viewMode === 'grid' ? 'flex-col' : ''}`}>
                                            <div className="w-20 h-20 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200">
                                                {candidate.profilePicture ? (
                                                    <img 
                                                        src={candidate.profilePicture.startsWith('http') ? candidate.profilePicture : `http://localhost:8000${candidate.profilePicture}`} 
                                                        alt={candidate.name} 
                                                        className="w-full h-full object-cover" 
                                                    />
                                                ) : (
                                                    <User className="w-10 h-10 text-gray-400" />
                                                )}
                                            </div>
                                            <div className={`${viewMode === 'grid' ? 'text-center' : 'text-left'}`}>
                                                <h3 className="text-xl font-bold text-gray-900">{candidate.name}</h3>
                                                <p className="text-[#4169E1] font-medium">{candidate.title || 'Open to Work'}</p>
                                                {candidate.currentLocation && (
                                                    <p className="text-sm text-gray-500 flex items-center justify-center gap-1 mt-1">
                                                        <MapPin className="w-3 h-3" /> {candidate.currentLocation}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className={`flex flex-col gap-2 ${viewMode === 'grid' ? 'w-full mt-4' : 'w-full md:w-auto min-w-[140px]'}`}>
                                            <Link
                                                to={`/employer/candidates/${candidate._id}`}
                                                className="w-full px-4 py-2 border border-[#4169E1] text-[#4169E1] font-medium rounded-lg hover:bg-blue-50 transition-colors text-center"
                                            >
                                                View Profile
                                            </Link>
                                            
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidatesPage;
