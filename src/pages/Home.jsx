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
    <div>
      {/* Hero Section */}
      <section className="bg-white py-20 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-black mb-6">
              Find Your <span className="text-[#4169E1]">Dream Job</span> Here
            </h1>
            <p className="text-xl text-gray-600 mb-10">
              Discover thousands of job opportunities with all the information you need.
              Its your future. Come find it.
            </p>
            
            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-lg p-3 max-w-3xl mx-auto border border-gray-100">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative border-b md:border-b-0 md:border-r border-gray-100">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Job title, keyword, or company"
                      className="w-full pl-12 pr-4 py-3 text-black border-none focus:outline-none rounded-lg focus:bg-gray-50 transition-colors"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <div className="flex-1 relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="City, state, or remote"
                      className="w-full pl-12 pr-4 py-3 text-black border-none focus:outline-none rounded-lg focus:bg-gray-50 transition-colors"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <button 
                  onClick={handleSearch}
                  className="bg-[#4169E1] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#3A5FCD] transition-colors"
                >
                  Search Jobs
                </button>
              </div>
            </div>

            {/* Popular Searches */}
            <div className="mt-8">
              <p className="text-gray-600 mb-3">Popular Searches:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {['Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer', 'Marketing'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handlePopularSearch(tag)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-[#4169E1] hover:text-white transition-all cursor-pointer border border-transparent hover:border-[#4169E1]"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group hover:transform hover:-translate-y-1 transition-transform duration-300">
                <div className="w-16 h-16 bg-[#4169E1] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-shadow">
                  <div className="text-white">{stat.icon}</div>
                </div>
                <div className="text-4xl font-bold text-black mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

       {/* Recommended Jobs Section */}
       {user && user.role === 'Job Seeker' && recommendedJobs.length > 0 && (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="mb-10">
                    <h2 className="text-3xl font-bold text-black mb-2">Recommended For You</h2>
                    <p className="text-gray-600">Jobs that match your profile skills</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {recommendedJobs.map((job) => (
                    <JobCard key={job._id} job={job} />
                    ))}
                </div>
            </div>
        </section>
      )}

      {/* Featured Jobs */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold text-black mb-2">Featured Jobs</h2>
              <p className="text-gray-600">Discover your next career move</p>
            </div>
            <Link
              to="/jobs"
              className="px-6 py-3 border-2 border-[#4169E1] text-[#4169E1] rounded-lg font-medium hover:bg-[#4169E1] hover:text-white transition-colors"
            >
              View All Jobs
            </Link>
          </div>

          {loading ? (
             <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4169E1]"></div>
             </div>
          ) : error ? (
            <div className="text-center text-red-500 py-10">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {featuredJobs.map((job) => (
                <JobCard key={job._id} job={job} />
                ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#4169E1]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white">
            Ready to take the next step in your career?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of professionals who found their dream job through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-4 bg-white text-[#4169E1] rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Create Free Account
            </Link>
            <Link
              to="/jobs"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-[#4169E1] transition-colors"
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;