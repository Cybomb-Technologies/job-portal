import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { User, Mail, MapPin, Briefcase, GraduationCap, Calendar, Award, ArrowLeft } from 'lucide-react';

const PublicProfile = () => {
    const { slug } = useParams();
    const [candidate, setCandidate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCandidate = async () => {
            try {
                setLoading(true);
                const { data } = await api.get(`/candidates/public/${slug}`);
                setCandidate(data);
            } catch (err) {
                console.error(err);
                setError('Profile not found');
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchCandidate();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4169E1]"></div>
            </div>
        );
    }

    if (error || !candidate) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
                <User className="w-16 h-16 text-gray-300 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
                <p className="text-gray-500 mb-6">The profile you're looking for doesn't exist or has been removed.</p>
                <Link to="/" className="text-[#4169E1] hover:underline font-medium">← Go to Home</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
            <div className="container mx-auto px-3 sm:px-4 max-w-4xl">


                {/* Profile Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
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

                    <div className="px-4 sm:px-8 pb-6 sm:pb-8">
                        <div className="relative flex flex-col sm:flex-row sm:justify-between sm:items-end -mt-10 sm:-mt-12 mb-4 sm:mb-6 gap-4">
                            <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-full bg-white p-1 shadow-lg flex-shrink-0">
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
                        </div>

                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{candidate.name}</h1>
                            <p className="text-lg sm:text-xl text-[#4169E1] font-medium mb-3 sm:mb-4">{candidate.title || 'Job Seeker'}</p>
                            
                            <div className="flex flex-wrap gap-x-4 gap-y-2 sm:gap-4 text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                                {candidate.currentLocation && (
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <MapPin className="w-4 h-4 flex-shrink-0" />
                                        <span>{candidate.currentLocation}</span>
                                    </div>
                                )}
                                {candidate.totalExperience !== undefined && candidate.totalExperience > 0 && (
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <Briefcase className="w-4 h-4 flex-shrink-0" />
                                        <span>{candidate.totalExperience} Years Experience</span>
                                    </div>
                                )}
                                {candidate.email && (
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <Mail className="w-4 h-4 flex-shrink-0" />
                                        <span>{candidate.email}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* About Section */}
                {candidate.about && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">About</h2>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">{candidate.about}</p>
                    </div>
                )}

                {/* Skills Section */}
                {candidate.skills && candidate.skills.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {candidate.skills.map((skill, index) => (
                                <span key={index} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs sm:text-sm font-medium border border-blue-100">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Experience & Education Grid */}
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
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mt-6">
                        <div className="flex items-center gap-2 mb-4 sm:mb-6">
                            <Award className="w-5 h-5 text-[#4169E1]" />
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Certifications</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {candidate.certifications.map((cert, index) => (
                                <div key={index} className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">{cert.name}</h3>
                                    <p className="text-gray-600 text-xs sm:text-sm">{cert.issuer}</p>
                                    {cert.year && <p className="text-gray-500 text-xs mt-1">{cert.year}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublicProfile;
