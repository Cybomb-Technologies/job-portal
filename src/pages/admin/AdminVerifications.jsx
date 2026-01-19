import React, { useState, useEffect } from 'react';
import { 
    CheckCircle, 
    XCircle, 
    FileText, 
    ExternalLink, 
    AlertCircle,
    Search,
    Shield
} from 'lucide-react';
import api from '../../api';
import Swal from 'sweetalert2';

const AdminVerifications = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPendingVerifications();
    }, []);

    const fetchPendingVerifications = async () => {
        try {
            const { data } = await api.get('/admin/verifications');
            setPendingUsers(data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch pending verifications", error);
            setLoading(false);
        }
    };

    const handleApprove = async (userId, documentId) => {
        try {
             await api.put(`/admin/verification/${userId}/document/${documentId}`, {
                 status: 'Approved'
             });
             
             Swal.fire({
                 icon: 'success',
                 title: 'Document Approved',
                 toast: true,
                 position: 'top-end',
                 showConfirmButton: false,
                 timer: 3000
             });

             fetchPendingVerifications();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to approve', 'error');
        }
    };

    const handleReject = async (userId, documentId) => {
        const { value: reason } = await Swal.fire({
            title: 'Reject Document',
            input: 'textarea',
            inputLabel: 'Reason for Rejection',
            inputPlaceholder: 'Enter the reason...',
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) {
                return 'You need to write a reason!'
                }
            }
        });

        if (reason) {
            try {
                await api.put(`/admin/verification/${userId}/document/${documentId}`, {
                    status: 'Rejected',
                    rejectionReason: reason
                });

                Swal.fire({
                    icon: 'success',
                    title: 'Document Rejected',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });

                fetchPendingVerifications();
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'Failed to reject', 'error');
            }
        }
    };

    const filteredUsers = pendingUsers.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center text-gray-500">Loading verifications...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pending Verifications</h1>
                    <p className="text-gray-500">Review and approve employer documents</p>
                </div>
            </div>

            {/* Search */}
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center mb-6">
                <Search className="w-5 h-5 text-gray-400 mr-3" />
                <input 
                    type="text" 
                    placeholder="Search by name, company or email..." 
                    className="flex-1 outline-none text-gray-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {filteredUsers.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">All Caught Up!</h3>
                    <p className="text-gray-500">There are no pending verification requests at this time.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredUsers.map(user => (
                        <div key={user._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-wrap justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-[#4169E1] font-bold">
                                        {user.companyName ? user.companyName.charAt(0) : user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{user.companyName || 'No Company Name'}</h3>
                                        <div className="text-sm text-gray-500">{user.name} ({user.email})</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                    <span className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-bold border border-yellow-100 flex items-center">
                                       <AlertCircle className="w-3 h-3 mr-1" />
                                       Pending Verification
                                    </span>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Submitted Documents</h4>
                                <div className="space-y-4">
                                    {user.employerVerification?.documents
                                        .filter(doc => doc.status === 'Pending')
                                        .map((doc, index) => (
                                        <div key={index} className="flex flex-col md:flex-row items-center border border-gray-100 rounded-lg p-4 hover:border-blue-100 transition-colors">
                                            <div className="flex items-center flex-1 mb-4 md:mb-0">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4 text-gray-500">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{doc.type} Verification</div>
                                                    <div className="text-xs text-gray-500">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</div>
                                                    <a 
                                                        href={doc.fileUrl.startsWith('http') ? doc.fileUrl : `http://localhost:8000${doc.fileUrl}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-[#4169E1] text-sm font-medium hover:underline flex items-center mt-1"
                                                    >
                                                        View Document <ExternalLink className="w-3 h-3 ml-1" />
                                                    </a>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3 w-full md:w-auto">
                                                <button 
                                                    onClick={() => handleReject(user._id, doc._id)}
                                                    className="flex-1 md:flex-none px-4 py-2 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors text-sm flex items-center justify-center"
                                                >
                                                    <XCircle className="w-4 h-4 mr-2" />
                                                    Reject
                                                </button>
                                                <button 
                                                    onClick={() => handleApprove(user._id, doc._id)}
                                                    className="flex-1 md:flex-none px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm flex items-center justify-center shadow-sm"
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    Approve
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminVerifications;
