import React, { useState, useEffect } from 'react';
import api from '../../api';
import { ShieldCheck, Upload, AlertCircle, CheckCircle, Store, Building2 } from 'lucide-react';

const VerificationCenter = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [docType, setDocType] = useState('GST');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [loadingOTP, setLoadingOTP] = useState(false);
    const [idCardFile, setIdCardFile] = useState(null);
    const [uploadingId, setUploadingId] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchStatus();
        
        // Auto-refresh status every 5 seconds to catch admin updates
        const interval = setInterval(() => {
            fetchStatus(true); // pass true to suppress loading spinner
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const fetchStatus = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const storedUser = localStorage.getItem('user');
            const token = storedUser ? JSON.parse(storedUser).token : null;
            
            if (!token) {
                setLoading(false);
                return; 
            }

            const res = await api.get('/verification/status');
            setStatus(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleSendOTP = async () => {
        try {
            setLoadingOTP(true);
            const storedUser = localStorage.getItem('user');
            const token = storedUser ? JSON.parse(storedUser).token : null;

            const res = await api.post('/verification/send-otp', {});
            setOtpSent(true);
            setMessage({ type: 'success', text: res.data.message });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to send OTP' });
        } finally {
            setLoadingOTP(false);
        }
    };

    const handleVerifyOTP = async () => {
        try {
            setLoadingOTP(true);
            const storedUser = localStorage.getItem('user');
            const token = storedUser ? JSON.parse(storedUser).token : null;

            const res = await api.post('/verification/verify-otp', { otp });
            setStatus({ ...status, level: res.data.level, emailVerified: true, domainVerified: true, status: 'Verified' });
            setMessage({ type: 'success', text: res.data.message });
            setOtpSent(false);
            setOtp('');
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Verification failed' });
        } finally {
            setLoadingOTP(false);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleIdFileChange = (e) => {
        setIdCardFile(e.target.files[0]);
    };

    const handleIdUpload = async (e) => {
        e.preventDefault();
        if (!idCardFile) {
            setMessage({ type: 'error', text: 'Please select an ID card file' });
            return;
        }

        const formData = new FormData();
        formData.append('idCard', idCardFile);

        try {
            setUploadingId(true);
            const storedUser = localStorage.getItem('user');
            const token = storedUser ? JSON.parse(storedUser).token : null;

            await api.post('/verification/upload-id-card', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            fetchStatus(); // Refresh status
            setMessage({ type: 'success', text: 'ID Card uploaded successfully! Pending Admin Approval.' });
            setIdCardFile(null);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'ID Upload failed' });
        } finally {
            setUploadingId(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage({ type: 'error', text: 'Please select a file' });
            return;
        }

        const formData = new FormData();
        formData.append('document', file);
        formData.append('docType', docType);

        try {
            setUploading(true);
            const storedUser = localStorage.getItem('user');
            const token = storedUser ? JSON.parse(storedUser).token : null;

            await api.post('/verification/upload-docs', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            fetchStatus(); // Refresh status
            setMessage({ type: 'success', text: 'Document uploaded successfully!' });
            setFile(null);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Upload failed' });
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading verification status...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 dark:text-gray-100">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Verification Center</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Verify your company identity to unlock premium features and build trust.</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-center min-w-[150px]">
                    <p className="text-sm text-gray-500 dark:text-gray-400 uppercase font-semibold">Current Level</p>
                    <div className="text-4xl font-bold text-blue-600">Level {status?.level || 0}</div>
                    <div className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-wide">
                        {status?.level === 0 ? 'Unverified' : status?.level === 1 ? 'Identity Verified' : 'Fully Verified'}
                    </div>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <p>{message.text}</p>
                </div>
            )}

            {/* Level 1: Identity Verification */}
            <div className={`border rounded-2xl overflow-hidden transition-all ${status?.level >= 1 ? 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
                    <div className="flex gap-4">
                        <div className={`p-3 rounded-lg ${status?.level >= 1 ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                            <Store size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Level 1: Company Identity</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Verify your official work email and domain.</p>
                        </div>
                    </div>
                    {status?.level >= 1 ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                            <CheckCircle size={14} /> Verified
                        </span>
                    ) : (
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">Pending</span>
                    )}
                </div>

                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                {status?.emailVerified ? <CheckCircle className="text-green-500" size={20} /> : <div className="w-5 h-5 rounded-full border-2 border-gray-300" />}
                                <span className={status?.emailVerified ? 'text-gray-900 font-medium' : 'text-gray-500'}>Official Work Email</span>
                            </div>
                            
                            {/* ID Card Verification Status Item */}
                            <div className="flex items-center gap-3">
                                {status?.idCard?.status === 'Approved' ? <CheckCircle className="text-green-500" size={20} /> : <div className="w-5 h-5 rounded-full border-2 border-gray-300" />}
                                
                                <div className="flex flex-col">
                                    <span className={status?.idCard?.status === 'Approved' ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                                        Identity Verification (ID Card)
                                    </span>
                                    {status?.idCard?.status === 'Pending' && <span className="text-xs text-yellow-600 font-medium">Verification Pending</span>}
                                    {status?.idCard?.status === 'Rejected' && <span className="text-xs text-red-600 font-medium">Rejected: {status?.idCard?.rejectionReason}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6 w-full max-w-sm">
                            {/* OTP Section */}
                            {!status?.emailVerified && (
                                <div className="flex flex-col gap-3 w-full">
                                    {!otpSent ? (
                                        <button 
                                            onClick={handleSendOTP}
                                            disabled={loadingOTP}
                                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                                        >
                                            {loadingOTP ? 'Sending...' : 'Verify Email (OTP)'}
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                placeholder="Enter 6-digit OTP"
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                maxLength={6}
                                            />
                                            <button 
                                                onClick={handleVerifyOTP}
                                                disabled={loadingOTP}
                                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-70"
                                            >
                                                {loadingOTP ? 'Verifying...' : 'Submit'}
                                            </button>
                                        </div>
                                    )}
                                    {otpSent && <p className="text-xs text-gray-500">Check your email for the code.</p>}
                                </div>
                            )}

                            {/* ID Card Upload Section - Show if Email Verified or independent? Usually generic requirement. */}
                            {/* Requirement: Level 1 = Email + ID Card. Show ID upload even if email not verified yet? Yes. */}
                            {status?.idCard?.status !== 'Approved' && status?.idCard?.status !== 'Pending' && (
                                <div className="flex flex-col gap-2 w-full">
                                    <p className="text-sm font-medium text-gray-700">Upload Government/Work ID Card</p>
                                    <div className="flex gap-2">
                                        <input 
                                            type="file" 
                                            onChange={handleIdFileChange} 
                                            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            accept=".jpg,.jpeg,.png,.pdf"
                                        />
                                        <button 
                                            onClick={handleIdUpload}
                                            disabled={uploadingId || !idCardFile}
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-70 whitespace-nowrap"
                                        >
                                            {uploadingId ? '...' : 'Upload ID'}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500">Required for Level 1 completion.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Level 2: Legal Verification */}
            <div className={`border rounded-2xl overflow-hidden transition-all ${status?.level >= 2 || status?.inheritedFromCompany ? 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
                    <div className="flex gap-4">
                        <div className={`p-3 rounded-lg ${status?.level >= 2 || status?.inheritedFromCompany ? 'bg-green-100 text-green-600' : 'bg-purple-50 text-purple-600'}`}>
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Level 2: Legal Business Verification</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Upload official government documents (GST, CIN, Udyam).</p>
                        </div>
                    </div>
                    {status?.level >= 2 ? (
                         <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                            <CheckCircle size={14} /> Verified
                        </span>
                    ) : status?.inheritedFromCompany ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                           <CheckCircle size={14} /> Business Verified
                       </span>
                   ) : (status?.documents?.some(d => d.status === 'Pending') && status.level < 2) ? (
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">Under Review</span>
                    ) : (status?.level >= 1) ? (
                         <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">Action Required</span>
                    ) : (
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">Locked</span>
                    )}
                </div>

                <div className="p-6">
                    {status?.level < 1 ? (
                        <div>
                             {status?.inheritedFromCompany && (
                                <div className="mb-6 text-green-700 bg-green-50 p-4 rounded-lg border border-green-100">
                                    <p className="font-medium">Business Verified by Admin</p>
                                    <p className="text-sm mt-1 opacity-90">
                                        Your company is already verified. Complete your <strong>Level 1 (Identity)</strong> verification to achieve full Level 2 status.
                                    </p>
                                </div>
                            )}
                            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <ShieldCheck className="mx-auto text-gray-300 mb-2" size={32} />
                                Complete Level 1 verification to unlock this step.
                            </div>
                        </div>
                    ) : status?.level >= 2 || status?.inheritedFromCompany ? (
                        <div className="text-green-700 bg-green-50 p-4 rounded-lg border border-green-100">
                            <p className="font-medium">{status.inheritedFromCompany ? 'Business Verified by Admin' : 'Business Identity Verified'}</p>
                            <p className="text-sm mt-1 opacity-90">
                                {status.inheritedFromCompany 
                                    ? 'Your company administrator has already verified the business documents. You inherit this verification status.' 
                                    : 'Your business has been legally verified. You now have the "Registered Business" badge on all job posts.'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <form onSubmit={handleUpload} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                                    <select 
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        value={docType}
                                        onChange={(e) => setDocType(e.target.value)}
                                    >
                                        <option value="GST">GST Certificate</option>
                                        <option value="CIN">Certificate of Incorporation (CIN)</option>
                                        <option value="MSME">Udyam Registration (MSME)</option>
                                        <option value="Other">Other Official Document</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload Document (PDF/Image)</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer relative">
                                        <input 
                                            type="file" 
                                            onChange={handleFileChange} 
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                        />
                                        <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                                        <p className="text-sm text-gray-600">
                                            {file ? <span className="text-blue-600 font-medium">{file.name}</span> : 'Click or drag to upload'}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">Max 5MB</p>
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={uploading || !file}
                                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploading ? 'Uploading...' : 'Submit for Verification'}
                                </button>
                            </form>

                            {/* Document History */}
                            {status?.documents?.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Submission History</h3>
                                    <div className="space-y-3">
                                        {status.documents.map((doc, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-white rounded border border-gray-200">
                                                        <span className="text-xs font-bold text-gray-500">{doc.type}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">Document Uploaded</p>
                                                        <p className="text-xs text-gray-500">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                                    doc.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                    doc.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {doc.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerificationCenter;
