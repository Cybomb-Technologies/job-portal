import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Mail, CheckCircle, AlertCircle, Clock, Filter, Search, ChevronDown, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';

const AdminSupport = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchIssues = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/issues');
            setIssues(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, []);

    const handleResolve = async (id, currentStatus) => {
        // Confirmation with Reply Input
        const result = await Swal.fire({
            title: 'Resolve & Reply',
            input: 'textarea',
            inputLabel: 'Message to User (Optional)',
            inputPlaceholder: 'Type your reply here...',
            inputAttributes: {
                'aria-label': 'Type your reply here'
            },
            showCancelButton: true,
            confirmButtonColor: '#10B981',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Resolve Issue',
            showLoaderOnConfirm: true,
            preConfirm: async (reply) => {
                try {
                    await api.put(`/issues/${id}/status`, { 
                        status: 'Resolved',
                        reply: reply || 'The issue has been resolved.'
                    });
                    return reply;
                } catch (error) {
                    Swal.showValidationMessage(
                        `Request failed: ${error}`
                    )
                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        });

        if (result.isConfirmed) {
            // Optimistic Update
            setIssues(prevIssues => prevIssues.map(issue => 
                issue._id === id ? { ...issue, status: 'Resolved' } : issue
            ));

            Swal.fire({
                title: 'Resolved!',
                text: 'Issue has been resolved and user notified.',
                icon: 'success'
            });
        }
    };

    const filteredIssues = issues.filter(issue => {
        const matchesStatus = filterStatus === 'All' || issue.status === filterStatus;
        const matchesSearch = issue.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              issue.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              issue.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusColor = (status) => {
        switch(status) {
            case 'Open': return 'bg-red-100 text-red-700';
            case 'In Progress': return 'bg-yellow-100 text-yellow-700';
            case 'Resolved': return 'bg-green-100 text-green-700';
            case 'Closed': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
                    <p className="text-gray-500">Manage and resolve user reported issues.</p>
                </div>
                <button 
                    onClick={fetchIssues} 
                    className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="Search tickets..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {['All', 'Open', 'Resolved'].map(status => (
                         <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                                filterStatus === status 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                         >
                             {status}
                         </button>
                    ))}
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                </div>
            ) : filteredIssues.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No tickets found</h3>
                    <p className="text-gray-500">Great job! There are no pending issues.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredIssues.map((issue) => (
                        <div key={issue._id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                        issue.type === 'Bug' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-gray-900">{issue.name}</h3>
                                            <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded-md border border-gray-200">
                                                {issue.type}
                                            </span>
                                        </div>
                                        <a href={`mailto:${issue.email}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                            <Mail className="w-3 h-3" /> {issue.email}
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(issue.status)}`}>
                                        {issue.status}
                                    </span>
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(issue.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-4">
                                <p className="text-gray-700 whitespace-pre-wrap">{issue.description}</p>
                            </div>

                            {issue.status !== 'Resolved' && (
                                <div className="flex justify-end">
                                    <button 
                                        onClick={() => handleResolve(issue._id)}
                                        className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Mark as Resolved
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminSupport;
