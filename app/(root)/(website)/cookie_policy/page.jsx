'use client'

import React from 'react'
import { Cookie, Lock, BarChart3, SlidersHorizontal, MapPin, Target } from 'lucide-react'

const toc = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'what-are-cookies', label: 'What Are Cookies?' },
  { id: 'categories', label: 'Categories of Cookies We Use' },
  { id: 'third-party', label: 'Third-Party Cookies' },
  { id: 'retention', label: 'Cookie Duration & Retention' },
  { id: 'manage', label: 'How to Manage Your Cookie Preferences' },
  { id: 'changes', label: 'Changes to This Notice' },
  { id: 'more-info', label: 'More Information' },
]

const cookieCategories = [
  {
    icon: Lock,
    letter: 'a',
    title: 'Strictly Necessary Cookies',
    body: `These cookies are essential for the BuildRush platform to operate
      and cannot be switched off. They enable core functionality including
      secure account login, session management, order placement, live
      delivery tracking, and labour hire booking. No consent is required
      for these cookies as they are necessary to provide the service you
      have requested.`,
  },
  {
    icon: BarChart3,
    letter: 'b',
    title: 'Performance & Analytics Cookies',
    body: `These cookies help us understand how users interact with our
      platform — for example, which pages are visited most, how long
      users spend on each section, and where errors or drop-offs occur.
      This data is used in aggregate and anonymised form to improve our
      delivery service, labour hire matching, and overall platform
      performance. We use tools such as Google Analytics for this purpose.`,
  },
  {
    icon: SlidersHorizontal,
    letter: 'c',
    title: 'Functional Cookies',
    body: `These cookies enable enhanced functionality and personalisation.
      On the BuildRush platform, this includes remembering your saved
      delivery addresses, preferred material categories, recent orders,
      worker shortlists, and notification preferences so you don't have
      to re-enter them each time you visit.`,
  },
  {
    icon: MapPin,
    letter: 'd',
    title: 'Location & Delivery Coordination Cookies',
    body: `To support our 30-minute delivery service, we use cookies and
      local storage to retain your last-used delivery location and site
      postcode. This helps us provide accurate delivery time estimates
      and connect you with the nearest available stock. This data is
      stored locally on your device and is not shared with third parties
      for advertising purposes.`,
  },
  {
    icon: Target,
    letter: 'e',
    title: 'Targeting & Advertising Cookies',
    body: `With your consent, we may use targeting cookies to show you
      relevant content — such as material promotions, labour availability
      in your area, and platform updates — based on your browsing
      behaviour. These cookies may be set by BuildRush or by trusted
      third-party partners including social media platforms. You can
      opt out of these cookies at any time via our cookie preferences
      centre.`,
  },
]

/* ── Blueprint grid overlay ── */
const BlueprintGrid = ({ opacity = 0.08 }) => (
  <div
    className="pointer-events-none absolute inset-0"
    style={{
      opacity,
      backgroundImage:
        'linear-gradient(#4A7A96 1px, transparent 1px), linear-gradient(90deg, #4A7A96 1px, transparent 1px)',
      backgroundSize: '36px 36px',
    }}
  />
)

/* ── Corner-bracket frame ── */
const CornerBrackets = ({ color = '#F97316' }) => (
  <>
    <span className="absolute -top-px -left-px h-5 w-5 border-t-2 border-l-2" style={{ borderColor: color }} />
    <span className="absolute -top-px -right-px h-5 w-5 border-t-2 border-r-2" style={{ borderColor: color }} />
    <span className="absolute -bottom-px -left-px h-5 w-5 border-b-2 border-l-2" style={{ borderColor: color }} />
    <span className="absolute -bottom-px -right-px h-5 w-5 border-b-2 border-r-2" style={{ borderColor: color }} />
  </>
)

/* ── Numbered clause with ruler divider ── */
const Clause = ({ id, index, title, children }) => (
  <section id={id} className="scroll-mt-28">
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xs font-mono text-[#F97316] shrink-0">
        {String(index).padStart(2, '0')}
      </span>
      <span
        className="flex-1 h-px"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, #E5E1D8 0 6px, transparent 6px 12px)',
        }}
      />
    </div>
    <h2 className="text-2xl font-extrabold mb-3 tracking-tight text-[#14161A]">{title}</h2>
    <div className="text-[#3A3D42] leading-relaxed space-y-3 [&_a]:text-[#F97316] [&_a]:underline [&_a:hover]:text-[#14161A] [&_strong]:text-[#14161A] [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:marker:text-[#F97316]">
      {children}
    </div>
  </section>
)

const CookiePolicy = () => {
  return (
    <div className="w-full bg-[#F5F3EF] text-[#14161A]">

      {/* ---------- HEADER ---------- */}
      <section className="relative bg-[#14161A] text-white py-20 overflow-hidden">
        <BlueprintGrid />
        <div
          className="absolute bottom-0 left-0 right-0 h-1.5"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, #F97316 0 14px, transparent 14px 28px)',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 text-[#F97316] text-xs font-mono uppercase tracking-[0.3em] mb-5">
            <Cookie size={16} strokeWidth={2.5} />
            Legal Document
          </div>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight leading-[1.02]">
            Cookies Notice
          </h1>
          <p className="mt-4 text-[#C9CCD1] text-lg max-w-2xl">
            How and why we use cookies on the BuildRush platform.
          </p>
        </div>
      </section>

      {/* ---------- BODY ---------- */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-10">

          {/* LEFT SIDEBAR — TABLE OF CONTENTS */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-8">
              <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-[#9098A0] mb-6">
                Table of Contents
              </h3>
              <ul className="space-y-1">
                {toc.map((item, i) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="flex items-start gap-3 py-2 pl-4 border-l-2 border-transparent text-[#6C7278] hover:text-[#14161A] hover:border-[#F97316] transition-colors duration-200"
                    >
                      <span className="text-[11px] font-mono text-[#9098A0] pt-0.5 shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[15px] leading-snug">{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* RIGHT CONTENT */}
          <main className="lg:col-span-3 relative bg-white border border-black/5 p-8 lg:p-14">
            <CornerBrackets />

            <div className="space-y-14">

              {/* 1. INTRODUCTION */}
              <Clause id="introduction" index={1} title="Introduction">
                <p>
                  BuildRush Ltd ("we", "us", "our") uses cookies and similar technologies
                  on our website and mobile app to keep our platform running smoothly,
                  improve your experience, support fast material delivery coordination,
                  and help us understand how our services are being used.
                </p>
                <p>
                  This Cookies Notice is issued in accordance with the UK General Data
                  Protection Regulation (UK GDPR), the Data Protection Act 2018, and the
                  Privacy and Electronic Communications Regulations (PECR). It should be
                  read alongside our{' '}
                  <a href="/privacy-policy">Privacy Policy</a>.
                </p>
                <p>
                  By continuing to use the BuildRush platform after being presented with
                  our cookie banner, you consent to our use of non-essential cookies as
                  described in this notice. You may withdraw or change your consent at
                  any time.
                </p>
              </Clause>

              {/* 2. WHAT ARE COOKIES */}
              <Clause id="what-are-cookies" index={2} title="What Are Cookies?">
                <p>
                  Cookies are small text files placed on your device (computer, tablet
                  or mobile phone) when you visit our website or use our app. They allow
                  our platform to recognise your device, remember your preferences, and
                  provide a faster, more personalised experience.
                </p>
                <p>
                  We also use similar technologies such as pixel tags, web beacons and
                  local storage for comparable purposes. Any reference to "cookies" in
                  this notice includes these similar technologies.
                </p>
              </Clause>

              {/* 3. COOKIE CATEGORIES */}
              <Clause id="categories" index={3} title="Categories of Cookies We Use">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 not-prose">
                  {cookieCategories.map(({ icon: Icon, letter, title, body }) => (
                    <div
                      key={letter}
                      className="border border-black/10 bg-[#F5F3EF] p-6 flex flex-col gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center h-9 w-9 bg-[#14161A] text-[#F97316] shrink-0">
                          <Icon size={18} />
                        </span>
                        <span className="text-[11px] font-mono text-[#9098A0] uppercase tracking-wider">
                          {letter}.
                        </span>
                      </div>
                      <h3 className="text-lg font-extrabold tracking-tight text-[#14161A]">
                        {title}
                      </h3>
                      <p className="text-[#3A3D42] leading-relaxed text-[15px]">
                        {body}
                      </p>
                    </div>
                  ))}
                </div>
              </Clause>

              {/* 4. THIRD-PARTY COOKIES */}
              <Clause id="third-party" index={4} title="Third-Party Cookies">
                <p>
                  Some cookies on our platform are set by trusted third parties whose
                  services we use to operate BuildRush. These may include:
                </p>
                <ul>
                  <li><strong>Google Analytics</strong> — platform performance and usage analytics</li>
                  <li><strong>Payment processors</strong> — secure transaction handling and fraud prevention</li>
                  <li><strong>Mapping providers (e.g. Google Maps)</strong> — delivery routing and site location display</li>
                  <li><strong>Customer support tools</strong> — live chat and support ticket functionality</li>
                  <li><strong>Social media platforms</strong> — if you interact with BuildRush via embedded social content</li>
                </ul>
                <p>
                  These third parties have their own privacy and cookie policies, which
                  we encourage you to review. BuildRush is not responsible for third-party
                  cookies.
                </p>
              </Clause>

              {/* 5. RETENTION */}
              <Clause id="retention" index={5} title="Cookie Duration & Retention">
                <p>
                  Cookies are either <strong>session cookies</strong> (deleted when you
                  close your browser) or <strong>persistent cookies</strong> (stored for
                  a set period). Our cookie durations are as follows:
                </p>
                <ul>
                  <li><strong>Strictly necessary cookies</strong> — session-based or up to 24 hours</li>
                  <li><strong>Functional cookies</strong> — up to 90 days</li>
                  <li><strong>Analytics cookies</strong> — up to 12 months</li>
                  <li><strong>Targeting cookies</strong> — up to 30 days</li>
                </ul>
                <p>
                  You may delete cookies from your device at any time via your browser
                  or device settings.
                </p>
              </Clause>

              {/* 6. MANAGE COOKIES */}
              <Clause id="manage" index={6} title="How to Manage Your Cookie Preferences">
                <p>
                  When you first visit our platform, you will be presented with a cookie
                  consent banner allowing you to accept all cookies, reject non-essential
                  cookies, or customise your preferences by category.
                </p>
                <p>
                  You can update your preferences at any time by clicking{' '}
                  <strong>"Manage Cookies"</strong> in the footer of our website.
                </p>
                <p>
                  You can also manage or delete cookies directly through your browser
                  settings. Most browsers allow you to:
                </p>
                <ul>
                  <li>View what cookies are stored on your device</li>
                  <li>Block all or specific cookies</li>
                  <li>Delete cookies when you close your browser</li>
                  <li>Receive a notification when a cookie is set</li>
                </ul>
                <p>
                  Please note that disabling certain cookies may affect the functionality
                  of the BuildRush platform — in particular, delivery tracking, saved
                  addresses and account login may not work as expected.
                </p>
              </Clause>

              {/* 7. CHANGES */}
              <Clause id="changes" index={7} title="Changes to This Notice">
                <p>
                  We may update this Cookies Notice from time to time as our platform
                  evolves or legal requirements change. The date of the most recent
                  update is shown below. We will notify you of significant changes via
                  the cookie banner on your next visit.
                </p>
              </Clause>

              {/* 8. MORE INFO */}
              <Clause id="more-info" index={8} title="More Information">
                <p>
                  If you have any questions about how we use cookies or wish to exercise
                  your data rights, please contact our Data Protection Officer:
                </p>
                <p>
                  <strong>Email:</strong>{' '}
                  <a href="mailto:privacy@buildrush.co.uk">
                    privacy@buildrush.co.uk
                  </a>
                </p>
                <p>
                  <strong>Address:</strong> Data Protection Officer, BuildRush Ltd,
                  [Your Office Address], United Kingdom
                </p>
                <p>
                  <strong>Last updated:</strong> April 2026
                </p>
                <p>
                  For more information on how we handle your personal data, please
                  read our full{' '}
                  <a href="/privacy-policy">
                    Privacy Policy
                  </a>. You can also visit{' '}
                  <a
                    href="https://ico.org.uk/for-the-public/online/cookies"
                    target="_blank"
                    rel="noreferrer"
                  >
                    ico.org.uk
                  </a>{' '}
                  for independent guidance on cookies and your rights.
                </p>
              </Clause>

            </div>
          </main>
        </div>
      </section>
    </div>
  )
}

export default CookiePolicy