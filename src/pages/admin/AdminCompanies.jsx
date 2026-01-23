import React, { useState, useEffect } from 'react';
import api from '../../api';
import { FiSearch, FiMail, FiMapPin, FiGlobe, FiBriefcase, FiUsers, FiCheckCircle } from 'react-icons/fi';
import './AdminTable.css';

const AdminCompanies = () => {
    const [companies, setCompanies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredCompanies.length === 0 && (
                    <div className="no-data">No companies found.</div>
                )}
            </div>
        </div>
    );
};

export default AdminCompanies;
