import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import api from '../api';
import Swal from 'sweetalert2';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
        await api.post('/contact', formData);
        Swal.fire({
            icon: 'success',
            title: 'Message Sent!',
            text: 'Thank you for contacting us. We will get back to you shortly.',
            confirmButtonColor: '#4169E1'
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
        console.error(err);
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong. Please try again later.',
            confirmButtonColor: '#4169E1'
        });
    } finally {
        setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            We're here to help. Reach out to us with any questions about your account, job postings, or general inquiries.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 -mt-10">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-10 h-10 bg-[#4169E1] rounded-lg flex items-center justify-center mb-4">
                <Mail className="text-white w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Email Us</h3>
              <p className="text-gray-600 text-sm mb-2">Our friendly team is here to help.</p>
              <a href="mailto:support@jobportal.com" className="text-[#4169E1] font-medium hover:underline">support@jobportal.com</a>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-10 h-10 bg-[#4169E1] rounded-lg flex items-center justify-center mb-4">
                <MapPin className="text-white w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Visit Us</h3>
              <p className="text-gray-600 text-sm mb-2">Come say hello at our office HQ.</p>
              <p className="text-gray-900 font-medium text-sm">123 Business Park, Tech City,<br/>CA 94043, USA</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-10 h-10 bg-[#4169E1] rounded-lg flex items-center justify-center mb-4">
                <Phone className="text-white w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Call Us</h3>
              <p className="text-gray-600 text-sm mb-2">Mon-Fri from 8am to 5pm.</p>
              <a href="tel:+15550000000" className="text-[#4169E1] font-medium hover:underline">+1 (555) 000-0000</a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] outline-none transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] outline-none transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] outline-none transition-colors"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] outline-none transition-colors resize-none"
                    placeholder="Tell us more about your inquiry..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full md:w-auto px-8 py-3 bg-[#4169E1] text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span>{sending ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
