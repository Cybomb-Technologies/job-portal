import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building, Users } from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { generateSlug } from '../../utils/slugify';
import Swal from 'sweetalert2';

const FollowingCompanies = () => {
    const { user } = useAuth();
    const [followingCompanies, setFollowingCompanies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFollowing = async () => {
            try {
                const { data } = await api.get('/auth/profile');
                setFollowingCompanies(data.followingCompanies || []);
            } catch (err) {
                console.error("Failed to fetch following companies", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFollowing();
    }, []);

    const handleUnfollow = async (company) => {
        try {
            await api.delete(`/auth/unfollow/${company._id}`);
            setFollowingCompanies(prev => prev.filter(c => c._id !== company._id));
            Swal.fire({ 
                icon: 'success', 
                title: 'Unfollowed', 
                text: `You have unfollowed ${company.name}`, 
                timer: 1500, 
                showConfirmButton: false 
            });
        } catch (err) {
            console.error(err);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to unfollow' });
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Building className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Following Companies</h2>
                    <p className="text-sm text-gray-500">Companies you are interested in</p>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-gray-50 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : followingCompanies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {followingCompanies.map((company) => (
                        <div key={company._id} className="border border-gray-100 rounded-xl p-4 hover:border-blue-200 transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 p-1.5 shrink-0">
                                    {company.profilePicture ? (
                                        <img 
                                            src={company.profilePicture.startsWith('http') ? company.profilePicture : `${import.meta.env.VITE_SERVER_URL}${company.profilePicture}`} 
                                            alt={company.name} 
                                            className="w-full h-full object-contain" 
                                        />
                                    ) : (
                                        <Building className="w-5 h-5 text-gray-400" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <Link 
                                        to={`/company/${generateSlug(company.name, company._id)}`} 
                                        className="font-bold text-gray-900 truncate block group-hover:text-blue-600 transition-colors"
                                    >
                                        {company.name}
                                    </Link>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleUnfollow(company)}
                                className="mt-3 w-full py-2 bg-slate-50 text-slate-600 font-bold rounded-lg text-xs hover:bg-red-50 hover:text-red-600 transition-colors border border-gray-100"
                            >
                                Unfollow
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    <Building className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="font-medium text-lg">You are not following any companies yet.</p>
                    <p className="text-sm mt-1">Follow companies to get updates about their new job postings.</p>
                    <Link to="/companies" className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
                        Explore Companies
                    </Link>
                </div>
            )}
        </div>
    );
};

export default FollowingCompanies;
