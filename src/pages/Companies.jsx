import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Users, Globe, ExternalLink, Search, Grid, List, TrendingUp } from 'lucide-react';
import api from '../api';

const Companies = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('openPositions'); // 'name', 'openPositions'
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list'

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await api.get('/jobs');
        setJobs(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load companies.');
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Extract unique companies from jobs
  const companies = Array.from(new Set(jobs.map(job => job.company))).map(companyName => {
    const companyJobs = jobs.filter(j => j.company === companyName);
    const job = companyJobs[0];
    return {
      name: companyName,
      location: job.location,
      description: job.companyDescription || "Leading technology company focused on innovation and building the future.", 
      industry: "Technology", 
      employees: "100-500", 
      openPositions: companyJobs.length,
      employerId: job.postedBy?._id
    };
  });

  // Filter and Sort Companies
  const filteredCompanies = companies
    .filter(company => 
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
        if (sortOption === 'name') {
            return a.name.localeCompare(b.name);
        } else if (sortOption === 'openPositions') {
            return b.openPositions - a.openPositions;
        }
        return 0;
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4169E1]"></div>
      </div>
    );
  }

  if (error) {
    return (
        <div className="flex justify-center items-center h-screen bg-gray-50 text-red-500">
            {error}
        </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-black mb-4">Top Companies Hiring</h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Explore the best companies to work for. Find your dream workplace among the top employers in the industry.
            </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8 sticky top-20 z-10 transition-shadow hover:shadow-md">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                {/* Search */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
                    <input 
                        type="text" 
                        placeholder="Search company or location..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#4169E1] transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    {/* Sort */}
                    <select 
                        className="px-4 py-2.5 border border-gray-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#4169E1] bg-white cursor-pointer w-full md:w-auto"
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                    >
                        <option value="openPositions">Most Openings</option>
                        <option value="name">Name (A-Z)</option>
                    </select>

                    {/* View Toggle */}
                    <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 shrink-0">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-[#4169E1]' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Grid className="w-5 h-5"/>
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-[#4169E1]' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <List className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Content */}
        {filteredCompanies.length === 0 ? (
             <div className="text-center py-20">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-10 h-10 text-gray-400"/>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No companies found</h3>
                <p className="text-gray-500">Try adjusting your search criteria.</p>
            </div>
        ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-4'}>
            {filteredCompanies.map((company, index) => (
                <div 
                    key={index} 
                    className={`bg-white rounded-xl border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-blue-100 group animate-fade-in-up ${
                        viewMode === 'grid' ? 'p-6' : 'p-6 flex flex-col md:flex-row items-center gap-6'
                    }`}
                >
                <div className={`${viewMode === 'list' && 'flex-1 w-full flex flex-col md:flex-row items-center gap-6'}`}>
                     <div className={`flex items-start justify-between ${viewMode === 'grid' ? 'mb-4' : 'w-full md:w-auto flex-col md:flex-row items-center md:items-start'}`}>
                        <div className="flex flex-col md:flex-row items-center gap-4">
                             <div className="bg-blue-50 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <Building2 className="w-8 h-8 text-[#4169E1]" />
                            </div>
                            {viewMode === 'list' && (
                                <div className="text-center md:text-left">
                                     <h3 className="text-xl font-bold text-black mb-1 group-hover:text-[#4169E1] transition-colors">{company.name}</h3>
                                     <div className="text-gray-500 text-sm flex items-center justify-center md:justify-start gap-1">
                                         <MapPin className="w-3 h-3"/> {company.location}
                                     </div>
                                </div>
                            )}
                        </div>

                        {viewMode === 'grid' && (
                            <span className="bg-blue-50 text-[#4169E1] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                {company.openPositions} Jobs
                            </span>
                        )}
                    </div>
                    
                    {viewMode === 'grid' && (
                         <>
                            <h3 className="text-xl font-bold text-black mb-2 group-hover:text-[#4169E1] transition-colors">{company.name}</h3>
                            <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{company.description}</p>
                        </>
                    )}

                    {viewMode === 'list' && (
                         <div className="text-center md:text-left flex-1 hidden md:block">
                            <p className="text-gray-600 line-clamp-2 text-sm">{company.description}</p>
                         </div>
                    )}
                    
                    <div className={`space-y-2 ${viewMode === 'grid' ? 'mb-6' : 'w-full md:w-auto flex flex-wrap justify-center gap-4 md:space-y-0'}`}>
                        {viewMode === 'grid' && (
                            <>
                                <div className="flex items-center text-gray-500 text-sm">
                                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                {company.location}
                                </div>
                                <div className="flex items-center text-gray-500 text-sm">
                                <Users className="w-4 h-4 mr-2 text-gray-400" />
                                {company.employees} Employees
                                </div>
                            </>
                        )}
                         {viewMode === 'list' && (
                            <div className="flex items-center text-gray-500 text-sm">
                                <Users className="w-4 h-4 mr-2 text-gray-400" />
                                {company.employees}
                            </div>
                         )}
                         {viewMode === 'list' && (
                             <span className="bg-blue-50 text-[#4169E1] px-3 py-1 rounded-full text-xs font-bold uppercase inline-block">
                                {company.openPositions} Jobs
                            </span>
                         )}
                    </div>
                </div>
                
                <Link 
                    to={company.employerId ? `/company/${company.employerId}` : '#'}
                    className={`block text-center border-2 border-[#4169E1] text-[#4169E1] rounded-lg font-medium hover:bg-[#4169E1] hover:text-white transition-colors duration-300 ${
                    viewMode === 'grid' ? 'w-full py-2.5' : 'w-full md:w-auto px-6 py-2.5 mt-4 md:mt-0'
                }`}>
                    View Profile
                </Link>
                </div>
            ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default Companies;
