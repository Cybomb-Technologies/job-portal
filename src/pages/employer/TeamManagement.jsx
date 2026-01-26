import React, { useState, useEffect } from 'react';
import api from '../../api';
import { UserPlus, Trash2, Shield, Mail, User } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';

const TeamManagement = () => {
    const { user } = useAuth();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newMember, setNewMember] = useState({ name: '', email: '', password: '', role: 'Recruiter' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/team/members');
            setMembers(data);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to fetch team members'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await api.post('/team/members', newMember);
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Member added successfully',
                timer: 2000,
                showConfirmButton: false
            });
            setShowAddModal(false);
            setNewMember({ name: '', email: '', password: '', role: 'Recruiter' });
            fetchMembers();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to add member'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemoveMember = async (userId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "They will lose access to the company dashboard.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#4169E1',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, remove them!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/team/members/${userId}`);
                Swal.fire('Removed!', 'Member has been removed.', 'success');
                fetchMembers();
            } catch (error) {
                Swal.fire('Error!', error.response?.data?.message || 'Failed to remove member', 'error');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Team Management</h2>
                    <p className="text-gray-600">Manage your recruitment team and collaborate on job postings.</p>
                </div>
                {user?.companyRole === 'Admin' && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        <UserPlus />
                        Add Member
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Member</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Role</th>
                            {user?.companyRole === 'Admin' && <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {members.map((member) => (
                            <tr key={member.user._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <div className="font-medium text-gray-900">{member.user.name}</div>
                                            <div className="text-sm text-gray-500">{member.user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                        member.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        <Shield size={12} />
                                        {member.role}
                                    </span>
                                </td>
                                {user?.companyRole === 'Admin' && (
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleRemoveMember(member.user._id)}
                                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                            title="Remove Member"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {members.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        No team members found. Add your first colleague to start collaborating.
                    </div>
                )}
            </div>

            {/* Add Member Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-scaleIn">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Add Team Member</h3>
                        <form onSubmit={handleAddMember} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        value={newMember.name}
                                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                        placeholder="John Doe"
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={newMember.email}
                                        onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                                        placeholder="colleague@company.com"
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={newMember.password}
                                        onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">If the user exists, the name and password will be ignored.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={newMember.role}
                                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="Recruiter">Recruiter</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                >
                                    {submitting ? 'Adding...' : 'Add Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamManagement;
