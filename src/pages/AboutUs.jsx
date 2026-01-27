import React from 'react';
import { Users, Target, Shield, Award } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-black text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold !text-white mb-6">About JobPortal</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            We are dedicated to connecting ambitious professionals with world-class companies, making the hiring process seamless and efficient.
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="py-16 container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-black">Our Mission</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              At JobPortal, our mission is to empower individuals to achieve their career goals and help organizations find the talent they need to thrive. We believe in the power of connection and the potential of every professional.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We strive to create a platform that is transparent, efficient, and user-centric, removing the barriers between talent and opportunity.
            </p>
          </div>
          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
            <h2 className="text-3xl font-bold mb-6 text-black">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              To be the world's most trusted and effective career platform, where every professional can find their dream job and every company can build their dream team.
            </p>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Our Core Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our values guide everything we do, from product development to customer support.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-12 h-12 bg-[#4169E1] rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="text-white w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">User First</h3>
              <p className="text-gray-600 text-sm">We prioritize the needs and experiences of our job seekers and employers.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-12 h-12 bg-[#4169E1] rounded-lg flex items-center justify-center mx-auto mb-4">
                <Target className="text-white w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Innovation</h3>
              <p className="text-gray-600 text-sm">We constantly innovate to improve the recruitment landscape.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-12 h-12 bg-[#4169E1] rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="text-white w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Integrity</h3>
              <p className="text-gray-600 text-sm">We operate with transparency, honesty, and ethical standards.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-12 h-12 bg-[#4169E1] rounded-lg flex items-center justify-center mx-auto mb-4">
                <Award className="text-white w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Excellence</h3>
              <p className="text-gray-600 text-sm">We strive for excellence in every feature and service we provide.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-[#4169E1] mb-2">10k+</div>
            <div className="text-gray-600">Active Jobs</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-[#4169E1] mb-2">5k+</div>
            <div className="text-gray-600">Companies</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-[#4169E1] mb-2">50k+</div>
            <div className="text-gray-600">Job Seekers</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-[#4169E1] mb-2">98%</div>
            <div className="text-gray-600">Success Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
