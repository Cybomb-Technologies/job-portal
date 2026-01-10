import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, MapPin, Briefcase, Calendar, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';
import api from '../../api';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { data } = await api.get('/applications/my-applications');
        setApplications(data);
      } catch (error) {
        console.error('Failed to fetch applications', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
    // Poll for updates every 3 seconds
    const interval = setInterval(fetchApplications, 3000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Applied': return <span className="flex items-center text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full text-xs font-semibold"><Clock className="w-3 h-3 mr-1"/> Applied</span>;
      case 'Resume Viewed': return <span className="flex items-center text-blue-600 bg-blue-100 px-3 py-1 rounded-full text-xs font-semibold"><Eye className="w-3 h-3 mr-1"/> Resume Viewed</span>;
      case 'Shortlisted': return <span className="flex items-center text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full text-xs font-semibold"><Briefcase className="w-3 h-3 mr-1"/> Shortlisted</span>;
      case 'Interviewed': return <span className="flex items-center text-purple-600 bg-purple-100 px-3 py-1 rounded-full text-xs font-semibold"><Calendar className="w-3 h-3 mr-1"/> Interviewed</span>;
      case 'Hired': return <span className="flex items-center text-green-600 bg-green-100 px-3 py-1 rounded-full text-xs font-semibold"><CheckCircle className="w-3 h-3 mr-1"/> Hired</span>;
      case 'Rejected': return <span className="flex items-center text-red-600 bg-red-100 px-3 py-1 rounded-full text-xs font-semibold"><XCircle className="w-3 h-3 mr-1"/> Rejected</span>;
      default: return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  if (loading) return <div className="p-20 text-center">Loading your applications...</div>;

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="text-3xl font-bold text-black mb-8">My Applications</h1>

            {applications.length === 0 ? (
                <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No applications yet</h3>
                    <p className="text-gray-600 mb-6">Start your career journey by exploring open positions.</p>
                    <Link to="/jobs" className="bg-[#4169E1] text-white px-6 py-2 rounded-lg hover:bg-[#3A5FCD]">
                        Browse Jobs
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {applications.map((app) => (
                        <div key={app._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition">
                            <div>
                                <h3 className="text-xl font-bold text-black mb-1">
                                    <Link to={`/job/${app.job?._id}`} className="hover:text-[#4169E1]">{app.job?.title || 'Job Unavailable'}</Link>
                                </h3>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                                    <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1" /> {app.job?.company || 'Unknown Company'}</span>
                                    <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {app.job?.location || 'Unknown Location'}</span>
                                    <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                                </div>
                                
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                {getStatusBadge(app.status)}
                                <Link to={`/job/${app.job?._id}`} className="text-[#4169E1] text-sm hover:underline">
                                    View Job Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};

export default MyApplications;
