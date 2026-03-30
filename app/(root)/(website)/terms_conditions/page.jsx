'use client'

import React from 'react'

const TermsAndConditions = () => {
  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-5xl mx-auto px-6">

        {/* PAGE TITLE */}
        <h1 className="text-4xl font-bold mb-4">
          Terms & Conditions
        </h1>

        <p className="text-gray-600 mb-10">
          Below we've set out our terms and conditions and important information.
          Please read through them and contact us if you have any questions.
        </p>

        {/* CONTENT */}
        <div className="space-y-10 text-gray-700 leading-relaxed text-base">

          {/* GENERAL INFORMATION */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">General Information</h2>
            <p>All Spikes.com is a trading name of B Sporting Ltd.</p>
            <p>1 The Park, Jubilee Way, BD18 1QG, Shipley, United Kingdom</p>
            <p>Registered Company Number: 01627024</p>
            <p>Registered VAT Number: 363879701 (England)</p>
          </section>

          {/* GENERAL TERMS */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">General Terms of Use</h2>
            <p>
              By accessing or using this site you agree to be bound by these terms
              and all applicable laws. If you do not agree, please do not use this site.
            </p>
            <p className="mt-3">
              We reserve the right to amend these terms at any time. Changes will
              be effective once published on the website.
            </p>
          </section>

          {/* ORDERING */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Ordering</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>All information provided must be accurate and complete.</li>
              <li>Orders are offers to purchase and not binding until despatched.</li>
              <li>You must check your confirmation email carefully.</li>
              <li>We reserve the right to refuse any order.</li>
            </ul>
          </section>

          {/* PAYMENT */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Payment</h2>
            <p>
              Full payment must be received before dispatch. Payments are processed
              at the time of despatch after card validation.
            </p>
            <p className="mt-3">
              Discounts apply only once payment is accepted. Bank transfers must
              be received within 5 days or orders will be cancelled.
            </p>
          </section>

          {/* KLARNA */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Klarna</h2>
            <p>
              Klarna Pay in 3 and Pay in 30 Days are unregulated credit agreements.
              18+ UK residents only. Subject to status and Ts&Cs.
            </p>
          </section>

          {/* PRICING */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Pricing</h2>
            <p>
              All prices are shown in GBP and include VAT where applicable.
              Errors may occur and will be corrected before order acceptance.
            </p>
          </section>

          {/* STOCK */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Stock Availability</h2>
            <p>
              Goods are subject to availability. Product images are illustrative
              and colours may vary by device.
            </p>
          </section>

          {/* PROMOTIONS */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Promotions</h2>
            <p>
              Only one promotion may be used per order unless otherwise stated.
              Promotions may be amended or withdrawn at any time.
            </p>
          </section>

          {/* CANCELLATIONS */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Cancellations</h2>
            <p>
              Customers may cancel within the cooling-off period. All Spikes
              extends this to 100 days in most cases.
            </p>
          </section>

          {/* DELIVERY */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Delivery</h2>
            <p>
              Delivery times are estimates. We are not responsible for courier delays.
            </p>
          </section>

          {/* RETURNS */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Returns & Refunds</h2>
            <p>
              Items must be returned in resaleable condition within 100 days.
              Refunds are issued to the original payment method within 7 working days.
            </p>
          </section>

          {/* INTELLECTUAL PROPERTY */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Intellectual Property</h2>
            <p>
              All site content, trademarks and branding belong to B Sporting Ltd
              or respective owners and may not be reproduced without permission.
            </p>
          </section>

          {/* DISCLAIMER */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Disclaimer</h2>
            <p>
              We make no warranties regarding site availability or accuracy.
              Products are for personal use only.
            </p>
          </section>

          {/* GOVERNING LAW */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Governing Law</h2>
            <p>
              These terms are governed by the laws of England & Wales.
            </p>
          </section>

        </div>
      </div>
    </section>
  )
}

export default TermsAndConditions
