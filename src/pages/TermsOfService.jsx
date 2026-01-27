import React from 'react';
import { FileText, AlertCircle, HelpCircle, CheckCircle } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="bg-black text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold !text-white mb-4">Terms of Service</h1>
          <p className="text-gray-300">Last Updated: January 2026</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 -mt-8">
        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12 max-w-4xl mx-auto">
          
          <div className="prose prose-lg max-w-none text-gray-600 force-normal-break">
            <p className="lead text-xl text-gray-800 font-medium mb-8">
              Welcome to JobPortal. By accessing or using our website, you agree to comply with and be bound by the following Terms of Service. Please read them carefully.
            </p>

            <div className="space-y-10">
              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <CheckCircle className="text-[#4169E1] w-6 h-6" />
                  <h2 className="text-2xl font-bold text-black m-0">1. Acceptance of Terms</h2>
                </div>
                <p>
                  By registering for, accessing, or using our services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.
                </p>
              </section>

              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <FileText className="text-[#4169E1] w-6 h-6" />
                  <h2 className="text-2xl font-bold text-black m-0">2. User Accounts</h2>
                </div>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You must provide accurate and complete information when creating an account.</li>
                  <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                  <li>You are solely responsible for all activities that occur under your account.</li>
                  <li>We reserve the right to terminate accounts that violate these terms or engage in fraudulent activity.</li>
                </ul>
              </section>

              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <AlertCircle className="text-[#4169E1] w-6 h-6" />
                  <h2 className="text-2xl font-bold text-black m-0">3. User Conduct</h2>
                </div>
                <p className="mb-3">You agree NOT to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Post false, misleading, or fraudulent content.</li>
                  <li>Harass, abuse, or harm another person.</li>
                  <li>Use the service for any illegal or unauthorized purpose.</li>
                  <li>Attempt to interfere with or disrupt the integrity or performance of the service.</li>
                  <li>Scrape or collect data from the service without our express permission.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">4. Intellectual Property</h2>
                <p>
                  The content, features, and functionality of JobPortal (including text, graphics, logos, and software) are owned by JobPortal and are protected by international copyright, trademark, and other intellectual property laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">5. Limitation of Liability</h2>
                <p>
                  In no event shall JobPortal, its directors, employees, or partners, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">6. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these terms at any time. We will provide notice of significant changes by posting the new terms on this page and updating the "Last Updated" date. Your continued use of the service after such changes constitutes your acceptance of the new terms.
                </p>
              </section>

              <section className="bg-gray-50 p-6 rounded-lg border border-gray-100 mt-8">
                <div className="flex items-center space-x-3 mb-3">
                  <HelpCircle className="text-[#4169E1] w-5 h-5" />
                  <h3 className="text-lg font-bold text-black m-0">Questions?</h3>
                </div>
                <p className="text-sm m-0">
                  If you have any questions regarding these Terms of Service, please contact us at <a href="mailto:legal@jobportal.com" className="text-[#4169E1] hover:underline">legal@jobportal.com</a>.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
