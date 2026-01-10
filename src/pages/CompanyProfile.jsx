import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, MapPin, Mail, Globe, ArrowLeft, Briefcase, CheckCircle } from 'lucide-react';
import api from '../api';

const CompanyProfile = () => {
    const { id } = useParams();
    const [company, setCompany] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4169E1]"></div>
            </div>
        );
    }

    if (error || !company) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50 flex-col">
                <div className="text-red-500 mb-4">{error || 'Company not found'}</div>
                <Link to="/companies" className="text-[#4169E1] hover:underline flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Companies
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <Link to="/companies" className="text-gray-500 hover:text-[#4169E1] flex items-center mb-6 w-fit transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Companies
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Sidebar - Company Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="h-32 bg-blue-50 relative">
                                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                                    <div className="w-24 h-24 bg-white rounded-xl border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                                        {company.profilePicture ? (
                                            <img 
                                                src={company.profilePicture.startsWith('http') ? company.profilePicture : `http://localhost:8000${company.profilePicture}`} 
                                                alt={company.companyName} 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Building2 className="w-10 h-10 text-[#4169E1]" />
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="pt-16 pb-6 px-6 text-center">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <h1 className="text-2xl font-bold text-gray-900">{company.companyName || company.name}</h1>
                                    {company.employerVerification?.isVerified && (
                                        <CheckCircle className="w-5 h-5 text-blue-500" />
                                    )}
                                </div>
                                <p className="text-gray-500 text-sm mb-6">{company.location || 'Headquarters not specified'}</p>
                                
                                <div className="space-y-4 text-left">
                                    {company.email && (
                                        <div className="flex items-center text-gray-600 text-sm">
                                            <Mail className="w-5 h-5 mr-3 text-gray-400" />
                                            <span>{company.email}</span>
                                        </div>
                                    )}
                                    {company.location && (
                                        <div className="flex items-center text-gray-600 text-sm">
                                            <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                                            <span>{company.location}</span>
                                        </div>
                                    )}
                                    {/* Placeholder for website if you add it later */}
                                    {/* <div className="flex items-center text-gray-600 text-sm">
                                        <Globe className="w-5 h-5 mr-3 text-gray-400" />
                                        <a href="#" className="hover:text-[#4169E1]">Visit Website</a>
                                    </div> */}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-900 mb-4">About Company</h3>
                            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                                {company.about || 'No description available.'}
                            </p>
                        </div>
                    </div>

                    {/* Right Content - Jobs */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Open Positions</h2>
                            <span className="bg-blue-100 text-[#4169E1] px-3 py-1 rounded-full text-sm font-bold">
                                {jobs.length} Jobs
                            </span>
                        </div>

                        {jobs.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Briefcase className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No open positions</h3>
                                <p className="text-gray-500 mt-2">Check back later for new opportunities at {company.companyName}.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {jobs.map((job) => (
                                    <div key={job._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                                    <Link to={`/job/${job._id}`} className="hover:text-[#4169E1] transition-colors">
                                                        {job.title}
                                                    </Link>
                                                </h3>
                                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                    <span className="flex items-center">
                                                        <MapPin className="w-4 h-4 mr-1" />
                                                        {job.location}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <Briefcase className="w-4 h-4 mr-1" />
                                                        {job.type}
                                                    </span>
                                                    <span>
                                                        {job.salaryType === 'Range' 
                                                            ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}` 
                                                            : `$${job.salaryMin.toLocaleString()}+`}
                                                    </span>
                                                </div>
                                            </div>
                                            <Link 
                                                to={`/job/${job._id}`}
                                                className="px-6 py-2 bg-[#4169E1] text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                                            >
                                                Apply Now
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyProfile;
