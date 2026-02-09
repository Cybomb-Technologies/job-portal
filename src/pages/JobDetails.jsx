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
  FileText,
  MessageCircle,
  Hourglass,
  Share2,
  Bookmark
} from 'lucide-react';
import api from '../api';
import { showWarning, showError, quickSuccess } from '../utils/sweetAlerts';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { generateSlug } from '../utils/slugify';

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

// Helper function to clean HTML content
const cleanHtmlContent = (html) => {
    if (!html) return '';
    
    // 1. First cleanup basic artifacts
    let cleaned = html
        .replace(/<wbr\s*\/?>/gi, '')
        .replace(/&shy;/gi, '')
        .replace(/\u00AD/g, '')
        .replace(/[\u200B\u200C\u200D\uFEFF\u2060]/g, '')
        .replace(/<p>\s*<\/p>/g, '') 
        .trim();

    // 2. Protect HTML tags from regex replacements
    const tags = [];
    const tagPlaceholder = '___HTML_TAG___';
    cleaned = cleaned.replace(/<[^>]+>/g, (match) => {
        tags.push(match);
        return tagPlaceholder;
    });

    // 3. Apply word text fixes
    // Normalize whitespace (including &nbsp; and newlines) to single space
    cleaned = cleaned.replace(/(&nbsp;|\s)+/g, ' ');

    cleaned = cleaned
        // Pass 1: Fix isolated single Consonant + word (e.g., "p ractical" -> "practical")
        // Safe because we exclude vowels (avoid "a lot", "I am")
        .replace(/\b([b-df-hj-np-tv-zB-DF-HJ-NP-TV-Z]) ([a-zA-Z]{2,})\b/g, '$1$2')
        
        // Pass 2: Fix Word + Specific Floating Fragments (e.g., "diag nostics", "al gorithms")
        // STRICT MATCH on the fragment part to avoid merging full words (e.g. "machine learning")
        .replace(/([a-zA-Z]{2,}) (tion|sion|ment|ance|ence|nostics|tics|tive|sive|lize|yse|yze|tical|rch|ghts|nsights|lts|ning|ding|ming|ting|ger|ler|est|ies|edge|gorithms|opment|uction|ysis|nologies|telligence|ers)\b/g, '$1$2')
        
        // Pass 3: Fix Word + Single Lowercase Letter Suffix (e.g., "analyz e" -> "analyze")
        // Restricting to lowercase avoids merging "Plan A", "part B"
        .replace(/([a-zA-Z]{2,}) ([a-z])(?=[.,!?;:\s]|$)/g, (match, p1, p2) => {
            // Exclude valid single-letter words 'a' and 'i'
            if (p2 === 'a' || p2 === 'i') return match; 
            return p1 + p2; // Merge others (e.g. "analyz e" -> "analyze")
        })
        
        // Clean up multiple spaces
        .replace(/ {2,}/g, ' ');

    // 4. Restore HTML tags
    let tagIndex = 0;
    while (cleaned.includes(tagPlaceholder) && tagIndex < tags.length) {
        cleaned = cleaned.replace(tagPlaceholder, tags[tagIndex]);
        tagIndex++;
    }

    return cleaned;
};

const JobDetails = () => {
  const { slug } = useParams(); // Changed id to slug
  const navigate = useNavigate();
  const { user } = useAuth();
  const { initiateChat } = useChat();
  
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
  const [followCompany, setFollowCompany] = useState(false);
  const [isAlreadyFollowing, setIsAlreadyFollowing] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);

  // Saved Job State
  const [isSaved, setIsSaved] = useState(false);
  const [savingJob, setSavingJob] = useState(false);

  // Helper to determining if we skip screening
  const hasScreening = job?.preScreeningQuestions?.length > 0;
  
  // Reset step when modal closes
  useEffect(() => {
    if (!showApplyModal) setCurrentStep(1);
  }, [showApplyModal]);

  const handleMessageEmployer = () => {
      if (!user) {
          navigate('/login');
          return;
      }
      
      // Enforce application requirement
      if (!job.hasApplied) {
          showWarning('Application Required', 'You must apply to this job before you can message the employer.').then((result) => {
              if (result.isConfirmed) {
                   if (job.applyMethod === 'website' && job.applyUrl) {
                        window.open(job.applyUrl, '_blank');
                    } else {
                        setShowApplyModal(true);
                    }
              }
          });
          return;
      }

      if (job && job.postedBy) {
          initiateChat(job.postedBy);
          navigate('/messages');
      } else {
          showError('Unavailable', 'Employer information is not available for this job.');
      }
  };

  const handleShareJob = () => {
      navigator.clipboard.writeText(window.location.href);
      quickSuccess('Link Copied!');
  };

  const handleSaveJob = async () => {
      if (!user) {
          navigate('/login');
          return;
      }
      if (!job?._id) return;
      
      setSavingJob(true);
      try {
          if (isSaved) {
              await api.delete(`/auth/jobs/${job._id}/unsave`);
              setIsSaved(false);
              quickSuccess('Job removed from saved!');
          } else {
              await api.post(`/auth/jobs/${job._id}/save`);
              setIsSaved(true);
              quickSuccess('Job saved!');
          }
      } catch (err) {
          console.error('Failed to save/unsave job', err);
          showError('Error', 'Failed to update saved status');
      } finally {
          setSavingJob(false);
      }
  };

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
      ...(hasScreening 
        ? [{ num: 3, label: 'Screening' }, { num: 4, label: 'Review' }] 
        : [{ num: 3, label: 'Review' }]
      )
  ];

  const displayStep = (!hasScreening && currentStep === 4) ? 3 : currentStep;

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        let jobData;
        if(slug){
            const { data } = await api.get(`/jobs/slug/${slug}`);
            jobData = data;
        } else {
            // Fallback
             setError('Invalida job URL');
             setLoading(false);
             return;
        }

        setJob(jobData);
        setLoading(false);

        // Fetch Related Jobs
        try {
            const relatedRes = await api.get(`/jobs/${jobData._id}/related`);
            setRelatedJobs(relatedRes.data);
        } catch (err) {
            console.error("Failed to fetch related jobs", err);
        }

      } catch (err) {
        setError('Job not found');
        setLoading(false);
      }
    };
    if(slug) fetchJob();
  }, [slug, user?._id]);

  // Check if job is saved
  useEffect(() => {
      const checkSavedStatus = async () => {
          if (user && job?._id) {
              try {
                  const { data } = await api.get('/auth/saved-jobs');
                  const savedIds = data.map(j => j._id);
                  setIsSaved(savedIds.includes(job._id));
              } catch (err) {
                  console.error('Failed to check saved status', err);
              }
          }
      };
      checkSavedStatus();
  }, [user, job?._id]);

  useEffect(() => {
      if (user && showApplyModal) {
          const fetchProfile = async () => {
              setLoadingProfile(true);
              try {
                  const { data } = await api.get('/auth/profile');
                  setUserResumes(data.resumes || []);

                  // Check if already following
                  if (job) {
                      // Helper to safely get string ID
                      const getId = (item) => {
                          if (!item) return null;
                          if (typeof item === 'string') return item;
                          return item._id;
                      };

                      const targetId = getId(job.companyId) || getId(job.postedBy);
                      
                      if (targetId) {
                          const isFollowed = data.following?.some(f => getId(f) === targetId) || 
                                           data.followingCompanies?.some(fc => getId(fc) === targetId);
                          
                          setIsAlreadyFollowing(!!isFollowed);
                          
                          if (!!isFollowed) {
                              setFollowCompany(true);
                          }
                      }
                  }
              } catch (err) {
                  console.error("Failed to fetch profile", err);
              } finally {
                  setLoadingProfile(false);
              }
          };
          fetchProfile();
      }
  }, [user, showApplyModal, job]);

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

      if (followCompany) {
          try {
             // Prioritize companyId, fallback to postedBy ID if legacy
             const targetId = job.companyId || job.postedBy?._id;
             if (targetId) {
                 await api.post(`/auth/follow/${targetId}`);
             }
          } catch (e) {
             console.error("Failed to auto-follow company", e);
             // Fail silently so we don't disrupt the application success flow
          }
      }

      setApplySuccess(true);
      setJob(prev => ({ ...prev, hasApplied: true })); // Update local state immediately
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
    <div className="min-h-screen bg-slate-50 py-12 relative">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="mb-8 animate-fadeIn">
          <ol className="flex items-center space-x-2 text-sm text-slate-500 font-medium">
            <li><Link to="/" className="hover:text-blue-600 transition-colors">Home</Link></li>
            <li>/</li>
            <li><Link to="/jobs" className="hover:text-blue-600 transition-colors">Jobs</Link></li>
            <li>/</li>
            <li className="text-slate-800">{job.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Header */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 md:p-10 relative overflow-hidden group">
              <div className="flex justify-start items-start mb-8 relative z-10">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm p-4 mr-6 shrink-0">
                  {job.postedBy?.profilePicture ? (
                    <img 
                      src={job.postedBy.profilePicture.startsWith('http') ? job.postedBy.profilePicture : `${import.meta.env.VITE_SERVER_URL}${job.postedBy.profilePicture}`} 
                      alt={job.company} 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Briefcase className="w-10 h-10 text-blue-600" />
                  )}
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 font-display tracking-tight">{job.title}</h1>
                  <div className="flex items-center text-lg text-slate-600 font-medium mb-4 group/company">
                    {(job.postedBy?._id || job.companyId) ? (
                        <Link to={`/company/${generateSlug(job.company, job.postedBy?._id || job.companyId)}`} className="hover:text-blue-600 transition-all">
                        {job.company}
                        </Link>
                    ) : (
                        <span>{job.company}</span>
                    )}
                  </div>
                </div>

                {/* Share and Save Buttons (Top Right) */}
                <div className="ml-auto flex items-center gap-2">
                    <button 
                        onClick={handleSaveJob}
                        disabled={savingJob}
                        className={`p-3 rounded-xl border shadow-sm hover:shadow-md transition-all group/save ${isSaved ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-100 text-slate-400 hover:text-blue-600'}`}
                        title={isSaved ? 'Unsave Job' : 'Save Job'}
                    >
                        <Bookmark className={`w-5 h-5 group-hover/save:scale-110 transition-transform ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                    <button 
                        onClick={handleShareJob}
                        className="p-3 bg-white text-slate-400 hover:text-blue-600 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group/share"
                        title="Share Job"
                    >
                        <Share2 className="w-5 h-5 group-hover/share:scale-110 transition-transform" />
                    </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mb-8 relative z-10">
                <div className="flex items-center text-slate-600">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mr-3 shrink-0">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium">{job.location}</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center mr-3 shrink-0">
                    <Briefcase className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="font-medium">{job.type}</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center mr-3 shrink-0">
                    <IndianRupee className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="font-medium font-display">
                    {job.salaryType === 'Fixed' 
                        ? `Fixed: ${Number(job.salaryMin).toLocaleString()}` 
                        : job.salaryType === 'Starting From' 
                            ? `Starts from ${Number(job.salaryMin).toLocaleString()}` 
                            : `${Number(job.salaryMin).toLocaleString()} - ${Number(job.salaryMax).toLocaleString()}`
                    } / {job.salaryFrequency}
                  </span>
                </div>
                <div className="flex items-center text-slate-600">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center mr-3 shrink-0">
                    <Clock className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="font-medium">{job.experienceMin} - {job.experienceMax} years</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center mr-3 shrink-0">
                    <Hourglass className="w-4 h-4 text-pink-600" />
                  </div>
                  <span className="font-medium">{job.recruitmentDuration}</span>
                </div>
              </div>
              
              {/* Interview Details Section - Combined with Apply */}
              {(job.interviewTime?.trim() || job.interviewVenue?.trim() || job.interviewContact?.trim()) && (
                <div className="mb-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50 relative z-10">
                    <h3 className="text-sm font-bold text-blue-900 mb-4 flex items-center uppercase tracking-wider">
                        <Clock className="w-4 h-4 mr-2 text-blue-600" />
                        Interview Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {job.interviewTime && (
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Time & Venue</div>
                                <div className="text-slate-700 font-semibold">{job.interviewTime}</div>
                            </div>
                        )}
                        {job.interviewVenue && (
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Venue</div>
                                <div className="text-slate-700 font-medium italic">{job.interviewVenue}</div>
                            </div>
                        )}
                        {job.interviewContact && (
                            <div className="md:col-span-2 pt-4 border-t border-blue-100">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Contact:</span>
                                <span className="text-slate-900 font-bold">{job.interviewContact}</span>
                            </div>
                        )}
                    </div>
                </div>
              )}

              <div className="relative z-10">
                  {user?.role === 'employer' ? (
                     <div className="bg-slate-100 text-slate-600 p-4 rounded-xl text-center font-bold border border-slate-200">
                        Preview Mode (Employer View)
                     </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                        {job.hasApplied ? (
                            <button 
                                disabled
                                className="w-full py-4 bg-green-600 text-white text-lg font-bold rounded-xl shadow-md cursor-not-allowed flex items-center justify-center gap-2 opacity-90"
                            >
                                <CheckCircle className="w-6 h-6" />
                                Applied
                            </button>
                        ) : (
                            <button 
                              onClick={() => {
                                if (job.applyMethod === 'website' && job.applyUrl) {
                                    window.open(job.applyUrl, '_blank');
                                } else {
                                    setShowApplyModal(true);
                                }
                              }}
                              className="w-full py-4 bg-blue-600 text-white text-lg font-bold rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-200 hover:shadow-2xl hover:shadow-blue-300 hover:-translate-y-0.5 transition-all duration-300"
                            >
                              {job.applyMethod === 'website' ? 'Apply on Company Website' : 'Apply Now'}
                            </button>
                        )}
                        <button 
                            onClick={handleMessageEmployer}
                            className="w-full py-3 bg-white text-blue-600 text-lg font-bold rounded-xl border-2 border-blue-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Message Employer
                        </button>
                    </div>
                  )}
              </div>
              
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-20 -mt-20 -z-0"></div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 md:p-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 font-display">Job Description</h2>


              <div 
                className="job-description-text text-slate-700 mb-8 text-lg leading-relaxed font-sans w-full"
                dangerouslySetInnerHTML={{ 
                  __html: cleanHtmlContent(job.description)
                }}
              />
              
              <div className="border-t border-gray-100 my-8"></div>

              <h3 className="text-lg font-bold text-slate-900 mb-4 font-display">Required Skills</h3>
              <div className="flex flex-wrap gap-2 mb-8">
                {job.skills?.map((skill, index) => (
                  <span key={index} className="bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold hover:border-blue-200 hover:text-blue-600 transition-colors cursor-default">
                    {skill}
                  </span>
                ))}
              </div>

              {job.benefits && job.benefits.length > 0 && (
                  <>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-gray-100 mb-4 font-display">Benefits & Perks</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {job.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center text-slate-600 dark:text-gray-300 bg-green-50/50 dark:bg-green-900/20 p-3 rounded-xl border border-green-100 dark:border-green-800/30">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-3 shrink-0" />
                            <span className="font-medium">{benefit}</span>
                        </li>
                        ))}
                    </ul>
                  </>
              )}
            </div>

            {/* About Company */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 md:p-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 font-display">About {job.company}</h2>
              <p className="text-slate-600 leading-relaxed text-lg">{job.companyDescription || 'No description available.'}</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-24">
                {/* Quick Stats */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-6 font-display">Job Overview</h3>
                <div className="space-y-6">
                    <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Posted Date</div>
                    <div className="flex items-center text-slate-900 font-semibold">
                        <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                        {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                    </div>
                    <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Job Type</div>
                    <div className="text-slate-900 font-semibold">{job.type}</div>
                    </div>
                    <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Experience</div>
                    <div className="text-slate-900 font-semibold">{job.experienceMin} - {job.experienceMax} years</div>
                    </div>
                    <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Role</div>
                    <div className="text-slate-900 font-semibold">{job.jobRole || 'Not specified'}</div>
                    </div>
                    <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Openings</div>
                    <div className="text-slate-900 font-semibold">{job.openings || 'Not specified'}</div>
                    </div>
                    <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Applicants</div>
                    <div className="text-blue-600 font-extrabold text-2xl font-display">{formatApplicants(job.applicantCount)}</div>
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Posted {timeAgo(job.createdAt)}
                        </div>
                    </div>
                </div>
                </div>

                {/* Related Jobs */}
                {relatedJobs.length > 0 && (
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 font-display">Related Jobs</h3>
                        <div className="space-y-4">
                            {relatedJobs.map(job => (
                                <Link to={`/job/${generateSlug(job.title, job._id)}`} key={job._id} className="block group">
                                    <div className="p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-100 dark:hover:border-blue-500/30 transition-all duration-200">
                                        <h4 className="font-bold text-slate-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1 mb-1">{job.title}</h4>
                                        <div className="text-sm text-slate-500 dark:text-gray-400 font-medium mb-2">{job.company}</div>
                                        <div className="flex items-center text-xs text-slate-400 dark:text-gray-500 gap-3 font-semibold">
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
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={() => setShowApplyModal(false)}
            >
                <div 
                    className="bg-white rounded-[2rem] max-w-3xl w-full p-0 relative animate-in fade-in zoom-in duration-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    onClick={(e) => e.stopPropagation()}
                >
                     {/* Modal Header */}
                    <div className="px-5 md:px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 font-display">Apply for {job.title}</h2>
                            <p className="text-sm text-slate-500 mt-1 font-medium">Step {displayStep} of {steps.length}: {steps.find(s=>s.num===displayStep)?.label}</p>
                        </div>
                        <button 
                            onClick={() => setShowApplyModal(false)}
                            className="text-slate-400 hover:text-slate-900 transition-colors bg-white p-2 rounded-full shadow-sm hover:shadow-md border border-gray-100"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {applySuccess ? (
                         <div className="p-16 text-center flex flex-col items-center justify-center flex-grow">
                            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8 animate-[scaleIn_0.5s_ease-out]">
                                <CheckCircle className="w-12 h-12 text-green-500" />
                            </div>
                            <h3 className="text-3xl font-extrabold text-slate-900 mb-4 font-display">Application Sent!</h3>
                            <p className="text-slate-500 text-lg mb-8 max-w-sm mx-auto">Founders at <span className="font-bold text-slate-900">{job.company}</span> have received your application. Good luck!</p>
                            <button onClick={() => setShowApplyModal(false)} className="text-blue-600 font-bold hover:text-blue-700 hover:underline">Return to Job</button>
                        </div>
                    ) : (
                        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                            {/* Stepper */}
                            <div className="px-5 md:px-8 py-4 bg-white shrink-0 border-b border-gray-50">
                                <div className="flex items-center justify-between relative max-w-md mx-auto">
                                    <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-100 -z-0 rounded-full"></div>
                                    <div className="absolute left-0 top-1/2 h-1 bg-blue-600 -z-0 rounded-full transition-all duration-500 ease-out" 
                                        style={{ width: `${((displayStep - 1) / (steps.length - 1)) * 100}%` }}></div>
                                    
                                    {steps.map((step) => (
                                        <div key={step.num} className="flex flex-col items-center z-10 bg-white px-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                                                displayStep >= step.num 
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' 
                                                : 'bg-white border-gray-200 text-gray-300'
                                            }`}>
                                                {displayStep > step.num ? <CheckCircle className="w-5 h-5" /> : step.num}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="px-5 md:px-8 py-6 overflow-y-auto flex-grow min-h-0">
                                {applyError && (
                                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-start animate-fadeIn border border-red-100 font-medium">
                                        <div className="mr-3 text-lg">⚠️</div>
                                        {applyError}
                                    </div>
                                )}

                                {currentStep === 1 && (
                                    <div className="space-y-6 animate-fadeIn">
                                        <div className="text-center mb-6">
                                            <h3 className="text-xl font-bold text-slate-900 font-display">Select a Resume</h3>
                                            <p className="text-slate-500 font-medium">Choose from your profile to apply quickly.</p>
                                        </div>
                                        
                                        {loadingProfile ? (
                                            <div className="text-center py-12">
                                                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                                <p className="text-slate-400 font-medium">Loading resumes...</p>
                                            </div>
                                        ) : userResumes.length > 0 ? (
                                            <div className="grid gap-4">
                                                {userResumes.map((res, index) => (
                                                    <div 
                                                        key={index} 
                                                        className={`border-2 rounded-2xl p-5 cursor-pointer transition-all flex items-center justify-between group ${resume === res.file ? 'border-blue-600 bg-blue-50/30 ring-4 ring-blue-50' : 'border-gray-100 hover:border-blue-200 hover:bg-slate-50'}`} 
                                                        onClick={() => setResume(res.file)}
                                                    >
                                                        <div className="flex items-center overflow-hidden">
                                                            <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center flex-shrink-0 transition-colors ${resume === res.file ? 'border-blue-600' : 'border-gray-300'}`}>
                                                                {resume === res.file && <div className="w-3 h-3 rounded-full bg-blue-600"></div>}
                                                            </div>
                                                            <div>
                                                                <div className={`font-bold text-base truncate ${resume === res.file ? 'text-blue-700' : 'text-slate-700'}`}>{res.name}</div>
                                                                <div className="text-xs text-slate-400 font-semibold mt-1">Uploaded {new Date().toLocaleDateString()}</div>
                                                            </div>
                                                        </div>
                                                        <a href={res.file} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 p-2 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all" onClick={(e) => e.stopPropagation()}><FileText className="w-5 h-5" /></a>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                                <p className="text-slate-500 font-medium mb-4">No resumes found in your profile.</p>
                                                <Link to="/profile" className="px-6 py-2 bg-white border border-gray-200 text-slate-700 font-bold rounded-xl hover:border-blue-300 hover:text-blue-600 transition-colors shadow-sm">Upload Resume</Link>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="space-y-6 animate-fadeIn">
                                        <div className="text-center mb-6">
                                            <h3 className="text-xl font-bold text-slate-900 font-display">Cover Letter</h3>
                                            <p className="text-slate-500 font-medium">Why are you a great fit? (Optional)</p>
                                        </div>
                                        <textarea 
                                            className="w-full p-5 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none h-64 resize-none text-base bg-white transition-all text-slate-700 placeholder-slate-400 font-medium"
                                            placeholder="Dear Hiring Manager..."
                                            value={coverLetter}
                                            onChange={(e) => setCoverLetter(e.target.value)}
                                        ></textarea>
                                    </div>
                                )}

                                {currentStep === 3 && hasScreening && (
                                    <div className="space-y-8 animate-fadeIn">
                                        <div className="text-center">
                                            <h3 className="text-xl font-bold text-slate-900 font-display">Screening Questions</h3>
                                            <p className="text-slate-500 font-medium">Please answer the following questions from the employer.</p>
                                        </div>

                                        <div className="space-y-6">
                                            {job.preScreeningQuestions.map((question, index) => (
                                                <div key={index} className="space-y-3">
                                                    <label className="block text-sm font-bold text-slate-700">{index + 1}. {question} <span className="text-red-500">*</span></label>
                                                    <input 
                                                        type="text" 
                                                        className="w-full px-5 py-3 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none font-medium text-slate-800 transition-all"
                                                        placeholder="Your answer..."
                                                        value={screeningAnswers[index] || ''}
                                                        onChange={(e) => setScreeningAnswers(prev => ({ ...prev, [index]: e.target.value }))}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {currentStep === 4 && (
                                    <div className="space-y-8 animate-fadeIn">
                                        <div className="text-center">
                                            <h3 className="text-xl font-bold text-slate-900 font-display">Review Application</h3>
                                            <p className="text-slate-500 font-medium">Ready to submit? Check everything one last time.</p>
                                        </div>
                                        
                                        <div className="bg-slate-50 rounded-2xl p-6 border border-gray-200 space-y-6">
                                            <div className="flex items-start">
                                                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 mr-4 shrink-0"><FileText className="w-5 h-5" /></div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Resume</div>
                                                    <div className="text-slate-900 font-bold">{userResumes.find(r => r.file === resume)?.name || 'Selected Resume'}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-start">
                                                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 mr-4 shrink-0"><FileText className="w-5 h-5" /></div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cover Letter</div>
                                                    <div className="text-slate-900 font-medium">{coverLetter ? 'Included' : 'Not Included'}</div>
                                                </div>
                                            </div>
                                            {hasScreening && (
                                                <div className="flex items-start">
                                                    <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600 mr-4 shrink-0"><CheckCircle className="w-5 h-5" /></div>
                                                    <div>
                                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Screening Questions</div>
                                                        <div className="text-slate-900 font-bold">{Object.keys(screeningAnswers).length} / {job.preScreeningQuestions.length} Answered</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {!isAlreadyFollowing && (
                                            <div 
                                                className="flex items-center bg-white border-2 border-gray-100 p-4 rounded-xl cursor-pointer hover:border-blue-200 transition-all group mb-3"
                                                onClick={() => setFollowCompany(!followCompany)}
                                            >
                                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center mr-4 transition-all ${followCompany ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300 group-hover:border-blue-400'}`}>
                                                    {followCompany && <CheckCircle className="w-4 h-4 text-white" />}
                                                </div>
                                                <label className="cursor-pointer select-none font-medium text-slate-600 text-sm">
                                                    Follow <span className="text-slate-900 font-bold">{job.company}</span> for future job updates.
                                                </label>
                                            </div>
                                        )}

                                        <div 
                                            className="flex items-center bg-white border-2 border-gray-100 p-4 rounded-xl cursor-pointer hover:border-blue-200 transition-all group"
                                            onClick={() => setAgreedToTerms(!agreedToTerms)}
                                        >
                                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center mr-4 transition-all ${agreedToTerms ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300 group-hover:border-blue-400'}`}>
                                                {agreedToTerms && <CheckCircle className="w-4 h-4 text-white" />}
                                            </div>
                                            <label className="cursor-pointer select-none font-medium text-slate-600 text-sm">
                                                I authorize <span className="text-slate-900 font-bold">{job.company}</span> to view my profile and contact details.
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Buttons */}
                            <div className="p-6 border-t border-gray-100 bg-gray-50/80 backdrop-blur-sm flex justify-between shrink-0 rounded-b-[2rem]">
                                {currentStep > 1 ? (
                                    <button 
                                        type="button" 
                                        onClick={handleBack}
                                        className="px-6 py-3 text-slate-500 font-bold hover:text-slate-800 hover:bg-white rounded-xl transition-all"
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
                                        className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all active:scale-95 flex items-center"
                                    >
                                        Next Step <Users className="w-4 h-4 ml-2" />
                                    </button>
                                ) : (
                                    <button 
                                        type="button" 
                                        onClick={handleApply}
                                        disabled={applying || !agreedToTerms}
                                        className="px-10 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black shadow-xl transition-all active:scale-95 flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
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
