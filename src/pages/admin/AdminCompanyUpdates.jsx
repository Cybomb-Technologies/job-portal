import React, { useState, useEffect } from 'react';
import { Eye, Check, X, Building2, MapPin, Globe, Mail, Calendar, Users } from 'lucide-react';
import api from '../../api';

import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

const AdminCompanyUpdates = () => {
    const { user } = useAuth(); // Get user for socket auth/room joining
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('pending');

    useEffect(() => {
        if (activeTab === 'pending') {
            fetchRequests();
        } else {
            fetchHistory();
        }

        // Socket Connection for Real-time Updates
        const socket = io(import.meta.env.VITE_SERVER_URL);

        if (user && user.role === 'Admin') {
            socket.emit('join', 'admin-room');
        }

        socket.on('notification', (data) => {
            if (data.type === 'COMPANY_UPDATE') {
                if (activeTab === 'pending') fetchRequests();
                if (activeTab === 'history') fetchHistory();
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [user, activeTab]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/company-updates');
            setRequests(data);
        } catch (error) {
            console.error("Failed to fetch requests", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/company-updates/history');
            setHistory(data);
        } catch (error) {
            console.error("Failed to fetch history", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        const result = await Swal.fire({
            title: 'Approve Updates?',
            text: "This will immediately update the company's public profile.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#10B981',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, Approve Changes'
        });

        if (!result.isConfirmed) return;
        
        setActionLoading(true);
        try {
            await api.put(`/admin/company-update/${id}/approve`);
            setRequests(requests.filter(req => req._id !== id));
            setSelectedRequest(null);
            
            Swal.fire({
                icon: 'success',
                title: 'Approved!',
                text: 'The company profile has been updated.',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to approve updates'
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (id) => {
        if (!rejectReason) {
            return Swal.fire({
                icon: 'warning',
                title: 'Reason Required',
                text: 'Please provide a reason for rejection.',
                confirmButtonColor: '#3B82F6'
            });
        }
        
        setActionLoading(true);
        try {
            await api.put(`/admin/company-update/${id}/reject`, { reason: rejectReason });
            setRequests(requests.filter(req => req._id !== id));
            setSelectedRequest(null);
            setRejectReason('');
            
            Swal.fire({
                icon: 'info',
                title: 'Request Rejected',
                text: 'The employer has been notified.',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to reject request'
            });
        } finally {
            setActionLoading(false);
        }
    };

    if (loading && requests.length === 0 && history.length === 0) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Company Updates</h1>
                
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            activeTab === 'pending' 
                                ? 'bg-white text-blue-600 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Pending ({requests.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            activeTab === 'history' 
                                ? 'bg-white text-blue-600 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        History
                    </button>
                </div>
            </div>

            {activeTab === 'pending' ? (
                requests.length === 0 ? (
                    <div className="text-gray-500 bg-white p-8 rounded-lg shadow-sm text-center">
                        No pending update requests.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* List */}
                        <div className="lg:col-span-1 space-y-4">
                            {requests.map(request => (
                                <div 
                                    key={request._id}
                                    onClick={() => setSelectedRequest(request)}
                                    className={`p-4 bg-white rounded-lg shadow-sm border cursor-pointer transition-all ${selectedRequest?._id === request._id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-300'}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{request.companyId?.name || 'Unknown Company'}</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Requested by: {request.requesterId?.name || 'Unknown'}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-2">
                                                {new Date(request.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                                            Pending
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Detail View */}
                        <div className="lg:col-span-2">
                            {selectedRequest ? (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="mb-6 border-b pb-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900">Review Changes</h2>
                                                <p className="text-sm text-gray-500">
                                                    Applying updates to {selectedRequest.companyId?.name}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleApprove(selectedRequest._id)}
                                                    disabled={actionLoading}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                                                >
                                                    <Check size={18} /> Approve
                                                </button>
                                            </div>
                                        </div>

                                        {/* Company Visual Header */}
                                        <div className="relative h-32 w-full rounded-lg bg-gray-100 overflow-hidden mb-12 border border-gray-200">
                                            {/* Banner */}
                                            {selectedRequest.companyId?.bannerPicture ? (
                                                <img 
                                                    src={selectedRequest.companyId.bannerPicture.startsWith('http') 
                                                        ? selectedRequest.companyId.bannerPicture 
                                                        : `${import.meta.env.VITE_SERVER_URL}${selectedRequest.companyId.bannerPicture}`
                                                    } 
                                                    alt="Banner" 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <span className="text-xs">No Banner</span>
                                                </div>
                                            )}
                                            
                                            {/* Logo overlay */}
                                            <div className="absolute -bottom-6 left-6">
                                                <div className="h-16 w-16 rounded-lg border-4 border-white bg-white shadow-sm overflow-hidden flex items-center justify-center">
                                                    {selectedRequest.companyId?.profilePicture ? (
                                                        <img 
                                                            src={selectedRequest.companyId.profilePicture.startsWith('http') 
                                                                ? selectedRequest.companyId.profilePicture 
                                                                : `${import.meta.env.VITE_SERVER_URL}${selectedRequest.companyId.profilePicture}`
                                                            } 
                                                            alt="Logo" 
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <Building2 className="text-gray-300 h-8 w-8" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                            <h3 className="font-medium text-blue-900 mb-4">Requested Changes</h3>
                                            <div className="space-y-4">
                                                {Object.entries(selectedRequest.requestedChanges).reduce((acc, [key, value]) => {
                                                    // Map key for current value lookup
                                                    let currentKey = key;
                                                    if (key === 'companyName') currentKey = 'name';

                                                    const currentValue = selectedRequest.companyId ? selectedRequest.companyId[currentKey] : null;
                                                    
                                                    // Normalization for comparison
                                                    const normalize = (val) => {
                                                        if (val === null || val === undefined) return '';
                                                        return String(val).trim();
                                                    };

                                                    // Skip if values are essentially the same
                                                    if (normalize(currentValue) === normalize(value)) {
                                                        return acc;
                                                    }

                                                    const isImage = key.toLowerCase().includes('picture') || key.toLowerCase().includes('logo') || key.toLowerCase().includes('image');

                                                    const renderValue = (val, isNew = false) => {
                                                        if (!val) return <span className="text-gray-400 italic">None</span>;
                                                        if (isImage) {
                                                            const src = val.toString().startsWith('http') ? val : `${import.meta.env.VITE_SERVER_URL}${val}`;
                                                            return (
                                                                <div className="mt-1">
                                                                    <img src={src} alt={key} className="h-20 w-auto rounded border border-gray-300 object-cover" />
                                                                    <span className="text-xs text-gray-500 break-all mt-1 block">{val}</span>
                                                                </div>
                                                            );
                                                        }
                                                        return typeof val === 'object' ? JSON.stringify(val) : String(val);
                                                    };

                                                    acc.push(
                                                        <div key={key} className="bg-white p-3 rounded border border-blue-200 shadow-sm">
                                                            <span className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                                            </span>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="p-2 bg-red-50 rounded border border-red-100">
                                                                    <span className="text-xs text-red-500 font-semibold mb-1 block">Current Value</span>
                                                                    <div className="text-sm text-gray-700 break-words font-medium">
                                                                        {renderValue(currentValue)}
                                                                    </div>
                                                                </div>
                                                                <div className="p-2 bg-green-50 rounded border border-green-100">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="text-xs text-green-600 font-semibold">New Value</span>
                                                                        <span className="text-[10px] bg-green-200 text-green-800 px-1 rounded">REQUESTED</span>
                                                                    </div>
                                                                    <div className="text-sm text-gray-900 break-words font-bold">
                                                                        {renderValue(value, true)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                    return acc;
                                                }, [])}
                                                
                                                {/* Fallback if no specific changes detected */}
                                                {(() => {
                                                    const hasChanges = Object.entries(selectedRequest.requestedChanges).some(([key, value]) => {
                                                         let currentKey = key;
                                                         if (key === 'companyName') currentKey = 'name';
                                                         const currentValue = selectedRequest.companyId ? selectedRequest.companyId[currentKey] : null;
                                                         return String(currentValue || '').trim() !== String(value || '').trim();
                                                    });
                                                    if (!hasChanges) {
                                                        return (
                                                            <div className="text-center p-4 text-gray-500 italic bg-white rounded border border-gray-200">
                                                                No actual content changes detected in this request.
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })()}
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t">
                                            <h3 className="font-medium text-gray-900 mb-2">Rejection</h3>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="text" 
                                                    value={rejectReason}
                                                    onChange={(e) => setRejectReason(e.target.value)}
                                                    placeholder="Reason for rejection..."
                                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                                />
                                                <button 
                                                    onClick={() => handleReject(selectedRequest._id)}
                                                    disabled={actionLoading || !rejectReason}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <X size={18} /> Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                <Eye className="w-12 h-12 mb-2 opacity-20" />
                                <p>Select a request to review details</p>
                            </div>
                        )}
                    </div>
                </div>
            )) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-900">Company</th>
                                    <th className="px-6 py-4 font-semibold text-gray-900">Requester</th>
                                    <th className="px-6 py-4 font-semibold text-gray-900">Status</th>
                                    <th className="px-6 py-4 font-semibold text-gray-900">Processed By</th>
                                    <th className="px-6 py-4 font-semibold text-gray-900">Date</th>
                                    <th className="px-6 py-4 font-semibold text-gray-900">Comments</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {history.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500 italic">
                                            No history found.
                                        </td>
                                    </tr>
                                ) : (
                                    history.map((item) => (
                                        <tr key={item._id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {item.companyId?.name || 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {item.requesterId?.name || 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    item.status === 'Approved' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {item.status === 'Approved' ? <Check size={12} className="mr-1" /> : <X size={12} className="mr-1" />}
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {item.processedBy?.name || 'System'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {new Date(item.processedAt).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                                                {item.adminComments || '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCompanyUpdates;
