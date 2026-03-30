'use client'

import React, { useState } from 'react'

const sections = [
  { key: 'promise', label: 'Our Privacy Promise' },
  { key: 'collect', label: 'What Kind of Personal Information Do We Collect?' },
  { key: 'legal', label: 'The Legal Bases for Using Your Personal Information' },
  { key: 'when', label: 'When Do We Collect Your Data?' },
  { key: 'how', label: 'How and Why We Use Your Personal Data' },
  { key: 'sharing', label: 'Sharing Your Data with Third Parties' },
  { key: 'protect', label: 'How We Protect Your Data' },
  { key: 'where', label: 'Where Your Data May Be Stored and Processed' },
  { key: 'retain', label: 'How Long Do We Keep Your Data?' },
  { key: 'rights', label: 'Your Rights Relating to Your Data' },
  { key: 'children', label: 'Privacy of Children On Our Website' },
  { key: 'changes', label: 'Changes to Our Privacy Statement' },
  { key: 'contact', label: 'Contact Us' },
]

const PrivacyPolicy = () => {
  const [active, setActive] = useState('promise')

  return (
    <section className="bg-gray-100 py-20">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-10">

        {/* LEFT SIDEBAR */}
        <aside className="lg:col-span-1 border-r pr-6">
          <h3 className="text-xl font-bold mb-6">Your Information & Privacy</h3>

          <ul className="space-y-3">
            {sections.map(item => (
              <li
                key={item.key}
                onClick={() => setActive(item.key)}
                className={`cursor-pointer text-lg relative w-fit
                  after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:bg-black
                  after:w-0 hover:after:w-full after:transition-all after:duration-300
                  ${active === item.key ? 'font-semibold after:w-full text-black' : 'text-gray-600'}
                `}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </aside>

        {/* RIGHT CONTENT */}
        <main className="lg:col-span-3 bg-white rounded-2xl shadow p-8 lg:p-12">

          {active === 'promise' && (
            <>
              <h1 className="text-3xl font-bold mb-6">Our Privacy Promise</h1>
              <p className="text-gray-700 leading-relaxed mb-4">
                We want to put you in the driving seat when it comes to your data and it’s important to us that you have absolute confidence in how we look after your personal information.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                We are committed to managing your personal information with great care and in accordance with data protection legislation including GDPR and PECR.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We do not and will not sell your data to third parties and will always keep it safe and secure.
              </p>
            </>
          )}

          {active === 'collect' && (
            <>
              <h2 className="text-3xl font-bold mb-6">
                What Kind of Personal Information Do We Collect?
              </h2>

              <h4 className="font-semibold mt-6 mb-2">Information You Provide Yourself</h4>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Name, address, telephone number and email</li>
                <li>Payment methods</li>
                <li>Order history and shopping preferences</li>
                <li>Customer service interactions</li>
                <li>Marketing preferences and reviews</li>
              </ul>

              <h4 className="font-semibold mt-6 mb-2">Information Collected Automatically</h4>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>IP address</li>
                <li>Browser, device and operating system</li>
                <li>Cookie-based analytics</li>
              </ul>
            </>
          )}

          {active === 'legal' && (
            <>
              <h2 className="text-3xl font-bold mb-6">
                The Legal Bases for Using Your Personal Information
              </h2>

              <p className="mb-4"><strong>Performance of a Contract:</strong> to fulfil your orders.</p>
              <p className="mb-4"><strong>Consent:</strong> newsletters and promotions.</p>
              <p className="mb-4"><strong>Legitimate Interests:</strong> personalised marketing and service improvement.</p>
              <p><strong>Legal Compliance:</strong> regulatory and fraud prevention obligations.</p>
            </>
          )}

          {active === 'when' && (
            <>
              <h2 className="text-3xl font-bold mb-6">When Do We Collect Your Data?</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>When you browse our website</li>
                <li>When you create an account</li>
                <li>When you place an order</li>
                <li>When you contact customer support</li>
                <li>When you sign up for marketing</li>
              </ul>
            </>
          )}

          {active === 'protect' && (
            <>
              <h2 className="text-3xl font-bold mb-6">How We Protect Your Data</h2>
              <p className="text-gray-700 leading-relaxed">
                We use physical, electronic and procedural safeguards including encryption,
                firewalls and strict access controls to protect your personal information.
              </p>
            </>
          )}

          {active === 'children' && (
            <>
              <h2 className="text-3xl font-bold mb-6">Privacy of Children</h2>
              <p className="text-gray-700">
                Our website is not intended for children under 18 and we do not knowingly
                collect data from minors.
              </p>
            </>
          )}

          {active === 'contact' && (
            <>
              <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
              <p className="text-gray-700 mb-3">
                Email: <strong>dataprotection@allspikes.com</strong>
              </p>
              <p className="text-gray-700">
                Address: Data Protection, allspikes.com,  
                1 The Park, Jubilee Way, Shipley, BD18 1QG
              </p>
            </>
          )}

        </main>
      </div>
    </section>
  )
}

export default PrivacyPolicy
