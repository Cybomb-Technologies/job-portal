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

const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} day${interval > 1 ? 's' : ''} ago`;
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} hour${interval > 1 ? 's' : ''} ago`;
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} minute${interval > 1 ? 's' : ''} ago`;
    return 'Just now';
};

const formatApplicants = (count) => {
    if (!count || count === 0) return '0';
    if (count < 5) return count.toString();
    const rounded = Math.floor(count / 5) * 5;
    return `${rounded}+`;
};

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedJobs, setRelatedJobs] = useState([]);
  
  // Application State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [resume, setResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState(null);

  // Profile Data for Resume Selection
  const [userResumes, setUserResumes] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Pre-screening Answers
  const [screeningAnswers, setScreeningAnswers] = useState({}); // { questionIndex: answer }
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);

  // Helper to determining if we skip screening
  const hasScreening = job?.preScreeningQuestions?.length > 0;
  
  // Reset step when modal closes
  useEffect(() => {
    if (!showApplyModal) setCurrentStep(1);
  }, [showApplyModal]);

  const handleNext = () => {
    if (currentStep === 1 && !resume) {
        setApplyError('Please select a resume to proceed.');
        return;
    }
    setApplyError(null);
    
    // Validate Screening Questions
    if (currentStep === 3 && hasScreening) {
        const totalQuestions = job.preScreeningQuestions.length;
        const answeredCount = Object.keys(screeningAnswers).length;
        // Check if all questions are answered and not empty
        let allAnswered = true;
        for(let i=0; i<totalQuestions; i++) {
            if(!screeningAnswers[i] || !screeningAnswers[i].trim()) {
                allAnswered = false;
                break;
            }
        }
        
        if (!allAnswered) {
             setApplyError('Please answer all pre-screening questions before proceeding.');
             return;
        }
    }

    // Skip screening step if no questions
    if (currentStep === 2 && !hasScreening) {
        setCurrentStep(4);
    } else {
        setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
      if (currentStep === 4 && !hasScreening) {
          setCurrentStep(2);
      } else {
          setCurrentStep(prev => prev - 1);
      }
  };

  const steps = [
      { num: 1, label: 'Resume' },
      { num: 2, label: 'Cover Letter' },
      ...(hasScreening ? [{ num: 3, label: 'Screening' }] : []),
      { num: 4, label: 'Review' }
  ];

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await api.get(`/jobs/${id}`);
        setJob(data);
        setLoading(false);

        // Fetch Related Jobs
        try {
            const relatedRes = await api.get(`/jobs/${id}/related`);
            setRelatedJobs(relatedRes.data);
        } catch (err) {
            console.error("Failed to fetch related jobs", err);
        }

      } catch (err) {
        setError('Job not found');
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  useEffect(() => {
      if (user && showApplyModal) {
          const fetchProfile = async () => {
              setLoadingProfile(true);
              try {
                  const { data } = await api.get('/auth/profile');
                  setUserResumes(data.resumes || []);
              } catch (err) {
                  console.error("Failed to fetch profile", err);
              } finally {
                  setLoadingProfile(false);
              }
          };
          fetchProfile();
      }
  }, [user, showApplyModal]);

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    setApplyError(null);

    try {
      if (!user) {
        navigate('/login');
        return;
      }

      // Validation
      if (!resume) {
          setApplyError('Please select a resume.');
          setApplying(false);
          return;
      }

      const answers = [];
      if (job.preScreeningQuestions?.length > 0) {
          for (let i = 0; i < job.preScreeningQuestions.length; i++) {
              if (!screeningAnswers[i] || !screeningAnswers[i].trim()) {
                  setApplyError('Please answer all pre-screening questions.');
                  setApplying(false);
                  return;
              }
              answers.push({
                  question: job.preScreeningQuestions[i],
                  answer: screeningAnswers[i]
              });
          }
      }

      const payload = {
          jobId: job._id,
          resume: resume, // This is now the URL string
          coverLetter: coverLetter,
          screeningAnswers: answers,
          agreedToTerms: agreedToTerms
      };

      await api.post('/applications', payload);

      setApplySuccess(true);
      setTimeout(() => {
        setShowApplyModal(false);
        setApplySuccess(false);
        setResume(null);
        setCoverLetter('');
        setScreeningAnswers({});
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
                  <div className="flex items-center text-lg text-black font-medium mb-4 group">
                    <Building className="w-5 h-5 mr-2 text-gray-400 group-hover:text-[#4169E1] transition-colors" />
                    <Link to={`/company/${job.postedBy?._id}`} className="hover:text-[#4169E1] hover:underline decoration-2 transition-all">
                      {job.company}
                    </Link>
                  </div>
                </div>
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm overflow-hidden shrink-0">
                  {job.postedBy?.profilePicture ? (
                    <img 
                      src={job.postedBy.profilePicture.startsWith('http') ? job.postedBy.profilePicture : `http://localhost:8000${job.postedBy.profilePicture}`} 
                      alt={job.company} 
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <Briefcase className="w-8 h-8 text-[#4169E1]" />
                  )}
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
                  <span>
                    {job.salaryType === 'Fixed' 
                        ? `Fixed: ${Number(job.salaryMin).toLocaleString()}` 
                        : job.salaryType === 'Starting From' 
                            ? `Starts from ${Number(job.salaryMin).toLocaleString()}` 
                            : `${Number(job.salaryMin).toLocaleString()} - ${Number(job.salaryMax).toLocaleString()}`
                    }
                    {job.salaryFrequency ? ` / ${job.salaryFrequency}` : ''}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-3" />
                  <span>{job.experienceMin} - {job.experienceMax} years</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-3" />
                  <span>{job.recruitmentDuration || 'Immediate'}</span>
                </div>
              </div>
              
              {/* Interview Details Section - Combined with Apply */}
              {(job.interviewTime?.trim() || job.interviewVenue?.trim() || job.interviewContact?.trim()) && (
                <div className="mb-6 p-5 bg-[#4169E1]/5 rounded-xl border border-[#4169E1]/10 animate-fadeIn">
                    <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-[#4169E1]" />
                        Interview Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {job.interviewTime && (
                            <div>
                                <div className="text-[11px] font-bold text-[#4169E1] uppercase tracking-wider mb-0.5">Time & Venue</div>
                                <div className="text-gray-600 text-sm font-medium">{job.interviewTime}</div>
                            </div>
                        )}
                        {job.interviewVenue && (
                            <div>
                                <div className="text-[11px] font-bold text-[#4169E1] uppercase tracking-wider mb-0.5">Venue</div>
                                <div className="text-gray-600 text-sm font-medium italic">{job.interviewVenue}</div>
                            </div>
                        )}
                        {job.interviewContact && (
                            <div className="md:col-span-2 pt-3 border-t border-gray-100">
                                <span className="text-[11px] font-bold text-[#4169E1] uppercase tracking-wider mr-2">Contact:</span>
                                <span className="text-gray-600 text-sm font-semibold">{job.interviewContact}</span>
                            </div>
                        )}
                    </div>
                </div>
              )}

              {user?.role === 'employer' ? (
                 <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-center font-medium">
                    You are viewing this as an Employer
                 </div>
              ) : (
                <button 
                  onClick={() => {
                    if (job.applyMethod === 'website' && job.applyUrl) {
                        window.open(job.applyUrl, '_blank');
                    } else {
                        setShowApplyModal(true);
                    }
                  }}
                  className="w-full py-3 bg-[#4169E1] text-white text-lg font-semibold rounded-lg hover:bg-[#3A5FCD]"
                >
                  {job.applyMethod === 'website' ? 'Apply on Company Website' : 'Apply Now'}
                </button>
              )}
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
              <h2 className="text-2xl font-bold text-black mb-6">Job Description</h2>
              <div 
                className="text-gray-700 mb-6 prose max-w-none font-sans break-words overflow-hidden"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
              
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
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-24">
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
                    <div>
                    <div className="text-sm text-gray-500 mb-1">Openings</div>
                    <div className="text-black font-semibold">{job.openings || 'Not specified'}</div>
                    </div>
                    <div>
                    <div className="text-sm text-gray-500 mb-1">Applicants</div>
                    <div className="text-[#4169E1] font-bold text-lg">{formatApplicants(job.applicantCount)}</div>
                    </div>
                    <div className="pt-2 border-t border-gray-100 mt-2">
                        <div className="text-[11px] text-gray-400 font-medium">
                            Posted: {timeAgo(job.createdAt)}
                        </div>
                    </div>
                </div>
                </div>

                {/* Related Jobs */}
                {relatedJobs.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-black mb-4">Related Jobs</h3>
                        <div className="space-y-4">
                            {relatedJobs.map(job => (
                                <Link to={`/job/${job._id}`} key={job._id} className="block group">
                                    <div className="p-3 border border-gray-100 rounded-lg hover:bg-blue-50/50 hover:border-blue-100 transition-all">
                                        <h4 className="font-bold text-gray-900 group-hover:text-[#4169E1] line-clamp-1">{job.title}</h4>
                                        <div className="text-sm text-gray-500 mb-2">{job.company}</div>
                                        <div className="flex items-center text-xs text-gray-400 gap-3">
                                            <span className="flex items-center"><MapPin className="w-3 h-3 mr-1"/> {job.location}</span>
                                            <span className="flex items-center"><Briefcase className="w-3 h-3 mr-1"/> {job.type}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>

        {/* Apply Modal */}
        {showApplyModal && (
            <div 
                className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={() => setShowApplyModal(false)}
            >
                <div 
                    className="bg-white rounded-2xl max-w-3xl w-full p-0 relative animate-in fade-in zoom-in duration-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    onClick={(e) => e.stopPropagation()}
                >
                     {/* Modal Header */}
                    <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Apply for {job.title}</h2>
                            <p className="text-sm text-gray-500 mt-1">Complete the steps below to submit your application.</p>
                        </div>
                        <button 
                            onClick={() => setShowApplyModal(false)}
                            className="text-gray-400 hover:text-black transition-colors bg-white p-2 rounded-full shadow-sm hover:shadow-md border border-gray-100"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {applySuccess ? (
                         <div className="p-12 text-center flex flex-col items-center justify-center flex-grow">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
                            <p className="text-gray-600 text-lg mb-6">Hello {user?.name}, your application has been sent to {job.company}.</p>
                            <button onClick={() => setShowApplyModal(false)} className="text-[#4169E1] font-medium hover:underline">Close Window</button>
                        </div>
                    ) : (
                        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                            {/* Stepper */}
                            <div className="px-8 py-6 bg-white shrink-0">
                                <div className="flex items-center justify-between relative">
                                    <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-100 -z-0 rounded-full"></div>
                                    <div className="absolute left-0 top-1/2 h-1 bg-[#4169E1] -z-0 rounded-full transition-all duration-300" 
                                        style={{ width: `${((currentStep - 1) / (hasScreening ? 3 : 2)) * 100}%` }}></div>
                                    
                                    {steps.map((step) => (
                                        <div key={step.num} className="flex flex-col items-center z-10 bg-white px-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                                                currentStep >= step.num 
                                                ? 'bg-[#4169E1] border-[#4169E1] text-white' 
                                                : 'bg-white border-gray-200 text-gray-400'
                                            }`}>
                                                {currentStep > step.num ? <CheckCircle className="w-5 h-5" /> : step.num}
                                            </div>
                                            <span className={`text-xs font-medium mt-2 ${currentStep >= step.num ? 'text-[#4169E1]' : 'text-gray-400'}`}>{step.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="px-8 py-4 overflow-y-auto flex-grow min-h-0">
                                {applyError && (
                                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-start animate-fadeIn">
                                        <div className="mr-2 mt-0.5">⚠️</div>
                                        {applyError}
                                    </div>
                                )}

                                {currentStep === 1 && (
                                    <div className="space-y-4 animate-fadeIn">
                                        <h3 className="text-lg font-bold text-gray-900">Select a Resume</h3>
                                        <p className="text-gray-500 text-sm mb-4">Choose the resume you want to submit for this application.</p>
                                        
                                        {loadingProfile ? (
                                            <div className="text-center py-8 text-gray-500">Loading your resumes...</div>
                                        ) : userResumes.length > 0 ? (
                                            <div className="grid gap-3">
                                                {userResumes.map((res, index) => (
                                                    <div 
                                                        key={index} 
                                                        className={`border-2 rounded-xl p-4 cursor-pointer transition-all flex items-center justify-between group ${resume === res.file ? 'border-[#4169E1] bg-blue-50/50' : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'}`} 
                                                        onClick={() => setResume(res.file)}
                                                    >
                                                        <div className="flex items-center overflow-hidden">
                                                            <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center flex-shrink-0 ${resume === res.file ? 'border-[#4169E1]' : 'border-gray-300'}`}>
                                                                {resume === res.file && <div className="w-2.5 h-2.5 rounded-full bg-[#4169E1]"></div>}
                                                            </div>
                                                            <div>
                                                                <div className={`font-semibold text-sm truncate ${resume === res.file ? 'text-[#4169E1]' : 'text-gray-800'}`}>{res.name}</div>
                                                                <div className="text-xs text-gray-500">Uploaded on {new Date().toLocaleDateString()}</div>
                                                            </div>
                                                        </div>
                                                        <a href={res.file} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#4169E1] p-2 bg-white rounded-lg border border-gray-100 shadow-sm" onClick={(e) => e.stopPropagation()}><FileText className="w-4 h-4" /></a>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                                <p className="text-gray-500 mb-2">No resumes found.</p>
                                                <Link to="/profile" className="text-[#4169E1] font-semibold hover:underline">Upload a resume in your profile</Link>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="space-y-4 animate-fadeIn">
                                        <h3 className="text-lg font-bold text-gray-900">Cover Letter</h3>
                                        <p className="text-gray-500 text-sm mb-4">Explain why you're a good fit for this role (Optional).</p>
                                        <textarea 
                                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4169E1] focus:border-transparent outline-none h-60 resize-none text-base bg-gray-50 focus:bg-white transition-colors"
                                            placeholder="Write your cover letter here..."
                                            value={coverLetter}
                                            onChange={(e) => setCoverLetter(e.target.value)}
                                        ></textarea>
                                    </div>
                                )}

                                {currentStep === 3 && hasScreening && (
                                    <div className="space-y-6 animate-fadeIn">
                                        <h3 className="text-lg font-bold text-gray-900">Screening Questions</h3>
                                        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl text-sm border border-yellow-100 mb-4">
                                            The employer has asked the following questions to screen candidates. Please answer truthfully.
                                        </div>
                                        <div className="space-y-5">
                                            {job.preScreeningQuestions.map((question, index) => (
                                                <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                    <label className="block text-sm font-bold text-gray-800 mb-2">{index + 1}. {question} <span className="text-red-500">*</span></label>
                                                    <input 
                                                        type="text" 
                                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4169E1] outline-none text-sm bg-white"
                                                        placeholder="Type your answer here..."
                                                        value={screeningAnswers[index] || ''}
                                                        onChange={(e) => setScreeningAnswers(prev => ({ ...prev, [index]: e.target.value }))}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {currentStep === 4 && (
                                    <div className="space-y-6 animate-fadeIn">
                                        <h3 className="text-lg font-bold text-gray-900">Review Application</h3>
                                        
                                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-4">
                                            <div className="flex items-start">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#4169E1] mr-3 mt-1"><FileText className="w-4 h-4" /></div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">Selected Resume</div>
                                                    <div className="text-sm text-gray-600">{userResumes.find(r => r.file === resume)?.name || 'Resume'}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-start">
                                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3 mt-1"><FileText className="w-4 h-4" /></div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">Cover Letter</div>
                                                    <div className="text-sm text-gray-600 line-clamp-2">{coverLetter ? 'Included' : 'Not Included'}</div>
                                                </div>
                                            </div>
                                            {hasScreening && (
                                                <div className="flex items-start">
                                                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mr-3 mt-1"><CheckCircle className="w-4 h-4" /></div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900">Screening Questions</div>
                                                        <div className="text-sm text-gray-600">{Object.keys(screeningAnswers).length} / {job.preScreeningQuestions.length} Answered</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div 
                                            className="flex items-center text-sm text-gray-600 bg-gray-50 p-4 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                                            onClick={() => setAgreedToTerms(!agreedToTerms)}
                                        >
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${agreedToTerms ? 'bg-[#4169E1] border-[#4169E1]' : 'bg-white border-gray-300'}`}>
                                                {agreedToTerms && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                            </div>
                                            <label className="cursor-pointer select-none font-medium">
                                                I agree to share my profile and provided information with {job.company}.
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Buttons */}
                            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between shrink-0 rounded-b-2xl">
                                {currentStep > 1 ? (
                                    <button 
                                        type="button" 
                                        onClick={handleBack}
                                        className="px-6 py-2.5 text-gray-600 font-semibold hover:bg-gray-200 rounded-xl transition-colors"
                                    >
                                        Back
                                    </button>
                                ) : (
                                    <div></div>
                                )}

                                {currentStep < 4 ? (
                                     <button 
                                        type="button" 
                                        onClick={handleNext}
                                        className="px-8 py-2.5 bg-[#4169E1] text-white font-bold rounded-xl hover:bg-[#3A5FCD] shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center"
                                    >
                                        Next Step <Users className="w-4 h-4 ml-2" />
                                    </button>
                                ) : (
                                    <button 
                                        type="button" 
                                        onClick={handleApply}
                                        disabled={applying || !agreedToTerms}
                                        className="px-10 py-2.5 bg-black text-white font-bold rounded-xl hover:bg-gray-800 shadow-xl transition-all active:scale-95 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {applying ? 'Submitting...' : 'Submit Application'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};

export default JobDetails;
