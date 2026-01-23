import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Users, Shield, MapPin } from 'lucide-react';
import JobCard from '../components/jobs/JobCard';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await api.get('/jobs');
        // Get top 4 jobs
        setFeaturedJobs(data.slice(0, 4));
        
        if (user && user.role === 'Job Seeker') {
            const recRes = await api.get('/jobs/recommendations');
            setRecommendedJobs(recRes.data);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load featured jobs');
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user]);

  const handleSearch = () => {
      const params = new URLSearchParams();
      if(searchQuery) params.append('search', searchQuery);
      if(locationQuery) params.append('location', locationQuery);
      navigate(`/jobs?${params.toString()}`);
  };

  const handlePopularSearch = (term) => {
      navigate(`/jobs?search=${encodeURIComponent(term)}`);
  };

  const stats = [
    { number: '10,000+', label: 'Jobs Available', icon: <TrendingUp /> },
    { number: '5,000+', label: 'Companies', icon: <Users /> },
    { number: '95%', label: 'Success Rate', icon: <Shield /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 rounded-full blur-[100px] opacity-60 translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100 rounded-full blur-[100px] opacity-60 -translate-x-1/2 translate-y-1/2"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        </div>

        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto text-center space-y-8 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-bold text-sm tracking-wide uppercase mb-4 animate-scaleIn">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                #1 Job Platform in 2026
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              Find Your <span className="text-gradient">Dream Career</span><br />
              <span className="text-slate-400">Not Just a Job.</span>
            </h1>
            
            <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
              Connect with 5000+ top companies and startups. Your next big opportunity is just one search away.
            </p>
            
            {/* Search Bar */}
            <div className="mt-12 p-3 bg-white shadow-2xl shadow-blue-100/50 rounded-2xl border border-gray-100/50 max-w-4xl mx-auto backdrop-blur-xl relative z-10 animate-slide-up">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      placeholder="Job title, skills, or company"
                      className="block w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500/20 transition-all font-semibold"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <div className="flex-1 relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      placeholder="City, state, or remote"
                      className="block w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500/20 transition-all font-semibold"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <button 
                  onClick={handleSearch}
                  className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98] transition-all duration-200"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Popular Searches */}
            <div className="pt-8 flex flex-wrap justify-center gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider py-2">Trending:</span>
              {['Remote', 'Product Design', 'Engineering', 'Marketing', 'Startup'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => handlePopularSearch(tag)}
                  className="px-4 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-full text-sm font-semibold hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50/50 transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="group p-8 rounded-3xl bg-slate-50 border border-transparent hover:bg-white hover:border-blue-100 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 border border-gray-100 group-hover:border-blue-100">
                        <div className="text-blue-600 transform scale-125 group-hover:rotate-12 transition-transform duration-300">{stat.icon}</div>
                    </div>
                    <div>
                        <div className="text-4xl font-extrabold text-slate-900 mb-1 font-display">{stat.number}</div>
                        <div className="text-slate-500 font-medium">{stat.label}</div>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

       {/* Recommended Jobs Section */}
       {user && user.role === 'Job Seeker' && recommendedJobs.length > 0 && (
        <section className="py-24 bg-white relative">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 font-display">Recommended For You</h2>
                        <p className="text-lg text-slate-500 max-w-xl">Curated opportunities matching your unique profile and skills.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {recommendedJobs.map((job) => (
                    <JobCard key={job._id} job={job} />
                    ))}
                </div>
            </div>
        </section>
      )}

      {/* Featured Jobs */}
      <section className="py-24 bg-slate-50/50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg mb-3 uppercase tracking-wider">Hot Jobs</div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 font-display">Featured Opportunities</h2>
              <p className="text-lg text-slate-500 max-w-xl">Top positions from leading global companies.</p>
            </div>
            <Link
              to="/jobs"
              className="group px-6 py-3 bg-white border border-gray-200 text-slate-700 rounded-xl font-bold hover:border-blue-300 hover:text-blue-600 transition-all flex items-center shadow-sm hover:shadow-md"
            >
              View All Jobs
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {loading ? (
             <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
             </div>
          ) : error ? (
            <div className="text-center bg-red-50 text-red-600 py-12 rounded-2xl border border-red-100 font-medium">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                {featuredJobs.map((job) => (
                <JobCard key={job._id} job={job} />
                ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-900/20">
                {/* Decorative Circles */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-20 -mt-20"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mb-20"></div>
                
                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 font-display relative z-10">
                    Ready to shape your future?
                </h2>
                <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto font-medium relative z-10 leading-relaxed">
                    Join thousands of professionals who found their dream job through our platform. Create your profile today.
                </p>
                <div className="flex flex-col sm:flex-row gap-5 justify-center relative z-10">
                    <Link
                    to="/signup"
                    className="px-10 py-5 bg-white text-blue-600 rounded-2xl font-bold text-lg hover:bg-blue-50 shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-1 transition-all"
                    >
                    Create Free Account
                    </Link>
                    <Link
                    to="/jobs"
                    className="px-10 py-5 bg-blue-700/50 backdrop-blur-sm border border-white/20 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 hover:border-white/40 transition-all"
                    >
                    Browse Jobs
                    </Link>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
};

export default Home;