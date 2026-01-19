import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, IndianRupee, Clock, ShieldCheck, CheckCircle } from 'lucide-react';

const JobCard = ({ job }) => {

  
  return (
    <Link to={`/job/${job._id}`} className="block group h-full">
        <div className="bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-100 p-6 transition-all duration-300 animate-fade-in-up hover:border-blue-100 h-full relative flex flex-col">
        <div className="flex justify-between items-start">
            <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Briefcase className="w-6 h-6 text-[#4169E1]" />
            </div>
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-black group-hover:text-[#4169E1] transition-colors">{job.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                    <p className="text-gray-700 font-medium">{job.company}</p>
                    {job.postedBy?.employerVerification?.level >= 1 && (
                         <span title="Verified Company" className="flex items-center text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-[10px] font-bold border border-blue-100 uppercase tracking-wider">
                            Verified <ShieldCheck size={10} className="ml-1" />
                        </span>
                    )}
                     {job.postedBy?.employerVerification?.level >= 2 && (
                         <span title="Registered Business" className="flex items-center text-green-600 bg-green-50 px-1.5 py-0.5 rounded text-[10px] font-bold border border-green-100 uppercase tracking-wider">
                            Reg. Business <CheckCircle size={10} className="ml-1" />
                        </span>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-3">
                <span className="flex items-center text-gray-500 text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location}
                </span>
                <span className="flex items-center text-gray-500 text-sm">
                    <Briefcase className="w-4 h-4 mr-1" />
                    {job.type}
                </span>
                <span className="flex items-center text-gray-500 text-sm">
                    <IndianRupee className="w-4 h-4 mr-1" />
                    {job.salaryType === 'Fixed' 
                        ? `Fixed: ${Number(job.salaryMin).toLocaleString()}` 
                        : job.salaryType === 'Starting From' 
                            ? `Starts from ${Number(job.salaryMin).toLocaleString()}` 
                            : `${Number(job.salaryMin).toLocaleString()} - ${Number(job.salaryMax).toLocaleString()}`
                    }
                    {job.salaryFrequency ? ` / ${job.salaryFrequency}` : ''}
                </span>
                <span className="flex items-center text-gray-500 text-sm">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(job.createdAt).toLocaleDateString()}
                </span>
                </div>
            </div>
            </div>
            <div className="flex flex-col items-end mt-2">
            <span className="whitespace-nowrap px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full mb-3 uppercase tracking-wide mt-6">
                {job.experienceMin} - {job.experienceMax} years
            </span>
            <span
                className="px-6 py-2 bg-white border-2 border-[#4169E1] text-[#4169E1] text-sm font-medium rounded-lg group-hover:bg-[#4169E1] group-hover:text-white transition-all duration-300 z-10 relative"
            >
                Apply Now
            </span>
            </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-50 flex-1">
            <div 
                className="text-gray-600 text-sm line-clamp-2 mb-4"
                dangerouslySetInnerHTML={{ __html: job.description }}
            />
            <div className="flex flex-wrap gap-2">
            {job.skills.map((skill, index) => (
                <span
                key={index}
                className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full border border-gray-100"
                >
                {skill}
                </span>
            ))}
            </div>
        </div>

        {(job.applyMethod === 'direct' || !job.applyMethod) && (
            <div className="absolute top-0 right-0">
                <span className="bg-[#4169E1] text-white text-[10px] font-bold px-3 py-1.5 rounded-bl-xl rounded-tr-xl shadow-sm uppercase tracking-wider flex items-center">
                   <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                   Direct Apply
                </span>
            </div>
        )}
        </div>
    </Link>
  );
};

export default JobCard;