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

          {/* PROMISE */}
          {active === 'promise' && (
            <>
              <h1 className="text-3xl font-bold mb-6">Our Privacy Promise</h1>
              <p className="text-gray-700 leading-relaxed mb-4">
                At BuildRush, trust is the foundation of everything we do — and that includes how
                we handle your personal information. Whether you're booking a 30-minute material
                delivery to your construction site or hiring skilled labour for your next project,
                we want you to have complete confidence in how your data is managed.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                We are committed to managing your personal information with great care and in full
                compliance with data protection legislation, including the UK General Data
                Protection Regulation (UK GDPR) and the Privacy and Electronic Communications
                Regulations (PECR).
              </p>
              <p className="text-gray-700 leading-relaxed">
                We do not and will never sell your data to third parties. Your information exists
                solely to help us deliver fast, reliable construction services to you — and to keep
                improving them.
              </p>
            </>
          )}

          {/* COLLECT */}
          {active === 'collect' && (
            <>
              <h2 className="text-3xl font-bold mb-6">
                What Kind of Personal Information Do We Collect?
              </h2>

              <h4 className="font-semibold mt-6 mb-2">Information You Provide Directly</h4>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Full name, company/business name, address, phone number and email</li>
                <li>Delivery site address and access instructions</li>
                <li>Payment information (processed securely via our payment provider)</li>
                <li>Labour hire requirements — job role, trade, skills, duration and site conditions</li>
                <li>Order and booking history</li>
                <li>Customer service communications, complaints and feedback</li>
                <li>Marketing and communication preferences</li>
              </ul>

              <h4 className="font-semibold mt-6 mb-2">Information Collected Automatically</h4>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>IP address and device, browser and operating system details</li>
                <li>GPS and location data (used to coordinate 30-minute deliveries)</li>
                <li>Delivery tracking data — driver routes, dispatch timestamps and proof of delivery</li>
                <li>App usage and website browsing activity</li>
                <li>Cookie-based analytics</li>
              </ul>

              <h4 className="font-semibold mt-6 mb-2">Information About Workers (Labour Hire)</h4>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Trade qualifications, certifications, licences and skills</li>
                <li>Work history, references and availability</li>
                <li>Right-to-work documentation</li>
                <li>DBS/background check results (where applicable)</li>
                <li>Health and safety induction and training records</li>
                <li>Bank account details for payroll processing</li>
                <li>Emergency contact information</li>
                <li>National Insurance number and tax information</li>
              </ul>
            </>
          )}

          {/* LEGAL */}
          {active === 'legal' && (
            <>
              <h2 className="text-3xl font-bold mb-6">
                The Legal Bases for Using Your Personal Information
              </h2>

              <p className="text-gray-700 mb-4">
                <strong>Performance of a Contract:</strong> To process and fulfil your material
                delivery orders, coordinate labour hire bookings, manage payments, and provide
                our core construction services.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Legal Obligation:</strong> To comply with employment law, right-to-work
                verification, health and safety regulations, HMRC tax reporting, employer's
                liability insurance requirements, and anti-money laundering obligations.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Legitimate Interests:</strong> To optimise delivery routing and response
                times, improve our platform, prevent fraud, ensure site safety, and send relevant
                service communications.
              </p>
              <p className="text-gray-700">
                <strong>Consent:</strong> To send you marketing emails, promotional offers and
                newsletters. You may withdraw your consent at any time by unsubscribing or
                contacting us directly.
              </p>
            </>
          )}

          {/* WHEN */}
          {active === 'when' && (
            <>
              <h2 className="text-3xl font-bold mb-6">When Do We Collect Your Data?</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>When you browse or use our website or mobile app</li>
                <li>When you create an account or business profile</li>
                <li>When you place a material delivery order</li>
                <li>When you submit a labour hire request or book a worker</li>
                <li>When a worker registers on our platform and completes onboarding</li>
                <li>When you track a live delivery via our app</li>
                <li>When you contact our customer support team</li>
                <li>When you complete a review, survey or feedback form</li>
                <li>When you sign up for our newsletter or marketing communications</li>
              </ul>
            </>
          )}

          {/* HOW */}
          {active === 'how' && (
            <>
              <h2 className="text-3xl font-bold mb-6">How and Why We Use Your Personal Data</h2>

              <h4 className="font-semibold mt-6 mb-2">30-Minute Delivery Services</h4>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Processing and dispatching your material orders within 30 minutes</li>
                <li>Sharing your site address and delivery instructions with our drivers</li>
                <li>Sending real-time delivery tracking updates via SMS or app notification</li>
                <li>Generating proof of delivery and order documentation</li>
                <li>Handling returns, disputes and refunds</li>
              </ul>

              <h4 className="font-semibold mt-6 mb-2">Labour Hire Services</h4>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Matching workers to your project's trade and skill requirements</li>
                <li>Conducting right-to-work, DBS and qualification verification checks</li>
                <li>Processing timesheets, payroll and tax documentation</li>
                <li>Maintaining health and safety induction and compliance records</li>
                <li>Managing worker scheduling, availability and deployment</li>
              </ul>

              <h4 className="font-semibold mt-6 mb-2">General Platform Operations</h4>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Fraud prevention and platform security</li>
                <li>Improving our services through usage analytics</li>
                <li>Personalising your dashboard and showing relevant offers</li>
                <li>Communicating important changes to our services or policies</li>
                <li>Responding to legal requests or enforcing our terms</li>
              </ul>
            </>
          )}

          {/* SHARING */}
          {active === 'sharing' && (
            <>
              <h2 className="text-3xl font-bold mb-6">Sharing Your Data with Third Parties</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We do not sell your personal data. We share it only where strictly necessary with
                the following trusted categories of third party:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Delivery drivers and logistics partners</strong> — to fulfil your orders on time</li>
                <li><strong>Payment processors</strong> — for secure transaction and refund handling</li>
                <li><strong>Payroll and HR providers</strong> — for worker payment, tax and compliance</li>
                <li><strong>Background check providers</strong> — for right-to-work and DBS screening</li>
                <li><strong>Insurance providers</strong> — for employer's liability and public liability cover</li>
                <li><strong>HMRC and regulatory authorities</strong> — where legally required</li>
                <li><strong>IT infrastructure and cloud providers</strong> — for secure data hosting</li>
                <li><strong>Analytics platforms</strong> — for anonymised, aggregate usage data only</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                All third-party data processors are bound by data processing agreements and are
                required to handle your data in accordance with UK GDPR.
              </p>
            </>
          )}

          {/* PROTECT */}
          {active === 'protect' && (
            <>
              <h2 className="text-3xl font-bold mb-6">How We Protect Your Data</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We take the security of your personal information seriously. Our safeguards include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>End-to-end encryption for all data transmitted through our platform</li>
                <li>Encrypted storage for sensitive data at rest</li>
                <li>Strict role-based access controls — only authorised staff can access your data</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Secure, GDPR-compliant cloud infrastructure</li>
                <li>Staff training on data protection, confidentiality and GDPR compliance</li>
                <li>Documented incident response procedures in the event of a data breach</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                In the unlikely event of a data breach that poses a risk to your rights and freedoms,
                we will notify the ICO within 72 hours and inform affected individuals without
                undue delay.
              </p>
            </>
          )}

          {/* WHERE */}
          {active === 'where' && (
            <>
              <h2 className="text-3xl font-bold mb-6">Where Your Data May Be Stored and Processed</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your data is primarily stored on servers located within the <strong>United Kingdom
                and the European Economic Area (EEA)</strong>.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Where data is transferred outside the UK or EEA — for example, to certain cloud
                service providers — we ensure that appropriate safeguards are in place, such as
                the UK International Data Transfer Agreement (IDTA) or Standard Contractual
                Clauses approved by the Information Commissioner's Office (ICO).
              </p>
            </>
          )}

          {/* RETAIN */}
          {active === 'retain' && (
            <>
              <h2 className="text-3xl font-bold mb-6">How Long Do We Keep Your Data?</h2>
              <p className="text-gray-700 mb-4">
                We retain personal data only for as long as necessary for the purposes it was
                collected or as required by law:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Customer account data</strong> — retained for the lifetime of your account plus 6 years</li>
                <li><strong>Delivery and order records</strong> — 6 years (in line with HMRC requirements)</li>
                <li><strong>Worker employment records</strong> — 6 years after the working relationship ends</li>
                <li><strong>Right-to-work documents</strong> — 2 years after employment ends (as required by the Immigration, Asylum and Nationality Act 2006)</li>
                <li><strong>Payroll and tax records</strong> — 6 years (HMRC requirement)</li>
                <li><strong>Health and safety records</strong> — up to 40 years for certain exposure records</li>
                <li><strong>Marketing preferences</strong> — until you unsubscribe or withdraw consent</li>
                <li><strong>CCTV footage (depots/warehouses)</strong> — overwritten after 30 days unless required for an investigation</li>
              </ul>
              <p className="text-gray-700 mt-4">
                After the applicable retention period, data is securely deleted or anonymised.
              </p>
            </>
          )}

          {/* RIGHTS */}
          {active === 'rights' && (
            <>
              <h2 className="text-3xl font-bold mb-6">Your Rights Relating to Your Data</h2>
              <p className="text-gray-700 mb-4">
                Under UK GDPR, you have the following rights:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Right of access</strong> — request a copy of the personal data we hold about you</li>
                <li><strong>Right to rectification</strong> — ask us to correct inaccurate or incomplete data</li>
                <li><strong>Right to erasure</strong> — request deletion of your data where there is no lawful reason to retain it</li>
                <li><strong>Right to restriction</strong> — ask us to limit how we process your data in certain circumstances</li>
                <li><strong>Right to data portability</strong> — receive your data in a structured, machine-readable format</li>
                <li><strong>Right to object</strong> — object to processing based on legitimate interests or for direct marketing</li>
                <li><strong>Right to withdraw consent</strong> — at any time for marketing and non-essential processing</li>
              </ul>
              <p className="text-gray-700 mt-4">
                To exercise any of these rights, please contact us using the details in the Contact
                Us section. We will respond within <strong>30 days</strong>. If you are unsatisfied with our
                response, you have the right to lodge a complaint with the{' '}
                <strong>Information Commissioner's Office (ICO)</strong> at{' '}
                <a href="https://ico.org.uk" className="underline text-blue-600">ico.org.uk</a>{' '}
                or by calling <strong>0303 123 1113</strong>.
              </p>
            </>
          )}

          {/* CHILDREN */}
          {active === 'children' && (
            <>
              <h2 className="text-3xl font-bold mb-6">Privacy of Children On Our Website</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our platform and services are designed exclusively for businesses, contractors
                and adult professionals in the construction industry. We do not knowingly collect
                or process personal data from anyone under the age of 18.
              </p>
              <p className="text-gray-700 leading-relaxed">
                If you believe a minor has submitted personal data through our platform, please
                contact us immediately at the details below and we will take prompt steps to
                delete that information.
              </p>
            </>
          )}

          {/* CHANGES */}
          {active === 'changes' && (
            <>
              <h2 className="text-3xl font-bold mb-6">Changes to Our Privacy Statement</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may update this Privacy Statement from time to time to reflect changes in our
                services, legal obligations, or best practices. The date of the most recent update
                is shown at the top of this page.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                When we make material changes, we will notify you by email or via an in-app
                notification at least <strong>14 days</strong> before the changes take effect.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Continued use of our services after the effective date of any changes constitutes
                your acceptance of the updated Privacy Statement. We encourage you to review this
                page periodically to stay informed.
              </p>
            </>
          )}

          {/* CONTACT */}
          {active === 'contact' && (
            <>
              <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
              <p className="text-gray-700 mb-3">
                If you have any questions about this Privacy Statement, wish to exercise your
                data rights, or have a concern about how your data has been handled, please
                contact our Data Protection Officer:
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Email:</strong>{' '}
                <a href="mailto:privacy@buildrush.co.uk" className="underline text-blue-600">
                  privacy@buildrush.co.uk
                </a>
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Post:</strong> Data Protection Officer, BuildRush Ltd,
                [Your Office Address], United Kingdom
              </p>
              <p className="text-gray-700 mb-6">
                <strong>Response time:</strong> We aim to respond within 5 business days and no
                later than 30 days as required by UK GDPR.
              </p>
              <p className="text-gray-700">
                You also have the right to raise a concern directly with the{' '}
                <strong>Information Commissioner's Office (ICO)</strong>:{' '}
                <a href="https://ico.org.uk" className="underline text-blue-600">ico.org.uk</a>{' '}
                or call <strong>0303 123 1113</strong>.
              </p>
            </>
          )}

        </main>
      </div>
    </section>
  )
}

export default PrivacyPolicy