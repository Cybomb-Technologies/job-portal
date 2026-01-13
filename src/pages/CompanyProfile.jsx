import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    Building2, MapPin, Mail, Globe, ArrowLeft, Briefcase, 
    CheckCircle, Users, Calendar, Search, Filter, 
    Star, MessageSquare, ChevronRight, Share2, Plus, Sparkles, ExternalLink,
    PlayCircle, Video, FileText
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { X, Send, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const ReviewCard = ({ review, isOwner, onUpdate }) => {
    const handleToggleVisibility = async () => {
        try {
            await api.patch(`/reviews/${review._id}/visibility`);
            onUpdate();
        } catch (err) {
            console.error('Failed to toggle visibility:', err);
        }
    };

    return (
        <div className={`p-6 rounded-2xl border transition-all ${review.isHidden ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-100 shadow-sm'}`}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden border border-blue-100">
                        {review.reviewerType === 'Employee' ? (
                            <ShieldCheck className="w-6 h-6 text-[#4169E1]" />
                        ) : review.reviewer?.profilePicture ? (
                            <img src={review.reviewer.profilePicture.startsWith('http') ? review.reviewer.profilePicture : `http://localhost:8000${review.reviewer.profilePicture}`} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <Users className="w-6 h-6 text-gray-400" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900">
                                {review.reviewerType === 'Employee' 
                                    ? (isOwner && review.reviewer?.name 
                                        ? `${review.reviewer.name} (${review.role})` 
                                        : `${review.role} - ${review.department}`)
                                    : (review.reviewer?.name || 'Anonymous User')}
                            </h4>
                            {review.reviewerType === 'Employee' && (
                                <span className="px-2 py-0.5 bg-blue-100 text-[#4169E1] text-[10px] font-bold rounded uppercase tracking-wider">Verified Employee</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} className={`w-3 h-3 ${i <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                                ))}
                            </div>
                            <span className="text-xs text-gray-400 font-medium">
                                {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>
                {isOwner && (
                    <button 
                        onClick={handleToggleVisibility}
                        className={`p-2 rounded-lg transition-colors ${review.isHidden ? 'bg-blue-50 text-[#4169E1]' : 'hover:bg-gray-50 text-gray-400'}`}
                        title={review.isHidden ? 'Show Review' : 'Hide Review'}
                    >
                        {review.isHidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                )}
            </div>
            <p className="text-gray-600 leading-relaxed font-medium">
                {review.comment}
            </p>
            {review.isHidden && (
                <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <EyeOff className="w-3 h-3" />
                    Hidden from public view
                </div>
            )}
        </div>
    );
};

const ReviewModal = ({ isOpen, onClose, companyId, companyName, onSuccess }) => {
    const [step, setStep] = useState(1); // 1: Choose type, 2: Form
    const [reviewType, setReviewType] = useState('Public');
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [role, setRole] = useState('');
    const [department, setDepartment] = useState('');
    const [employeeEmail, setEmployeeEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await api.post('/reviews', {
                companyId,
                rating,
                comment,
                reviewerType: reviewType,
                role: reviewType === 'Employee' ? role : undefined,
                department: reviewType === 'Employee' ? department : undefined,
                employeeEmail: reviewType === 'Employee' ? employeeEmail : undefined
            });
            setSubmitted(true);
            if (reviewType === 'Public') {
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 2000);
            }
        } catch (err) {
            console.error('Review submission failed:', err);
            alert(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-xl font-bold text-gray-900">Write a Review for {companyName}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-8">
                    {submitted ? (
                        <div className="text-center py-10">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </div>
                            <h4 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h4>
                            <p className="text-gray-500 font-medium leading-relaxed">
                                {reviewType === 'Employee' 
                                    ? "We've sent a verification link to your workplace email. Your review will be published once verified."
                                    : "Your review has been published successfully."}
                            </p>
                            <button 
                                onClick={onClose}
                                className="mt-8 px-8 py-3 bg-[#4169E1] text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md"
                            >
                                Close Window
                            </button>
                        </div>
                    ) : step === 1 ? (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <p className="text-gray-500 font-medium">How would you like to review this company?</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => { 
                                            if (!currentUser) {
                                                alert('You must be logged in to leave a public review. For employee reviews, please use the Employee Review option.');
                                                return;
                                            }
                                            setReviewType('Public'); 
                                            setStep(2); 
                                        }}
                                        className="p-6 border-2 border-gray-100 rounded-2xl hover:border-[#4169E1] hover:bg-blue-50/30 transition-all text-left group"
                                    >
                                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Users className="w-6 h-6 text-[#4169E1]" />
                                        </div>
                                        <h4 className="font-bold text-gray-900 mb-1">Public Review</h4>
                                        <p className="text-xs text-gray-500 font-medium">Post as a job seeker or visitor. Login required.</p>
                                    </button>
                                <button 
                                    onClick={() => { setReviewType('Employee'); setStep(2); }}
                                    className="p-6 border-2 border-gray-100 rounded-2xl hover:border-[#4169E1] hover:bg-blue-50/30 transition-all text-left group"
                                >
                                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <ShieldCheck className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <h4 className="font-bold text-gray-900 mb-1">Employee Review</h4>
                                    <p className="text-xs text-gray-500 font-medium">Post using workplace email. No login needed.</p>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex flex-col items-center mb-6">
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button 
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="transform hover:scale-110 transition-transform"
                                        >
                                            <Star className={`w-10 h-10 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                                        </button>
                                    ))}
                                </div>
                                <span className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-widest">{rating === 5 ? 'Excellent' : rating === 4 ? 'Very Good' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}</span>
                            </div>

                            {reviewType === 'Employee' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Your Role</label>
                                        <input 
                                            required
                                            type="text" 
                                            placeholder="e.g. Project Manager"
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Department</label>
                                        <input 
                                            required
                                            type="text" 
                                            placeholder="e.g. Operations"
                                            value={department}
                                            onChange={(e) => setDepartment(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm"
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Workplace Email (for verification)</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                                            <input 
                                                required
                                                type="email" 
                                                placeholder="name@company.com"
                                                value={employeeEmail}
                                                onChange={(e) => setEmployeeEmail(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm"
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-400 italic ml-1">* We will never show your email or name on the review.</p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Your Feedback</label>
                                <textarea 
                                    required
                                    rows="4" 
                                    placeholder={`Tell us about your experience at ${companyName}...`}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm resize-none"
                                ></textarea>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all"
                                >
                                    Go Back
                                </button>
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] py-4 bg-[#4169E1] text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Post Review
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

const CompanyProfile = () => {
    const { id } = useParams();
    const [company, setCompany] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    // UI State
    const [isFollowing, setIsFollowing] = useState(false);
    
    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedExp, setSelectedExp] = useState('');

    // Custom Reviews State
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewSort, setReviewSort] = useState('newest');
    const { user: currentUser } = useAuth();
    const isOwner = currentUser?._id === id;

    const handleShare = async () => {
        const shareData = {
            title: company.companyName || company.name,
            text: `Check out ${company.companyName || company.name} on Cybomb Job Portal`,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                alert('Profile link copied to clipboard!');
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    const getYoutubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const fetchReviews = async () => {
        try {
            setReviewsLoading(true);
            // Use owner-specific route if logged in as company owner to see names/hidden reviews
            const endpoint = isOwner ? '/reviews/my/all' : `/reviews/company/${id}?sort=${reviewSort}`;
            const { data } = await api.get(endpoint);
            setReviews(data);
        } catch (err) {
            console.error('Error fetching reviews:', err);
        } finally {
            setReviewsLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchReviews();
        }
    }, [id, reviewSort]);

    const averageRating = reviews.length > 0 
        ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1) 
        : 4.0;

    useEffect(() => {
        const fetchCompanyData = async () => {
            try {
                const [companyRes, jobsRes] = await Promise.all([
                    api.get(`/auth/user/${id}`),
                    api.get(`/jobs?postedBy=${id}`)
                ]);

                setCompany(companyRes.data);
                setJobs(jobsRes.data);
                setLoading(false);

                // Fetch Custom Reviews
                fetchReviews();
            } catch (err) {
                console.error('Error fetching company details:', err);
                setError('Failed to load company profile.');
                setLoading(false);
            }
        };

        if (id) {
            fetchCompanyData();
        }
    }, [id]);

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLocation = !selectedLocation || job.location === selectedLocation;
        const matchesDept = !selectedDept || job.functionalArea === selectedDept;
        const matchesExp = !selectedExp || (
            selectedExp === 'fresher' ? job.experienceMin === 0 :
            selectedExp === 'mid' ? (job.experienceMin >= 1 && job.experienceMin <= 3) :
            selectedExp === 'senior' ? job.experienceMin > 3 : true
        );
        return matchesSearch && matchesLocation && matchesDept && matchesExp;
    });

    // Unique values for filters
    const departments = [...new Set(jobs.map(j => j.functionalArea).filter(Boolean))];
    const locations = [...new Set(jobs.map(j => j.location).filter(Boolean))];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4169E1]"></div>
            </div>
        );
    }

    if (error || !company) {
        return (
            <div className="flex justify-center items-center h-screen bg-white flex-col">
                <div className="text-red-500 mb-4">{error || 'Company not found'}</div>
                <Link to="/companies" className="text-[#4169E1] hover:underline flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Companies
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                    <Link to="/companies" className="text-gray-500 hover:text-[#4169E1] flex items-center mb-6 w-fit transition-colors text-sm font-medium">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Companies
                    </Link>
                </div>

                {/* Banner & Logo */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative mb-36 lg:mb-28">
                    <div className="h-48 md:h-64 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 relative shadow-inner">
                        {company.bannerPicture ? (
                            <img 
                                src={company.bannerPicture.startsWith('http') ? company.bannerPicture : `http://localhost:8000${company.bannerPicture}`} 
                                alt="" 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <>
                                {/* Simulated Banner Patterns */}
                                <div className="absolute inset-0 opacity-20 pointer-events-none">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/20 rounded-full blur-2xl -ml-16 -mb-16"></div>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                     <div className="text-white text-center">
                                         <h2 className="text-3xl md:text-5xl font-bold opacity-30 tracking-widest uppercase">{company.companyName || company.name}</h2>
                                     </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Branding Bar */}
                    <div className="absolute -bottom-24 left-4 md:left-12 flex flex-col md:flex-row md:items-end gap-6 md:gap-10 w-[calc(100%-2rem)] md:w-[calc(100%-6rem)]">
                        <div className="w-32 h-32 md:w-44 md:h-44 bg-white rounded-3xl p-2 shadow-2xl border-4 border-white flex items-center justify-center overflow-hidden shrink-0">
                            {company.profilePicture ? (
                                <img 
                                    src={company.profilePicture.startsWith('http') ? company.profilePicture : `http://localhost:8000${company.profilePicture}`} 
                                    alt={company.companyName} 
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <Building2 className="w-16 h-16 text-[#4169E1]" />
                            )}
                        </div>
                        
                        <div className="pb-4 flex-grow">
                             <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">{company.companyName || company.name}</h1>
                                        {company.employerVerification?.isVerified && (
                                            <div className="bg-blue-50 p-1 rounded-full border border-blue-100 shadow-sm" title="Verified Employer">
                                                <CheckCircle className="w-6 h-6 text-blue-500 fill-blue-50" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold uppercase tracking-wider">{company.companyCategory || "Industry"}</span>
                                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wider">{company.companyType || "Company"}</span>
                                        <span className="flex items-center text-gray-500 text-sm ml-2">
                                            <Users className="w-4 h-4 mr-1.5" />
                                            {company.employeeCount ? `${company.employeeCount} Employees` : 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="text-right mr-4 hidden md:block">
                                        <div className="text-lg font-bold text-gray-900">
                                            {averageRating} 
                                            <Star className="w-4 h-4 inline-block text-yellow-400 fill-yellow-400 mb-1" />
                                        </div>
                                        <div className="text-xs text-gray-500 font-medium">{reviews.length} Reviews</div>
                                    </div>
                                    <button 
                                        onClick={() => setIsFollowing(!isFollowing)}
                                        className={`px-8 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-sm ${
                                            isFollowing 
                                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                                            : 'bg-[#4169E1] text-white hover:bg-blue-700 hover:shadow-lg active:scale-95'
                                        }`}
                                    >
                                        {isFollowing ? 'Following' : (
                                            <>
                                                <Plus className="w-5 h-5" />
                                                Follow
                                            </>
                                        )}
                                    </button>
                                    <button 
                                        onClick={handleShare}
                                        className="p-2.5 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 border border-gray-200 transition-colors"
                                    >
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                    <div className="flex items-center gap-8 border-b border-gray-100">
                        {['overview', 'jobs', 'why join us'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 px-2 text-sm font-bold capitalize transition-all relative ${
                                    activeTab === tab 
                                    ? 'text-[#4169E1]' 
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#4169E1] rounded-t-full"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* About Section */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-[#4169E1]" />
                                    About {company.companyName || company.name}
                                </h3>
                                <div className="prose prose-blue max-w-none">
                                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-lg">
                                        {company.about || 'No description available for this company yet. Check back soon!'}
                                    </p>
                                </div>
                            </div>

                            {/* Custom Review Section */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                        Company Reviews
                                    </h3>
                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <select 
                                            value={reviewSort}
                                            onChange={(e) => setReviewSort(e.target.value)}
                                            className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="newest">Newest First</option>
                                            <option value="highest">Highest Rated</option>
                                            <option value="lowest">Lowest Rated</option>
                                        </select>
                                        <button 
                                            onClick={() => setShowReviewModal(true)}
                                            className="flex-grow md:flex-none px-6 py-2 bg-[#4169E1] text-white font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 text-sm"
                                        >
                                            Write a Review
                                        </button>
                                    </div>
                                </div>

                                {/* Review Stats */}
                                <div className="flex flex-col md:flex-row gap-8 items-center bg-gray-50/50 rounded-2xl p-8 mb-8">
                                    <div className="text-center md:border-r border-gray-200 pr-8 py-2">
                                        <div className="text-6xl font-extrabold text-gray-900">{averageRating}</div>
                                        <div className="flex justify-center gap-1 my-3">
                                            {[1,2,3,4,5].map(i => (
                                                <Star 
                                                    key={i} 
                                                    className={`w-6 h-6 ${i <= Math.round(Number(averageRating)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} 
                                                />
                                            ))}
                                        </div>
                                        <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">{reviews.length} Verified Reviews</div>
                                    </div>
                                    
                                    <div className="flex-grow w-full space-y-3">
                                        {[5,4,3,2,1].map(star => {
                                            const count = reviews.filter(r => r.rating === star).length;
                                            const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                                            return (
                                                <div key={star} className="flex items-center gap-4">
                                                    <span className="text-sm font-bold text-gray-500 w-4">{star}</span>
                                                    <div className="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                                                            style={{ width: `${percent}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-400 w-8">{percent.toFixed(0)}%</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Review List */}
                                <div className="space-y-6">
                                    {reviewsLoading ? (
                                        <div className="space-y-4">
                                            {[1,2,3].map(i => (
                                                <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>
                                            ))}
                                        </div>
                                    ) : reviews.length === 0 ? (
                                        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                            <h4 className="text-lg font-bold text-gray-900">No reviews yet</h4>
                                            <p className="text-gray-500 mt-2 font-medium px-4">Be the first to share your experience with {company.companyName || company.name}.</p>
                                        </div>
                                    ) : (
                                        reviews.map((review) => (
                                            <ReviewCard key={review._id} review={review} isOwner={isOwner} onUpdate={fetchReviews} />
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 divide-y divide-gray-100">
                                <div className="pb-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-6">Company Highlights</h3>
                                    <div className="space-y-5">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                <Calendar className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Founded</p>
                                                <p className="text-sm font-bold text-gray-900">{company.foundedYear || 'Not Specified'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-orange-50 rounded-lg">
                                                <MapPin className="w-5 h-5 text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Headquarters</p>
                                                <p className="text-sm font-bold text-gray-900">{company.companyLocation || company.location || 'Global'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-green-50 rounded-lg">
                                                <Users className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Company Size</p>
                                                <p className="text-sm font-bold text-gray-900">{company.employeeCount ? `${company.employeeCount} Employees` : 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="py-6 space-y-4">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contact Information</h4>
                                    {company.website && (
                                        <div className="flex items-center gap-3">
                                            <Globe className="w-5 h-5 text-gray-400" />
                                            <a 
                                                href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="text-sm font-bold text-[#4169E1] hover:underline truncate"
                                            >
                                                {company.website.replace(/^https?:\/\//, '')}
                                            </a>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                        <a href={`mailto:${company.companyEmail || company.email}`} className="text-sm font-bold text-gray-700 hover:text-[#4169E1]">
                                            {company.companyEmail || company.email || 'Email not visible'}
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Verification Badge card */}
                            {company.employerVerification?.isVerified && (
                                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
                                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                                    <h4 className="flex items-center gap-2 font-bold text-lg mb-2">
                                        <CheckCircle className="w-6 h-6 fill-white text-blue-600" />
                                        Managed by employer
                                    </h4>
                                    <p className="text-sm text-blue-50 font-medium">This profile is built and controlled by the employer team.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'jobs' && (
                    <div className="space-y-6">
                        {/* Search and Filters */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-4 sticky top-6 z-10">
                            <div className="relative flex-grow">
                                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search jobs by title or keyword..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all"
                                />
                            </div>
                            <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                                <select 
                                    value={selectedDept}
                                    onChange={(e) => setSelectedDept(e.target.value)}
                                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Departments</option>
                                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <select 
                                    value={selectedLocation}
                                    onChange={(e) => setSelectedLocation(e.target.value)}
                                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Locations</option>
                                    {locations.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                                <select 
                                    value={selectedExp}
                                    onChange={(e) => setSelectedExp(e.target.value)}
                                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Experience</option>
                                    <option value="fresher">Fresher (0 yrs)</option>
                                    <option value="mid">Mid Level (1-3 yrs)</option>
                                    <option value="senior">Senior (3+ yrs)</option>
                                </select>
                            </div>
                        </div>

                        {/* Jobs List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredJobs.length === 0 ? (
                                <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-gray-100">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Briefcase className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">No matching jobs found</h3>
                                    <p className="text-gray-500 mt-2 font-medium">Try adjusting your filters or search keywords.</p>
                                </div>
                            ) : (
                                filteredJobs.map((job) => (
                                    <Link 
                                        to={`/job/${job._id}`}
                                        key={job._id} 
                                        className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:border-blue-200 transition-all active:scale-[0.98]"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#4169E1] transition-colors leading-tight mb-1">
                                                    {job.title}
                                                </h3>
                                                <div className="flex items-center gap-3 text-sm font-bold text-gray-400 uppercase tracking-widest">
                                                    <span>{job.functionalArea}</span>
                                                </div>
                                            </div>
                                            <div className="px-3 py-1 bg-blue-50 text-[#4169E1] rounded-lg text-xs font-extrabold uppercase tracking-wider">
                                                {job.type}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-y-3 gap-x-6 text-sm font-medium text-gray-500 mb-6">
                                            <div className="flex items-center">
                                                <MapPin className="w-4 h-4 mr-1.5 text-gray-400" />
                                                {job.location}
                                            </div>
                                            <div className="flex items-center">
                                                <Briefcase className="w-4 h-4 mr-1.5 text-gray-400" />
                                                {job.experienceMin === 0 ? 'Fresher' : `${job.experienceMin}+ yrs`}
                                            </div>
                                            <div className="flex items-center text-gray-900 font-bold">
                                                {job.salaryType === 'Range' 
                                                    ? `₹${job.salaryMin.toLocaleString()} - ₹${job.salaryMax.toLocaleString()}` 
                                                    : `₹${job.salaryMin.toLocaleString()}+`}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-50 group-hover:border-blue-50 transition-colors">
                                           <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                               <Users className="w-4 h-4" />
                                               {job.applicantsCount || 0} applicants
                                           </div>
                                           <div className="flex items-center text-[#4169E1] font-bold text-sm">
                                               View Details
                                               <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                                           </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'why join us' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Videos Section */}
                        {company.whyJoinUs?.videos?.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 bg-blue-50 rounded-lg text-[#4169E1]">
                                        <Video className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900">Life at {company.companyName || company.name}</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {company.whyJoinUs.videos.map((video, index) => (
                                        <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                                            <div className="aspect-video relative overflow-hidden bg-black">
                                                {getYoutubeId(video.url) ? (
                                                    <iframe
                                                        src={`https://www.youtube.com/embed/${getYoutubeId(video.url)}`}
                                                        title={video.description}
                                                        className="absolute inset-0 w-full h-full"
                                                        allowFullScreen
                                                    ></iframe>
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <PlayCircle className="w-16 h-16 text-white/50" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-5">
                                                <p className="text-gray-700 leading-relaxed font-medium">{video.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Blogs Section */}
                        {company.whyJoinUs?.blogs?.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 bg-blue-50 rounded-lg text-[#4169E1]">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900">Inside Stories</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-8">
                                    {company.whyJoinUs.blogs.map((blog, index) => (
                                        <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300">
                                            <div className="flex justify-between items-start mb-6">
                                                <h4 className="text-xl font-bold text-gray-900 group-hover:text-[#4169E1] transition-colors">{blog.title}</h4>
                                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 px-3 py-1 rounded-full">
                                                    {new Date(blog.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{blog.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {(!company.whyJoinUs?.videos?.length && !company.whyJoinUs?.blogs?.length) && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Sparkles className="w-12 h-12 text-[#4169E1]" />
                                </div>
                                <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Culture at {company.companyName || company.name}</h2>
                                <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed text-lg font-medium">
                                    We're working on something amazing here. Stay tuned to learn more about our culture, and why you should be part of our journey!
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <ReviewModal 
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                companyId={id}
                companyName={company.companyName}
                onSuccess={fetchReviews}
            />
        </div>
    );
};

export default CompanyProfile;
