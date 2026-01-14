import React, { useState } from 'react';
import { AlertCircle, Send, CheckCircle, Bug, Lightbulb, FileText, HelpCircle } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const ReportIssue = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        type: 'Bug',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.post('/issues/public', formData);
            setSubmitted(true);
        } catch (err) {
            console.error('Report error:', err);
            setError(err.response?.data?.message || 'Failed to submit report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in-up">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Thank You!</h2>
                    <p className="text-gray-500 mb-8 text-lg">
                        Your report has been submitted successfully. Our team will review it shortly.
                    </p>
                    <button 
                        onClick={() => {
                            setSubmitted(false);
                            setFormData({
                                name: user?.name || '',
                                email: user?.email || '',
                                type: 'Bug',
                                description: ''
                            });
                        }}
                        className="w-full py-4 bg-[#4169E1] text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                    >
                        Submit Another Report
                    </button>
                    <button 
                         onClick={() => window.history.back()}
                         className="mt-4 text-gray-500 hover:text-gray-700 font-medium"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const getTypeIcon = (type) => {
        switch(type) {
            case 'Bug': return <Bug className="w-5 h-5" />;
            case 'Feature Request': return <Lightbulb className="w-5 h-5" />;
            case 'Content': return <FileText className="w-5 h-5" />;
            default: return <HelpCircle className="w-5 h-5" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-3 bg-red-50 rounded-2xl mb-4">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Report an Issue</h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                        Found a bug or have a suggestion? Let us know so we can improve your experience.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="p-8 md:p-12">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Your Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4169E1] outline-none transition-all font-medium"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4169E1] outline-none transition-all font-medium"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Issue Type</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {['Bug', 'Feature Request', 'Content', 'Other'].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type })}
                                            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                                                formData.type === type 
                                                ? 'bg-blue-50 border-[#4169E1] text-[#4169E1] ring-1 ring-[#4169E1]' 
                                                : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                                            }`}
                                        >
                                            {getTypeIcon(type)}
                                            <span className="text-sm font-bold">{type}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Description</label>
                                <textarea
                                    name="description"
                                    required
                                    rows="6"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4169E1] outline-none transition-all font-medium resize-none"
                                    placeholder="Please describe the issue in detail..."
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-[#4169E1] text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transform active:scale-[0.99]"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Submit Report
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportIssue;
