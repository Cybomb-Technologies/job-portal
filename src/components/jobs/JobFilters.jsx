import React from 'react';
import { Filter, X } from 'lucide-react';

const JobFilters = ({ filters, onFilterChange, clearFilters }) => {
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'];
  const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'];
  const salaryRanges = [
    '₹30k - ₹50k',
    '₹50k - ₹80k',
    '₹80k - ₹120k',
    '₹120k - ₹200k',
    '₹200k+',
  ];
  const locations = ['Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Mumbai', 'Delhi NCR', 'Gurgaon', 'Noida', 'Remote'];

  const handleCheckboxChange = (filterType, value) => {
      // Logic to toggle if it was an array, but here it seems to reflect single selection in previous code (radio behavior).
      // Re-reading previous code: it was single selection (checked={filters.jobType === type})
      // So onFilterChange should just set the value, or clear it if already selected.
      const newValue = filters[filterType] === value ? '' : value;
      onFilterChange(filterType, newValue);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-black flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Filters
        </h2>
        <button
          onClick={clearFilters}
          className="text-sm text-[#4169E1] hover:text-[#3A5FCD] flex items-center transition-all group px-3 py-1.5 rounded-lg border border-transparent hover:border-[#4169E1] hover:bg-blue-50 cursor-pointer"
        >
          <X className="w-4 h-4 mr-1 transition-transform group-hover:rotate-90 duration-300" />
          Clear all
        </button>
      </div>

      {/* Job Type Filter */}
      <div className="mb-6">
        <h3 className="font-medium text-black mb-3">Job Type</h3>
        <div className="space-y-2">
          {jobTypes.map((type) => (
            <label key={type} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="jobType"
                checked={filters.jobType === type}
                onChange={() => handleCheckboxChange('jobType', type)}
                className="sr-only"
              />
              <div className={`w-4 h-4 border rounded mr-3 flex items-center justify-center ${
                filters.jobType === type 
                  ? 'border-[#4169E1] bg-[#4169E1]' 
                  : 'border-gray-300'
              }`}>
                {filters.jobType === type && (
                  <div className="w-2 h-2 bg-white rounded-sm"></div>
                )}
              </div>
              <span className="text-gray-700">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Experience Level Filter */}
      <div className="mb-6">
        <h3 className="font-medium text-black mb-3">Experience Level</h3>
        <div className="space-y-2">
          {experienceLevels.map((level) => (
            <label key={level} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="experience"
                checked={filters.experience === level}
                onChange={() => handleCheckboxChange('experience', level)}
                className="sr-only"
              />
              <div className={`w-4 h-4 border rounded mr-3 flex items-center justify-center ${
                filters.experience === level 
                  ? 'border-[#4169E1] bg-[#4169E1]' 
                  : 'border-gray-300'
              }`}>
                {filters.experience === level && (
                  <div className="w-2 h-2 bg-white rounded-sm"></div>
                )}
              </div>
              <span className="text-gray-700">{level}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Salary Range Filter */}
      <div className="mb-6">
        <h3 className="font-medium text-black mb-3">Salary Range</h3>
        <div className="space-y-2">
          {salaryRanges.map((range) => (
            <label key={range} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="salaryRange"
                checked={filters.salaryRange === range}
                onChange={() => handleCheckboxChange('salaryRange', range)}
                className="sr-only"
              />
              <div className={`w-4 h-4 border rounded mr-3 flex items-center justify-center ${
                filters.salaryRange === range 
                  ? 'border-[#4169E1] bg-[#4169E1]' 
                  : 'border-gray-300'
              }`}>
                {filters.salaryRange === range && (
                  <div className="w-2 h-2 bg-white rounded-sm"></div>
                )}
              </div>
              <span className="text-gray-700">{range}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Location Filter */}
      <div>
        <h3 className="font-medium text-black mb-3">Location</h3>
        <div className="space-y-2">
          {locations.map((location) => (
            <label key={location} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="location"
                checked={filters.location === location}
                onChange={() => handleCheckboxChange('location', location)}
                className="sr-only"
              />
              <div className={`w-4 h-4 border rounded mr-3 flex items-center justify-center ${
                filters.location === location 
                  ? 'border-[#4169E1] bg-[#4169E1]' 
                  : 'border-gray-300'
              }`}>
                {filters.location === location && (
                  <div className="w-2 h-2 bg-white rounded-sm"></div>
                )}
              </div>
              <span className="text-gray-700">{location}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobFilters;