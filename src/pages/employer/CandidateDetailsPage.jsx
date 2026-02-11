import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { User, MapPin, Briefcase, GraduationCap, Calendar, Mail, Phone, ExternalLink, ArrowLeft, Download, X, Eye, Award, Copy, Check, MessageSquare } from 'lucide-react';
import api from '../../api';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';

const CandidateDetailsPage = ({ isPublic = false }) => {
    const { id, slug } = useParams();
    const navigate = useNavigate();
    const { initiateChat } = useChat();
    const { user } = useAuth();
    const [candidate, setCandidate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchCandidate = async () => {
            try {
                let response;
                // If user is logged in, use authenticated endpoint for full data (including mobile)
                if (slug) {
                    if (user) {
                        // Authenticated access using slug (includes all data)
                        response = await api.get(`/candidates/slug/${slug}`);
                    } else {
                        // Public profile access using slug (excludes mobile)
                        response = await api.get(`/candidates/public/${slug}`);
                    }
                } else if (id) {
                    // Legacy: Authenticated access using ID (fallback)
                    response = await api.get(`/candidates/${id}`);
                }
                setCandidate(response.data);
            } catch (error) {
                console.error('Failed to fetch candidate', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCandidate();
    }, [id, slug, isPublic, user]);

    const handleCopyEmail = () => {
        if (candidate?.email) {
            navigator.clipboard.writeText(candidate.email);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleMessage = () => {
        if (candidate) {
            initiateChat(candidate);
            navigate('/messages');
        }
    };

    const handleContactOption = (type) => {
        const email = candidate?.email;
        if (!email) return;

        let url = '';
        switch (type) {
            case 'gmail':
                url = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}`;
                window.open(url, '_blank', 'noreferrer');
                break;
            case 'outlook':
                url = `https://outlook.office.com/mail/deeplink/compose?to=${email}`;
                window.open(url, '_blank', 'noreferrer');
                break;
            case 'default':
                window.location.href = `mailto:${email}`;
                break;
            default:
                break;
        }
        setShowContactModal(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4169E1]"></div>
            </div>
        );
    }
    
    // ... (rest of the file until the buttons)

    return (
        <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
            <div className="container mx-auto px-3 sm:px-4 max-w-4xl">


                {/* Header Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                    {/* ... (banner code) ... */}
                    {candidate.bannerPicture ? (
                        <div className="h-32 sm:h-48 w-full relative">
                            <img 
                                src={candidate.bannerPicture.startsWith('http') ? candidate.bannerPicture : `${import.meta.env.VITE_SERVER_URL}${candidate.bannerPicture}`} 
                                alt="Banner" 
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/20"></div>
                        </div>
                    ) : (
                        <div className="h-24 sm:h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
                    )}
                    <div className="px-3 sm:px-4 md:px-8 pb-6 sm:pb-8">
                        <div className="relative flex flex-col sm:flex-row sm:justify-between sm:items-end -mt-10 sm:-mt-12 mb-4 sm:mb-6 gap-4">
                             <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-full bg-white p-1 shadow-lg flex-shrink-0">
                                {/* ... (profile pic) ... */}
                                <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                     {candidate.profilePicture ? (
                                        <img 
                                            src={candidate.profilePicture.startsWith('http') ? candidate.profilePicture : `${import.meta.env.VITE_SERVER_URL}${candidate.profilePicture}`} 
                                            alt={candidate.name} 
                                            className="w-full h-full object-cover" 
                                        />
                                    ) : (
                                        <User className="w-10 sm:w-12 h-10 sm:h-12 text-gray-400" />
                                    )}
                                </div>
                             </div>
                             <div className="flex flex-wrap gap-2 sm:gap-3">
                                {user ? (
                                    <>
                                        <button
                                            onClick={handleMessage}
                                            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition shadow-sm text-sm sm:text-base"
                                        >
                                            <MessageSquare className="w-4 h-4" /> Message
                                        </button>
                                        <button
                                            onClick={() => setShowContactModal(true)}
                                            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-[#4169E1] text-white rounded-lg font-medium hover:bg-[#3A5FCD] transition shadow-md text-sm sm:text-base"
                                        >
                                            <Mail className="w-4 h-4" /> Contact
                                        </button>
                                        {candidate.resume && (
                                            <button 
                                                onClick={() => setShowResumeModal(true)}
                                                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm sm:text-base"
                                            >
                                                <Eye className="w-4 h-4" /> <span className="hidden sm:inline">View</span> Resume
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <Link
                                        to="/login"
                                        className="flex items-center gap-1.5 sm:gap-2 px-4 py-2 bg-[#4169E1] text-white rounded-lg font-medium hover:bg-[#3A5FCD] transition shadow-md text-sm sm:text-base"
                                    >
                                        <Mail className="w-4 h-4" /> Login to Contact
                                    </Link>
                                )}
                             </div>
                        </div>

                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{candidate.name}</h1>
                            <p className="text-lg sm:text-xl text-[#4169E1] font-medium mb-3 sm:mb-4">{candidate.title || 'Job Seeker'}</p>
                            
                            <div className="flex flex-wrap gap-x-4 gap-y-2 sm:gap-4 text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                                {candidate.currentLocation && (
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <MapPin className="w-4 h-4 flex-shrink-0" />
                                        <span><b>Current:</b> {candidate.currentLocation}</span>
                                    </div>
                                )}
                                {candidate.totalExperience !== undefined && (
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <Briefcase className="w-4 h-4 flex-shrink-0" />
                                        <span><b>Exp:</b> {candidate.totalExperience} Years</span>
                                    </div>
                                )}
                                {candidate.mobileNumber && (
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <Phone className="w-4 h-4 flex-shrink-0" />
                                        <span><b>Mobile:</b> {candidate.mobileNumber}</span>
                                    </div>
                                )}
                                {candidate.preferredLocations && candidate.preferredLocations.length > 0 && (
                                     <div className="flex items-center gap-1.5 sm:gap-2">
                                        <MapPin className="w-4 h-4 flex-shrink-0 text-green-600" />
                                        <span><b>Preferred:</b> {candidate.preferredLocations.join(', ')}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                                    <Mail className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate"><b>Mail:</b> {candidate.email}</span>
                                    <button 
                                        onClick={handleCopyEmail}
                                        className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-[#4169E1] flex-shrink-0"
                                        title="Copy Email"
                                    >
                                        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>

                            {candidate.about && (
                                <div className="mb-4 sm:mb-6">
                                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">About</h3>
                                    <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{candidate.about}</p>
                                </div>
                            )}

                             {/* Skills */}
                            {candidate.skills && candidate.skills.length > 0 && (
                                <div>
                                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">Skills</h3>
                                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                        {candidate.skills.filter(s => s && s.trim() !== '').map((skill, index) => (
                                            <span key={index} className="px-2.5 sm:px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs sm:text-sm font-medium">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Experience Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-4 sm:mb-6">
                            <Briefcase className="w-5 h-5 text-[#4169E1]" />
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Experience</h2>
                        </div>
                        
                        <div className="space-y-4 sm:space-y-6">
                            {candidate.experience && candidate.experience.length > 0 ? (
                                candidate.experience.map((exp, index) => (
                                    <div key={index} className="pb-3 sm:pb-4 last:pb-0 border-b border-gray-100 last:border-0 mb-3 sm:mb-4 last:mb-0">
                                        <h3 className="font-bold text-gray-900 text-sm sm:text-base">{exp.title}</h3>
                                        <p className="text-[#4169E1] font-medium text-sm sm:text-base">{exp.company}</p>
                                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mt-1 mb-2">
                                            <Calendar className="w-3 h-3" />
                                            <span>{exp.startMonth} {exp.startYear} - {exp.endMonth ? `${exp.endMonth} ${exp.endYear}` : 'Present'}</span>
                                        </div>
                                        {exp.description && <p className="text-xs sm:text-sm text-gray-600">{exp.description}</p>}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 italic text-sm">No experience added.</p>
                            )}
                        </div>
                    </div>

                    {/* Education Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                         <div className="flex items-center gap-2 mb-4 sm:mb-6">
                            <GraduationCap className="w-5 h-5 text-[#4169E1]" />
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Education</h2>
                        </div>

                        <div className="space-y-4 sm:space-y-6">
                             {candidate.education && candidate.education.length > 0 ? (
                                candidate.education.map((edu, index) => (
                                    <div key={index} className="pb-3 sm:pb-4 last:pb-0 border-b border-gray-100 last:border-0 mb-3 sm:mb-4 last:mb-0">
                                        <h3 className="font-bold text-gray-900 text-sm sm:text-base">{edu.institute || edu.university}</h3>
                                        <p className="text-gray-700 text-sm sm:text-base">{edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</p>
                                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mt-1">
                                            <Calendar className="w-3 h-3" />
                                            <span>{edu.startYear} - {edu.endYear}</span>
                                        </div>
                                    </div>
                                ))
                             ) : (
                                <p className="text-gray-500 italic text-sm">No education added.</p>
                             )}
                        </div>
                    </div>
                </div>

                {/* Certifications Section */}
                {candidate.certifications && candidate.certifications.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mt-4 sm:mt-6">
                        <div className="flex items-center gap-2 mb-4 sm:mb-6">
                            <Award className="w-5 h-5 text-[#4169E1]" />
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Certifications</h2>
                        </div>
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            {candidate.certifications.map((cert, index) => (
                                <div key={index} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-50 border border-gray-100 rounded-lg text-gray-700 font-medium text-sm sm:text-base">
                                    {cert}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Resume Modal */}
                {showResumeModal && (
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 transition-opacity"
                        onClick={() => setShowResumeModal(false)}
                    >
                        <div 
                            className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] sm:h-[90vh] flex flex-col relative animate-fadeIn"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button 
                                onClick={() => setShowResumeModal(false)} 
                                className="absolute -top-10 right-0 sm:right-0 text-white hover:text-gray-200 transition-colors"
                            >
                                <X className="w-7 sm:w-8 h-7 sm:h-8" />
                            </button>
                            <div className="flex-1 bg-gray-100 overflow-hidden rounded-xl custom-scrollbar-container">
                                <iframe 
                                    src={`${import.meta.env.VITE_SERVER_URL}${candidate.resume}#toolbar=0&navpanes=0&scrollbar=0`} 
                                    className="w-full h-full border-0 rounded-xl"
                                    title="Resume Preview"
                                ></iframe>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contact Options Modal */}
                {showContactModal && (
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
                        onClick={() => setShowContactModal(false)}
                    >
                        <div 
                            className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="font-bold text-gray-900 text-lg">Contact Candidate</h3>
                                <button onClick={() => setShowContactModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-4 space-y-3">
                                <button
                                    onClick={() => handleContactOption('gmail')}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-red-50 hover:border-red-100 hover:text-red-600 transition-all group"
                                >
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-xl border border-gray-100 group-hover:border-red-100">
                                        M
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-gray-900 group-hover:text-red-700">Gmail</div>
                                        <div className="text-xs text-gray-500">Open in Gmail web</div>
                                    </div>
                                </button>
                                
                                <button
                                    onClick={() => handleContactOption('outlook')}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-blue-50 hover:border-blue-100 hover:text-blue-600 transition-all group"
                                >
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-xl border border-gray-100 group-hover:border-blue-100">
                                        O
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-gray-900 group-hover:text-blue-700">Outlook</div>
                                        <div className="text-xs text-gray-500">Open in Outlook web</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleContactOption('default')}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all group"
                                >
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-xl border border-gray-100">
                                        <Mail className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-gray-900">Default Mail App</div>
                                        <div className="text-xs text-gray-500">Open system mail app</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CandidateDetailsPage;
