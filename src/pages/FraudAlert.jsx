import React from 'react';

const FraudAlert = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <div className="bg-black text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold !text-white mb-4">Fraud Alert & Security</h1>
          <p className="text-gray-300">Protecting yourself from job scams and recruitment fraud</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Important Notice</h2>
            <p className="mb-4">
              JobPortal is committed to providing a safe search experience for all users. Unfortunately, recruitment fraud is a growing global issue where scammers impersonate legitimate companies to defraud job seekers. Please be vigilant and aware of specific indicators of fraud.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Signs of Recruitment Fraud</h2>
            <ul className="list-disc pl-6 space-y-3">
              <li><strong>Requests for Payment:</strong> Legitimate employers and JobPortal will <strong>NEVER</strong> ask you for money for training, equipment, visa processing, or application fees during the recruitment process.</li>
              <li><strong>Unprofessional Communication:</strong> Emails originating from free, web-based email accounts (e.g., Gmail, Yahoo) instead of official company domains, or containing numerous spelling and grammatical errors.</li>
              <li><strong>Instant Job Offers:</strong> Receiving a job offer without an interview or formal application process, or offers that seem "too good to be true" with unusually high salaries for the role.</li>
              <li><strong>Request for Sensitive Information:</strong> Asking for personal financial information (bank account details, tax numbers) or passwords early in the process.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Protect You</h2>
            <p className="mb-4">
              We employ rigorous verification processes for all companies registered on our platform. We actively monitor job postings and user reports to identify and remove fraudulent activity. However, due to the volume of listings, we urge all users to exercise caution.
            </p>
          </section>

           <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reporting Suspicious Activity</h2>
             <p>
              If you encounter a suspicious job posting or receive a communication that you believe is fraudulent, please cease communication immediately and report it to us:
            </p>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4">
                <p className="font-semibold text-red-700">How to Report:</p>
                <p className="text-red-600 mt-1">Use the "Report Issue" link in the footer or email our Trust & Safety team directly at <a href="mailto:safety@jobportal.com" className="underline">safety@jobportal.com</a>.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default FraudAlert;
