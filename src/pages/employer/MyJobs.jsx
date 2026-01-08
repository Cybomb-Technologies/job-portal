import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Edit, Eye, MapPin, Briefcase, IndianRupee, Users } from 'lucide-react';
import api from '../../api';

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      const { data } = await api.get('/jobs/myjobs');
      setJobs(data);
    } catch (err) {
      setError('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await api.delete(`/jobs/${id}`);
      setJobs(jobs.filter(job => job._id !== id));
    } catch (err) {
      alert('Failed to delete job');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-black">My Job Listings</h1>
            <Link
                to="/employer/post-job"
                className="bg-[#4169E1] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#3A5FCD] transition-colors"
             >
                Post New Job
            </Link>
        </div>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="grid gap-6">
          {jobs.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-lg">You haven't posted any jobs yet.</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition hover:shadow-md">
                <div className="flex flex-col md:flex-row justify-between md:items-center">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-xl font-bold text-black mb-2">{job.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1" /> {job.company}</span>
                      <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {job.location}</span>
                      <span className="flex items-center"><IndianRupee className="w-4 h-4 mr-1" /> {job.salaryMin?.toLocaleString()} - {job.salaryMax?.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Link 
                        to={`/employer/applications/${job._id}`}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="View Applications"
                    >
                        <Users className="w-5 h-5" />
                    </Link>
                    <Link 
                        to={`/employer/edit-job/${job._id}`}
                        className="p-2 text-[#4169E1] hover:bg-blue-50 rounded-lg transition"
                        title="Edit Job"
                    >
                        <Edit className="w-5 h-5" />
                    </Link>
                    <button 
                        onClick={() => handleDelete(job._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Delete Job"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                    <span className="text-gray-500">Posted on {new Date(job.createdAt).toLocaleDateString()}</span>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">Active</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyJobs;
