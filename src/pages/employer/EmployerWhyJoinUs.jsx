import React, { useState, useEffect } from 'react';
import { Video, FileText, Plus, Trash2, Youtube, Save, ExternalLink, PlayCircle } from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

const EmployerWhyJoinUs = () => {
    const { user, login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [videos, setVideos] = useState([]);
    const [blogs, setBlogs] = useState([]);

    useEffect(() => {
        if (user?.whyJoinUs) {
            setVideos(user.whyJoinUs.videos || []);
            setBlogs(user.whyJoinUs.blogs || []);
        }
    }, [user]);

    const addVideo = () => {
        setVideos([...videos, { url: '', description: '' }]);
    };

    const removeVideo = (index) => {
        setVideos(videos.filter((_, i) => i !== index));
    };

    const updateVideo = (index, field, value) => {
        const newVideos = [...videos];
        newVideos[index][field] = value;
        setVideos(newVideos);
    };

    const addBlog = () => {
        setBlogs([...blogs, { title: '', content: '', date: new Date() }]);
    };

    const removeBlog = (index) => {
        setBlogs(blogs.filter((_, i) => i !== index));
    };

    const updateBlog = (index, field, value) => {
        const newBlogs = [...blogs];
        newBlogs[index][field] = value;
        setBlogs(newBlogs);
    };

    const getYoutubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        const formData = new FormData();
        formData.append('whyJoinUs', JSON.stringify({ videos, blogs }));

        try {
            const { data } = await api.put('/auth/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            login(data);
            setMessage('Why Join Us content updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update content');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-black">Why Join Us Content</h2>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-6 py-2 bg-[#4169E1] text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    {loading ? 'Saving...' : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>

            {message && (
                <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200 mb-6">
                    {message}
                </div>
            )}
            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 mb-6">
                    {error}
                </div>
            )}

            <div className="space-y-10">
                {/* Videos Section */}
                <section>
                    <div className="flex items-center justify-between mb-4 border-b pb-2">
                        <div className="flex items-center gap-2">
                            <Video className="w-6 h-6 text-[#4169E1]" />
                            <h3 className="text-lg font-semibold text-gray-800">Company Videos</h3>
                        </div>
                        <button
                            onClick={addVideo}
                            className="text-sm font-medium text-[#4169E1] hover:underline flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" /> Add Video
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                        {videos.length === 0 && (
                            <p className="text-sm text-gray-500 italic">No videos added yet.</p>
                        )}
                        {videos.map((video, index) => (
                            <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200 relative group">
                                <button
                                    onClick={() => removeVideo(index)}
                                    className="absolute -top-3 -right-3 p-2 bg-white text-red-500 rounded-full shadow-md hover:bg-red-50 transition-colors border"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Video Link</label>
                                            <div className="relative">
                                                <Youtube className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="url"
                                                    value={video.url}
                                                    onChange={(e) => updateVideo(index, 'url', e.target.value)}
                                                    placeholder="https://www.youtube.com/watch?v=..."
                                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                            <textarea
                                                value={video.description}
                                                onChange={(e) => updateVideo(index, 'description', e.target.value)}
                                                placeholder="What's this video about?"
                                                rows="3"
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="bg-black/5 rounded-lg flex items-center justify-center p-2">
                                        {getYoutubeId(video.url) ? (
                                            <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-sm">
                                                <iframe
                                                    src={`https://www.youtube.com/embed/${getYoutubeId(video.url)}`}
                                                    title="YouTube Preview"
                                                    className="absolute inset-0 w-full h-full"
                                                    allowFullScreen
                                                ></iframe>
                                            </div>
                                        ) : (
                                            <div className="text-center p-8">
                                                <PlayCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                                <p className="text-sm text-gray-500">Enter a valid YouTube URL to see preview</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Blogs Section */}
                <section>
                    <div className="flex items-center justify-between mb-4 border-b pb-2">
                        <div className="flex items-center gap-2">
                            <FileText className="w-6 h-6 text-[#4169E1]" />
                            <h3 className="text-lg font-semibold text-gray-800">Company Blogs</h3>
                        </div>
                        <button
                            onClick={addBlog}
                            className="text-sm font-medium text-[#4169E1] hover:underline flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" /> Add Blog Post
                        </button>
                    </div>

                    <div className="space-y-6">
                        {blogs.length === 0 && (
                            <p className="text-sm text-gray-500 italic">No blog posts added yet.</p>
                        )}
                        {blogs.map((blog, index) => (
                            <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200 relative group">
                                <button
                                    onClick={() => removeBlog(index)}
                                    className="absolute -top-3 -right-3 p-2 bg-white text-red-500 rounded-full shadow-md hover:bg-red-50 transition-colors border"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Blog Title</label>
                                        <input
                                            type="text"
                                            value={blog.title}
                                            onChange={(e) => updateBlog(index, 'title', e.target.value)}
                                            placeholder="Enter a catchy title"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                        <textarea
                                            value={blog.content}
                                            onChange={(e) => updateBlog(index, 'content', e.target.value)}
                                            placeholder="Write your blog content here..."
                                            rows="5"
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default EmployerWhyJoinUs;
