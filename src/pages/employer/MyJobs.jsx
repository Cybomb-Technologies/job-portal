import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    Trash2, Edit, Eye, MapPin, Briefcase, IndianRupee, Users, 
    Grid, List, Filter, ArrowUpDown, Search, CheckCircle, XCircle 
} from 'lucide-react';
import api from '../../api';
import Swal from 'sweetalert2';

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // UI State
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'active' | 'closed'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'salary'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      const { data } = await api.get('/jobs/myjobs');
      setJobs(data);
    } catch (err) {
      setError('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
        try {
            await api.delete(`/jobs/${id}`);
            setJobs(jobs.filter(job => job._id !== id));
            Swal.fire('Deleted!', 'Your job has been deleted.', 'success');
        } catch (err) {
            Swal.fire('Error', 'Failed to delete job', 'error');
        }
    }
  };

  const handleStatusToggle = async (job) => {
      const newStatus = job.status === 'Active' ? 'Closed' : 'Active';
      const action = newStatus === 'Active' ? 'Activate' : 'Deactivate';

      try {
          // Optimistic update
          setJobs(jobs.map(j => j._id === job._id ? { ...j, status: newStatus } : j));
          
          await api.put(`/jobs/${job._id}`, { status: newStatus });
          
          const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
          });
          
          Toast.fire({
            icon: 'success',
            title: `Job ${action}d successfully`
          });

      } catch (err) {
          // Revert on error
          setJobs(jobs.map(j => j._id === job._id ? { ...j, status: job.status } : j));
          Swal.fire('Error', 'Failed to update status', 'error');
      }
  };

  // Filter and Sort Logic
  const filteredJobs = jobs
    .filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              job.company.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' 
            ? true 
            : filterStatus === 'active' 
                ? job.status === 'Active' 
                : job.status !== 'Active'; // Assume anything not Active is Closed/Disabled
        return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortBy === 'salary') return b.salaryMin - a.salaryMin;
        return 0;
    });

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-black">My Job Listings</h1>
                <p className="text-gray-500 mt-1">Manage your job posts and track applications</p>
            </div>
            <Link
                to="/employer/post-job"
                className="bg-[#4169E1] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-[#3A5FCD] transition-all shadow-lg shadow-blue-500/30 active:scale-95"
             >
                + Post New Job
            </Link>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-col lg:flex-row gap-4 justify-between items-center">
            
            {/* Search */}
            <div className="relative w-full lg:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                    type="text" 
                    placeholder="Search by title or company..." 
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4169E1] outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                {/* Status Filter */}
                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select 
                        className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 cursor-pointer"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active Only</option>
                        <option value="closed">Closed Only</option>
                    </select>
                </div>

                {/* Sort By */}
                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                    <ArrowUpDown className="w-4 h-4 text-gray-500" />
                    <select 
                        className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 cursor-pointer"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="salary">Highest Salary</option>
                    </select>
                </div>

                {/* View Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-[#4169E1]' : 'text-gray-500 hover:text-gray-700'}`}
                        title="List View"
                    >
                        <List className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-[#4169E1]' : 'text-gray-500 hover:text-gray-700'}`}
                        title="Grid View"
                    >
                        <Grid className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>

        {error && <div className="text-red-500 mb-4 bg-red-50 p-4 rounded-lg">{error}</div>}

        {/* Jobs List/Grid */}
        {filteredJobs.length === 0 ? (
            <div className="bg-white p-16 text-center rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                    <Briefcase className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-500">Try adjusting your filters or post a new job.</p>
            </div>
        ) : (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                {filteredJobs.map((job) => (
                    <div 
                        key={job._id} 
                        className={`bg-white rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md group relative overflow-hidden ${
                            viewMode === 'list' ? 'p-6 flex flex-col md:flex-row justify-between items-start md:items-center' : 'p-6 flex flex-col h-full'
                        } ${job.status === 'Closed' ? 'opacity-75 bg-gray-50' : ''}`}
                    >   
                        {/* Status Bar for Closed Jobs */}
                        {job.status === 'Closed' && (
                             <div className="absolute top-0 left-0 w-1 h-full bg-gray-300"></div>
                        )}
                        {job.status === 'Active' && (
                             <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                        )}

                        <div className={`flex-1 ${viewMode === 'list' ? 'mb-4 md:mb-0 md:mr-6' : 'mb-6'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-black group-hover:text-[#4169E1] transition-colors line-clamp-1">{job.title}</h3>
                                {viewMode === 'grid' && (
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                        job.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
                                    }`}>
                                        {job.status}
                                    </span>
                                )}
                            </div>
                            
                            <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                                <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1 text-gray-400" /> {job.company}</span>
                                <span className="flex items-center"><MapPin className="w-4 h-4 mr-1 text-gray-400" /> {job.location}</span>
                            </div>

                            <div className="flex items-center text-sm font-medium text-gray-700">
                                <IndianRupee className="w-4 h-4 mr-1 text-gray-400" />
                                {job.salaryType === 'Fixed' 
                                    ? Number(job.salaryMin).toLocaleString() 
                                    : `${Number(job.salaryMin).toLocaleString()} - ${Number(job.salaryMax).toLocaleString()}`
                                }
                            </div>
                        </div>
                        
                        {/* Actions & Stats */}
                        <div className={`flex items-center ${viewMode === 'list' ? 'gap-6' : 'justify-between mt-auto w-full pt-4 border-t border-gray-50'}`}>
                            
                            {/* Applicant Count */}
                            <Link 
                                to={`/employer/applications/${job._id}`}
                                className="group/app flex flex-col items-center cursor-pointer"
                                title="View Applications"
                            >
                                <div className="relative">
                                    <div className="bg-blue-50 text-[#4169E1] p-2 rounded-lg group-hover/app:bg-[#4169E1] group-hover/app:text-white transition-colors">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    {job.applicationCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm">
                                            {job.applicationCount}
                                        </span>
                                    )}
                                </div>
                                {viewMode === 'list' && <span className="text-xs text-center mt-1 font-medium text-gray-500 group-hover/app:text-[#4169E1]">Applicants</span>}
                            </Link>

                            <div className="flex items-center gap-2">
                                {/* Toggle Status */}
                                <button
                                    onClick={() => handleStatusToggle(job)}
                                    className={`p-2 rounded-lg transition-colors ${
                                        job.status === 'Active' 
                                            ? 'text-orange-500 hover:bg-orange-50' 
                                            : 'text-green-600 hover:bg-green-50'
                                    }`}
                                    title={job.status === 'Active' ? 'Deactivate Job' : 'Activate Job'}
                                >
                                    {job.status === 'Active' ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                </button>
                                
                                {/* Edit */}
                                <Link 
                                    to={`/employer/edit-job/${job._id}`}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                    title="Edit Job"
                                >
                                    <Edit className="w-5 h-5" />
                                </Link>

                                {/* Delete */}
                                <button 
                                    onClick={() => handleDelete(job._id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                    title="Delete Job"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default MyJobs;
