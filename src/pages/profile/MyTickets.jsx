import React, { useState, useEffect } from 'react';
import api from '../../api';
import { HelpCircle, CheckCircle } from 'lucide-react';

const MyTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const { data } = await api.get('/issues/my-issues');
                setTickets(data);
            } catch (err) {
                console.error("Failed to fetch tickets", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, []);

    return (
        <div className="max-w-5xl mx-auto animate-fadeIn min-h-[85vh] py-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
                        <p className="text-gray-500 text-sm mt-1">Track the status of your reported issues.</p>
                    </div>
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{tickets.length} Tickets</span>
                </div>

                {loading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4169E1] mx-auto"></div>
                        <p className="mt-2 text-gray-500 font-medium">Loading tickets...</p>
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                        <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No support tickets found.</p>
                        <p className="text-sm text-gray-400 mt-1">Issues you report via the Report Issue page will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tickets.map((ticket) => (
                            <div key={ticket._id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
                                                ticket.status === 'Resolved' 
                                                ? 'bg-green-50 text-green-700 border-green-100' 
                                                : ticket.status === 'Open' 
                                                ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                : 'bg-gray-100 text-gray-700 border-gray-200'
                                            }`}>
                                                {ticket.status}
                                            </span>
                                            <span className="text-xs text-gray-400 font-medium">#{ticket._id.slice(-6).toUpperCase()}</span>
                                            <span className="text-xs text-gray-400">• {new Date(ticket.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900 mb-1">{ticket.name}</h4>
                                        <p className="text-sm text-gray-500 mb-4 font-medium flex items-center gap-2">
                                            Type: <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700">{ticket.type}</span>
                                        </p>
                                        
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                            <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
                                        </div>
                                    </div>
                                </div>

                                {ticket.status === 'Resolved' && (
                                    <div className="mt-4 pl-4 border-l-4 border-green-500 bg-green-50/50 p-4 rounded-r-lg">
                                        <h5 className="text-sm font-bold text-green-800 mb-2 flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" /> Admin Reply
                                        </h5>
                                        <p className="text-gray-700 text-sm">
                                            The issue has been marked as resolved by the administrator.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyTickets;
