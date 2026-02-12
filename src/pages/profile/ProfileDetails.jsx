import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { User, Mail, AlertCircle, Camera, Plus, Trash2, FileText, Download, ExternalLink, Briefcase, GraduationCap, MapPin, AlertTriangle, Image as ImageIcon, Edit, Copy, Check, X, Calendar, CheckCircle, Phone, Share2, Building } from 'lucide-react';
import { commonJobTitles, commonSkills, commonDegrees, commonFieldsOfStudy } from '../../utils/profileData';
import Swal from 'sweetalert2';
import ImageUrlCropper from '../../components/ImageUrlCropper';
import { generateSlug } from '../../utils/slugify';

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
    const [mobileNumber, setMobileNumber] = useState('');
    const [title, setTitle] = useState('');
    const [about, setAbout] = useState('');
    const [skills, setSkills] = useState('');
    const [currentLocation, setCurrentLocation] = useState('');
    const [preferredLocations, setPreferredLocations] = useState([]);
    const [totalExperience, setTotalExperience] = useState(0);
    
    // Structured Data
    const [experience, setExperience] = useState([]);
    const [education, setEducation] = useState([]);
    const [certifications, setCertifications] = useState([]);
    const [followingCompanies, setFollowingCompanies] = useState([]);
    
    // Files
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [resume, setResume] = useState(null);
    const [resumes, setResumes] = useState([]);
    const [existingResume, setExistingResume] = useState(null);

    // Cropper State
    const [showCropper, setShowCropper] = useState(false);
    const [cropperImage, setCropperImage] = useState(null);
    const [cropType, setCropType] = useState(null); // 'profile' or 'banner'
    
    const [loading, setLoading] = useState(false);
    // Removed message/error states as we use Swal now

    // UI State
    const [activeTab, setActiveTab] = useState('basic'); // basic, experience, education, skills
    const [completionPercentage, setCompletionPercentage] = useState(0);
    const [missingFields, setMissingFields] = useState([]);
    const [formErrors, setFormErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Refactor State
    const [isEditing, setIsEditing] = useState(false);
    const [bannerPicture, setBannerPicture] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);
    const [copied, setCopied] = useState(false);
    const [copiedMobile, setCopiedMobile] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    // --- Validation Logic ---
    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    // Calculate Profile Strength & Validation
    useEffect(() => {
        let score = 0;
        let total = 0;
        const missing = [];
        const currentErrors = {};

        // 1. Basic Info (40%)
        total += 40;
        let basicScore = 0;
        if (name) basicScore += 5; else missing.push("Full Name");
        if (title) basicScore += 10; else missing.push("Professional Title");
        if (about) basicScore += 10; else missing.push("About Me");
        if (currentLocation) basicScore += 5; else missing.push("Current Location");
        if (profilePicture) basicScore += 5; else missing.push("Profile Picture");
        if (email) basicScore += 5;

        score += basicScore;

        // 2. Experience (20%)
        total += 20;
        if (experience.length > 0) {
            score += 20;
            const isValidExp = experience.every(exp => exp.title && exp.company);
            if(!isValidExp) currentErrors.experience = "Complete all fields in experience entries";
        } else {
            missing.push("Work Experience");
        }

        // 3. Education (15%)
        total += 15;
        if (education.length > 0) {
            score += 15;
        } else {
            missing.push("Education");
        }

        // 4. Skills (15%)
        total += 15;
        if (skills) {
            score += 15;
        } else {
            missing.push("Skills");
        }

        // 5. Resume (10%)
        total += 10;
        if (existingResume || resume) {
            score += 10;
        } else {
            missing.push("Resume");
        }

        setCompletionPercentage(Math.min(100, Math.round((score / total) * 100)));
        setMissingFields(missing);

        if (!name) currentErrors.name = "Full Name is required";
        if (!title) currentErrors.title = "Professional Title is required";
        if (!about) currentErrors.about = "About Me is required";
        if (!currentLocation) currentErrors.currentLocation = "Current Location is required";
        
        setFormErrors(currentErrors);

        // Auto-calculate Total Experience
        if (experience && experience.length > 0) {
            let totalMonths = 0;
            experience.forEach(exp => {
                if (!exp.startYear || !exp.startMonth) return;
                
                const startMonthIndex = months.indexOf(exp.startMonth);
                const startDate = new Date(exp.startYear, startMonthIndex);
                
                let endDate;
                if (exp.endYear === 'Present' || !exp.endYear) {
                    endDate = new Date();
                } else {
                    const endMonthIndex = months.indexOf(exp.endMonth) !== -1 ? months.indexOf(exp.endMonth) : 11;
                    endDate = new Date(exp.endYear, endMonthIndex);
                }
                
                if (startDate > endDate) return; // invalid range
                
                // Difference in months + 1 (inclusive)
                let monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) + 1;
                totalMonths += Math.max(0, monthsDiff);
            });
            
            // Convert to years with 1 decimal place
            setTotalExperience(parseFloat((totalMonths / 12).toFixed(1)));
        } else {
            setTotalExperience(0);
        }

    }, [name, email, title, about, currentLocation, profilePicture, experience, education, skills, existingResume, resume]);

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: User, isComplete: !!(name && title && about && currentLocation) },
        { id: 'experience', label: 'Experience', icon: Briefcase, isComplete: experience.length > 0 },
        { id: 'education', label: 'Education', icon: GraduationCap, isComplete: education.length > 0 },
        { id: 'skills', label: 'Skills & Resume', icon: FileText, isComplete: !!skills && (!!existingResume || !!resume) },
    ];

    const fetchProfileData = async () => {
         try {
            const { data } = await api.get('/auth/profile');
            const updatedUser = { ...data, token: data.token || user?.token };
            login(updatedUser);

            setName(data.name || '');
            setEmail(data.email || '');
            setMobileNumber(data.mobileNumber || '');
            setTitle(data.title || '');
            setAbout(data.about || '');
            setSkills(data.skills ? data.skills.join(', ') : '');
            setCurrentLocation(data.currentLocation || '');
            setPreferredLocations(data.preferredLocations || []);
            setTotalExperience(data.totalExperience || 0);
            
            if (Array.isArray(data.experience)) setExperience(data.experience);
            else setExperience([]);

            if (Array.isArray(data.education)) setEducation(data.education);
            else setEducation([]);

            setCertifications(Array.isArray(data.certifications) ? data.certifications : []);
            
            setFollowingCompanies(data.followingCompanies || []);
            
            const getFullUrl = (path) => {
                if (!path) return null;
                if (path.startsWith('http')) return path;
                return `${import.meta.env.VITE_API_URL.replace('/api', '')}${path}`;
            };

            if (data.profilePicture) {
                setPreviewUrl(getFullUrl(data.profilePicture));
                setProfilePicture('existing'); 
            }

            if (data.bannerPicture) {
                setBannerPreview(getFullUrl(data.bannerPicture));
                setBannerPicture('existing');
            }

            setExistingResume(getFullUrl(data.resume));
            
            // Process Resumes
            if (data.resumes && Array.isArray(data.resumes)) {
                setResumes(data.resumes.map(r => ({
                    ...r,
                    file: getFullUrl(r.file)
                })));
            } else {
                setResumes([]);
            }

         } catch (error) {
            console.error("Failed to fetch fresh profile", error);
         }
    };

    useEffect(() => {
        fetchProfileData();
    }, []);



    const handleFileSelect = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setCropperImage(reader.result);
                setCropType(type);
                setShowCropper(true);
                e.target.value = ''; 
            });
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = (croppedBlob) => {
        const file = new File([croppedBlob], `${cropType}.jpg`, { type: 'image/jpeg' });
        const previewUrl = URL.createObjectURL(croppedBlob);

        if (cropType === 'profile') {
            setProfilePicture(file);
            setPreviewUrl(previewUrl);
        } else {
            setBannerPicture(file);
            setBannerPreview(previewUrl);
        }

        setShowCropper(false);
        setCropperImage(null);
        setCropType(null);
    };

    const handleDeleteImage = async (type) => {
        if (type === 'profile') {
            if (profilePicture && typeof profilePicture !== 'string') {
                 setProfilePicture(null);
            }
            setPreviewUrl(null); 
            // We assume user wants to delete image on server too when they click delete OR when they save.
            // But immediate preview removal is needed.
        } else {
            if (bannerPicture && typeof bannerPicture !== 'string') {
                setBannerPicture(null);
            }
            setBannerPreview(null);
        }
    };

    const handleCopyEmail = () => {
        if (email) {
            navigator.clipboard.writeText(email);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleCopyMobile = () => {
        if (mobileNumber) {
            navigator.clipboard.writeText(mobileNumber);
            setCopiedMobile(true);
            setTimeout(() => setCopiedMobile(false), 2000);
        }
    };

    const handleShareProfile = () => {
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-') + '-' + user._id.slice(-4);
        
        const profileUrl = `${window.location.origin}/profile/${slug}`;
        navigator.clipboard.writeText(profileUrl);
        setCopiedLink(true);
        Swal.fire({
            icon: 'success',
            title: 'Link Copied!',
            text: 'Your public profile link has been copied to clipboard.',
            timer: 2000,
            showConfirmButton: false
        });
        setTimeout(() => setCopiedLink(false), 2000);
    };
    
    const handleResumeChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Immediate upload logic
            try {
                // Show loading toast
                Swal.fire({
                    title: 'Uploading Resume...',
                    text: 'Please wait while we upload your file.',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                const formData = new FormData();
                formData.append('resume', file);
                
                const { data } = await api.put('/auth/profile', formData, { 
                    headers: { 'Content-Type': 'multipart/form-data' } 
                });

                // Update local state immediately with response data
                login({ ...data, token: data.token || user?.token });
                
                // Sync complete profile state from server
                await fetchProfileData();
                
                setResume(null); // Clear file input state
                setMessage('Resume uploaded successfully');

                // Clear message after 3 seconds
                setTimeout(() => setMessage(null), 3000);

            } catch (err) {
                console.error("Resume upload failed", err);
                setError(err.response?.data?.message || 'Failed to upload resume');
                setResume(null);
            }
        }
    };

    // --- Experience Handlers ---
    const [activeExpLocationIndex, setActiveExpLocationIndex] = useState(null);
    const [expLocationSuggestions, setExpLocationSuggestions] = useState([]);
    const [isLoadingExpLocations, setIsLoadingExpLocations] = useState(false);
    
    const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance', 'Remote'];
    
    const addExperience = () => {
        setExperience([...experience, { title: '', company: '', location: '', jobType: '', startYear: '', endYear: '', description: '' }]);
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
        setEducation([...education, { institute: '', university: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '' }]);
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

    // --- Autocomplete Logic ---
    const [universitySuggestions, setUniversitySuggestions] = useState([]);
    const [companySuggestions, setCompanySuggestions] = useState([]);
    const [locationSuggestions, setLocationSuggestions] = useState([]);
    const [titleSuggestions, setTitleSuggestions] = useState([]);
    const [skillSuggestions, setSkillSuggestions] = useState([]);
    const [degreeSuggestions, setDegreeSuggestions] = useState([]);
    const [fieldSuggestions, setFieldSuggestions] = useState([]);

    const [activeEducationIndex, setActiveEducationIndex] = useState(null);
    const [activeExperienceIndex, setActiveExperienceIndex] = useState(null);
    const [activeLocationField, setActiveLocationField] = useState(null);
    const [activeTitleField, setActiveTitleField] = useState(null); // 'basic' or experience index
    const [activeDegreeIndex, setActiveDegreeIndex] = useState(null);
    const [activeFieldIndex, setActiveFieldIndex] = useState(null);
    const [activeSkillInput, setActiveSkillInput] = useState(false);
    
    const [isLoadingUniversities, setIsLoadingUniversities] = useState(false);
    const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
    const [isLoadingLocations, setIsLoadingLocations] = useState(false);
    const [preferredLocationInput, setPreferredLocationInput] = useState('');

    // University Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (activeEducationIndex !== null && education[activeEducationIndex]?.university?.length > 2) {
                setIsLoadingUniversities(true);
                try {
                    const response = await fetch(`http://universities.hipolabs.com/search?name=${encodeURIComponent(education[activeEducationIndex].university)}&country=India`);
                    const data = await response.json();
                    setUniversitySuggestions(data.slice(0, 10));
                } catch (err) { console.error(err); } 
                finally { setIsLoadingUniversities(false); }
            } else { setUniversitySuggestions([]); }
        }, 500);
        return () => clearTimeout(timer);
    }, [activeEducationIndex, education]);

    // Company Search
    useEffect(() => {
        const timer = setTimeout(async () => {
             if (activeExperienceIndex !== null && experience[activeExperienceIndex]?.company?.length > 1) {
                  setIsLoadingCompanies(true);
                  try {
                      const response = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(experience[activeExperienceIndex].company)}`);
                      setCompanySuggestions(await response.json());
                  } catch (err) { console.error(err); } 
                  finally { setIsLoadingCompanies(false); }
             } else { setCompanySuggestions([]); }
        }, 400);
        return () => clearTimeout(timer);
    }, [activeExperienceIndex, experience]);

    // Location Search
    useEffect(() => {
        const timer = setTimeout(async () => {
             if (activeLocationField) {
                 const query = activeLocationField === 'current' ? currentLocation : preferredLocationInput;
                 if (query && query.length > 2) {
                      setIsLoadingLocations(true);
                      try {
                          const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
                          const data = await response.json();
                          setLocationSuggestions(data.results || []);
                      } catch (err) { console.error(err); } 
                      finally { setIsLoadingLocations(false); }
                 } else { setLocationSuggestions([]); }
             }
        }, 400);
        return () => clearTimeout(timer);
    }, [activeLocationField, currentLocation, preferredLocationInput]);

    // Experience Location Search
    useEffect(() => {
        const timer = setTimeout(async () => {
             if (activeExpLocationIndex !== null && experience[activeExpLocationIndex]?.location?.length > 2) {
                 setIsLoadingExpLocations(true);
                 try {
                     const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(experience[activeExpLocationIndex].location)}&count=5&language=en&format=json`);
                     const data = await response.json();
                     setExpLocationSuggestions(data.results || []);
                 } catch (err) { console.error(err); } 
                 finally { setIsLoadingExpLocations(false); }
             } else { setExpLocationSuggestions([]); }
        }, 400);
        return () => clearTimeout(timer);
    }, [activeExpLocationIndex, experience]);

    // Job Title Suggestion Logic
    useEffect(() => {
        const filterTitles = (query) => {
            if (!query) return [];
            return commonJobTitles.filter(t => t.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
        };

        if (activeTitleField === 'basic' && title.length > 0) {
            setTitleSuggestions(filterTitles(title));
        } else if (typeof activeTitleField === 'number' && experience[activeTitleField]?.title.length > 0) {
            setTitleSuggestions(filterTitles(experience[activeTitleField].title));
        } else {
            setTitleSuggestions([]);
        }
    }, [activeTitleField, title, experience]);

    // Degree Suggestion Logic
    useEffect(() => {
        if (activeDegreeIndex !== null && education[activeDegreeIndex]?.degree?.length > 0) {
            const query = education[activeDegreeIndex].degree.toLowerCase();
            setDegreeSuggestions(commonDegrees.filter(d => d.toLowerCase().includes(query)).slice(0, 5));
        } else {
            setDegreeSuggestions([]);
        }
    }, [activeDegreeIndex, education]);

    // Field of Study Suggestion Logic
    useEffect(() => {
        if (activeFieldIndex !== null && education[activeFieldIndex]?.fieldOfStudy?.length > 0) {
            const query = education[activeFieldIndex].fieldOfStudy.toLowerCase();
            setFieldSuggestions(commonFieldsOfStudy.filter(f => f.toLowerCase().includes(query)).slice(0, 5));
        } else {
            setFieldSuggestions([]);
        }
    }, [activeFieldIndex, education]);

    // Skills Suggestion Logic
    useEffect(() => {
        if (activeSkillInput && skills) {
             const lastSkill = skills.split(',').pop().trim().toLowerCase();
             if (lastSkill.length > 0) {
                 setSkillSuggestions(commonSkills.filter(s => s.toLowerCase().includes(lastSkill)).slice(0, 5));
             } else {
                 setSkillSuggestions([]);
             }
        } else {
            setSkillSuggestions([]);
        }
    }, [activeSkillInput, skills]);


    // Selection Handlers
    const handleUniversityChange = (index, value) => { updateEducation(index, 'university', value); setActiveEducationIndex(index); };
    const selectUniversity = (index, name) => { updateEducation(index, 'university', name); setUniversitySuggestions([]); setActiveEducationIndex(null); };
    
    const handleCompanyChange = (index, value) => { updateExperience(index, 'company', value); setActiveExperienceIndex(index); };
    const selectCompany = (index, name) => { updateExperience(index, 'company', name); setCompanySuggestions([]); setActiveExperienceIndex(null); };

    const handleExpLocationChange = (index, value) => { updateExperience(index, 'location', value); setActiveExpLocationIndex(index); };
    const selectExpLocation = (index, name) => { 
        updateExperience(index, 'location', name); 
        setExpLocationSuggestions([]); 
        setActiveExpLocationIndex(null); 
    };
    const handleExpLocationKeyDown = (e, index) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setActiveExpLocationIndex(null);
            setExpLocationSuggestions([]);
        }
    };

    const selectLocation = (name) => {
        if (activeLocationField === 'current') setCurrentLocation(name);
        else if (activeLocationField === 'preferred') {
            if (preferredLocations.length < 3 && !preferredLocations.includes(name)) setPreferredLocations([...preferredLocations, name]);
            setPreferredLocationInput('');
        }
        setLocationSuggestions([]);
        setActiveLocationField(null);
    };

    const selectTitle = (name) => {
        if (activeTitleField === 'basic') setTitle(name);
        else if (typeof activeTitleField === 'number') updateExperience(activeTitleField, 'title', name);
        setTitleSuggestions([]);
        setActiveTitleField(null);
    };

    const selectDegree = (index, name) => {
        updateEducation(index, 'degree', name);
        setDegreeSuggestions([]);
        setActiveDegreeIndex(null);
    };

    const selectField = (index, name) => {
        updateEducation(index, 'fieldOfStudy', name);
        setFieldSuggestions([]);
        setActiveFieldIndex(null);
    };

    const selectSkill = (skill) => {
        const allSkills = skills.split(',').map(s => s.trim());
        allSkills.pop(); // Remove partial input
        allSkills.push(skill);
        setSkills(allSkills.join(', ') + ', ');
        setSkillSuggestions([]);
        // Keep focus? Using refs would be better but simplified for now
    };

    const removePreferredLocation = (loc) => setPreferredLocations(preferredLocations.filter(l => l !== loc));

    const handleDeleteResume = async (resumeId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
             try {
                 const formData = new FormData();
                 formData.append('deleteResumeId', resumeId); // Send ID to backend
                 const { data } = await api.put('/auth/profile', formData);
                 login(data);
                 
                 await fetchProfileData(); // Sync with server
                 Swal.fire(
                    'Deleted!',
                    'Your resume has been deleted.',
                    'success'
                 );
             } catch (err) { 
                 Swal.fire({
                     icon: 'error',
                     title: 'Error',
                     text: 'Failed to delete resume',
                 });
                 // Refresh to restore correct state in case of error mismatch
                 fetchProfileData();
             }
        }
    };

    const handleSetActiveResume = async (resumeId) => {
        try {
             // Optimistic update for immediate feedback
             const target = resumes.find(r => r._id === resumeId);
             if (target) setExistingResume(target.file);

             const formData = new FormData();
             formData.append('activeResumeId', resumeId);
             await api.put('/auth/profile', formData);
             
             await fetchProfileData(); // Sync with server
             
             if(target) {
                 Swal.fire({
                     icon: 'success',
                     title: 'Active Resume Updated',
                     text: `'${target.name}' is now your active resume.`,
                     timer: 2000,
                     showConfirmButton: false
                 });
             }
        } catch (err) { 
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to set active resume',
            });
            fetchProfileData();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouched({ name: true, title: true, about: true, currentLocation: true }); // Touch all fields

        if (Object.keys(formErrors).length > 0 && completionPercentage < 50) { 
            Swal.fire({
                icon: 'warning',
                title: 'Incomplete Profile',
                text: 'Please fill in at least Basic Info to save.',
            });
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('mobileNumber', mobileNumber);
        formData.append('title', title);
        formData.append('about', about);
        formData.append('skills', skills);
        formData.append('experience', JSON.stringify(experience));
        formData.append('education', JSON.stringify(education));
        formData.append('currentLocation', currentLocation);
        formData.append('preferredLocations', JSON.stringify(preferredLocations));
        formData.append('totalExperience', totalExperience);

        if (profilePicture && typeof profilePicture === 'object') {
            formData.append('profilePicture', profilePicture);
        } else if (previewUrl === null) {
            formData.append('deleteProfilePicture', 'true');
        }

        if (bannerPicture && typeof bannerPicture === 'object') {
            formData.append('bannerPicture', bannerPicture);
        } else if (bannerPreview === null) {
            formData.append('deleteBanner', 'true');
        }


        try {
            const { data } = await api.put('/auth/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            login({ ...data, token: data.token || user?.token });
            setResume(null);
            
            Swal.fire({
                icon: 'success',
                title: 'Profile Updated!',
                text: 'Your profile details have been saved successfully.',
                timer: 2000,
                showConfirmButton: false
            });
            setIsEditing(false); // Switch back to view mode on success
            
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: err.response?.data?.message || 'Failed to update profile',
            });
        } finally {
            setLoading(false);
        }
    };

    // Helper for suggestion list rendering
    const SuggestionList = ({ items, onSelect }) => {
        if (!items || items.length === 0) return null;
        return (
            <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl shadow-xl mt-2 max-h-60 overflow-y-auto animate-fadeIn divide-y divide-gray-50">
                {items.map((item, i) => (
                    <li 
                        key={i} 
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => { e.stopPropagation(); onSelect(item); }} 
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm text-gray-900 transition-colors block"
                    >
                        {item}
                    </li>
                ))}
            </ul>
        );
    };

    if (!isEditing) {
        return (
            <div className="max-w-5xl mx-auto animate-fadeIn min-h-[85vh] py-8">
                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8 relative group">
                    {/* Banner */}
                    <div className="h-48 md:h-64 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                        {bannerPreview ? (
                            <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20">
                                <ImageIcon className="w-16 h-16" />
                            </div>
                        )}
                        <button 
                             onClick={handleShareProfile}
                             className="absolute top-6 right-40 bg-white/90 hover:bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2 z-10"
                        >
                            {copiedLink ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />} Share Profile
                        </button>
                        <button 
                             onClick={() => setIsEditing(true)}
                             className="absolute top-6 right-6 bg-white/90 hover:bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2 z-10"
                        >
                            <Edit className="w-4 h-4" /> Edit Profile
                        </button>
                    </div>

                    <div className="px-8 pb-8">
                        <div className="relative flex justify-between items-end -mt-16 mb-6">
                             <div className="w-32 h-32 rounded-2xl bg-white p-1.5 shadow-lg">
                                <div className="w-full h-full rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100">
                                     {previewUrl ? (
                                        <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-12 h-12 text-gray-300" />
                                    )}
                                </div>
                             </div>
                        </div>

                        <div>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">{name || 'Your Name'}</h1>
                                    <p className="text-xl text-[#4169E1] font-medium mb-1">{title || 'Your Professional Title'}</p>
                                </div>
                                {completionPercentage < 100 && (
                                    <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Profile Strength</span>
                                            <span className="text-lg font-extrabold text-[#4169E1]">{completionPercentage}%</span>
                                        </div>
                                        <div className="w-12 h-12 relative flex items-center justify-center">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-blue-200" />
                                                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={2 * Math.PI * 20} strokeDashoffset={2 * Math.PI * 20 - (completionPercentage / 100) * 2 * Math.PI * 20} className="text-[#4169E1]" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-600 mb-6">
                                {currentLocation && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span>{currentLocation}</span>
                                    </div>
                                )}
                                {email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span>{email}</span>
                                        <button 
                                            onClick={handleCopyEmail}
                                            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-[#4169E1]"
                                            title="Copy Email"
                                        >
                                            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                )}
                                {mobileNumber && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span>{mobileNumber}</span>
                                        <button 
                                            onClick={handleCopyMobile}
                                            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-[#4169E1]"
                                            title="Copy Mobile Number"
                                        >
                                            {copiedMobile ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                )}
                                {totalExperience > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-gray-400" />
                                        <span>{totalExperience} Years Exp.</span>
                                    </div>
                                )}
                            </div>

                            {about && (
                                <div className="mb-8">
                                    <h3 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">About</h3>
                                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{about}</p>
                                </div>
                            )}

                             {/* Skills */}
                            {skills && (
                                <div className="mb-8">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {skills.split(',').filter(s => s.trim()).map((skill, index) => (
                                            <span key={index} className="px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-sm font-semibold">
                                                {skill.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Resumes Section */}
                            {resumes && resumes.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Resumes</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {resumes.map((res) => {
                                            const isActive = existingResume === res.file;
                                            return (
                                                <div key={res._id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isActive ? 'bg-green-50/50 border-green-200 shadow-sm' : 'bg-gray-50 border-gray-100 hover:border-blue-200'}`}>
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className={`flex-shrink-0 p-2.5 rounded-lg ${isActive ? 'bg-green-100 text-green-700' : 'bg-white text-gray-500 shadow-sm'}`}>
                                                            <FileText className="w-5 h-5" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-bold text-gray-900 text-sm truncate" title={res.name}>{res.name}</h4>
                                                                {isActive && <span className="flex-shrink-0 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Active</span>}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-0.5 font-medium">
                                                                {new Date(res.uploadedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <a 
                                                        href={res.file} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="flex-shrink-0 ml-2 p-2 text-gray-400 hover:text-[#4169E1] hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="View Resume"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Experience Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-50 text-[#4169E1] rounded-lg">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Experience</h2>
                        </div>
                        
                        <div className="space-y-8">
                            {experience && experience.length > 0 ? (
                                experience.map((exp, index) => (
                                    <div key={index} className="relative pl-8 border-l-2 border-dashed border-gray-200 last:border-0 pb-8 last:pb-0">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-[#4169E1]"></div>
                                        <h3 className="font-bold text-gray-900 text-lg">{exp.title}</h3>
                                        <p className="text-[#4169E1] font-bold mb-1">{exp.company}</p>
                                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-2 font-medium">
                                            {exp.location && (
                                                <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg text-xs">
                                                    <MapPin className="w-3 h-3" />
                                                    {exp.location}
                                                </span>
                                            )}
                                            {exp.jobType && (
                                                <span className="bg-blue-50 text-[#4169E1] px-2 py-1 rounded-lg text-xs font-semibold">
                                                    {exp.jobType}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3 font-medium">
                                            <Calendar className="w-4 h-4" />
                                            <span>{exp.startMonth} {exp.startYear} - {exp.endMonth ? `${exp.endMonth} ${exp.endYear}` : 'Present'}</span>
                                        </div>
                                        {exp.description && <p className="text-gray-600 text-sm leading-relaxed">{exp.description}</p>}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400 italic text-center py-4">No experience added.</p>
                            )}
                        </div>
                    </div>

                    {/* Education Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                         <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Education</h2>
                        </div>

                        <div className="space-y-8">
                             {education && education.length > 0 ? (
                                education.map((edu, index) => (
                                    <div key={index} className="relative pl-8 border-l-2 border-dashed border-gray-200 last:border-0 pb-8 last:pb-0">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-indigo-600"></div>
                                        <h3 className="font-bold text-gray-900 text-lg">{edu.institute || edu.university}</h3>
                                        <p className="text-gray-700 font-medium">{edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</p>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1 font-medium">
                                            <Calendar className="w-4 h-4" />
                                            <span>{edu.startYear} - {edu.endYear}</span>
                                        </div>
                                    </div>
                                ))
                             ) : (
                                <p className="text-gray-400 italic text-center py-4">No education added.</p>
                             )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto animate-fadeIn min-h-[85vh] space-y-8">
            
            {/* 1. Header & Profile Strength Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                             
                             Profile Strength
                        </h2>
                        <p className="text-gray-500 mt-1">Complete your profile to reach 'Excellent' status and visible to more recruiters.</p>
                        
                        {/* Validation Summary */}
                        {missingFields.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {missingFields.slice(0, 4).map((field, i) => (
                                    <span key={i} className="inline-flex items-center text-xs font-medium text-orange-700 bg-orange-50 px-2 py-1 rounded border border-orange-100">
                                        <AlertTriangle className="w-3 h-3 mr-1" /> {field}
                                    </span>
                                ))}
                                {missingFields.length > 4 && <span className="text-xs text-gray-400 self-center">+{missingFields.length - 4} more</span>}
                            </div>
                        )}
                    </div>
                    
                    <div className="w-full md:w-1/3 flex flex-col items-center md:items-end">
                        <div className="flex items-center gap-4 mb-2">
                             <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide border ${
                                completionPercentage === 100 
                                ? 'text-green-700 bg-green-50 border-green-200' 
                                : 'text-blue-700 bg-blue-50 border-blue-200'
                            }`}>
                                {completionPercentage === 100 ? 'Excellent' : 'In Progress'}
                            </span>
                            <span className="text-3xl font-extrabold text-[#4169E1]">{completionPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                            <div 
                                style={{ width: `${completionPercentage}%` }} 
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                    completionPercentage === 100 ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-blue-400 to-[#4169E1]'
                                }`}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Main Content Wrapper */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden min-h-[600px]">
                
                {/* Horizontal Tab Navigation */}
                {/* Horizontal Tab Navigation */}
                <div className="flex items-center justify-between border-b border-gray-100 pr-4 md:pr-8">
                    <div className="overflow-x-auto scrollbar-hide">
                        <div className="flex px-4 md:px-8 space-x-8 min-w-max">
                            {tabs.map((tab) => {
                                 const Icon = tab.icon;
                                 return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center space-x-2 py-5 px-1 border-b-2 transition-all font-medium text-sm whitespace-nowrap ${
                                            activeTab === tab.id 
                                            ? 'border-[#4169E1] text-[#4169E1]' 
                                            : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-200'
                                        }`}
                                    >
                                        <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'stroke-[2.5px]' : ''}`} />
                                        <span>{tab.label}</span>
                                        {tab.isComplete && <CheckCircle className="w-3.5 h-3.5 text-green-500 ml-1" />}
                                    </button>
                                 );
                            })}
                        </div>
                    </div>
                     <button 
                         type="button"
                         onClick={() => setIsEditing(false)}
                         className="flex-shrink-0 text-gray-500 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-all flex items-center gap-2 text-sm font-bold ml-2"
                         title="Cancel Editing"
                     >
                         <X className="w-5 h-5" />
                         <span className="hidden sm:inline">Cancel</span>
                     </button>
                </div>

                {/* Form Content */}
                <div className="p-6 md:p-10">
                    
                    {/* Feedback Messages */}


                    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-10 animate-fadeIn">
                        
                        {/* Cropper Modal */}
                        {showCropper && (
                            <ImageUrlCropper
                                imageSrc={cropperImage}
                                aspect={cropType === 'profile' ? 1 : 16/9} // Profile square, Banner wide
                                onCropComplete={handleCropComplete}
                                onCancel={() => { setShowCropper(false); setCropperImage(null); }}
                            />
                        )}
                        
                        {/* Basic Info Tab */}
                        {activeTab === 'basic' && (
                            <div className="space-y-8 animate-fadeIn">
                                {/* Banner Upload */}
                                <div className="relative h-32 md:h-48 rounded-2xl bg-gray-100 overflow-hidden group border-2 border-dashed border-gray-200 hover:border-blue-300 transition-all">
                                    {bannerPreview ? (
                                        <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                            <ImageIcon className="w-8 h-8 mb-2" />
                                            <span className="text-xs font-semibold">Upload Banner Image</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                         <label htmlFor="banner-upload" className="cursor-pointer bg-white text-gray-700 px-4 py-2 rounded-lg font-bold shadow-md hover:text-[#4169E1] transition-colors flex items-center gap-2">
                                            <Camera className="w-4 h-4" /> Change Banner
                                         </label>
                                         <input 
                                            id="banner-upload"
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*"
                                            onChange={(e) => handleFileSelect(e, 'banner')}
                                        />
                                        {bannerPreview && (
                                            <button 
                                                type="button"
                                                onClick={() => handleDeleteImage('banner')}
                                                className="bg-white text-red-500 px-3 py-2 rounded-lg font-bold shadow-md hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row gap-8 items-start px-4 relative z-10">
                                    {/* Profile Picture Upload - Updated Design */}
                                    <div className="flex-shrink-0 mx-auto md:mx-0 -mt-12">
                                        <div className="relative group">
                                            <div className="w-36 h-36 rounded-2xl bg-gray-50 border-2 border-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
                                                {previewUrl ? (
                                                    <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-12 h-12 text-gray-300" />
                                                )}
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                     <p className="text-white text-xs font-medium">Change Photo</p>
                                                </div>
                                            </div>
                                            <div className="absolute -bottom-3 -right-3 flex gap-1">
                                                <label 
                                                    htmlFor="profile-upload" 
                                                    className="bg-white text-gray-700 p-2 rounded-xl cursor-pointer shadow-md hover:text-[#4169E1] border border-gray-100 transition-colors"
                                                >
                                                    <Camera className="w-4 h-4" />
                                                    <input 
                                                        id="profile-upload"
                                                        type="file" 
                                                        className="hidden" 
                                                        accept="image/*"
                                                        onChange={(e) => handleFileSelect(e, 'profile')}
                                                    />
                                                </label>
                                                {previewUrl && (
                                                    <button
                                                        type="button" 
                                                        onClick={() => handleDeleteImage('profile')}
                                                        className="bg-white text-gray-700 p-2 rounded-xl cursor-pointer shadow-md hover:text-red-500 border border-gray-100 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-grow space-y-6 w-full">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-bold text-gray-700">Full Name <span className="text-red-500">*</span></label>
                                                <input 
                                                    type="text" 
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    onBlur={() => handleBlur('name')}
                                                    className={`w-full px-4 py-3.5 border rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all ${touched.name && formErrors.name ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-gray-200 focus:border-[#4169E1]'}`}
                                                    placeholder="e.g. John Doe"
                                                />
                                                {touched.name && formErrors.name && <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.name}</p>}
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <label className="block text-sm font-bold text-gray-700">Email Address</label>
                                                <div className="relative">
                                                    <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                                                    <input 
                                                        type="email" 
                                                        value={email}
                                                        disabled
                                                        className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-500 cursor-not-allowed font-medium"
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <label className="block text-sm font-bold text-gray-700">Mobile Number</label>
                                                <div className="relative">
                                                    <Phone className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                                                    <input 
                                                        type="tel" 
                                                        value={mobileNumber}
                                                        onChange={(e) => setMobileNumber(e.target.value)}
                                                        placeholder="Enter your mobile number"
                                                        className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all border-gray-200 focus:border-[#4169E1]"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 relative">
                                            <label className="block text-sm font-bold text-gray-700">Professional Title <span className="text-red-500">*</span></label>
                                            <input 
                                                type="text" 
                                                placeholder="e.g. Senior Full Stack Developer" 
                                                value={title} 
                                                onChange={(e) => setTitle(e.target.value)}
                                                onFocus={() => setActiveTitleField('basic')}
                                                onBlur={() => { handleBlur('title'); setTimeout(() => setActiveTitleField(null), 200); }}
                                                className={`w-full px-4 py-3.5 border rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all ${touched.title && formErrors.title ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-gray-200 focus:border-[#4169E1]'}`}
                                            />
                                            {activeTitleField === 'basic' && (
                                                <SuggestionList items={titleSuggestions} onSelect={selectTitle} />
                                            )}
                                             {touched.title && formErrors.title && <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.title}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                     <label className="block text-sm font-bold text-gray-700">Total Experience (Years)</label>
                                     <input 
                                         type="number" 
                                         value={totalExperience}
                                         readOnly
                                         className={`w-full px-4 py-3.5 border rounded-xl bg-gray-50 focus:outline-none transition-all border-gray-200 text-gray-500 font-medium`}
                                         title="Calculated automatically from Work Experience"
                                     />
                                     <p className="text-xs text-blue-500 mt-1">Calculated automatically from your work experience.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">About Me <span className="text-red-500">*</span></label>
                                    <textarea 
                                        placeholder="Write a brief bio about your professional background..."
                                        value={about}
                                        onChange={(e) => setAbout(e.target.value)}
                                        onBlur={() => handleBlur('about')}
                                        className={`w-full px-4 py-3.5 border rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none h-32 resize-none transition-all ${touched.about && formErrors.about ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-gray-200 focus:border-[#4169E1]'}`}
                                    ></textarea>
                                    {touched.about && formErrors.about && <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.about}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                     <div className="space-y-2">
                                         <label className="block text-sm font-bold text-gray-700">Current Location <span className="text-red-500">*</span></label>
                                         <div className="relative">
                                            <MapPin className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                                            <input 
                                                type="text" 
                                                placeholder="e.g. Bangalore, India"
                                                value={currentLocation}
                                                onChange={(e) => setCurrentLocation(e.target.value)}
                                                onFocus={() => setActiveLocationField('current')}
                                                onBlur={() => handleBlur('currentLocation')}
                                                className={`w-full pl-11 pr-4 py-3.5 border rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all ${touched.currentLocation && formErrors.currentLocation ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-gray-200 focus:border-[#4169E1]'}`}
                                            />
                                            {activeLocationField === 'current' && locationSuggestions.length > 0 && (
                                                <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl shadow-xl mt-2 max-h-60 overflow-y-auto animate-fadeIn divide-y divide-gray-50">
                                                    {isLoadingLocations ? <li className="px-4 py-3 text-sm text-gray-500">Loading...</li> : locationSuggestions.map((loc, i) => (
                                                        <li key={i} onClick={(e) => { e.stopPropagation(); selectLocation(`${loc.name}, ${loc.admin1 || ''}, ${loc.country || ''}`.replace(/, ,/g, ',').replace(/, $/, '')); }} className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors block">
                                                            <div className="font-medium text-gray-900 text-sm">{loc.name}</div>
                                                            <div className="text-xs text-gray-500">{[loc.admin1, loc.country].filter(Boolean).join(', ')}</div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                         </div>
                                    </div>

                                    <div className="space-y-2">
                                         <label className="block text-sm font-bold text-gray-700">Preferred Locations</label>
                                         <div className="relative">
                                            <div className="flex flex-wrap gap-2 mb-2 min-h-[30px]">
                                                {preferredLocations.map((loc, i) => (
                                                    <span key={i} className="bg-blue-50 text-[#4169E1] pl-3 pr-2 py-1 rounded-full text-xs font-bold flex items-center border border-blue-100 shadow-sm">
                                                        {loc}
                                                        <button type="button" onClick={() => removePreferredLocation(loc)} className="ml-1 p-0.5 hover:bg-blue-100 rounded-full transition-colors text-blue-400 hover:text-blue-600">
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                            {preferredLocations.length < 3 && (
                                                <input 
                                                    type="text" 
                                                    placeholder="Search location..."
                                                    value={preferredLocationInput}
                                                    onChange={(e) => setPreferredLocationInput(e.target.value)}
                                                    onFocus={() => setActiveLocationField('preferred')}
                                                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-[#4169E1] outline-none"
                                                />
                                            )}
                                             {activeLocationField === 'preferred' && locationSuggestions.length > 0 && (
                                                <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl shadow-xl mt-2 max-h-60 overflow-y-auto animate-fadeIn divide-y divide-gray-50">
                                                    {isLoadingLocations ? <li className="px-4 py-3 text-sm text-gray-500">Loading...</li> : locationSuggestions.map((loc, i) => (
                                                        <li key={i} onClick={(e) => { e.stopPropagation(); selectLocation(`${loc.name}, ${loc.admin1 || ''}, ${loc.country || ''}`.replace(/, ,/g, ',').replace(/, $/, '')); }} className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors block">
                                                            <div className="font-medium text-gray-900 text-sm">{loc.name}</div>
                                                            <div className="text-xs text-gray-500">{[loc.admin1, loc.country].filter(Boolean).join(', ')}</div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                         </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Experience Tab */}
                        {activeTab === 'experience' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 p-6 rounded-2xl border border-gray-200/60 mb-8">
                                     <div>
                                        <h3 className="font-bold text-gray-900 text-lg">Work Experience</h3>
                                        <p className="text-gray-500 text-sm mt-1">Add your previous job positions.</p>
                                     </div>
                                     <button type="button" onClick={addExperience} className="mt-4 sm:mt-0 bg-white border border-gray-200 hover:border-[#4169E1] text-[#4169E1] hover:bg-blue-50 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow flex items-center">
                                        <Plus className="w-4 h-4 mr-2" /> Add Position
                                     </button>
                                </div>
                                
                                {experience.map((exp, index) => (
                                    <div key={index} className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 hover:border-[#4169E1]/30 transition-all relative shadow-sm group">
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                             <button type="button" onClick={() => removeExperience(index)} className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                             <div className="space-y-2 relative">
                                                <label className="text-sm font-bold text-gray-700">Job Title</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="e.g. Solution Architect" 
                                                    value={exp.title} 
                                                    onChange={(e) => updateExperience(index, 'title', e.target.value)}
                                                    onFocus={() => setActiveTitleField(index)}
                                                    onBlur={() => setTimeout(() => setActiveTitleField(null), 200)}
                                                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-[#4169E1] outline-none transition-all"
                                                />
                                                {activeTitleField === index && (
                                                    <SuggestionList items={titleSuggestions} onSelect={selectTitle} />
                                                )}
                                             </div>
                                            
                                             <div className="space-y-2 relative">
                                                <label className="text-sm font-bold text-gray-700">Company</label>
                                                 <input 
                                                    type="text" 
                                                    placeholder="Search Company..." 
                                                    value={exp.company} 
                                                    onChange={(e) => handleCompanyChange(index, e.target.value)}
                                                    onFocus={() => setActiveExperienceIndex(index)}
                                                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-[#4169E1] outline-none transition-all"
                                                />
                                                {activeExperienceIndex === index && companySuggestions.length > 0 && (
                                                    <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl shadow-xl mt-2 max-h-60 overflow-y-auto divide-y divide-gray-50">
                                                        {isLoadingCompanies ? <li className="px-4 py-3 text-sm text-gray-500">Loading...</li> : companySuggestions.map((company, i) => (
                                                            <li key={i} onClick={(e) => { e.stopPropagation(); selectCompany(index, company.name); }} className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between transition-colors">
                                                                <div className="flex items-center">
                                                                    {company.logo && <img src={company.logo} alt="" className="w-6 h-6 mr-3 rounded-md object-contain border border-gray-100"/>}
                                                                    <span className="font-medium text-gray-900 text-sm">{company.name}</span>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                             </div>
                                        </div>

                                        {/* Location and Job Type Row */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                             <div className="space-y-2 relative">
                                                <label className="text-sm font-bold text-gray-700">Location</label>
                                                 <input 
                                                    type="text" 
                                                    placeholder="e.g. Bangalore, India" 
                                                    value={exp.location || ''} 
                                                    onChange={(e) => handleExpLocationChange(index, e.target.value)}
                                                    onFocus={() => setActiveExpLocationIndex(index)}
                                                    onBlur={() => setTimeout(() => setActiveExpLocationIndex(null), 200)}
                                                    onKeyDown={(e) => handleExpLocationKeyDown(e, index)}
                                                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-[#4169E1] outline-none transition-all"
                                                />
                                                {activeExpLocationIndex === index && expLocationSuggestions.length > 0 && (
                                                    <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl shadow-xl mt-2 max-h-60 overflow-y-auto divide-y divide-gray-50">
                                                        {isLoadingExpLocations ? <li className="px-4 py-3 text-sm text-gray-500">Loading...</li> : expLocationSuggestions.map((loc, i) => (
                                                            <li key={i} onClick={(e) => { e.stopPropagation(); selectExpLocation(index, `${loc.name}, ${loc.admin1 || ''}, ${loc.country || ''}`.replace(/, ,/g, ',').replace(/, $/, '')); }} className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors block">
                                                                <div className="font-medium text-gray-900 text-sm">{loc.name}</div>
                                                                <div className="text-xs text-gray-500">{[loc.admin1, loc.country].filter(Boolean).join(', ')}</div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                             </div>
                                            
                                             <div className="space-y-2 relative">
                                                <label className="text-sm font-bold text-gray-700">Job Type</label>
                                                <select 
                                                    value={exp.jobType || ''} 
                                                    onChange={(e) => updateExperience(index, 'jobType', e.target.value)}
                                                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#4169E1] bg-white"
                                                >
                                                    <option value="">Select Job Type</option>
                                                    {jobTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                                </select>
                                                {/* Custom Job Type Input */}
                                                {exp.jobType === '' && (
                                                    <input 
                                                        type="text" 
                                                        placeholder="Or enter custom job type..." 
                                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-[#4169E1] outline-none transition-all mt-2 text-sm"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && e.target.value.trim()) {
                                                                e.preventDefault();
                                                                updateExperience(index, 'jobType', e.target.value.trim());
                                                                e.target.value = '';
                                                            }
                                                        }}
                                                    />
                                                )}
                                             </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                             <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700">Start Date</label>
                                                <div className="flex gap-3">
                                                    <select value={exp.startMonth || ''} onChange={(e) => updateExperience(index, 'startMonth', e.target.value)} className="w-1/2 px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#4169E1] bg-white">
                                                        <option value="">Month</option>
                                                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                                                    </select>
                                                    <select value={exp.startYear || ''} onChange={(e) => updateExperience(index, 'startYear', e.target.value)} className="w-1/2 px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#4169E1] bg-white">
                                                        <option value="">Year</option>
                                                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                                                    </select>
                                                 </div>
                                             </div>
                                             <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700">End Date</label>
                                                <div className="flex gap-3">
                                                    <select value={exp.endMonth || ''} onChange={(e) => updateExperience(index, 'endMonth', e.target.value)} className="w-1/2 px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#4169E1] bg-white">
                                                        <option value="">Month</option>
                                                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                                                    </select>
                                                    <select value={exp.endYear || ''} onChange={(e) => updateExperience(index, 'endYear', e.target.value)} className="w-1/2 px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#4169E1] bg-white">
                                                        <option value="">Year</option>
                                                        <option value="Present">Present</option>
                                                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                                                    </select>
                                                </div>
                                             </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">Description</label>
                                            <textarea 
                                                placeholder="Describe your role, responsibilities, and key achievements..."
                                                value={exp.description}
                                                onChange={(e) => updateExperience(index, 'description', e.target.value)}
                                                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-[#4169E1] outline-none h-32 resize-none transition-all"
                                            ></textarea>
                                        </div>
                                    </div>
                                ))}
                                {experience.length === 0 && (
                                    <div className="text-center py-16 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
                                        <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 font-medium">No experience added yet.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Education Tab */}
                        {activeTab === 'education' && (
                             <div className="space-y-6 animate-fadeIn">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 p-6 rounded-2xl border border-gray-200/60 mb-8">
                                     <div>
                                        <h3 className="font-bold text-gray-900 text-lg">Education</h3>
                                        <p className="text-sm text-gray-500 mt-1">Add your academic background.</p>
                                     </div>
                                     <button type="button" onClick={addEducation} className="mt-4 sm:mt-0 bg-white border border-gray-200 hover:border-[#4169E1] text-[#4169E1] hover:bg-blue-50 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow flex items-center">
                                        <Plus className="w-4 h-4 mr-2" /> Add Education
                                     </button>
                                </div>
                                
                                {education.map((edu, index) => (
                                    <div key={index} className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 hover:border-[#4169E1]/30 transition-all relative shadow-sm group">
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                             <button type="button" onClick={() => removeEducation(index)} className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                             <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700">Institute Name</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="College Name" 
                                                    value={edu.institute} 
                                                    onChange={(e) => updateEducation(index, 'institute', e.target.value)}
                                                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-[#4169E1] outline-none transition-all"
                                                />
                                             </div>
                                            
                                            <div className="space-y-2 relative">
                                                 <label className="text-sm font-bold text-gray-700">University</label>
                                                 <input 
                                                    type="text" 
                                                    placeholder="University Name" 
                                                    value={edu.university || ''} 
                                                    onChange={(e) => handleUniversityChange(index, e.target.value)}
                                                    onFocus={() => setActiveEducationIndex(index)}
                                                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-[#4169E1] outline-none transition-all"
                                                />
                                                {activeEducationIndex === index && universitySuggestions.length > 0 && (
                                                    <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl shadow-xl mt-2 max-h-60 overflow-y-auto divide-y divide-gray-50">
                                                        {isLoadingUniversities ? <li className="px-4 py-3 text-sm text-gray-500">Loading...</li> : universitySuggestions.map((uni, i) => (
                                                            <li key={i} onClick={(e) => { e.stopPropagation(); selectUniversity(index, uni.name); }} className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm text-gray-900 transition-colors">
                                                                {uni.name}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                             <div className="space-y-2 relative">
                                                 <label className="text-sm font-bold text-gray-700">Degree</label>
                                                 <input 
                                                    type="text" 
                                                    placeholder="e.g. Bachelor's" 
                                                    value={edu.degree} 
                                                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                                    onFocus={() => setActiveDegreeIndex(index)}
                                                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-[#4169E1] outline-none transition-all"
                                                />
                                                {activeDegreeIndex === index && (
                                                    <SuggestionList items={degreeSuggestions} onSelect={(val) => selectDegree(index, val)} />
                                                )}
                                             </div>
                                             <div className="space-y-2">
                                                 <label className="text-sm font-bold text-gray-700">Field of Study</label>
                                                 <input 
                                                    type="text" 
                                                    placeholder="e.g. Computer Science" 
                                                    value={edu.fieldOfStudy} 
                                                    onChange={(e) => updateEducation(index, 'fieldOfStudy', e.target.value)}
                                                    onFocus={() => setActiveFieldIndex(index)}
                                                    onBlur={() => setTimeout(() => setActiveFieldIndex(null), 200)}
                                                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-[#4169E1] outline-none transition-all"
                                                />
                                                {activeFieldIndex === index && (
                                                    <SuggestionList items={fieldSuggestions} onSelect={(val) => selectField(index, val)} />
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                             <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700">Start Year</label>
                                                <select value={edu.startYear || ''} onChange={(e) => updateEducation(index, 'startYear', e.target.value)} className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#4169E1] bg-white">
                                                    <option value="">Year</option>
                                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                                </select>
                                             </div>
                                             <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700">End Year</label>
                                                <select value={edu.endYear || ''} onChange={(e) => updateEducation(index, 'endYear', e.target.value)} className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#4169E1] bg-white">
                                                    <option value="">Year</option>
                                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                                </select>
                                             </div>
                                        </div>
                                    </div>
                                ))}
                                {education.length === 0 && (
                                    <div className="text-center py-16 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
                                        <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 font-medium">No education added yet.</p>
                                    </div>
                                )}
                             </div>
                        )}

                        {/* Skills & Resume Tab */}
                        {activeTab === 'skills' && (
                            <div className="space-y-10 animate-fadeIn">
                                {/* Skills */}
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                        Skills <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Separate with commas</span>
                                    </h3>
                                    <div className="bg-white p-2 relative">
                                         <input 
                                            type="text" 
                                            placeholder="e.g. React, Node.js, TypeScript, Docker..."
                                            value={skills}
                                            onChange={(e) => setSkills(e.target.value)}
                                            onFocus={() => setActiveSkillInput(true)}
                                            onBlur={() => setTimeout(() => setActiveSkillInput(false), 200)}
                                            className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-[#4169E1] outline-none"
                                        />
                                        {activeSkillInput && (
                                            <SuggestionList items={skillSuggestions} onSelect={selectSkill} />
                                        )}
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {skills.split(',').filter(s => s.trim()).map((skill, i) => (
                                                <span key={i} className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-blue-50 text-[#4169E1] border border-blue-100">
                                                    {skill.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Resume */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-bold text-gray-900">Resumes</h3>
                                        <span className="text-sm font-medium text-gray-500">{resumes.length}/3 Uploaded</span>
                                    </div>
                                    
                                    <div className="space-y-4 mb-6">
                                        {resumes.map((res) => {
                                            const isActive = existingResume === res.file;
                                            return (
                                                <div key={res._id} className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${isActive ? 'bg-green-50/50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                                    <div className="flex items-start gap-4">
                                                        <div className={`p-3 rounded-lg ${isActive ? 'bg-green-100 text-green-700' : 'bg-white text-gray-500 shadow-sm'}`}>
                                                            <FileText className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-bold text-gray-900 line-clamp-1 break-all text-sm md:text-base">{res.name}</h4>
                                                                {isActive && <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Active</span>}
                                                            </div>
                                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 font-medium">
                                                                <span>{new Date(res.uploadedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                                                <span>•</span>
                                                                <a href={res.file} target="_blank" rel="noopener noreferrer" className="hover:text-[#4169E1] hover:underline flex items-center">
                                                                    View File <ExternalLink className="w-3 h-3 ml-1" />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2 self-end md:self-auto">
                                                        {!isActive && (
                                                            <button 
                                                                type="button" 
                                                                onClick={() => handleSetActiveResume(res._id)} 
                                                                className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-[#4169E1] hover:text-[#4169E1] transition-all"
                                                            >
                                                                Make Active
                                                            </button>
                                                        )}
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleDeleteResume(res._id)} 
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete Resume"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {resumes.length < 3 ? (
                                        <div className={`flex justify-center px-8 pt-10 pb-10 border-2 border-dashed rounded-2xl transition-all duration-200 bg-gray-50/50 ${resume ? 'border-[#4169E1] bg-blue-50/20' : 'border-gray-200 hover:border-[#4169E1]'}`}>
                                            <div className="space-y-3 text-center">
                                                <div className={`mx-auto h-14 w-14 flex items-center justify-center rounded-full ${resume ? 'bg-blue-100 text-[#4169E1]' : 'bg-white shadow-sm text-gray-400'}`}>
                                                    <Download className="h-7 w-7" />
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <label htmlFor="resume-upload" className="relative cursor-pointer font-bold text-[#4169E1] hover:text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#4169E1] rounded-md px-1">
                                                        <span>{resume ? 'Change file' : 'Upload a new resume'}</span>
                                                        <input id="resume-upload" name="resume" type="file" className="sr-only" onChange={handleResumeChange} accept=".pdf,.doc,.docx" />
                                                    </label>
                                                    <span className="pl-1">or drag and drop</span>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    PDF, DOC, DOCX up to 10MB
                                                </p>
                                                {resume && <p className="text-sm font-bold text-[#4169E1] mt-2 bg-blue-100 py-1 px-3 rounded-full inline-block animate-pulse">{resume.name}</p>}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-500 text-sm">
                                            Maximum of 3 resumes reached. Delete one to upload a new version.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}



                        <div className="flex gap-4 pt-8 border-t border-gray-100">
                             <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 px-6 rounded-xl font-bold text-white text-lg transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-500/30 ${
                                    loading 
                                    ? 'bg-blue-400 cursor-not-allowed' 
                                    : 'bg-[#4169E1] hover:bg-[#3A5FCD]'
                                }`}
                            >
                                {loading && <span className="inline-block animate-spin mr-2">⟳</span>}
                                {loading ? 'Saving Changes...' : 'Save Profile'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileDetails;
