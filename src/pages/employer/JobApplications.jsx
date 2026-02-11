import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, MoreVertical, FileText, Check, X, Clock, 
    Grid, List, Filter, ArrowUpDown, Search, User, Mail, Calendar, Eye 
} from 'lucide-react';
import api from '../../api';

const JobApplications = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState('');

  // UI State
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'Applied' | 'Shortlisted' | 'Interviewed' | 'Hired' | 'Rejected'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'az' | 'za'
  const [atsEnabled, setAtsEnabled] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/applications/job/${jobId}${atsEnabled ? '?ats=true' : ''}`);
        setApplications(data);
        
        // Also fetch job details to display title (only once)
        if (!jobTitle) {
            const jobRes = await api.get(`/jobs/${jobId}`);
            setJobTitle(jobRes.data.title);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch applications', error);
        setLoading(false);
      }
    };
    fetchApplications();
  }, [jobId, atsEnabled]);

  const updateStatus = async (appId, newStatus, e) => {
      e.stopPropagation(); // Prevent row click
      try {
          // Optimistic update
          setApplications(prev => prev.map(app => app._id === appId ? { ...app, status: newStatus } : app));
          await api.put(`/applications/${appId}/status`, { status: newStatus });
      } catch (error) {
          console.error('Failed to update status', error);
      }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Resume Viewed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Shortlisted': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Interviewed': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Hired': return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter and Sort Logic
  const filteredApplications = applications
    .filter(app => {
        if (filterStatus === 'all') return true;
        return app.status === filterStatus;
    })
    .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortBy === 'az') return a.applicant.name.localeCompare(b.applicant.name);
        if (sortBy === 'za') return b.applicant.name.localeCompare(a.applicant.name);
        return 0;
    });

  if (loading) return <div className="p-12 text-center">Loading applications...</div>;

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>

                <h1 className="text-3xl font-bold text-black">Applications for <span className="text-[#4169E1]">{jobTitle}</span></h1>
                <p className="text-gray-600 mt-1">{filteredApplications.length} candidates found {filterStatus !== 'all' && `(filtered by ${filterStatus})`}</p>
            </div>
            
            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                {/* ATS Toggle */}
                <button 
                    onClick={() => setAtsEnabled(!atsEnabled)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                        atsEnabled 
                        ? 'bg-blue-50 text-[#4169E1] border-blue-200' 
                        : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                >
                    <span className="font-medium text-sm">ATS Match</span>
                </button>
                 {/* Status Filter */}
                 <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select 
                        className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 cursor-pointer"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="Applied">Applied</option>
                        <option value="Resume Viewed">Resume Viewed</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Interviewed">Interviewed</option>
                        <option value="Hired">Hired</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>

                {/* Sort */}
                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                    <ArrowUpDown className="w-4 h-4 text-gray-500" />
                    <select 
                        className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 cursor-pointer"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="az">Name (A-Z)</option>
                        <option value="za">Name (Z-A)</option>
                    </select>
                </div>

                {/* View Switcher */}
                <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-[#4169E1]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
                        title="List View"
                    >
                        <List className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-[#4169E1]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
                        title="Grid View"
                    >
                        <Grid className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>

        {applications.length === 0 ? (
             <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-100">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No applications yet</h3>
                <p className="text-gray-500">Wait for candidates to apply!</p>
            </div>
        ) : filteredApplications.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-100">
                <Filter className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No matching applications</h3>
                <p className="text-gray-500">Try adjusting your filters.</p>
            </div>
        ) : (
             <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"}>
                {viewMode === 'list' ? (
                     <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left p-6 font-semibold text-gray-600">Candidate</th>
                                    <th className="text-left p-6 font-semibold text-gray-600">Applied Date</th>
                                    <th className="text-left p-6 font-semibold text-gray-600">Resume/Details</th>
                                    <th className="text-left p-6 font-semibold text-gray-600">Status</th>
                                    <th className="text-left p-6 font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredApplications.map((app) => (
                                    <tr 
                                        key={app._id} 
                                        className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                                        onClick={() => navigate(`/employer/application/${app._id}`)}
                                    >
                                        <td className="p-6">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#4169E1] font-bold mr-3 text-lg">
                                                    {app.applicant.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-black group-hover:text-[#4169E1] transition-colors flex items-center gap-2">
                                                        {app.applicant.name}
                                                        {app.matchScore > 0 && (
                                                            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full border border-green-200 font-bold flex items-center">
                                                                 {app.matchScore}% Match
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                                        <Mail className="w-3 h-3" /> {app.applicant.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {new Date(app.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className="text-[#4169E1] font-medium flex items-center">
                                                <Eye className="w-4 h-4 mr-2" /> View Details
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(app.status)}`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <select 
                                                    value={app.status}
                                                    onChange={(e) => updateStatus(app._id, e.target.value, e)}
                                                    className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#4169E1] cursor-pointer hover:border-[#4169E1] transition-colors"
                                                >
                                                    <option value="Applied">Applied</option>
                                                    <option value="Resume Viewed">Resume Viewed</option>
                                                    <option value="Shortlisted">Shortlisted</option>
                                                    <option value="Interviewed">Interviewed</option>
                                                    <option value="Hired">Hired</option>
                                                    <option value="Rejected">Rejected</option>
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    filteredApplications.map((app) => (
                        <div 
                            key={app._id} 
                            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
                            onClick={() => navigate(`/employer/application/${app._id}`)}
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-[#4169E1] font-bold mr-3 text-xl">
                                            {app.applicant.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-black group-hover:text-[#4169E1] transition-colors">{app.applicant.name}</h3>
                                            <div className="text-sm text-gray-500 flex items-center gap-1">
                                                <Mail className="w-3 h-3" /> {app.applicant.email}
                                            </div>
                                        </div>
                                    </div>
                                     <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(app.status)}`}>
                                        {app.status}
                                    </span>
                                </div>
                                {app.matchScore > 0 && (
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700 flex items-center"> ATS Score</span>
                                            <span className="font-bold text-[#4169E1]">{app.matchScore}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                            <div style={{ width: `${app.matchScore}%` }} className="h-full bg-[#4169E1] rounded-full"></div>
                                        </div>
                                        {app.matchReasons && app.matchReasons.length > 0 && (
                                             <div className="mt-2 text-xs text-gray-500 space-y-1">
                                                {app.matchReasons.slice(0, 2).map((reason, idx) => (
                                                    <div key={idx} className="flex items-center">
                                                        <Check className="w-3 h-3 text-green-500 mr-1" /> {reason}
                                                    </div>
                                                ))}
                                             </div>
                                        )}
                                    </div>
                                )}
                                <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Applied on {new Date(app.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 space-y-3">
                                <button className="w-full py-2.5 text-[#4169E1] font-medium bg-blue-50 rounded-lg group-hover:bg-[#4169E1] group-hover:text-white transition-colors flex items-center justify-center">
                                    <Eye className="w-4 h-4 mr-2" /> View Details
                                </button>
                                
                                <div className="relative" onClick={(e) => e.stopPropagation()}>
                                    <select 
                                        value={app.status}
                                        onChange={(e) => updateStatus(app._id, e.target.value, e)}
                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[#4169E1] cursor-pointer appearance-none"
                                    >
                                        <option value="Applied">Status: Applied</option>
                                        <option value="Resume Viewed">Status: Resume Viewed</option>
                                        <option value="Shortlisted">Status: Shortlisted</option>
                                        <option value="Interviewed">Status: Interviewed</option>
                                        <option value="Hired">Status: Hired</option>
                                        <option value="Rejected">Status: Rejected</option>
                                    </select>
                                    <ArrowUpDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    ))
                )}
             </div>
        )}
      </div>
    </div>
  );
};

export default JobApplications;
