import React, { useState, useEffect } from 'react';
import { Activity, Clock, User, Briefcase, FileText, Settings, Shield } from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext'; // Fixed import path assuming structure

const EmployerActivityLogs = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const isRecruiter = user?.companyRole === 'Recruiter';

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const { data } = await api.get('/activity-logs');
                setLogs(data);
            } catch (err) {
                console.error("Failed to fetch logs", err);
                setError(err.response?.data?.message || 'Failed to load activity logs');
            } finally {
                setLoading(false);
            }
        };

        if (!isRecruiter) {
            fetchLogs();
        } else {
            setLoading(false);
        }
    }, [isRecruiter]);

    if (isRecruiter) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
                <p className="text-gray-500">Only company administrators can view activity logs.</p>
            </div>
        );
    }

    const getIcon = (action) => {
        switch (action) {
            case 'LOGIN': return <User className="w-5 h-5 text-blue-500" />;
            case 'JOB_CREATE': return <Briefcase className="w-5 h-5 text-green-500" />;
            case 'JOB_MODIFY': return <Briefcase className="w-5 h-5 text-orange-500" />;
            case 'JOB_DELETE': return <Briefcase className="w-5 h-5 text-red-500" />;
            case 'JOB_DEACTIVATE': return <Briefcase className="w-5 h-5 text-gray-500" />;
            case 'WHY_JOIN_US_UPDATE': return <FileText className="w-5 h-5 text-purple-500" />;
            case 'REVIEW_HIDE': return <Settings className="w-5 h-5 text-yellow-500" />;
            case 'APPLICANT_STATUS_CHANGE': return <User className="w-5 h-5 text-teal-500" />;
            default: return <Activity className="w-5 h-5 text-gray-500" />;
        }
    };

    const formatAction = (action) => {
        return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: 'numeric', hour12: true
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
             <div className="mb-6">
                <h2 className="text-xl font-bold text-black flex items-center gap-2">
                    <Activity className="w-6 h-6 text-[#4169E1]" />
                    Activity Logs
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    Track actions performed by your team members.
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4169E1]"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
                    {error}
                </div>
            ) : logs.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    No activity logs found.
                </div>
            ) : (
                <div className="flow-root">
                    <ul className="-mb-8">
                        {logs.map((log, logIdx) => (
                            <li key={log._id}>
                                <div className="relative pb-8">
                                    {logIdx !== logs.length - 1 ? (
                                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                    ) : null}
                                    <div className="relative flex space-x-3">
                                        <div>
                                            <span className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center ring-8 ring-white">
                                                {getIcon(log.action)}
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                            <div>
                                                <p className="text-sm text-gray-900">
                                                    <span className="font-medium mr-1">{log.performerName}</span>
                                                    <span className="text-gray-500">({log.performerEmail})</span>
                                                </p>
                                                <p className="text-sm text-gray-600 font-medium mt-0.5">{log.details}</p>
                                            </div>
                                            <div className="text-right text-sm whitespace-nowrap text-gray-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                <time dateTime={log.createdAt}>{formatDate(log.createdAt)}</time>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default EmployerActivityLogs;
