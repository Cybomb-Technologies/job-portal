import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    ArrowLeft, Save, Briefcase, MapPin, IndianRupee, Clock, 
    BookOpen, User, Building, Check, ChevronRight, ChevronLeft, 
    Plus, Trash2, HelpCircle, Info, Sparkles 
} from 'lucide-react';
import api from '../../api';
import { commonJobTitles, commonSkills, commonBenefits, commonPreScreeningQuestions, commonFunctionalAreas, commonDegrees, commonFieldsOfStudy, commonRecruitmentDurations } from '../../utils/profileData';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const quillModules = {
    toolbar: [
        ['bold', 'italic', 'underline'],
        [{'list': 'ordered'}, {'list': 'bullet'}]
    ],
};

const quillFormats = [
    'bold', 'italic', 'underline',
    'list', 'bullet'
];

const PostJob = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    
    // Form State
    const [formData, setFormData] = useState({
        // Step 1: Basics
        title: '',
        jobRole: '',
        functionalArea: '',
        type: 'Full-time',
        location: '',
        recruitmentDuration: '',
        
        // Step 2: Company
        company: '',
        companyDescription: '',
        
        // Step 3: Compensation & Experience
        salaryType: 'Range', // Range, Fixed, Starting From
        salaryFrequency: 'Year', // Year, Month, Week, Hour
        salaryMin: '',
        salaryMax: '',
        experienceMin: '',
        experienceMax: '',
        
        // Step 4: Description & Benefits
        description: '',
        benefits: [], // Array of strings
        skills: [], // Array of strings
        education: '',
        fieldOfStudy: '', // New Field
        applyMethod: 'direct',
        applyUrl: '',

        // Step 5: Screening
        preScreeningQuestions: [] // Array of strings
    });

    // Helper State
    const [customBenefit, setCustomBenefit] = useState('');
    const [customQuestion, setCustomQuestion] = useState('');
    const [skillInput, setSkillInput] = useState('');

    // Autocomplete States
    const [suggestions, setSuggestions] = useState({
        title: [],
        jobRole: [],
        functionalArea: [],
        location: [],
        skills: [],
        education: [],
        fieldOfStudy: [],
        recruitmentDuration: []
    });
    const [showSuggestions, setShowSuggestions] = useState({
        title: false,
        jobRole: false,
        functionalArea: false,
        location: false,
        skills: false,
        education: false,
        fieldOfStudy: false,
        recruitmentDuration: false
    });
    const [isLoadingLocations, setIsLoadingLocations] = useState(false);

    // Fetch Job Details if Editing
    useEffect(() => {
        if (id) {
            const fetchJob = async () => {
                setFetching(true);
                try {
                    const { data } = await api.get(`/jobs/${id}`);
                    setFormData({
                        title: data.title || '',
                        jobRole: data.jobRole || '',
                        functionalArea: data.functionalArea || '',
                        type: data.type || 'Full-time',
                        location: data.location || '',
                        company: data.company || '',
                        companyDescription: data.companyDescription || '',
                        recruitmentDuration: data.recruitmentDuration || '',
                        salaryType: data.salaryType || (data.salaryMax === data.salaryMin ? 'Fixed' : 'Range'), // Infer type if missing, assume range usually
                        salaryFrequency: data.salaryFrequency || 'Year',
                         // Ensure we don't display '0' if it was empty, but backend sends numbers. 
                         // If backend sends strings, it's fine. If numbers, toString() protects ??
                        salaryMin: data.salaryMin,
                        salaryMax: data.salaryMax,
                        experienceMin: data.experienceMin,
                        experienceMax: data.experienceMax,
                        description: data.description || '',
                        benefits: data.benefits || [],
                        skills: data.skills || [],
                        education: data.education || '',
                        fieldOfStudy: data.fieldOfStudy || '',
                        applyMethod: data.applyMethod || 'direct',
                        applyUrl: data.applyUrl || '',
                        preScreeningQuestions: data.preScreeningQuestions || []
                    });
                } catch (err) {
                    console.error('Failed to fetch job details', err);
                    Swal.fire('Error', 'Failed to load job details', 'error');
                    navigate('/employer/my-jobs');
                } finally {
                    setFetching(false);
                }
            };
            fetchJob();
        }
    }, [id]);


    // --- Data Loaders ---
    // (Similar logic to ProfileDetails for Location)
    useEffect(() => {
        const fetchLocations = async () => {
            if (formData.location.length > 2) {
                setIsLoadingLocations(true);
                try {
                const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(formData.location)}&count=5&language=en&format=json`);
                const data = await response.json();
                setSuggestions(prev => ({ ...prev, location: data.results || [] }));
                } catch (err) { console.error(err); } 
                finally { setIsLoadingLocations(false); }
            }
        };
        const timer = setTimeout(fetchLocations, 400);
        return () => clearTimeout(timer);
    }, [formData.location]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // Simple local filtering for static lists
        // Ensure other suggestions are hidden when typing in one
        setShowSuggestions({
            title: false,
            jobRole: false,
            functionalArea: false,
            location: false,
            skills: false,
            education: false,
            fieldOfStudy: false,
            recruitmentDuration: false,
            [name]: true // Open only current
        });
        if (name === 'title') {
             const filtered = commonJobTitles.filter(t => t.toLowerCase().includes(value.toLowerCase())).slice(0, 5);
             setSuggestions(prev => ({ ...prev, title: filtered }));
        }
        if (name === 'jobRole') {
             const filtered = commonJobTitles.filter(t => t.toLowerCase().includes(value.toLowerCase())).slice(0, 5);
             setSuggestions(prev => ({ ...prev, jobRole: filtered }));
        }
        if (name === 'functionalArea') {
             const filtered = commonFunctionalAreas.filter(t => t.toLowerCase().includes(value.toLowerCase())).slice(0, 5);
             setSuggestions(prev => ({ ...prev, functionalArea: filtered }));
        }
        if (name === 'education') {
             const filtered = commonDegrees.filter(t => t.toLowerCase().includes(value.toLowerCase())).slice(0, 5);
             setSuggestions(prev => ({ ...prev, education: filtered }));
        }
        if (name === 'fieldOfStudy') {
             const filtered = commonFieldsOfStudy.filter(t => t.toLowerCase().includes(value.toLowerCase())).slice(0, 5);
             setSuggestions(prev => ({ ...prev, fieldOfStudy: filtered }));
        }
        if (name === 'recruitmentDuration') {
             const filtered = commonRecruitmentDurations.filter(t => t.toLowerCase().includes(value.toLowerCase()));
             setSuggestions(prev => ({ ...prev, recruitmentDuration: filtered }));
        }
        if (name === 'location') setShowSuggestions(prev => ({ ...prev, location: true }));
    };

    const handleFocus = (field) => {
        setShowSuggestions({
            title: false,
            jobRole: false,
            functionalArea: false,
            location: false,
            skills: false,
            education: false,
            fieldOfStudy: false,
            recruitmentDuration: false,
            [field]: true
        });

        if (field === 'recruitmentDuration') {
             setSuggestions(prev => ({ ...prev, recruitmentDuration: commonRecruitmentDurations }));
        }
    };

    const selectSuggestion = (field, value) => {
        setFormData({ ...formData, [field]: value });
        setShowSuggestions({ ...showSuggestions, [field]: false });
    };

    // --- Array Handlers ---
    const toggleBenefit = (benefit) => {
        setFormData(prev => {
            const exists = prev.benefits.includes(benefit);
            return {
                ...prev,
                benefits: exists ? prev.benefits.filter(b => b !== benefit) : [...prev.benefits, benefit]
            };
        });
    };

    const addCustomBenefit = () => {
        if (customBenefit && !formData.benefits.includes(customBenefit)) {
            setFormData(prev => ({ ...prev, benefits: [...prev.benefits, customBenefit] }));
            setCustomBenefit('');
        }
    };

    const addScreeningQuestion = (question) => {
        if (!formData.preScreeningQuestions.includes(question)) {
            setFormData(prev => ({ ...prev, preScreeningQuestions: [...prev.preScreeningQuestions, question] }));
        }
    };

    const removeScreeningQuestion = (index) => {
        setFormData(prev => ({
            ...prev,
            preScreeningQuestions: prev.preScreeningQuestions.filter((_, i) => i !== index)
        }));
    };

    const addCustomQuestion = () => {
        if (customQuestion) {
            addScreeningQuestion(customQuestion);
            setCustomQuestion('');
        }
    };

    const handleSkillKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const val = skillInput.trim();
            if (val && !formData.skills.includes(val)) {
                setFormData(prev => ({ ...prev, skills: [...prev.skills, val] }));
                setSkillInput('');
                setShowSuggestions(prev => ({ ...prev, skills: false }));
            }
        }
    };

    const handleSkillInput = (e) => {
        const val = e.target.value;
        setSkillInput(val);
        const filtered = commonSkills.filter(s => s.toLowerCase().includes(val.toLowerCase())).slice(0, 5);
        setSuggestions(prev => ({ ...prev, skills: filtered }));
        setShowSuggestions(prev => ({ ...prev, skills: true }));
    };

    const selectSkillSuggestion = (_, val) => {
        if (val && !formData.skills.includes(val)) {
             setFormData(prev => ({ ...prev, skills: [...prev.skills, val] }));
             setSkillInput('');
             setShowSuggestions(prev => ({ ...prev, skills: false }));
        }
    };

    const removeSkill = (skill) => {
        setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
    };

    // --- Validation & Navigation ---
    const validateStep = (step) => {
        switch(step) {
            case 1:
                if (!formData.title || !formData.type || !formData.location || !formData.recruitmentDuration) return false;
                break;
            case 2:
                if (!formData.company) return false;
                break;
            case 3: 
                if (!formData.experienceMin || !formData.experienceMax) return false;
                if (formData.salaryType === 'Range' && (!formData.salaryMin || !formData.salaryMax)) return false;
                if ((formData.salaryType === 'Fixed' || formData.salaryType === 'Starting From') && !formData.salaryMin) return false;
                break;
            case 4:
                // Check if description is empty or just has empty html tags
                const isDescriptionEmpty = !formData.description || formData.description.replace(/<(.|\n)*?>/g, '').trim().length === 0;
                if (isDescriptionEmpty || formData.skills.length === 0) return false;
                if (formData.applyMethod === 'website' && !formData.applyUrl) return false;
                break;
            default: return true;
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 5));
            window.scrollTo(0, 0);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Missing Fields',
                text: 'Please fill in all required fields marked with *',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        window.scrollTo(0, 0);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Formatting payload to match backend schema
            const payload = {
                ...formData,
                salaryMin: Number(formData.salaryMin),
                // Fix: Ensure salaryMax has a value. logic: if range, use max. if fixed/starting, use min (or logic can vary, but standardizing to min avoids backend validation error)
                salaryMax: formData.salaryType === 'Range' ? Number(formData.salaryMax) : Number(formData.salaryMin),
                experienceMin: Number(formData.experienceMin),
                experienceMax: Number(formData.experienceMax),
                // Ensure arrays are arrays
                benefits: formData.benefits,
                skills: formData.skills,
                preScreeningQuestions: formData.preScreeningQuestions
            };

            if (id) {
                await api.put(`/jobs/${id}`, payload);
                 Swal.fire({
                    icon: 'success',
                    title: 'Job Updated!',
                    text: 'Your job listing has been updated successfully.',
                    confirmButtonColor: '#4169E1'
                }).then(() => {
                    navigate('/employer/my-jobs');
                });
            } else {
                await api.post('/jobs', payload);
                 Swal.fire({
                    icon: 'success',
                    title: 'Job Posted Successfully!',
                    text: 'Your job listing is now live.',
                    confirmButtonColor: '#4169E1'
                }).then(() => {
                    navigate('/employer/my-jobs');
                });
            }

        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: id ? 'Update Failed' : 'Post Failed',
                text: err.response?.data?.message || 'Something went wrong. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    // --- Components ---
    const Stepper = () => {
        const steps = [
            { num: 1, label: 'Basics' },
            { num: 2, label: 'Company' },
            { num: 3, label: 'Comp & Exp' },
            { num: 4, label: 'Details' },
            { num: 5, label: 'Screening' },
        ];

        const handleStepClick = (targetStep) => {
            // Allow going back always
            if (targetStep < currentStep) {
                setCurrentStep(targetStep);
                return;
            }

            // Validate all steps up to the target
            for (let i = 1; i < targetStep; i++) {
                if (!validateStep(i)) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Incomplete Step',
                        text: `Please complete Step ${i} (${steps[i-1].label}) before proceeding.`,
                        confirmButtonColor: '#4169E1'
                    });
                    setCurrentStep(i); // Go to the first invalid step
                    return;
                }
            }
            setCurrentStep(targetStep);
        };

        return (
            <div className="flex items-center justify-between mb-8 px-4">
                {steps.map((step, index) => (
                    <div 
                        key={step.num} 
                        className="flex flex-col items-center relative z-10 w-full group"
                        onClick={() => handleStepClick(step.num)}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 cursor-pointer ${
                            currentStep >= step.num 
                                ? 'bg-[#4169E1] border-[#4169E1] text-white shadow-lg shadow-blue-500/30' 
                                : 'bg-white border-gray-200 text-gray-400 group-hover:border-[#4169E1] group-hover:text-[#4169E1]'
                        }`}>
                            {currentStep > step.num ? <Check className="w-5 h-5" /> : step.num}
                        </div>
                        <span className={`text-xs font-medium mt-2 uppercase tracking-wide cursor-pointer transition-colors ${
                            currentStep >= step.num ? 'text-[#4169E1]' : 'text-gray-400 group-hover:text-[#4169E1]'
                        }`}>
                            {step.label}
                        </span>
                        {index !== steps.length - 1 && (
                             <div className={`hidden md:block absolute top-5 left-1/2 w-full h-[2px] transition-all duration-500 ${
                                 currentStep > step.num ? 'bg-[#4169E1]' : 'bg-gray-200'
                             }`} style={{ width: 'calc(100% - 2.5rem)', transform: 'translateX(1.25rem)' }}></div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const SuggestionList = ({ items, field, onSelect }) => {
        if (!showSuggestions[field] || items.length === 0) return null;
        return (
            <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl shadow-xl mt-1 max-h-60 overflow-y-auto animate-fadeIn divide-y divide-gray-50">
                {items.map((item, i) => {
                     const val = field === 'location' ? `${item.name}, ${item.admin1 || ''}, ${item.country || ''}`.replace(/, ,/g, ',').replace(/, $/, '') : item;
                     return (
                        <li 
                            key={i} 
                            onClick={() => onSelect(field, val)}
                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm text-gray-900 transition-colors block"
                        >
                            {field === 'location' ? (
                                <div>
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-xs text-gray-500">{[item.admin1, item.country].filter(Boolean).join(', ')}</div>
                                </div>
                            ) : item}
                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 font-sans">
            <div className="container mx-auto px-4 max-w-4xl">
                 <button 
                    onClick={() => navigate('/employer/dashboard')}
                    className="flex items-center text-gray-500 hover:text-black mb-8 transition-colors group"
                >
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </button>

                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-8 md:p-10">
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Post a New Job</h1>
                        <p className="text-gray-500 mb-10">Create a compelling job post to attract top talent.</p>

                        <Stepper />

                        <div className="mt-8 min-h-[400px]">
                            {/* Step 1: Basics */}
                            {currentStep === 1 && (
                                <div className="space-y-6 animate-fadeIn">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center mb-6">
                                        <Briefcase className="w-6 h-6 mr-3 text-[#4169E1]" />
                                        Basic Job Details
                                    </h2>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="relative md:col-span-2">
                                            <label className="label">Job Title <span className="text-red-500">*</span></label>
                                            <input 
                                                type="text" 
                                                name="title" 
                                                value={formData.title} 
                                                onChange={handleInputChange} 
                                                onFocus={() => handleFocus('title')}
                                                className="input-field" 
                                                placeholder="e.g. Senior Frontend Developer" 
                                                autoFocus 
                                            />
                                            <SuggestionList items={suggestions.title} field="title" onSelect={selectSuggestion} />
                                        </div>
                                        
                                        <div className="relative">
                                            <label className="label">Job Role</label>
                                            <input 
                                                type="text" 
                                                name="jobRole" 
                                                value={formData.jobRole} 
                                                onChange={handleInputChange} 
                                                onFocus={() => handleFocus('jobRole')}
                                                className="input-field" 
                                                placeholder="e.g. Software Engineer" 
                                            />
                                            <SuggestionList items={suggestions.jobRole} field="jobRole" onSelect={selectSuggestion} />
                                        </div>

                                        <div className="relative">
                                             <label className="label">Functional Area</label>
                                             <input 
                                                type="text" 
                                                name="functionalArea" 
                                                value={formData.functionalArea} 
                                                onChange={handleInputChange} 
                                                onFocus={() => handleFocus('functionalArea')}
                                                className="input-field" 
                                                placeholder="e.g. IT Software" 
                                            />
                                             <SuggestionList items={suggestions.functionalArea} field="functionalArea" onSelect={selectSuggestion} />
                                        </div>

                                        <div>
                                            <label className="label">Job Type <span className="text-red-500">*</span></label>
                                            <select name="type" value={formData.type} onChange={handleInputChange} className="input-field bg-white">
                                                <option>Full-time</option>
                                                <option>Part-time</option>
                                                <option>Contract</option>
                                                <option>Internship</option>
                                                <option>Remote</option>
                                                <option>Hybrid</option>
                                            </select>
                                        </div>

                                        <div className="relative">
                                            <label className="label">Recruitment Timeline <span className="text-red-500">*</span></label>
                                            <input 
                                                type="text" 
                                                name="recruitmentDuration" 
                                                value={formData.recruitmentDuration} 
                                                onChange={handleInputChange} 
                                                className="input-field" 
                                                placeholder="e.g. Immediate, 1 Month" 
                                                onFocus={() => handleFocus('recruitmentDuration')}
                                            />
                                            <SuggestionList items={suggestions.recruitmentDuration} field="recruitmentDuration" onSelect={selectSuggestion} />
                                        </div>

                                        <div className="relative">
                                             <label className="label">Location <span className="text-red-500">*</span></label>
                                             <div className="relative">
                                                 {/* <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" /> */}
                                                 <input 
                                                    type="text" 
                                                    name="location" 
                                                    value={formData.location} 
                                                    onChange={handleInputChange} 
                                                    onFocus={() => handleFocus('location')}
                                                    className="input-field pl-15" 
                                                    placeholder="Search city..." 
                                                />
                                             </div>
                                             {isLoadingLocations && <div className="absolute right-3 top-10 text-xs text-gray-400">Loading...</div>}
                                             <SuggestionList items={suggestions.location} field="location" onSelect={selectSuggestion} />
                                        </div>
                                    </div>
                                </div>
                            )}

                             {/* Step 2: Company */}
                             {currentStep === 2 && (
                                <div className="space-y-6 animate-fadeIn">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center mb-6">
                                        <Building className="w-6 h-6 mr-3 text-[#4169E1]" />
                                        Company Information
                                    </h2>
                                    <div className="relative">
                                        <label className="label">Company Name <span className="text-red-500">*</span></label>
                                        <input type="text" name="company" value={formData.company} onChange={handleInputChange} className="input-field" placeholder="Your Company Name" autoFocus />
                                    </div>
                                    <div>
                                        <label className="label">Company Description</label>
                                        <textarea name="companyDescription" rows="5" value={formData.companyDescription} onChange={handleInputChange} className="input-field" placeholder="Tell us about your company culture, mission, and values..."></textarea>
                                    </div>
                                </div>
                            )}

                             {/* Step 3: Compensation */}
                             {currentStep === 3 && (
                                <div className="space-y-8 animate-fadeIn">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center mb-6">
                                        <IndianRupee className="w-6 h-6 mr-3 text-[#4169E1]" />
                                        Compensation & Experience
                                    </h2>
                                    
                                    <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center"> Salary Details</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="label">Salary Type</label>
                                                <select name="salaryType" value={formData.salaryType} onChange={handleInputChange} className="input-field bg-white">
                                                    <option>Range</option>
                                                    <option>Fixed</option>
                                                    <option>Starting From</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="label">Payment Frequency</label>
                                                <select name="salaryFrequency" value={formData.salaryFrequency} onChange={handleInputChange} className="input-field bg-white">
                                                    <option>Year</option>
                                                    <option>Month</option>
                                                    <option>Week</option>
                                                    <option>Hour</option>
                                                </select>
                                            </div>
                                            
                                            <div>
                                                <label className="label">{formData.salaryType === 'Range' ? 'Min Salary' : 'Amount'} (₹) <span className="text-red-500">*</span></label>
                                                <input type="number" name="salaryMin" value={formData.salaryMin} onChange={handleInputChange} className="input-field" placeholder="e.g. 500000" />
                                            </div>

                                            {formData.salaryType === 'Range' && (
                                                <div>
                                                    <label className="label">Max Salary (₹) <span className="text-red-500">*</span></label>
                                                    <input type="number" name="salaryMax" value={formData.salaryMax} onChange={handleInputChange} className="input-field" placeholder="e.g. 1500000" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                         <div>
                                             <label className="label">Min Experience (Years) <span className="text-red-500">*</span></label>
                                             <input type="number" name="experienceMin" value={formData.experienceMin} onChange={handleInputChange} className="input-field" placeholder="e.g. 2" />
                                        </div>
                                         <div>
                                             <label className="label">Max Experience (Years) <span className="text-red-500">*</span></label>
                                             <input type="number" name="experienceMax" value={formData.experienceMax} onChange={handleInputChange} className="input-field" placeholder="e.g. 5" />
                                        </div>
                                    </div>
                                </div>
                            )}

                             {/* Step 4: Details & Benefits */}
                             {currentStep === 4 && (
                                <div className="space-y-8 animate-fadeIn">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center mb-6">
                                        <BookOpen className="w-6 h-6 mr-3 text-[#4169E1]" />
                                        Job Details & Benefits
                                    </h2>

                                    <div className="h-64 mb-12">
                                        <label className="label">Job Description <span className="text-red-500">*</span></label>
                                        <ReactQuill 
                                            theme="snow"
                                            value={formData.description}
                                            onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                                            modules={quillModules}
                                            formats={quillFormats}
                                            className="h-48 bg-white rounded-lg"
                                        />
                                    </div>

                                    <div>
                                        <label className="label">Skills <span className="text-red-500">*</span> <span className="text-xs font-normal text-gray-500">(Type and press Enter)</span></label>
                                        <div className="p-2 border border-gray-200 rounded-xl flex flex-wrap gap-2 focus-within:border-[#4169E1] focus-within:ring-4 focus-within:ring-blue-500/10 transition-all bg-white">
                                            {formData.skills.map((skill, index) => (
                                                <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-lg text-sm font-medium flex items-center">
                                                    {skill}
                                                    <button onClick={() => removeSkill(skill)} className="ml-2 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                                </span>
                                            ))}
                                            <input 
                                                type="text" 
                                                value={skillInput} 
                                                onChange={handleSkillInput} 
                                                onKeyDown={handleSkillKeyDown}
                                                className="flex-grow outline-none bg-transparent py-1 px-1 min-w-[120px]"
                                                placeholder="Add skill..." 
                                            />
                                            <SuggestionList items={suggestions.skills} field="skills" onSelect={selectSkillSuggestion} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="relative">
                                            <label className="label">Education</label>
                                            <input 
                                                type="text" 
                                                name="education" 
                                                value={formData.education} 
                                                onChange={handleInputChange} 
                                                onFocus={() => handleFocus('education')}
                                                className="input-field" 
                                                placeholder="e.g. Bachelor's" 
                                            />
                                            <SuggestionList items={suggestions.education} field="education" onSelect={selectSuggestion} />
                                        </div>
                                         <div className="relative">
                                            <label className="label">Field of Study</label>
                                            <input 
                                                type="text" 
                                                name="fieldOfStudy" 
                                                value={formData.fieldOfStudy} 
                                                onChange={handleInputChange} 
                                                onFocus={() => handleFocus('fieldOfStudy')}
                                                className="input-field" 
                                                placeholder="e.g. Computer Science" 
                                            />
                                            <SuggestionList items={suggestions.fieldOfStudy} field="fieldOfStudy" onSelect={selectSuggestion} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="label block mb-3">Benefits & Perks</label>
                                        <div className="flex flex-wrap gap-3 mb-4">
                                            {commonBenefits.slice(0, 10).map((benefit, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => toggleBenefit(benefit)}
                                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                                                        formData.benefits.includes(benefit)
                                                        ? 'bg-[#4169E1] text-white border-[#4169E1] shadow-md shadow-blue-500/20'
                                                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#4169E1] hover:text-[#4169E1]'
                                                    }`}
                                                >
                                                    {benefit}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                value={customBenefit} 
                                                onChange={(e) => setCustomBenefit(e.target.value)} 
                                                className="input-field" 
                                                placeholder="Add custom benefit..." 
                                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomBenefit())}
                                            />
                                            <button type="button" onClick={addCustomBenefit} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 rounded-xl font-medium transition-colors">Add</button>
                                        </div>
                                        {formData.benefits.length > 0 && (
                                             <div className="flex flex-wrap gap-2 mt-3">
                                                 {formData.benefits.map((b, i) => (
                                                     <span key={i} className="bg-green-50 text-green-700 border border-green-100 px-3 py-1 rounded-lg text-sm flex items-center">
                                                         <Check className="w-3 h-3 mr-1.5" /> {b}
                                                         <button onClick={() => toggleBenefit(b)} className="ml-2 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                                                     </span>
                                                 ))}
                                             </div>
                                        )}
                                    </div>

                                    {/* Application Method */}
                                    <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50">
                                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center">Application Method</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-6">
                                                <label className="flex items-center cursor-pointer">
                                                    <input 
                                                        type="radio" 
                                                        name="applyMethod" 
                                                        value="direct" 
                                                        checked={formData.applyMethod === 'direct'} 
                                                        onChange={handleInputChange} 
                                                        className="w-4 h-4 text-[#4169E1] border-gray-300 focus:ring-[#4169E1]" 
                                                    />
                                                    <span className="ml-2 text-gray-700">Direct Apply on Job Portal</span>
                                                </label>
                                                <label className="flex items-center cursor-pointer">
                                                    <input 
                                                        type="radio" 
                                                        name="applyMethod" 
                                                        value="website" 
                                                        checked={formData.applyMethod === 'website'} 
                                                        onChange={handleInputChange} 
                                                        className="w-4 h-4 text-[#4169E1] border-gray-300 focus:ring-[#4169E1]" 
                                                    />
                                                    <span className="ml-2 text-gray-700">Apply at Company Website</span>
                                                </label>
                                            </div>

                                            {formData.applyMethod === 'website' && (
                                                <div className="animate-fadeIn">
                                                    <label className="label">Company Website URL <span className="text-red-500">*</span></label>
                                                    <input 
                                                        type="url" 
                                                        name="applyUrl" 
                                                        value={formData.applyUrl} 
                                                        onChange={handleInputChange} 
                                                        className="input-field" 
                                                        placeholder="https://company.com/careers/job-id" 
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">Candidates will be redirected to this URL when they click "Apply Now".</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 5: Screening */}
                            {currentStep === 5 && (
                                <div className="space-y-8 animate-fadeIn">
                                     <h2 className="text-xl font-bold text-gray-800 flex items-center mb-6">
                                        <HelpCircle className="w-6 h-6 mr-3 text-[#4169E1]" />
                                        Pre-Screening Questions
                                    </h2>
                                    
                                    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-yellow-800 text-sm flex items-start mb-6">
                                        <Info className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                                        <p>Adding screening questions helps you filter candidates faster. Candidates must answer these when applying.</p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 mb-6">
                                        <label className="text-sm font-semibold text-gray-500">Popular questions (Click to add)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {commonPreScreeningQuestions.map((q, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => addScreeningQuestion(q)}
                                                    disabled={formData.preScreeningQuestions.includes(q)}
                                                    className={`text-left px-3 py-2 rounded-lg text-sm border transition-all ${
                                                        formData.preScreeningQuestions.includes(q)
                                                        ? 'bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed'
                                                        : 'bg-white text-gray-700 border-gray-200 hover:border-[#4169E1] hover:text-[#4169E1] hover:shadow-sm'
                                                    }`}
                                                >
                                                   + {q}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="label">Your Questions</label>
                                        {formData.preScreeningQuestions.map((q, i) => (
                                            <div key={i} className="flex items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm group">
                                                <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-bold mr-3">{i + 1}</span>
                                                <p className="flex-grow font-medium text-gray-800">{q}</p>
                                                <button onClick={() => removeScreeningQuestion(i)} className="text-gray-400 hover:text-red-500 p-2 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                value={customQuestion} 
                                                onChange={(e) => setCustomQuestion(e.target.value)} 
                                                className="input-field" 
                                                placeholder="Type a custom question..." 
                                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomQuestion())}
                                            />
                                            <button type="button" onClick={addCustomQuestion} className="bg-black text-white px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors">Add</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 1}
                            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center ${
                                currentStep === 1 
                                ? 'text-gray-300 cursor-not-allowed' 
                                : 'text-gray-600 hover:bg-gray-200 hover:text-black'
                            }`}
                        >
                            <ChevronLeft className="w-5 h-5 mr-1" /> Back
                        </button>

                        <button
                            onClick={currentStep === 5 ? handleSubmit : handleNext}
                            disabled={loading}
                            className={`bg-[#4169E1] text-white font-bold px-8 py-3 rounded-xl transition shadow-lg shadow-blue-500/30 flex items-center space-x-2 hover:bg-[#3A5FCD] ${loading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {currentStep === 5 ? (
                                loading ? (id ? 'Updating...' : 'Publishing...') : <><span>{id ? 'Update Job' : 'Publish Job'}</span> <Save className="w-5 h-5 ml-2" /></>
                            ) : (
                                <><span>Next Step</span> <ChevronRight className="w-5 h-5 ml-1" /></>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .label {
                    display: block;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 0.5rem;
                }
                .input-field {
                    width: 100%;
                    padding: 0.875rem 1rem;
                    border: 1px solid #E5E7EB;
                    border-radius: 0.75rem;
                    transition: all 0.2s;
                    font-size: 0.95rem;
                    color: #1F2937;
                    background-color: #fff;
                }
                .input-field:focus {
                    outline: none;
                    border-color: #4169E1;
                    box-shadow: 0 0 0 4px rgba(65, 105, 225, 0.1);
                }
                .input-field::placeholder {
                    color: #9CA3AF;
                }
            `}</style>
        </div>
    );
};

export default PostJob;
