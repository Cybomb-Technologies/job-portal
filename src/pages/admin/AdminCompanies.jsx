import React, { useState, useEffect } from 'react';
import api from '../../api';
import Swal from 'sweetalert2';
import { FiSearch, FiMail, FiMapPin, FiGlobe, FiBriefcase, FiUsers, FiCheckCircle, FiUserCheck, FiUserX, FiX } from 'react-icons/fi';
import './AdminTable.css';

const AdminCompanies = () => {
    const [companies, setCompanies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const { data } = await api.get('/admin/companies');
                setCompanies(data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };

        fetchCompanies();
    }, []);

    const handleToggleStatus = async (companyId, currentStatus) => {
        const action = currentStatus ? 'block' : 'unblock';
        
        const result = await Swal.fire({
            title: `Are you sure?`,
            text: `You want to ${action} this company?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: `Yes, ${action} it!`
        });

        if (!result.isConfirmed) return;

        try {
            const { data } = await api.put(`/admin/company/${companyId}/toggle-status`);
            setCompanies(companies.map(comp => comp._id === companyId ? { ...comp, isActive: data.isActive } : comp));
            Swal.fire(
                'Updated!',
                `Company has been ${action}ed.`,
                'success'
            );
        } catch (err) {
            Swal.fire(
                'Error',
                err.response?.data?.message || 'Failed to update company status',
                'error'
            );
        }
    };

    const handleViewDetails = async (id) => {
        try {
            const { data } = await api.get(`/admin/company/${id}/details`);
            setSelectedCompany(data);
        } catch (error) {
            Swal.fire('Error', 'Failed to fetch company details', 'error');
        }
    };

    const filteredCompanies = companies.filter(comp => 
        comp.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (comp.companyEmail && comp.companyEmail.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="admin-loading">Loading Companies...</div>;
    if (error) return <div className="admin-error">Error: {error}</div>;

    return (
        <div className="admin-page">
            <div className="page-header">
                <div>
                    <h1>Registered Companies</h1>
                    <p>View all companies registered through employers on the platform.</p>
                </div>
                <div className="header-actions">
                    <div className="search-bar">
                        <FiSearch />
                        <input 
                            type="text" 
                            placeholder="Search by company name..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Company</th>
                            <th>Industry & Scale</th>
                            <th>Location</th>
                            <th>Contact</th>
                            <th>Status</th>
                            <th>Account</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCompanies.map((comp, index) => (
                            <tr key={index}>
                                <td>
                                    <div className="company-info-cell">
                                        <div className="company-logo-stub">
                                            {comp.profilePicture ? (
                                                <img src={comp.profilePicture.startsWith('http') ? comp.profilePicture : `${import.meta.env.VITE_SERVER_URL}${comp.profilePicture}`} alt="" />
                                            ) : (
                                                <FiBriefcase />
                                            )}
                                        </div>
                                        <div>
                                            <div className="user-name">{comp.companyName}</div>
                                            {comp.website && (
                                                <a href={comp.website} target="_blank" rel="noopener noreferrer" className="company-website">
                                                    <FiGlobe /> {comp.website.replace(/^https?:\/\//, '')}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="industry-info">
                                        <div className="info-item">{comp.companyCategory || 'N/A'}</div>
                                        <div className="info-item-sub"><FiUsers /> {comp.employeeCount || 'N/A'} employees</div>
                                    </div>
                                </td>
                                <td>
                                    <div className="info-item"><FiMapPin /> {comp.companyLocation || 'N/A'}</div>
                                </td>
                                <td>
                                    <div className="contact-info">
                                        <div className="info-item"><FiMail /> {comp.companyEmail || 'N/A'}</div>
                                    </div>
                                </td>
                                <td>
                                    {comp.employerVerification?.status === 'Verified' ? (
                                        <span className="status-badge verified"><FiCheckCircle /> Verified</span>
                                    ) : (
                                        <span className="status-badge unverified">Secondary</span>
                                    )}
                                </td>
                                <td>
                                    <span className={`status-badge ${comp.isActive !== false ? 'active' : 'inactive'}`}>
                                        {comp.isActive !== false ? 'Active' : 'Blocked'}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button 
                                            className="btn-action bg-blue-50 text-blue-600 hover:bg-blue-100 mr-2"
                                            onClick={() => handleViewDetails(comp._id)}
                                        >
                                            View
                                        </button>
                                        <button 
                                            className={`btn-action ${comp.isActive !== false ? 'btn-block' : 'btn-unblock'}`}
                                            title={comp.isActive !== false ? 'Block Company' : 'Unblock Company'}
                                            onClick={() => handleToggleStatus(comp._id, comp.isActive !== false)}
                                        >
                                            {comp.isActive !== false ? 'Block' : 'Unblock'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredCompanies.length === 0 && (
                    <div className="no-data">No companies found.</div>
                )}
            </div>

            {selectedCompany && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-8 py-5 flex justify-between items-center z-10">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{selectedCompany.name}</h2>
                                <p className="text-gray-500 text-sm">Company ID: {selectedCompany.companyId}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedCompany(null)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <FiX className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-8">
                             {/* Basic Info */}
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="col-span-1">
                                    <div className="h-48 w-full rounded-xl bg-gray-100 border border-gray-200 overflow-hidden mb-4 relative">
                                        {selectedCompany.profilePicture ? (
                                            <img src={selectedCompany.profilePicture.startsWith('http') ? selectedCompany.profilePicture : `${import.meta.env.VITE_SERVER_URL}${selectedCompany.profilePicture}`} alt="Logo" className="w-full h-full object-contain p-4" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-300"><FiBriefcase className="w-16 h-16" /></div>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <FiGlobe className="w-5 h-5 text-gray-400" />
                                            <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600 truncate">{selectedCompany.website || 'N/A'}</a>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <FiMail className="w-5 h-5 text-gray-400" />
                                            <span className="truncate">{selectedCompany.companyEmail || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <FiMapPin className="w-5 h-5 text-gray-400" />
                                            <span>{selectedCompany.companyLocation || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="col-span-1 md:col-span-2 space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Industry</div>
                                            <div className="font-semibold text-gray-900">{selectedCompany.companyCategory || 'N/A'}</div>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Company Type</div>
                                            <div className="font-semibold text-gray-900">{selectedCompany.companyType || 'N/A'}</div>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Size</div>
                                            <div className="font-semibold text-gray-900">{selectedCompany.employeeCount || 'N/A'} Employees</div>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Founded</div>
                                            <div className="font-semibold text-gray-900">{selectedCompany.foundedYear || 'N/A'}</div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-2">About Company</h3>
                                        <p className="text-gray-600 leading-relaxed text-sm">
                                            {selectedCompany.about || 'No description available.'}
                                        </p>
                                    </div>
                                </div>
                             </div>

                             <div className="border-t pt-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                    <FiCheckCircle className="w-5 h-5 mr-2 text-blue-600" />
                                    Verification Status
                                    <span className={`ml-4 px-3 py-1 rounded-full text-xs font-bold ${
                                        selectedCompany.employerVerification?.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        Level {selectedCompany.employerVerification?.level || 0}
                                    </span>
                                </h3>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Verification Documents Area */}
                                    <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-6">
                                        <h4 className="font-bold text-blue-900 mb-4 text-sm uppercase tracking-wide">Level 2 Documents</h4>
                                        {/* We need to show documents from the admins of the company */}
                                        {selectedCompany.members?.map(member => (
                                            member.user?.employerVerification?.documents?.length > 0 && (
                                                <div key={member.user._id} className="mb-4 last:mb-0">
                                                    <div className="text-xs text-gray-400 mb-2">Uploaded by: {member.user.name}</div>
                                                    <div className="space-y-3">
                                                        {member.user.employerVerification.documents.map((doc, idx) => (
                                                            <div key={idx} className="bg-white p-3 rounded-lg border border-blue-200 flex items-center justify-between shadow-sm">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                                                        <FiBriefcase className="w-5 h-5" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-sm text-gray-900">{doc.type}</div>
                                                                        <div className={`text-xs font-bold ${doc.status === 'Approved' ? 'text-green-600' : doc.status === 'Rejected' ? 'text-red-500' : 'text-amber-500'}`}>
                                                                            {doc.status}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <a 
                                                                    href={doc.fileUrl.startsWith('http') ? doc.fileUrl : `${import.meta.env.VITE_SERVER_URL}${doc.fileUrl}`}
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition-colors"
                                                                >
                                                                    View
                                                                </a>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                        {(!selectedCompany.members || !selectedCompany.members.some(m => m.user?.employerVerification?.documents?.length > 0)) && (
                                            <div className="text-gray-500 text-sm italic py-4 text-center">No Level 2 documents found for this company.</div>
                                        )}
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default AdminCompanies;
