import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MoreVertical, FileText, Check, X, Clock } from 'lucide-react';
import api from '../../api';

const JobApplications = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { data } = await api.get(`/applications/job/${jobId}`);
        setApplications(data);
        
        // Also fetch job details to display title
        const jobRes = await api.get(`/jobs/${jobId}`);
        setJobTitle(jobRes.data.title);
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch applications', error);
        setLoading(false);
      }
    };
    fetchApplications();
  }, [jobId]);

  const updateStatus = async (appId, newStatus) => {
      try {
          const { data } = await api.put(`/applications/${appId}/status`, { status: newStatus });
          setApplications(prev => prev.map(app => app._id === appId ? data : app));
      } catch (error) {
          console.error('Failed to update status', error);
      }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied': return 'bg-yellow-100 text-yellow-800';
      case 'Shortlisted': return 'bg-blue-100 text-blue-800';
      case 'Interviewed': return 'bg-purple-100 text-purple-800';
      case 'Hired': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const [selectedResume, setSelectedResume] = useState(null);

  const viewResume = (resumePath) => {
      // Normalize path (handle backslashes from Windows paths)
      const normalizedPath = resumePath.replace(/\\/g, '/');
      const fullUrl = normalizedPath.startsWith('http') 
          ? normalizedPath 
          : `${import.meta.env.VITE_API_URL.replace('/api', '')}/${normalizedPath}`;
      setSelectedResume(fullUrl);
  };

  if (loading) return <div className="p-12 text-center">Loading applications...</div>;

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
            <Link to="/employer/dashboard" className="text-gray-500 hover:text-[#4169E1] flex items-center mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-black">Applications for <span className="text-[#4169E1]">{jobTitle}</span></h1>
            <p className="text-gray-600">{applications.length} candidates found</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {applications.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No applications yet.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left p-6 font-semibold text-gray-600">Candidate</th>
                                <th className="text-left p-6 font-semibold text-gray-600">Applied Date</th>
                                <th className="text-left p-6 font-semibold text-gray-600">Resume</th>
                                <th className="text-left p-6 font-semibold text-gray-600">Status</th>
                                <th className="text-left p-6 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {applications.map((app) => (
                                <tr key={app._id} className="hover:bg-gray-50 transition">
                                    <td className="p-6">
                                        <div className="font-semibold text-black">{app.applicant.name}</div>
                                        <div className="text-sm text-gray-500">{app.applicant.email}</div>
                                    </td>
                                    <td className="p-6 text-gray-600">
                                        {new Date(app.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-6">
                                        <button 
                                            onClick={() => viewResume(app.resume)}
                                            className="text-[#4169E1] hover:underline flex items-center"
                                        >
                                            <FileText className="w-4 h-4 mr-1" /> View Resume
                                        </button>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <select 
                                            value={app.status}
                                            onChange={(e) => updateStatus(app._id, e.target.value)}
                                            className="bg-white border border-gray-200 rounded-lg px-3 py-1 text-sm outline-none focus:border-blue-500"
                                        >
                                            <option value="Applied">Applied</option>
                                            <option value="Shortlisted">Shortlisted</option>
                                            <option value="Interviewed">Interviewed</option>
                                            <option value="Hired">Hired</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </div>

      {/* Resume Modal */}
      {selectedResume && (
          <div 
              className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedResume(null)}
          >
              <div 
                  className="bg-white rounded-xl w-full max-w-4xl h-[80vh] flex flex-col relative animate-in fade-in zoom-in duration-200 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
              >
                  <div className="flex justify-between items-center p-4 border-b border-gray-100">
                      <h3 className="text-lg font-bold">Resume Viewer</h3>
                      <button onClick={() => setSelectedResume(null)} className="text-gray-500 hover:text-black">
                          <X className="w-6 h-6" />
                      </button>
                  </div>
                  <div className="flex-1 p-4 bg-gray-100">
                      <iframe 
                          src={selectedResume} 
                          className="w-full h-full rounded-lg border border-gray-200"
                          title="Resume"
                      />
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default JobApplications;
