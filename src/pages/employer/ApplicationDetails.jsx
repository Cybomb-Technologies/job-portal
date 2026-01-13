import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Calendar, Download, FileText, CheckCircle, XCircle } from 'lucide-react';
import api from '../../api';

const ApplicationDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchApplication = async () => {
            try {
                const { data } = await api.get(`/applications/${id}`);
                setApplication(data);
                
                // Auto-update status to "Resume Viewed" if it's currently "Applied"
                if (data.status === 'Applied') {
                    await api.put(`/applications/${id}/status`, { status: 'Resume Viewed' });
                    setApplication(prev => ({ ...prev, status: 'Resume Viewed' }));
                }
                
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to load application details');
                setLoading(false);
            }
        };
        fetchApplication();
    }, [id]);

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

    const getResumeUrl = (path) => {
        if (!path) return '';
        let normalizedPath = path.replace(/\\/g, '/');
        if (normalizedPath.startsWith('/')) {
            normalizedPath = normalizedPath.substring(1);
        }
        return normalizedPath.startsWith('http') 
            ? normalizedPath 
            : `${import.meta.env.VITE_API_URL.replace('/api', '')}/${normalizedPath}`;
    };

    const getProfilePictureUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        let normalizedPath = path.replace(/\\/g, '/');
        if (normalizedPath.startsWith('/')) {
            normalizedPath = normalizedPath.substring(1);
        }
        return `${import.meta.env.VITE_API_URL.replace('/api', '')}/${normalizedPath}`;
    };

    const updateStatus = async (newStatus) => {
        try {
            await api.put(`/applications/${id}/status`, { status: newStatus });
            setApplication(prev => ({ ...prev, status: newStatus }));
        } catch (e) {
            alert('Failed to update status');
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;
    if (!application) return <div className="text-center p-10">Application not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Back Link */}
                <div className="mb-6 flex justify-between items-center">
                    <Link to={`/employer/applications/${application.job._id}`} className="inline-flex items-center text-gray-500 hover:text-[#4169E1] transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Applications
                    </Link>
                </div>

                {/* Top Info Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6 border-b border-gray-100 pb-6">
                        <div className="flex items-center gap-4">
                             <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
                                {application.applicant.profilePicture ? (
                                    <img 
                                        src={getProfilePictureUrl(application.applicant.profilePicture)} 
                                        alt={application.applicant.name} 
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                    />
                                ) : null}
                                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-[#4169E1] font-bold text-2xl" style={{ display: application.applicant.profilePicture ? 'none' : 'flex' }}>
                                    {application.applicant.name.charAt(0)}
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-4 mb-2">
                                    <h1 className="text-3xl font-bold text-gray-900">{application.applicant.name}</h1>
                                    <Link 
                                        to={`/employer/candidates/${application.applicant._id}`}
                                        className="text-xs font-semibold text-[#4169E1] hover:underline bg-blue-50 px-3 py-1 rounded-full border border-blue-100 transition-colors"
                                    >
                                        View Public Profile
                                    </Link>
                                </div>
                                <p className="text-gray-600 mb-3">Applied for <span className="font-semibold text-[#4169E1]">{application.job.title}</span></p>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <Mail className="w-4 h-4 mr-1.5" />
                                        <a href={`mailto:${application.applicant.email}`} className="hover:text-[#4169E1] transition-colors">
                                            {application.applicant.email}
                                        </a>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-1.5" />
                                        <span>Applied on {new Date(application.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                            {/* Status Badge */}
                            <div className={`px-4 py-1.5 rounded-full font-bold text-sm border ${getStatusColor(application.status)}`}>
                                {application.status}
                            </div>
                            
                            {/* Status Action Dropdown */}
                            <div className="relative min-w-[200px]">
                                <select 
                                    value=""
                                    onChange={(e) => updateStatus(e.target.value)}
                                    className="w-full appearance-none pl-4 pr-10 py-2 rounded-lg text-sm font-bold border border-gray-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4169E1] focus:border-transparent bg-white text-gray-700 hover:border-[#4169E1] transition-all shadow-sm"
                                >
                                    <option value="" disabled>Move to...</option>
                                    <option value="Shortlisted">Mark as Shortlisted</option>
                                    <option value="Interviewed">Mark as Interviewed</option>
                                    <option value="Hired">Mark as Hired</option>
                                    <option value="Rejected">Mark as Rejected</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resume Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8 h-[800px] flex flex-col">
                    <div className="flex-1 bg-white relative">
                        <iframe 
                            src={`${getResumeUrl(application.resume)}#toolbar=0&navpanes=0&view=FitH`}
                            className="w-full h-full border-none bg-white"
                            title="Resume PDF"
                        />
                         <a 
                            href={getResumeUrl(application.resume)} 
                            download 
                            target="_blank"
                            rel="noreferrer"
                            className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-gray-700 hover:text-[#4169E1] p-2 rounded-full border border-gray-200 shadow-sm transition-all"
                            title="Download Resume"
                        >
                            <Download className="w-5 h-5" />
                        </a>
                    </div>
                </div>

                {/* Bottom Section: Cover Letter & Questions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {application.coverLetter && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Cover Letter</h2>
                            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed text-sm">
                                {application.coverLetter}
                            </p>
                        </div>
                    )}

                    {application.screeningAnswers && application.screeningAnswers.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Screening Questions</h2>
                            <div className="space-y-4">
                                {application.screeningAnswers.map((item, index) => (
                                    <div key={index} className="border-b border-gray-50 last:border-0 pb-3 last:pb-0">
                                        <p className="text-sm font-medium text-gray-700 mb-1">{item.question}</p>
                                        <p className="text-sm text-gray-800">{item.answer}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApplicationDetails;
