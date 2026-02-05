import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, MapPin, Briefcase, Calendar, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';
import api from '../../api';
import { generateSlug } from '../../utils/slugify';

const AppliedJobs = () => {
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
      case 'Shortlisted': return <span className="flex items-center text-blue-600 bg-blue-100 px-3 py-1 rounded-full text-xs font-semibold"><Briefcase className="w-3 h-3 mr-1"/> Shortlisted</span>;
      case 'Interviewed': return <span className="flex items-center text-purple-600 bg-purple-100 px-3 py-1 rounded-full text-xs font-semibold"><Calendar className="w-3 h-3 mr-1"/> Interviewed</span>;
      case 'Hired': return <span className="flex items-center text-green-600 bg-green-100 px-3 py-1 rounded-full text-xs font-semibold"><CheckCircle className="w-3 h-3 mr-1"/> Hired</span>;
      case 'Rejected': return <span className="flex items-center text-red-600 bg-red-100 px-3 py-1 rounded-full text-xs font-semibold"><XCircle className="w-3 h-3 mr-1"/> Rejected</span>;
      default: return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  if (loading) return <div className="p-10 text-center">Loading your applications...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 min-h-[500px]">
        <h2 className="text-xl font-bold text-black mb-6">Applied Jobs</h2>

        {applications.length === 0 ? (
            <div className="text-center py-12">
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
                    <div key={app._id} className="p-4 rounded-lg border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-black mb-1">
                                <Link to={`/job/${app.job ? generateSlug(app.job.title, app.job._id) : '#'}`} className="hover:text-[#4169E1]">{app.job?.title || 'Job Unavailable'}</Link>
                            </h3>
                            <div className="flex flex-wrap gap-4 text-xs text-gray-600 mb-2">
                                <span className="flex items-center"><Briefcase className="w-3 h-3 mr-1" /> {app.job?.company || 'Unknown Company'}</span>
                                <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {app.job?.location || 'Unknown Location'}</span>
                            </div>
                            <div className="text-xs text-gray-400">
                                Applied: {new Date(app.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(app.status)}
                            <Link to={`/job/${app.job ? generateSlug(app.job.title, app.job._id) : '#'}`} className="text-[#4169E1] text-xs hover:underline font-medium">
                                View Job
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default AppliedJobs;
