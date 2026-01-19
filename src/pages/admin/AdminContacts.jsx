import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Mail, Reply, Calendar, CheckCircle, Clock } from 'lucide-react';
import Swal from 'sweetalert2';

const AdminContacts = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data } = await api.get('/contact');
      setMessages(data.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch messages', err);
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post(`/contact/${selectedMessage._id}/reply`, { replyMessage });
      
      Swal.fire({
          icon: 'success',
          title: 'Reply Sent',
          text: 'Your reply has been sent successfully via email.'
      });

      // Update local state
      setMessages(prev => prev.map(msg => 
          msg._id === selectedMessage._id 
            ? { ...msg, status: 'Replied', reply: replyMessage, repliedAt: new Date() } 
            : msg
      ));

      setSelectedMessage(null);
      setReplyMessage('');
    } catch (err) {
        Swal.fire({
            icon: 'error',
            title: 'Failed',
            text: 'Could not send reply. Please try again.'
        });
    } finally {
        setSending(false);
    }
  };

  if (loading) {
      return <div className="p-8 text-center text-gray-500">Loading messages...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Message Center</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-12rem)] flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-700">Inquiries</h3>
            </div>
            <div className="overflow-y-auto flex-1">
                {messages.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No messages found</div>
                ) : (
                    messages.map(msg => (
                        <div 
                            key={msg._id}
                            onClick={() => setSelectedMessage(msg)} 
                            className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${selectedMessage?._id === msg._id ? 'bg-blue-50 border-l-4 border-l-[#4169E1]' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`font-semibold text-sm truncate ${msg.status === 'New' ? 'text-black' : 'text-gray-600'}`}>
                                    {msg.name}
                                </span>
                                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                    {new Date(msg.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="text-sm font-medium text-gray-800 mb-1 truncate">{msg.subject}</div>
                            <div className="text-xs text-gray-500 line-clamp-2">{msg.message}</div>
                            <div className="mt-2 flex items-center justify-between">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                    msg.status === 'New' ? 'bg-blue-100 text-blue-700' :
                                    msg.status === 'Replied' ? 'bg-green-100 text-green-700' :
                                    'bg-gray-100 text-gray-600'
                                }`}>
                                    {msg.status}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* Message Detail & Reply */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100vh-12rem)] flex flex-col">
            {selectedMessage ? (
                <>
                    <div className="p-6 border-b border-gray-200 flex justify-between items-start bg-gray-50rounded-t-xl">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedMessage.subject}</h2>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center"><Mail className="w-4 h-4 mr-1.5"/> {selectedMessage.email}</span>
                                <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5"/> {new Date(selectedMessage.createdAt).toLocaleString()}</span>
                            </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            selectedMessage.status === 'New' ? 'bg-blue-100 text-blue-700' :
                            selectedMessage.status === 'Replied' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-600'
                        }`}>
                            {selectedMessage.status}
                        </div>
                    </div>
                    
                    <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
                        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm mb-6">
                            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedMessage.message}</p>
                        </div>

                        {selectedMessage.status === 'Replied' && (
                             <div className="ml-8 mb-6">
                                <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center"><Reply className="w-3 h-3 text-green-600"/></div>
                                    <span>Replied on {new Date(selectedMessage.repliedAt).toLocaleString()}</span>
                                </div>
                                <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 text-gray-700 whitespace-pre-wrap text-sm">
                                    {selectedMessage.reply}
                                </div>
                             </div>
                        )}

                        <div className="mt-8 border-t border-gray-200 pt-6">
                            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                                <Reply className="w-4 h-4 mr-2"/>
                                Send Reply
                            </h3>
                            <form onSubmit={handleReply}>
                                <textarea
                                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169E1] focus:border-transparent outline-none h-40 resize-none text-sm transition-all shadow-sm"
                                    placeholder="Type your reply here..."
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    required
                                ></textarea>
                                <div className="mt-4 flex justify-end">
                                    <button 
                                        type="submit" 
                                        disabled={sending}
                                        className="bg-[#4169E1] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#3A5FCD] transition-colors flex items-center disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
                                    >
                                        {sending ? 'Sending...' : 'Send Reply'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Mail className="w-16 h-16 mb-4 text-gray-200" />
                    <p className="text-lg">Select a message to view details</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AdminContacts;
