import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { generateSlug } from '../../utils/slugify';

const EmployerFollowers = () => {
    const { user } = useAuth();
    const [followers, setFollowers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFollowers = async () => {
            if (!user?.companyId) {
                setLoading(false);
                return;
            }
            try {
                const { data } = await api.get(`/auth/company/${user.companyId}/followers`);
                setFollowers(data);
            } catch (err) {
                console.error("Failed to fetch followers", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFollowers();
    }, [user]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Followers</h2>
                    <p className="text-sm text-gray-500">Job seekers following your company</p>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-gray-50 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            ) : followers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {followers.map(follower => (
                        <Link 
                            to={`/profile/${generateSlug(follower.name, follower._id)}`} 
                            key={follower._id} 
                            className="block group"
                        >
                            <div className="p-4 border border-gray-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                                    {follower.profilePicture ? (
                                        <img 
                                            src={follower.profilePicture.startsWith('http') ? follower.profilePicture : `${import.meta.env.VITE_SERVER_URL}${follower.profilePicture}`} 
                                            alt={follower.name} 
                                            className="w-full h-full object-cover" 
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                                            <Users className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                        {follower.name}
                                    </h4>
                                    <p className="text-xs text-slate-500 truncate font-medium">
                                        {follower.title || 'Job Seeker'}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                        <Users className="w-8 h-8 text-slate-300" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">No followers yet</h4>
                    <p className="text-slate-500 mt-2 font-medium px-4">
                        Job seekers who follow your company will appear here.
                    </p>
                </div>
            )}
        </div>
    );
};

export default EmployerFollowers;
