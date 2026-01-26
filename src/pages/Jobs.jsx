import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import JobFilters from '../components/jobs/JobFilters';
import JobCard from '../components/jobs/JobCard';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Grid, List, Search, MapPin, SlidersHorizontal } from 'lucide-react';

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
        if (user && user.role === 'Job Seeker') {
            try {
                const { data } = await api.get('/jobs/recommendations');
                setRecommendedJobs(data);
            } catch (err) {
                console.error('Failed to fetch recommendations', err);
            }
        }
    };
    fetchRecommendations();
  }, [user]);

  // Filters State
  const [filters, setFilters] = useState({
    jobType: searchParams.get('type') || '',
    experience: searchParams.get('experience') || '',
    salaryRange: searchParams.get('salaryRange') || '',
    location: searchParams.get('location') || '',
  });

  // Search State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [locationQuery, setLocationQuery] = useState(searchParams.get('locationQuery') || '');

  // Sort State
  const [sortBy, setSortBy] = useState('newest');
  
  // Direct Apply State
  const [directApply, setDirectApply] = useState(searchParams.get('directApply') === 'true');

  const parseSalary = (range) => {
    if(!range) return {};
    if(range.includes('+')) {
        const min = parseInt(range.replace(/[^0-9]/g, '')) * 1000;
        return { salaryMin: min };
    }
    const parts = range.split('-');
    if (parts.length === 2) {
        const min = parseInt(parts[0].replace(/[^0-9]/g, '')) * 1000;
        const max = parseInt(parts[1].replace(/[^0-9]/g, '')) * 1000;
        return { salaryMin: min, salaryMax: max };
    }
    return {};
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchQuery,
        location: locationQuery || filters.location, 
        type: filters.jobType,
        experience: filters.experience,
        sort: sortBy,
        directApply: directApply
      };

      const salaryParams = parseSalary(filters.salaryRange);
      Object.assign(params, salaryParams);

      const { data } = await api.get('/jobs', { params });
      setJobs(data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs. Please try again later.');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
        fetchJobs();
    }, 500);
    return () => clearTimeout(timer);
  }, [filters, searchQuery, locationQuery, sortBy, directApply]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      jobType: '',
      experience: '',
      salaryRange: '',
      location: '',
    });
    setSearchQuery('');
    setLocationQuery('');
    setSortBy('newest');
    setDirectApply(false);
  };

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        
        {/* Search Header */}
        <div className="bg-[#4169E1] rounded-2xl p-6 mb-8 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
                <h1 className="text-3xl font-bold mb-2">Find Your Dream Job</h1>
                <p className="text-blue-100 mb-6">Browse thousands of job opportunities</p>
                
                <div className="bg-white p-2 rounded-xl shadow-md flex flex-col md:flex-row gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
                        <input 
                            type="text" 
                            placeholder="Job title, keywords, or company"
                            className="w-full pl-10 pr-4 py-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-100"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex-1 relative border-t md:border-t-0 md:border-l border-gray-100">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
                        <input 
                            type="text" 
                            placeholder="City, state, or remote"
                            className="w-full pl-10 pr-4 py-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-100"
                            value={locationQuery}
                            onChange={(e) => setLocationQuery(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={fetchJobs}
                        className="bg-[#4169E1] hover:bg-[#3A5FCD] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                    >
                        Search
                    </button>
                </div>
            </div>
            
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-4">
            <button 
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full flex items-center justify-center gap-2 bg-white p-3 rounded-lg shadow-sm font-medium text-gray-700 border border-gray-200"
            >
                <SlidersHorizontal className="w-5 h-5"/>
                {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {/* Filters Sidebar */}
          <div className={`lg:w-1/4 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 custom-scrollbar">
              <JobFilters 
                filters={filters} 
                onFilterChange={handleFilterChange} 
                clearFilters={clearFilters}
              />
            </div>
          </div>

          {/* Job Listings */}
          <div className="lg:w-3/4">
            {/* Controls */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6 sticky top-20 z-20">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 flex-wrap">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">
                    Showing <span className="font-bold text-black">{jobs.length}</span> jobs
                  </span>
                </div>
                
                <div className="flex items-center gap-4 flex-wrap justify-end">
                    <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#4169E1]"
                    >
                        <option value="newest">Sort by: Newest</option>
                        <option value="salary_high">Sort by: Salary (High to Low)</option>
                        <option value="salary_low">Sort by: Salary (Low to High)</option>
                        <option value="relevance">Sort by: Relevance</option>
                    </select>

                    <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                            type="checkbox"
                            checked={directApply}
                            onChange={(e) => setDirectApply(e.target.checked)}
                            className="w-4 h-4 text-[#4169E1] rounded border-gray-300 focus:ring-[#4169E1]"
                        />
                        <span className="text-sm font-medium text-gray-700">Direct Apply</span>
                    </label>
                    
                    <div className="flex items-center border border-gray-200 rounded-lg p-1 bg-gray-50">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-all ${
                        viewMode === 'grid'
                            ? 'bg-white shadow text-[#4169E1]'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        <Grid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-all ${
                        viewMode === 'list'
                            ? 'bg-white shadow text-[#4169E1]'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                    </div>
                </div>

              </div>
            </div>

            {/* Recommended Jobs Section */}
            {user && user.role === 'Job Seeker' && recommendedJobs.length > 0 && !searchQuery && !filters.jobType && !filters.location && !filters.experience && (
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                        
                        <h2 className="text-xl font-bold text-gray-900">Recommended For You</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {recommendedJobs.map((job) => (
                            <JobCard key={`rec-${job._id}`} job={job} />
                        ))}
                    </div>
                    <div className="my-8 border-t border-gray-200"></div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">All Jobs</h2>
                </div>
            )}

            {/* Jobs Grid/List */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4169E1]"></div>
                </div>
            ) : jobs.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-gray-400"/>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs found</h3>
                    <p className="text-gray-500 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
                    <button 
                        onClick={clearFilters}
                        className="text-[#4169E1] font-medium hover:underline"
                    >
                        Clear all filters
                    </button>
                </div>
            ) : (
                <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}`}>
                {jobs.map((job) => (
                    <div key={job._id} className="animate-fade-in-up h-full"> 
                        <JobCard job={job} />
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

export default Jobs;