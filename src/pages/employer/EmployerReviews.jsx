import React, { useState, useEffect } from 'react';
import { Star, Eye, EyeOff, MessageSquare } from 'lucide-react';
import api from '../../api';

const EmployerReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const { data } = await api.get('/reviews/my/all');
            setReviews(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Failed to load reviews');
            setLoading(false);
        }
    };

    const toggleVisibility = async (id) => {
        try {
            const { data } = await api.patch(`/reviews/${id}/visibility`);
            setReviews(reviews.map(review => 
                review._id === id ? { ...review, isHidden: data.isHidden } : review
            ));
        } catch (err) {
            console.error(err);
            alert('Failed to update review visibility');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-black mb-6">Company Reviews</h2>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 mb-6">
                    {error}
                </div>
            )}

            {reviews.length === 0 ? (
                <div className="text-center py-12">
                     <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No reviews yet</h3>
                    <p className="text-gray-500 mt-2">When candidates review your company, they will appear here.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review._id} className={`p-6 rounded-lg border transistion-all ${review.isHidden ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-white border-gray-100 hover:shadow-md'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                                        {review.reviewer?.profilePicture ? (
                                             <img src={review.reviewer.profilePicture.startsWith('http') ? review.reviewer.profilePicture : `http://localhost:8000${review.reviewer.profilePicture}`} alt={review.reviewer.name} className="w-full h-full object-cover" />
                                        ) : (
                                            review.reviewer?.name?.charAt(0) || 'U'
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{review.title || 'Company Review'}</h4>
                                        <p className="text-sm text-gray-500">
                                            by {review.reviewer?.name || (review.reviewerType === 'Employee' ? 'Verified Employee' : 'Anonymous')}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => toggleVisibility(review._id)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                        review.isHidden 
                                        ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' 
                                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                    }`}
                                    title={review.isHidden ? "Click to Show Review" : "Click to Hide Review"}
                                >
                                    {review.isHidden ? (
                                        <>
                                            <Eye className="w-4 h-4" />
                                            Show
                                        </>
                                    ) : (
                                        <>
                                            <EyeOff className="w-4 h-4" />
                                            Hide
                                        </>
                                    )}
                                </button>
                            </div>
                            
                            <div className="flex items-center gap-1 mb-3">
                                {[...Array(5)].map((_, i) => (
                                    <Star 
                                        key={i} 
                                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                    />
                                ))}
                            </div>

                            <p className="text-gray-600 leading-relaxed">
                                {review.comment}
                            </p>
                            
                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-xs text-gray-400">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                                {review.isHidden && (
                                    <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                        Hidden from public
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EmployerReviews;
