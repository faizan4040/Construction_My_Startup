'use client'

import React from 'react'

const CookiePolicy = () => {
  return (
    <section className="bg-gray-100 py-20">
      <div className="max-w-5xl mx-auto px-4">

        {/* PAGE HEADER */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900">
            Cookies Notice
          </h1>
          <p className="text-gray-600 mt-4 text-lg">
            How and why we use cookies on our website
          </p>
        </header>

        {/* CONTENT */}
        <div className="bg-white rounded-2xl shadow p-8 lg:p-12 space-y-10">

          {/* 1. INTRODUCTION */}
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              We use cookies and similar technologies on our website and app to
              enhance your browsing experience, analyse traffic, and serve
              personalised content and advertisements.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              This notice is in accordance with the General Data Protection
              Regulation (EU) 2016/679 (GDPR), the Data Protection Act 2018 and
              applicable ePrivacy laws.
            </p>
          </section>

          {/* 2. WHAT ARE COOKIES */}
          <section>
            <h2 className="text-2xl font-bold mb-4">2. What Are Cookies?</h2>
            <p className="text-gray-700 leading-relaxed">
              Cookies are small text files placed on your device when you visit
              our website. They help us provide essential site functionality,
              remember your preferences and understand how you interact with our
              site.
            </p>
          </section>

          {/* 3. COOKIE CATEGORIES */}
          <section>
            <h2 className="text-2xl font-bold mb-6">
              3. Categories of Cookies We Use
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  a. Strictly Necessary Cookies
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  These cookies are essential for the website to function
                  properly, such as enabling secure login, shopping basket
                  functionality and checkout.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">
                  b. Performance / Analytics Cookies
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  These cookies help us understand how visitors use our site so
                  we can improve performance, usability and design.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">
                  c. Functional Cookies
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  These cookies enable enhanced functionality and personalisation,
                  such as remembering language or currency preferences.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">
                  d. Targeting / Advertising & Personalisation Cookies
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  These cookies help us show relevant products, services and
                  advertisements based on your browsing behaviour. They may also
                  be placed by trusted advertising and social media partners.
                </p>
              </div>
            </div>
          </section>

          {/* 4. RETENTION */}
          <section>
            <h2 className="text-2xl font-bold mb-4">
              4. Cookie Duration & Retention
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Non-essential cookies are set to expire automatically after 30
              days.
            </p>
          </section>

          {/* 5. MANAGE COOKIES */}
          <section>
            <h2 className="text-2xl font-bold mb-4">5. How to Manage Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              You can set your preferences by accepting, rejecting or clicking
              “Manage Cookies” when you first visit our website.
            </p>
            <p className="text-gray-700 leading-relaxed">
              You may also manage or delete cookies via your browser settings.
              Most browsers allow you to block cookies or notify you before one
              is placed.
            </p>
          </section>

          {/* 6. MORE INFO */}
          <section>
            <h2 className="text-2xl font-bold mb-4">6. More Information</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about cookies, privacy or your data,
              please contact us at{" "}
              <strong>dataprotection@allspikes.com</strong>.  
              You can also find further details in our Privacy Notice.
            </p>
          </section>

        </div>
      </div>
    </section>
  )
}

export default CookiePolicy
