import React from 'react';
import { Lock, ShieldCheck, Eye, Database } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="bg-black text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-gray-300">Last Updated: January 2026</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 -mt-8">
        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12 max-w-4xl mx-auto">
          
          <div className="prose prose-lg max-w-none text-gray-600 force-normal-break">
            <p className="lead text-xl text-gray-800 font-medium mb-8">
              At JobPortal, we value your privacy and are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data when you use our platform.
            </p>

            <div className="space-y-12">
              {/* Critical Highlights */}
              <div className="grid md:grid-cols-2 gap-6 not-prose mb-12">
                <div className="bg-blue-50 p-6 rounded-lg flex items-start space-x-4">
                  <Database className="w-6 h-6 text-[#4169E1] mt-1 shrink-0" />
                  <div>
                    <h3 className="font-bold text-black mb-2">Data Collection</h3>
                    <p className="text-sm">We collect only necessary data including profile info, resume details, and usage statistics.</p>
                  </div>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg flex items-start space-x-4">
                  <ShieldCheck className="w-6 h-6 text-[#4169E1] mt-1 shrink-0" />
                  <div>
                    <h3 className="font-bold text-black mb-2">Data Security</h3>
                    <p className="text-sm">Industry-standard encryption and security protocols protect your sensitive information.</p>
                  </div>
                </div>
              </div>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">1. Information We Collect</h2>
                <p className="mb-4">
                  We collect information that you provide directly to us when you create an account, update your profile, apply for jobs, or communicate with us. This may include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Personal identifiers (Name, Email, Phone number)</li>
                  <li>Professional information (Resume, Work history, Education, Skills)</li>
                  <li>Log and usage data (IP address, Browser type, Pages visited)</li>
                  <li>Device information (Device type, Operating system)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">2. How We Use Your Information</h2>
                <p className="mb-4">
                  We use the collected information to provide and improve our services, including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Matching you with relevant job opportunities</li>
                  <li>Processing job applications</li>
                  <li>Improving our platform's functionality and user experience</li>
                  <li>Sending administrative information and updates</li>
                  <li>Detecting and preventing fraud or abuse</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">3. Information Sharing</h2>
                <p className="mb-4">
                  We may share your information with:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Employers:</strong> When you apply for a job or make your profile visible.</li>
                  <li><strong>Service Providers:</strong> Who assist us in operating our platform (e.g., hosting, analytics).</li>
                  <li><strong>Legal Requirements:</strong> If required by law or to protect our rights.</li>
                </ul>
                <p className="mt-4 italic">
                  We do not sell your personal information to third parties for marketing purposes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">4. Your Rights and Choices</h2>
                <p className="mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access and update your personal information</li>
                  <li>Request deletion of your account and data</li>
                  <li>Opt-out of promotional communications</li>
                  <li>Control your profile visibility settings</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">5. Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@jobportal.com" className="text-[#4169E1] hover:underline">privacy@jobportal.com</a>.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
