import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Briefcase, 
  IndianRupee, 
  Clock, 
  Globe,
  Building,
  Users,
  Calendar,
  X,
  CheckCircle,
  FileText
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Application State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [resume, setResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await api.get(`/jobs/${id}`);
        setJob(data);
        setLoading(false);
      } catch (err) {
        setError('Job not found');
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    setApplyError(null);

    try {
      if (!user) {
        navigate('/login');
        return;
      }

      const formData = new FormData();
      formData.append('jobId', job._id);
      formData.append('resume', resume);
      formData.append('coverLetter', coverLetter);

      await api.post('/applications', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
      });

      setApplySuccess(true);
      setTimeout(() => {
        setShowApplyModal(false);
        setApplySuccess(false);
        setResume('');
        setCoverLetter('');
      }, 2000);
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error || !job) return <div className="flex justify-center items-center h-screen text-red-500">{error || 'Job not found'}</div>;

  return (
    <div className="py-12 relative">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li><Link to="/" className="hover:text-[#4169E1]">Home</Link></li>
            <li>/</li>
            <li><Link to="/jobs" className="hover:text-[#4169E1]">Jobs</Link></li>
            <li>/</li>
            <li className="text-black font-medium">{job.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Job Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-black mb-2">{job.title}</h1>
                  <div className="flex items-center text-lg text-black font-medium mb-4">
                    <Building className="w-5 h-5 mr-2" />
                    {job.company}
                  </div>
                </div>
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-[#4169E1]" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-3" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Briefcase className="w-5 h-5 mr-3" />
                  <span>{job.type}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <IndianRupee className="w-5 h-5 mr-3" />
                  <span>{job.salaryMin} - {job.salaryMax}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-3" />
                  <span>{job.experienceMin} - {job.experienceMax} years</span>
                </div>
              </div>

              {user?.role === 'employer' ? (
                 <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-center font-medium">
                    You are viewing this as an Employer
                 </div>
              ) : (
                <button 
                  onClick={() => setShowApplyModal(true)}
                  className="w-full py-3 bg-[#4169E1] text-white text-lg font-semibold rounded-lg hover:bg-[#3A5FCD]"
                >
                  Apply Now
                </button>
              )}
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
              <h2 className="text-2xl font-bold text-black mb-6">Job Description</h2>
              <p className="text-gray-700 mb-6 whitespace-pre-line">{job.description}</p>
              
              <h3 className="text-xl font-semibold text-black mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2 mb-8">
                {job.skills?.map((skill, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>

              <h3 className="text-xl font-semibold text-black mb-4">Benefits</h3>
              <ul className="space-y-2">
                {job.benefits?.map((benefit, index) => (
                  <li key={index} className="flex items-start text-gray-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            {/* About Company */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-black mb-6">About the Company</h2>
              <p className="text-gray-700 mb-6">{job.companyDescription || 'No description available.'}</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Job Overview</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Posted Date</div>
                  <div className="flex items-center text-black">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Job Type</div>
                  <div className="text-black">{job.type}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Experience</div>
                  <div className="text-black">{job.experienceMin} - {job.experienceMax} years</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Role</div>
                  <div className="text-black">{job.jobRole || 'Not specified'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Apply Modal */}
        {showApplyModal && (
            <div 
                className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={() => setShowApplyModal(false)}
            >
                <div 
                    className="bg-white rounded-xl max-w-lg w-full p-6 relative animate-in fade-in zoom-in duration-200 shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button 
                        onClick={() => setShowApplyModal(false)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <h2 className="text-2xl font-bold mb-6">Apply for {job.title}</h2>
                    
                    {applySuccess ? (
                        <div className="text-center py-8">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-green-600 mb-2">Application Submitted!</h3>
                            <p className="text-gray-600 text-lg mb-2">Hello {user?.name},</p>
                            <p className="text-gray-600">Thanks for applying! The employer will review your application shortly.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleApply}>
                            {applyError && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                                    {applyError}
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-2">Resume (PDF/DOC)</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                    <input 
                                        type="file" 
                                        required
                                        accept=".pdf,.doc,.docx"
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169E1] focus:border-transparent outline-none"
                                        onChange={(e) => setResume(e.target.files[0])}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Upload your resume. Max size 5MB.</p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 font-medium mb-2">Cover Letter (Optional)</label>
                                <textarea 
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169E1] focus:border-transparent outline-none h-32 resize-none"
                                    placeholder="Explain why you are a good fit for this role..."
                                    value={coverLetter}
                                    onChange={(e) => setCoverLetter(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button 
                                    type="button"
                                    onClick={() => setShowApplyModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={applying}
                                    className="px-6 py-2 bg-[#4169E1] text-white rounded-lg font-medium hover:bg-[#3A5FCD] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {applying ? 'Submitting...' : 'Submit Application'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};

export default JobDetails;
