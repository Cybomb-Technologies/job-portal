import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { User, Mail, CheckCircle, AlertCircle, Camera, Plus, Trash2, FileText, Download, ExternalLink } from 'lucide-react';

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const startYear = 1970;
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);

const ProfileDetails = () => {
    const { user, login } = useAuth();
    
    // Basic Info
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [title, setTitle] = useState('');
    const [about, setAbout] = useState('');
    const [skills, setSkills] = useState('');
    
    // Structured Data
    const [experience, setExperience] = useState([]);
    const [education, setEducation] = useState([]);
    const [certifications, setCertifications] = useState([]);
    
    // Files
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [resume, setResume] = useState(null);
    const [existingResume, setExistingResume] = useState(null);
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setTitle(user.title || '');
            setAbout(user.about || '');
            setSkills(user.skills ? user.skills.join(', ') : '');
            
            // Experience
            if (Array.isArray(user.experience)) {
                setExperience(user.experience);
            } else if (typeof user.experience === 'string' && user.experience) {
                 // Convert legacy string experience to object if needed, or just allow reset
                 setExperience([{ title: 'Legacy Experience', description: user.experience, company: '', startYear: '', endYear: '' }]);
            } else {
                setExperience([]);
            }

            // Education
            if (Array.isArray(user.education)) {
                setEducation(user.education);
            } else if (typeof user.education === 'string' && user.education) {
                 setEducation([{ institute: user.education, degree: '', fieldOfStudy: '', startYear: '', endYear: '' }]);
            } else {
                 setEducation([]);
            }

            // Certifications
            setCertifications(Array.isArray(user.certifications) ? user.certifications : []);
            
            // Profile Picture
            if (user.profilePicture) {
                const isFullUrl = user.profilePicture.startsWith('http');
                setPreviewUrl(isFullUrl ? user.profilePicture : `${import.meta.env.VITE_API_URL.replace('/api', '')}${user.profilePicture}`);
            }

            // Resume
            setExistingResume(user.resume);
        }
    }, [user]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };
    
    const handleResumeChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setResume(file);
        }
    };

    // --- Experience Handlers ---
    const addExperience = () => {
        setExperience([...experience, { title: '', company: '', startYear: '', endYear: '', description: '' }]);
    };

    const updateExperience = (index, field, value) => {
        const updated = [...experience];
        updated[index][field] = value;
        setExperience(updated);
    };

    const removeExperience = (index) => {
        const updated = experience.filter((_, i) => i !== index);
        setExperience(updated);
    };

    // --- Education Handlers ---
    const addEducation = () => {
        setEducation([...education, { institute: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '' }]);
    };

    const updateEducation = (index, field, value) => {
        const updated = [...education];
        updated[index][field] = value;
        setEducation(updated);
    };

    const removeEducation = (index) => {
        const updated = education.filter((_, i) => i !== index);
        setEducation(updated);
    };

    // --- Certification Handlers ---
    const addCertification = () => {
        setCertifications([...certifications, '']);
    };

    const updateCertification = (index, value) => {
        const updated = [...certifications];
        updated[index] = value;
        setCertifications(updated);
    };

    const removeCertification = (index) => {
        const updated = certifications.filter((_, i) => i !== index);
        setCertifications(updated);
    };
    
    const handleDeleteResume = async () => {
         if (!confirm("Are you sure you want to delete your resume?")) return;
         try {
             // We use the update endpoint but pass a flag
             const formData = new FormData();
             formData.append('deleteResume', 'true');
             const { data } = await api.put('/auth/profile', formData);
             login(data);
             setExistingResume(null);
             setMessage('Resume deleted successfully');
         } catch (err) {
             setError('Failed to delete resume');
         }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setError(null);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('title', title);
        formData.append('about', about);
        formData.append('skills', skills);
        
        // Append JSON strings for arrays
        formData.append('experience', JSON.stringify(experience));
        formData.append('education', JSON.stringify(education));
        formData.append('certifications', JSON.stringify(certifications));

        if (profilePicture) {
            formData.append('profilePicture', profilePicture);
        }
        
        if (resume) {
            formData.append('resume', resume);
        }

        try {
            const { data } = await api.put('/auth/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            // Update local user context
            login(data);
            
            setMessage('Profile updated successfully');
            setResume(null); // Clear pending upload
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-black mb-6">Profile Details</h2>

            {message && (
                <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center mb-6">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {message}
                </div>
            )}

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center mb-6">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Profile Picture Upload */}
                <div className="flex items-center space-x-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-10 h-10 text-gray-400" />
                            )}
                        </div>
                        <label 
                            htmlFor="profile-upload" 
                            className="absolute bottom-0 right-0 bg-[#4169E1] text-white p-2 rounded-full cursor-pointer hover:bg-[#3A5FCD] shadow-sm"
                        >
                            <Camera className="w-4 h-4" />
                            <input 
                                id="profile-upload"
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900">Profile Picture</h3>
                        <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                    </div>
                </div>


                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Full Name</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169E1] focus:border-transparent outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Email Address</label>
                        <input 
                            type="email" 
                            value={email}
                            disabled
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                        />
                         <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
                    </div>
                    
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Professional Title</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Senior Frontend Developer"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169E1] focus:border-transparent outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Skills (Comma separated)</label>
                        <input 
                            type="text" 
                            placeholder="React, Node.js, TypeScript..."
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169E1] focus:border-transparent outline-none"
                        />
                    </div>
                    
                    <div className="md:col-span-2">
                        <label className="block text-gray-700 font-medium mb-2">About</label>
                        <textarea 
                            placeholder="Tell us about yourself..."
                            value={about}
                            onChange={(e) => setAbout(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169E1] focus:border-transparent outline-none h-32 resize-none"
                        ></textarea>
                    </div>
                </div>

                <div className="border-t border-gray-100 my-6"></div>

                {/* Experience Section */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                         <h3 className="text-lg font-semibold text-gray-800">Work Experience</h3>
                         <button type="button" onClick={addExperience} className="text-[#4169E1] text-sm font-medium hover:underline flex items-center">
                            <Plus className="w-4 h-4 mr-1" /> Add Position
                         </button>
                    </div>
                    
                    <div className="space-y-6">
                        {experience.map((exp, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-center mb-4">
                                     <h4 className="text-sm font-medium text-gray-500">Position {index + 1}</h4>
                                     <button type="button" onClick={() => removeExperience(index)} className="text-gray-400 hover:text-red-500 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                     <input 
                                        type="text" 
                                        placeholder="Job Title" 
                                        value={exp.title} 
                                        onChange={(e) => updateExperience(index, 'title', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#4169E1]"
                                    />
                                     <input 
                                        type="text" 
                                        placeholder="Company Name" 
                                        value={exp.company} 
                                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#4169E1]"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                     <div className="flex gap-2">
                                        <select
                                            value={exp.startMonth || ''}
                                            onChange={(e) => updateExperience(index, 'startMonth', e.target.value)}
                                            className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#4169E1]"
                                        >
                                            <option value="">Start Month</option>
                                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                        <select
                                            value={exp.startYear || ''}
                                            onChange={(e) => updateExperience(index, 'startYear', e.target.value)}
                                            className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#4169E1]"
                                        >
                                            <option value="">Year</option>
                                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                     </div>
                                     <div className="flex gap-2">
                                        <select
                                            value={exp.endMonth || ''}
                                            onChange={(e) => updateExperience(index, 'endMonth', e.target.value)}
                                            className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#4169E1]"
                                        >
                                            <option value="">End Month</option>
                                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                        <select
                                            value={exp.endYear || ''}
                                            onChange={(e) => updateExperience(index, 'endYear', e.target.value)}
                                            className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#4169E1]"
                                        >
                                            <option value="">Year</option>
                                            <option value="Present">Present</option>
                                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                     </div>
                                </div>
                                <textarea 
                                    placeholder="Description of responsibilities..."
                                    value={exp.description}
                                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#4169E1] h-20 resize-none"
                                ></textarea>
                            </div>
                        ))}
                        {experience.length === 0 && <p className="text-gray-500 italic text-sm">No experience added yet.</p>}
                    </div>
                </div>

                <div className="border-t border-gray-100 my-6"></div>

                {/* Education Section */}
                 <div>
                    <div className="flex justify-between items-center mb-4">
                         <h3 className="text-lg font-semibold text-gray-800">Education</h3>
                         <button type="button" onClick={addEducation} className="text-[#4169E1] text-sm font-medium hover:underline flex items-center">
                            <Plus className="w-4 h-4 mr-1" /> Add Education
                         </button>
                    </div>
                    
                    <div className="space-y-6">
                        {education.map((edu, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-center mb-4">
                                     <h4 className="text-sm font-medium text-gray-500">Education {index + 1}</h4>
                                     <button type="button" onClick={() => removeEducation(index)} className="text-gray-400 hover:text-red-500 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                     <input 
                                        type="text" 
                                        placeholder="Institute Name" 
                                        value={edu.institute} 
                                        onChange={(e) => updateEducation(index, 'institute', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#4169E1]"
                                    />
                                     <input 
                                        type="text" 
                                        placeholder="Degree (e.g. BS)" 
                                        value={edu.degree} 
                                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#4169E1]"
                                    />
                                </div>
                                 <div className="mb-4">
                                     <input 
                                        type="text" 
                                        placeholder="Field of Study (e.g. Computer Science)" 
                                        value={edu.fieldOfStudy} 
                                        onChange={(e) => updateEducation(index, 'fieldOfStudy', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#4169E1]"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div>
                                        <select
                                            value={edu.startYear || ''}
                                            onChange={(e) => updateEducation(index, 'startYear', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#4169E1]"
                                        >
                                            <option value="">Start Year</option>
                                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                     </div>
                                     <div>
                                        <select
                                            value={edu.endYear || ''}
                                            onChange={(e) => updateEducation(index, 'endYear', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#4169E1]"
                                        >
                                            <option value="">End Year</option>
                                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                     </div>
                                </div>
                            </div>
                        ))}
                         {education.length === 0 && <p className="text-gray-500 italic text-sm">No education added yet.</p>}
                    </div>
                </div>

                <div className="border-t border-gray-100 my-6"></div>

                {/* Certifications Section */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                         <h3 className="text-lg font-semibold text-gray-800">Certifications</h3>
                         <button type="button" onClick={addCertification} className="text-[#4169E1] text-sm font-medium hover:underline flex items-center">
                            <Plus className="w-4 h-4 mr-1" /> Add Certification
                         </button>
                    </div>
                    <div className="space-y-3">
                         {certifications.map((cert, index) => (
                             <div key={index} className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Certification Name & Authority" 
                                    value={cert} 
                                    onChange={(e) => updateCertification(index, e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#4169E1]"
                                />
                                <button type="button" onClick={() => removeCertification(index)} className="text-gray-400 hover:text-red-500 px-2">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                             </div>
                         ))}
                         {certifications.length === 0 && <p className="text-gray-500 italic text-sm">No certifications added yet.</p>}
                    </div>
                </div>

                <div className="border-t border-gray-100 my-6"></div>

                {/* Resume Section */}
                <div>
                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Resume</h3>
                     <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        {existingResume ? (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <FileText className="w-8 h-8 text-[#4169E1] mr-3" />
                                    <div>
                                        <p className="font-medium text-gray-900">Current Resume</p>
                                        <a 
                                            href={existingResume.startsWith('http') ? existingResume : `${import.meta.env.VITE_API_URL.replace('/api', '')}${existingResume}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-sm text-[#4169E1] hover:underline flex items-center mt-1"
                                        >
                                            View Resume <ExternalLink className="w-3 h-3 ml-1" />
                                        </a>
                                    </div>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={handleDeleteResume}
                                    className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
                                >
                                    <Trash2 className="w-4 h-4 mr-1" /> Remove
                                </button>
                            </div>
                        ) : (
                            <div className="text-center">
                                 <div className="max-w-xs mx-auto">
                                    <label className="flex flex-col items-center px-4 py-6 bg-white text-[#4169E1] rounded-lg shadow-sm border border-dashed border-[#4169E1] cursor-pointer hover:bg-blue-50 transition-colors">
                                        <UploadIcon />
                                        <span className="mt-2 text-sm font-medium">{resume ? resume.name : 'Upload Resume (PDF, DOCX)'}</span>
                                        <input type='file' className="hidden" accept=".pdf,.doc,.docx" onChange={handleResumeChange} />
                                    </label>
                                </div>
                            </div>
                        )}
                        
                        {resume && !existingResume && (
                             <div className="mt-4 flex items-center justify-center text-sm text-green-600">
                                <CheckCircle className="w-4 h-4 mr-2" /> Ready to upload: {resume.name}
                             </div>
                        )}
                     </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-[#4169E1] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#3A5FCD] disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const UploadIcon = () => (
    <svg className="w-8 h-8 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
    </svg>
);

export default ProfileDetails;
