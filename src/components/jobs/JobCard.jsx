import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, IndianRupee, Clock } from 'lucide-react';

const JobCard = ({ job }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-100 p-6 transition-all duration-300 group animate-fade-in-up hover:border-blue-100">
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Briefcase className="w-6 h-6 text-[#4169E1]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-black mb-1 group-hover:text-[#4169E1] transition-colors">{job.title}</h3>
            <p className="text-gray-700 font-medium">{job.company}</p>
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
                {job.salaryMin?.toLocaleString()} - {job.salaryMax?.toLocaleString()}
              </span>
              <span className="flex items-center text-gray-500 text-sm">
                <Clock className="w-4 h-4 mr-1" />
                {new Date(job.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full mb-3 uppercase tracking-wide">
            {job.experienceMin} - {job.experienceMax} years
          </span>
          <Link
            to={`/job/${job._id}`}
            className="px-6 py-2 bg-white border-2 border-[#4169E1] text-[#4169E1] text-sm font-medium rounded-lg hover:bg-[#4169E1] hover:text-white transition-all duration-300"
          >
            Apply Now
          </Link>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-50">
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{job.description}</p>
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
    </div>
  );
};

export default JobCard;