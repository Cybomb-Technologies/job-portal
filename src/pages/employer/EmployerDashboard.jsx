import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Briefcase, Users, LayoutDashboard, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

const EmployerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
      activeJobs: 0,
      closedJobs: 0,
      totalJobs: 0,
      totalApplications: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
        try {
            const { data } = await api.get('/jobs/stats');
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats', error);
        }
    };
    if (user) fetchStats();
  }, [user]);

  const statCards = [
    { title: 'Total Jobs Posted', value: stats.totalJobs, icon: Briefcase, color: 'bg-blue-500', textColor: 'text-blue-500' },
    { title: 'Active Listings', value: stats.activeJobs, icon: LayoutDashboard, color: 'bg-purple-500', textColor: 'text-purple-500' },
    { title: 'Closed Jobs', value: stats.closedJobs, icon: Briefcase, color: 'bg-red-500', textColor: 'text-red-500' },
    { title: 'Total Applications', value: stats.totalApplications, icon: Users, color: 'bg-green-500', textColor: 'text-green-500' },
  ];

  return (
    <div className="py-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Employer Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Welcome back, <span className="font-semibold text-[#4169E1]">{user?.name}</span></p>
          </div>
          <Link
            to="/employer/post-job"
            className="flex items-center space-x-2 bg-[#4169E1] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#3A5FCD] transition-colors shadow-lg shadow-blue-500/30"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Post a New Job</span>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4 transition hover:shadow-md hover:-translate-y-1">
              <div className={`p-4 rounded-lg bg-opacity-10 ${stat.color.replace('bg-', 'bg-opacity-10 ')}`}>
                <stat.icon className={`w-8 h-8 ${stat.textColor}`} />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{stat.title}</p>
                <h3 className="text-3xl font-bold text-black dark:text-white mt-1">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions / Manage Jobs Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-black dark:text-white">Jobs Overview</h2>
            <Link to="/employer/my-jobs" className="flex items-center text-[#4169E1] hover:text-[#3A5FCD] font-medium transition">
              Manage All Jobs <Search className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          {stats.totalJobs === 0 ? (
             <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">You haven't posted any jobs yet.</p>
                <p className="text-sm text-gray-400 mb-6">Start building your team today.</p>
                <Link to="/employer/post-job" className="text-[#4169E1] font-bold hover:underline">
                    Post your first job →
                </Link>
            </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
                      <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-2">Boost your Hiring</h3>
                      <p className="text-blue-700 dark:text-blue-300 mb-4 text-sm">Upgrade to premium to feature your listings.</p>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Explore Plans</button>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/30 p-6 rounded-xl border border-purple-100 dark:border-purple-800">
                      <h3 className="text-lg font-bold text-purple-900 dark:text-purple-200 mb-2">Candidate Search</h3>
                      <p className="text-purple-700 dark:text-purple-300 mb-4 text-sm">Search our database of over 1 million resumes.</p>
                      <Link to="/employer/candidates" className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition">Search Candidates</Link>
                  </div>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
