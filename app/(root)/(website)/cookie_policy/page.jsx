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
            How and why we use cookies on the BuildRush platform
          </p>
        </header>

        {/* CONTENT */}
        <div className="bg-white rounded-2xl shadow p-8 lg:p-12 space-y-10">

          {/* 1. INTRODUCTION */}
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              BuildRush Ltd ("we", "us", "our") uses cookies and similar technologies
              on our website and mobile app to keep our platform running smoothly,
              improve your experience, support fast material delivery coordination,
              and help us understand how our services are being used.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              This Cookies Notice is issued in accordance with the UK General Data
              Protection Regulation (UK GDPR), the Data Protection Act 2018, and the
              Privacy and Electronic Communications Regulations (PECR). It should be
              read alongside our{' '}
              <a href="/privacy-policy" className="underline text-blue-600">Privacy Policy</a>.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              By continuing to use the BuildRush platform after being presented with
              our cookie banner, you consent to our use of non-essential cookies as
              described in this notice. You may withdraw or change your consent at
              any time.
            </p>
          </section>

          {/* 2. WHAT ARE COOKIES */}
          <section>
            <h2 className="text-2xl font-bold mb-4">2. What Are Cookies?</h2>
            <p className="text-gray-700 leading-relaxed">
              Cookies are small text files placed on your device (computer, tablet
              or mobile phone) when you visit our website or use our app. They allow
              our platform to recognise your device, remember your preferences, and
              provide a faster, more personalised experience.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              We also use similar technologies such as pixel tags, web beacons and
              local storage for comparable purposes. Any reference to "cookies" in
              this notice includes these similar technologies.
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
                  These cookies are essential for the BuildRush platform to operate
                  and cannot be switched off. They enable core functionality including
                  secure account login, session management, order placement, live
                  delivery tracking, and labour hire booking. No consent is required
                  for these cookies as they are necessary to provide the service you
                  have requested.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">
                  b. Performance & Analytics Cookies
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  These cookies help us understand how users interact with our
                  platform — for example, which pages are visited most, how long
                  users spend on each section, and where errors or drop-offs occur.
                  This data is used in aggregate and anonymised form to improve our
                  delivery service, labour hire matching, and overall platform
                  performance. We use tools such as Google Analytics for this purpose.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">
                  c. Functional Cookies
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  These cookies enable enhanced functionality and personalisation.
                  On the BuildRush platform, this includes remembering your saved
                  delivery addresses, preferred material categories, recent orders,
                  worker shortlists, and notification preferences so you don't have
                  to re-enter them each time you visit.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">
                  d. Location & Delivery Coordination Cookies
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  To support our 30-minute delivery service, we use cookies and
                  local storage to retain your last-used delivery location and site
                  postcode. This helps us provide accurate delivery time estimates
                  and connect you with the nearest available stock. This data is
                  stored locally on your device and is not shared with third parties
                  for advertising purposes.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">
                  e. Targeting & Advertising Cookies
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  With your consent, we may use targeting cookies to show you
                  relevant content — such as material promotions, labour availability
                  in your area, and platform updates — based on your browsing
                  behaviour. These cookies may be set by BuildRush or by trusted
                  third-party partners including social media platforms. You can
                  opt out of these cookies at any time via our cookie preferences
                  centre.
                </p>
              </div>

            </div>
          </section>

          {/* 4. THIRD-PARTY COOKIES */}
          <section>
            <h2 className="text-2xl font-bold mb-4">4. Third-Party Cookies</h2>
            <p className="text-gray-700 leading-relaxed">
              Some cookies on our platform are set by trusted third parties whose
              services we use to operate BuildRush. These may include:
            </p>
            <ul className="list-disc pl-6 mt-3 text-gray-700 space-y-2">
              <li><strong>Google Analytics</strong> — platform performance and usage analytics</li>
              <li><strong>Payment processors</strong> — secure transaction handling and fraud prevention</li>
              <li><strong>Mapping providers (e.g. Google Maps)</strong> — delivery routing and site location display</li>
              <li><strong>Customer support tools</strong> — live chat and support ticket functionality</li>
              <li><strong>Social media platforms</strong> — if you interact with BuildRush via embedded social content</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              These third parties have their own privacy and cookie policies, which
              we encourage you to review. BuildRush is not responsible for third-party
              cookies.
            </p>
          </section>

          {/* 5. RETENTION */}
          <section>
            <h2 className="text-2xl font-bold mb-4">
              5. Cookie Duration & Retention
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Cookies are either <strong>session cookies</strong> (deleted when you
              close your browser) or <strong>persistent cookies</strong> (stored for
              a set period). Our cookie durations are as follows:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Strictly necessary cookies</strong> — session-based or up to 24 hours</li>
              <li><strong>Functional cookies</strong> — up to 90 days</li>
              <li><strong>Analytics cookies</strong> — up to 12 months</li>
              <li><strong>Targeting cookies</strong> — up to 30 days</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              You may delete cookies from your device at any time via your browser
              or device settings.
            </p>
          </section>

          {/* 6. MANAGE COOKIES */}
          <section>
            <h2 className="text-2xl font-bold mb-4">6. How to Manage Your Cookie Preferences</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              When you first visit our platform, you will be presented with a cookie
              consent banner allowing you to accept all cookies, reject non-essential
              cookies, or customise your preferences by category.
            </p>
            <p className="text-gray-700 leading-relaxed mb-3">
              You can update your preferences at any time by clicking{' '}
              <strong>"Manage Cookies"</strong> in the footer of our website.
            </p>
            <p className="text-gray-700 leading-relaxed mb-3">
              You can also manage or delete cookies directly through your browser
              settings. Most browsers allow you to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>View what cookies are stored on your device</li>
              <li>Block all or specific cookies</li>
              <li>Delete cookies when you close your browser</li>
              <li>Receive a notification when a cookie is set</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Please note that disabling certain cookies may affect the functionality
              of the BuildRush platform — in particular, delivery tracking, saved
              addresses and account login may not work as expected.
            </p>
          </section>

          {/* 7. CHANGES */}
          <section>
            <h2 className="text-2xl font-bold mb-4">7. Changes to This Notice</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Cookies Notice from time to time as our platform
              evolves or legal requirements change. The date of the most recent
              update is shown below. We will notify you of significant changes via
              the cookie banner on your next visit.
            </p>
          </section>

          {/* 8. MORE INFO */}
          <section>
            <h2 className="text-2xl font-bold mb-4">8. More Information</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about how we use cookies or wish to exercise
              your data rights, please contact our Data Protection Officer:
            </p>
            <p className="text-gray-700 mt-3">
              <strong>Email:</strong>{' '}
              <a href="mailto:privacy@buildrush.co.uk" className="underline text-blue-600">
                privacy@buildrush.co.uk
              </a>
            </p>
            <p className="text-gray-700 mt-1">
              <strong>Address:</strong> Data Protection Officer, BuildRush Ltd,
              [Your Office Address], United Kingdom
            </p>
            <p className="text-gray-700 mt-1">
              <strong>Last updated:</strong> April 2026
            </p>
            <p className="text-gray-700 mt-3">
              For more information on how we handle your personal data, please
              read our full{' '}
              <a href="/privacy-policy" className="underline text-blue-600">
                Privacy Policy
              </a>. You can also visit{' '}
              <a
                href="https://ico.org.uk/for-the-public/online/cookies"
                className="underline text-blue-600"
                target="_blank"
                rel="noreferrer"
              >
                ico.org.uk
              </a>{' '}
              for independent guidance on cookies and your rights.
            </p>
          </section>

        </div>
      </div>
    </section>
  )
}

export default CookiePolicy