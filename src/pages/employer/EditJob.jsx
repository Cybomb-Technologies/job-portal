import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Briefcase, MapPin, IndianRupee, Clock, BookOpen, User, Building } from 'lucide-react';
import api from '../../api';

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    companyDescription: '',
    location: '',
    type: 'Full-time',
    salaryMin: '',
    salaryMax: '',
    experienceMin: '',
    experienceMax: '',
    description: '',
    skills: '',
    jobRole: '',
    functionalArea: '',
    education: '',
    benefits: '' 
  });

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
        const { data } = await api.get(`/jobs/${id}`);
        setFormData({
            title: data.title || '',
            company: data.company || '',
            companyDescription: data.companyDescription || '',
            location: data.location || '',
            type: data.type || 'Full-time',
            salaryMin: data.salaryMin || '',
            salaryMax: data.salaryMax || '',
            experienceMin: data.experienceMin || '',
            experienceMax: data.experienceMax || '',
            description: data.description || '',
            skills: data.skills ? data.skills.join(', ') : '',
            jobRole: data.jobRole || '',
            functionalArea: data.functionalArea || '',
            education: data.education || '',
            benefits: data.benefits ? data.benefits.join(', ') : ''
        });
        setLoading(false);
    } catch (err) {
        setError('Failed to fetch job details');
        setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const skillsArray = formData.skills.split(',').map(skill => skill.trim());
      const benefitsArray = formData.benefits.split(',').map(b => b.trim());
      
      await api.put(`/jobs/${id}`, { 
        ...formData, 
        skills: skillsArray,
        benefits: benefitsArray,
        salaryMin: Number(formData.salaryMin),
        salaryMax: Number(formData.salaryMax),
        experienceMin: Number(formData.experienceMin),
        experienceMax: Number(formData.experienceMax)
      });
      navigate('/employer/my-jobs');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update job');
    } finally {
      setSaving(false);
    }
  };

  const SectionTitle = ({ icon: Icon, title }) => (
      <div className="flex items-center space-x-2 mb-6 pb-2 border-b border-gray-200">
          <Icon className="w-5 h-5 text-[#4169E1]" />
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>
  );

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-black mb-6 transition-colors"
        >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-3xl font-bold text-black mb-2">Edit Job Post</h1>
            <p className="text-gray-500 mb-8">Update your job listing details.</p>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Same form fields as PostJob */}
                <div>
                     <SectionTitle icon={Briefcase} title="Basic Details" />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                             <label className="label">Job Title *</label>
                             <input type="text" name="title" required value={formData.title} onChange={handleChange} className="input-field" />
                        </div>
                         <div>
                             <label className="label">Job Role</label>
                             <input type="text" name="jobRole" value={formData.jobRole} onChange={handleChange} className="input-field" />
                        </div>
                        <div>
                             <label className="label">Functional Area</label>
                             <input type="text" name="functionalArea" value={formData.functionalArea} onChange={handleChange} className="input-field" />
                        </div>
                         <div>
                            <label className="label">Job Type *</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="input-field bg-white">
                                <option>Full-time</option>
                                <option>Part-time</option>
                                <option>Contract</option>
                                <option>Internship</option>
                                <option>Remote</option>
                                <option>Hybrid</option>
                            </select>
                        </div>
                         <div>
                             <label className="label">Location *</label>
                             <input type="text" name="location" required value={formData.location} onChange={handleChange} className="input-field" />
                        </div>
                     </div>
                </div>

                {/* Company Details */}
                <div>
                    <SectionTitle icon={Building} title="Company Details" />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                             <label className="label">Company Name *</label>
                             <input type="text" name="company" required value={formData.company} onChange={handleChange} className="input-field" />
                        </div>
                         <div className="md:col-span-2">
                             <label className="label">Company Description</label>
                             <textarea name="companyDescription" rows="3" value={formData.companyDescription} onChange={handleChange} className="input-field"></textarea>
                        </div>
                     </div>
                </div>

                {/* Requirements */}
                <div>
                    <SectionTitle icon={IndianRupee} title="Compensation & Experience" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="label">Min Salary (Annual) *</label>
                            <input type="number" name="salaryMin" required value={formData.salaryMin} onChange={handleChange} className="input-field" />
                        </div>
                        <div>
                            <label className="label">Max Salary (Annual) *</label>
                            <input type="number" name="salaryMax" required value={formData.salaryMax} onChange={handleChange} className="input-field" />
                        </div>
                        <div>
                             <label className="label">Min Experience (Years) *</label>
                             <input type="number" name="experienceMin" required value={formData.experienceMin} onChange={handleChange} className="input-field" />
                        </div>
                         <div>
                             <label className="label">Max Experience (Years) *</label>
                             <input type="number" name="experienceMax" required value={formData.experienceMax} onChange={handleChange} className="input-field" />
                        </div>
                    </div>
                </div>

                 {/* Skills & Education */}
                 <div>
                    <SectionTitle icon={BookOpen} title="Skills & Education" />
                    <div className="space-y-6">
                         <div>
                            <label className="label">Key Skills (Comma separated) *</label>
                            <input type="text" name="skills" required value={formData.skills} onChange={handleChange} className="input-field" />
                        </div>
                        <div>
                            <label className="label">Education / Qualification</label>
                            <input type="text" name="education" value={formData.education} onChange={handleChange} className="input-field" />
                        </div>
                    </div>
                </div>

                {/* Job Description & Benefits */}
                <div>
                    <SectionTitle icon={User} title="Job Description" />
                    <div className="space-y-6">
                        <div>
                            <label className="label">Job Description *</label>
                            <textarea name="description" required rows="8" value={formData.description} onChange={handleChange} className="input-field"></textarea>
                        </div>
                        <div>
                             <label className="label">Benefits (Comma separated)</label>
                             <input type="text" name="benefits" value={formData.benefits} onChange={handleChange} className="input-field" />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 mr-4 text-gray-600 font-medium hover:text-black transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className={`bg-[#4169E1] text-white font-bold px-8 py-3 rounded-xl transition shadow-lg shadow-blue-500/30 flex items-center space-x-2 hover:bg-[#3A5FCD] ${saving ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {saving ? 'Updating...' : (
                            <>
                                <Save className="w-5 h-5" />
                                <span>Update Job</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
      </div>

        <style>{`
            .label {
                display: block;
                font-size: 0.875rem;
                font-weight: 500;
                color: #374151;
                margin-bottom: 0.5rem;
            }
            .input-field {
                width: 100%;
                padding: 0.75rem 1rem;
                border: 1px solid #D1D5DB;
                border-radius: 0.75rem;
                transition: all 0.2s;
            }
            .input-field:focus {
                outline: none;
                border-color: #4169E1;
                box-shadow: 0 0 0 2px rgba(65, 105, 225, 0.2);
            }
        `}</style>
    </div>
  );
};

export default EditJob;
