import React, { useState } from 'react';
import { DollarSign, MapPin, Briefcase, GraduationCap, Calculator, PieChart, TrendingUp, Search, IndianRupee, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { baseSalaries, locationMultipliers, educationMultipliers, experienceMultipliers } from '../data/salaryData';

const SalaryCalculator = () => {
  const [formData, setFormData] = useState({
    jobTitle: '',
    location: '',
    experience: '0-2',
    education: 'B.Tech / B.E.',
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false);

  // Sorting roles for better UX
  const commonRoles = Object.keys(baseSalaries).sort();
  const commonLocations = Object.keys(locationMultipliers).sort();

  const calculateSalary = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      let base = baseSalaries[formData.jobTitle];

      // If exact role not found, try to estimate based on keywords
      if (!base) {
        const title = formData.jobTitle.toLowerCase();
        // Heuristic fallback logic
        if (title.includes('director') || title.includes('vp') || title.includes('chief')) {
           base = 2500000;
        } else if (title.includes('manager') || title.includes('lead') || title.includes('head')) {
           base = 1500000;
        } else if (title.includes('architect') || title.includes('principal')) {
           base = 2000000;
        } else if (title.includes('senior') || title.includes('sr.')) {
           base = 1200000;
        } else if (title.includes('intern') || title.includes('trainee')) {
           base = 300000;
        } else if (title.includes('engineer') || title.includes('developer')) {
           base = 700000;
        } else {
           base = 500000; // Generic default
        }
      }
      
      const expMult = experienceMultipliers[formData.experience] || 1.0;
      const eduMult = educationMultipliers[formData.education] || 1.0;
      const locMult = locationMultipliers[formData.location] || 1.0;

      const estimatedMedian = Math.round(base * expMult * eduMult * locMult);
      const estimatedLow = Math.round(estimatedMedian * 0.80);
      const estimatedHigh = Math.round(estimatedMedian * 1.20);

      setResult({
        low: estimatedLow,
        median: estimatedMedian,
        high: estimatedHigh,
        breakdown: {
            base: Math.round(estimatedMedian * 0.80),
            bonus: Math.round(estimatedMedian * 0.15),
            benefits: Math.round(estimatedMedian * 0.05),
        }
      });
      setLoading(false);
    }, 800);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <div className="bg-black text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold !text-white mb-6">Salary Calculator</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Know your worth in the Indian Job Market. Get accurate salary estimates based on your role, location, and experience.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Input Form Column */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-[#4169E1]" />
                Calculate Your Pay
              </h2>
              <form onSubmit={calculateSalary} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3.5 text-gray-400 w-5 h-5 pointer-events-none" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] outline-none"
                      placeholder="e.g. Software Engineer"
                      value={formData.jobTitle}
                      onChange={(e) => {
                        setFormData({...formData, jobTitle: e.target.value});
                        setShowRoleSuggestions(true);
                      }}
                      onFocus={() => setShowRoleSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowRoleSuggestions(false), 200)}
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 cursor-pointer" onClick={() => setShowRoleSuggestions(!showRoleSuggestions)}>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                    
                    {showRoleSuggestions && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {commonRoles
                          .filter(role => role.toLowerCase().includes(formData.jobTitle.toLowerCase()))
                          .map((role) => (
                            <div 
                              key={role}
                              className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700"
                              onMouseDown={() => {
                                setFormData({...formData, jobTitle: role});
                                setShowRoleSuggestions(false);
                              }}
                            >
                              {role}
                            </div>
                        ))}
                        {commonRoles.filter(role => role.toLowerCase().includes(formData.jobTitle.toLowerCase())).length === 0 && (
                             <div className="px-4 py-2 text-sm text-gray-500 italic">Type to add custom role...</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 text-gray-400 w-5 h-5 pointer-events-none" />
                    <select
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] outline-none bg-white appearance-none"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      required
                    >
                      <option value="" disabled>Select a location...</option>
                      {commonLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                        <select
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] outline-none bg-white"
                            value={formData.experience}
                            onChange={(e) => setFormData({...formData, experience: e.target.value})}
                        >
                            {Object.keys(experienceMultipliers).map(exp => (
                                <option key={exp} value={exp}>{exp} Years</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                        <select
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] outline-none bg-white"
                            value={formData.education}
                            onChange={(e) => setFormData({...formData, education: e.target.value})}
                        >
                            {Object.keys(educationMultipliers).map(edu => (
                                <option key={edu} value={edu}>{edu}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#4169E1] font-bold py-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-white"
                >
                  {loading ? (
                    <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    'Calculate Salary'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-8">
            {!result ? (
              <div className="bg-white rounded-xl shadow-lg p-6 md:p-12 text-center h-full flex flex-col justify-center items-center md:min-h-[500px]">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                    <TrendingUp className="w-10 h-10 text-[#4169E1]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">View Your Salary Estimate</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                    Enter your job details to see the estimated market rate for your role in India.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Main Estimate Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-100 pb-6">
                        <div>
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-1">Estimated Yearly Salary</h2>
                            <h3 className="text-3xl font-bold text-gray-900">{formData.jobTitle}</h3>
                            <p className="text-gray-500 flex items-center mt-2">
                                <MapPin className="w-4 h-4 mr-1" /> {formData.location || 'Remote'}
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0 text-right">
                             <div className="text-3xl md:text-5xl font-bold text-[#4169E1] flex items-center justify-end">
                                {formatCurrency(result.median)}
                             </div>
                             <div className="text-sm text-gray-500 mt-1">Median Annual Salary (CTC)</div>
                        </div>
                    </div>

                    {/* Range Bar */}
                    <div className="mb-8">
                        <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
                            <span>Low: {formatCurrency(result.low)}</span>
                            <span>High: {formatCurrency(result.high)}</span>
                        </div>
                        <div className="h-4 bg-gray-100 rounded-full overflow-hidden relative">
                            <div className="absolute top-0 bottom-0 left-[20%] right-[20%] bg-blue-100"></div>
                            <div className="absolute top-0 bottom-0 left-[50%] w-1 bg-[#4169E1] transform -translate-x-1/2"></div>
                        </div>
                         <div className="text-center text-xs text-gray-400 mt-2">
                            Typical range for this role & location
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Base Salary</div>
                            <div className="font-bold text-gray-900">{formatCurrency(result.breakdown.base)}</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Estimated Bonus</div>
                            <div className="font-bold text-green-600">+{formatCurrency(result.breakdown.bonus)}</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Benefits Value</div>
                            <div className="font-bold text-blue-600">+{formatCurrency(result.breakdown.benefits)}</div>
                        </div>
                    </div>
                </div>

                {/* CTA Card */}
                 <div className="bg-[#4169E1] rounded-xl shadow-lg p-8 text-white flex flex-col md:flex-row items-center justify-between">
                    <div className="mb-6 md:mb-0">
                        <h3 className="text-2xl font-bold mb-2">Ready to earn what you're worth?</h3>
                        <p className="text-blue-100">Explore open positions for {formData.jobTitle} now.</p>
                    </div>
                    <Link 
                        to="/jobs" 
                        state={{ searchTerm: formData.jobTitle, location: formData.location }}
                        className="bg-white text-[#4169E1] px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center"
                    >
                        <Search className="w-5 h-5 mr-2" />
                        Find Jobs
                    </Link>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryCalculator;
