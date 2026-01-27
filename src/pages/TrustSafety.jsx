import React from 'react';

const TrustSafety = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <div className="bg-black text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold !text-white mb-4">Trust & Safety</h1>
          <p className="text-gray-300">Building a secure and inclusive community for everyone</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment</h2>
            <p className="mb-4">
              At JobPortal, trust is the foundation of our community. We are dedicated to maintaining a professional, safe, and inclusive environment for all job seekers and employers. Our Trust & Safety team works around the clock to prevent abuse and enforce our community guidelines.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Community Guidelines</h2>
            <p className="mb-4">To ensure a positive experience for everyone, we expect all users to adhere to the following principles:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Professionalism:</strong> Communicate with respect and courtesy. Harassment, hate speech, and discriminatory behavior are strictly prohibited.</li>
              <li><strong>Authenticity:</strong> Represent yourself and your organization accurately. Do not impersonate others or provide false information.</li>
              <li><strong>Legality:</strong> Use our platform only for lawful purposes. Any illegal activities or content will be reported to authorities.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Employer Verification</h2>
             <p className="mb-4">
              We employ a multi-step verification process to ensure the legitimacy of companies on our platform. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Verifying business registration documents.</li>
                <li>Checking official email domains and contact information.</li>
                <li>Conducting background checks on company legitimacy.</li>
            </ul>
          </section>

           <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Privacy & Security</h2>
             <p className="mb-4">
              Your data is your property. We implement industry-leading security measures, including encryption and secure data storage, to protect your personal information. We do not sell your personal data to third parties.
            </p>
             <p>
                For more details, please review our <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TrustSafety;
