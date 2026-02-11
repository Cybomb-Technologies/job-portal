import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, IndianRupee, Clock, ShieldCheck, CheckCircle } from 'lucide-react';
import { generateSlug } from '../../utils/slugify';

const JobCard = ({ job }) => {

  
  return (
    <Link to={`/job/${generateSlug(job.title, job._id)}`} className="block group h-full">
        <div className="bg-white dark:bg-gray-800 rounded-[1.5rem] p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100/80 dark:border-gray-700 hover:border-blue-100/80 dark:hover:border-blue-500/30 h-full relative flex flex-col justify-between group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-blue-50/30 dark:group-hover:from-gray-800 dark:group-hover:to-gray-800">
        
        {/* Card Header & Content */}
        <div>
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-start gap-5">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                        <Briefcase className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors font-display mb-1.5 leading-tight">
                            {job.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-slate-600 font-semibold text-sm">{job.company}</p>
                            {/* Prioritize Company Verification */}
                            {(job.companyId?.employerVerification?.level >= 1 || job.postedBy?.employerVerification?.level >= 1) && (
                                <span title="Verified Company" className="inline-flex items-center text-blue-600 bg-blue-50/50 px-2 py-0.5 rounded-md text-[10px] font-extrabold border border-blue-100 uppercase tracking-wider">
                                    Verified <ShieldCheck size={10} className="ml-1" />
                                </span>
                            )}
                            {(job.companyId?.employerVerification?.level >= 2 || job.postedBy?.employerVerification?.level >= 2) && (
                                <span title="Registered Business" className="inline-flex items-center text-emerald-600 bg-emerald-50/50 px-2 py-0.5 rounded-md text-[10px] font-extrabold border border-emerald-100 uppercase tracking-wider">
                                    Reg. Business <CheckCircle size={10} className="ml-1" />
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                {(job.applyMethod === 'direct' || !job.applyMethod) && (
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg shadow-blue-200 uppercase tracking-wider flex items-center animate-fadeIn">
                       <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
                       Direct
                    </span>
                )}
            </div>

            <div className="flex flex-wrap gap-y-2 gap-x-5 mb-6">
                <span className="flex items-center text-slate-500 text-sm font-medium">
                    <MapPin className="w-4 h-4 mr-1.5 text-slate-400" />
                    {job.location}
                </span>
                <span className="flex items-center text-slate-500 text-sm font-medium">
                    <Briefcase className="w-4 h-4 mr-1.5 text-slate-400" />
                    {job.type}
                </span>
                <span className="flex items-center text-slate-900 text-sm font-bold">
                    <IndianRupee className="w-4 h-4 mr-1.5 text-slate-400" />
                    {job.salaryType === 'Fixed' 
                        ? `₹${Number(job.salaryMin).toLocaleString()}` 
                        : job.salaryType === 'Starting From' 
                            ? `From ₹${Number(job.salaryMin).toLocaleString()}` 
                            : `₹${Number(job.salaryMin).toLocaleString()} - ${Number(job.salaryMax).toLocaleString()}`
                    }
                </span>
            </div>

            <div className="mb-6">
                 <div className="flex flex-wrap gap-2">
                    {job.skills.slice(0, 3).map((skill, index) => (
                        <span
                        key={index}
                        className="px-3 py-1 bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 text-xs font-semibold rounded-lg border border-transparent group-hover:bg-white dark:group-hover:bg-gray-600 group-hover:border-blue-100 dark:group-hover:border-blue-500/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                        >
                        {skill}
                        </span>
                    ))}
                    {job.skills.length > 3 && (
                        <span className="px-2 py-1 text-slate-400 text-xs font-semibold">+ {job.skills.length - 3}</span>
                    )}
                </div>
            </div>
        </div>

        {/* Card Footer */}
        <div className="pt-5 border-t border-gray-100 group-hover:border-blue-100/50 transition-colors flex items-center justify-between mt-auto">
            <span className="flex items-center text-slate-400 text-xs font-medium">
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                {new Date(job.createdAt).toLocaleDateString()}
            </span>
            <span
                className="px-5 py-2.5 bg-slate-50 text-slate-700 text-sm font-bold rounded-xl group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-200 transition-all duration-300"
            >
                View Details
            </span>
        </div>
        </div>
    </Link>
  );
};

export default JobCard;