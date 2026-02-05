import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, MapPin, Briefcase, IndianRupee, Clock, Trash2 } from 'lucide-react';
import api from '../../api';
import { generateSlug } from '../../utils/slugify';
import { quickSuccess, showError } from '../../utils/sweetAlerts';

const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} day${interval > 1 ? 's' : ''} ago`;
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} hour${interval > 1 ? 's' : ''} ago`;
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} minute${interval > 1 ? 's' : ''} ago`;
    return 'Just now';
};

const SavedJobs = () => {
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSavedJobs = async () => {
            try {
                const { data } = await api.get('/auth/saved-jobs');
                setSavedJobs(data);
            } catch (err) {
                console.error('Failed to fetch saved jobs', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSavedJobs();
    }, []);

    const handleUnsave = async (jobId) => {
        try {
            await api.delete(`/auth/jobs/${jobId}/unsave`);
            setSavedJobs(prev => prev.filter(job => job._id !== jobId));
            quickSuccess('Job removed from saved!');
        } catch (err) {
            console.error('Failed to unsave job', err);
            showError('Error', 'Failed to remove job');
        }
    };

    if (loading) return <div className="p-10 text-center">Loading saved jobs...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 min-h-[500px]">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-black">Saved Jobs</h2>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-semibold">
                    {savedJobs.length} saved
                </span>
            </div>

            {savedJobs.length === 0 ? (
                <div className="text-center py-12">
                    <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No saved jobs yet</h3>
                    <p className="text-gray-600 mb-6">Jobs you save will appear here so you can easily find them later.</p>
                    <Link to="/jobs" className="bg-[#4169E1] text-white px-6 py-2 rounded-lg hover:bg-[#3A5FCD]">
                        Browse Jobs
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {savedJobs.map(job => (
                        <div key={job._id} className="p-4 rounded-lg border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group">
                            <div className="flex-1 min-w-0">
                                <Link 
                                    to={`/job/${generateSlug(job.title, job._id)}`}
                                    className="hover:text-[#4169E1]"
                                >
                                    <h3 className="text-lg font-bold text-black mb-1 truncate hover:text-[#4169E1]">
                                        {job.title}
                                    </h3>
                                </Link>
                                <div className="flex flex-wrap gap-4 text-xs text-gray-600 mb-2">
                                    <span className="flex items-center"><Briefcase className="w-3 h-3 mr-1" /> {job.company}</span>
                                    <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {job.location}</span>
                                    <span className="flex items-center">
                                        <IndianRupee className="w-3 h-3 mr-1" />
                                        {job.salaryType === 'Fixed' 
                                            ? `${Number(job.salaryMin).toLocaleString()}` 
                                            : `${Number(job.salaryMin).toLocaleString()} - ${Number(job.salaryMax).toLocaleString()}`
                                        }
                                    </span>
                                </div>
                                <div className="text-xs text-gray-400 flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Posted {timeAgo(job.createdAt)}
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2">
                                <button
                                    onClick={() => handleUnsave(job._id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Remove from saved"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                <Link to={`/job/${generateSlug(job.title, job._id)}`} className="text-[#4169E1] text-xs hover:underline font-medium">
                                    View Job
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SavedJobs;
