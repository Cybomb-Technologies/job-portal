import React from 'react';

const Cookies = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <div className="bg-black text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold !text-white mb-4">Cookie Policy</h1>
          <p className="text-gray-300">Last Updated: January 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. What Are Cookies?</h2>
            <p className="mb-4">
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the owners of the site. We use cookies to improve your user experience, analyze site traffic, and personalize content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. The Types of Cookies We Use</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Essential Cookies</h3>
                <p>These are strictly necessary for the website to function properly. They include, for example, cookies that enable you to log into secure areas of our website or use a shopping cart.</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Performance & Analytics Cookies</h3>
                <p>These allow us to recognize and count the number of visitors and to see how visitors move around our website when they are using it. This helps us to improve the way our website works, for example, by ensuring that users are finding what they are looking for easily.</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Functionality Cookies</h3>
                <p>These are used to recognize you when you return to our website. This enables us to personalize our content for you, greet you by name, and remember your preferences (for example, your choice of language or region).</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Targeting Cookies</h3>
                <p>These cookies record your visit to our website, the pages you have visited, and the links you have followed. We will use this information to make our website and the advertising displayed on it more relevant to your interests.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Third-Party Cookies</h2>
            <p className="mb-4">
              In addition to our own cookies, we may also identify you accurately on this device and on other devices you use by using third-party cookies, for example, Google Analytics, to help us process data. These third-party services may have their own privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Managing Cookies</h2>
            <p className="mb-4">
              Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit <a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.aboutcookies.org</a> or <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.allaboutcookies.org</a>.
            </p>
            <p>
              Please note that blocking some types of cookies may impact your experience of our website and the services we are able to offer.
            </p>
          </section>

           <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Contact Us</h2>
             <p>
              If you have any questions about our use of cookies, please contact us at <a href="mailto:privacy@jobportal.com" className="text-blue-600 hover:underline">privacy@jobportal.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Cookies;
