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
          Please read these Terms & Conditions carefully before using our platform or
          placing an order. By accessing our services — including 30-minute material
          delivery and labour hire — you agree to be bound by the terms set out below.
          If you have any questions, please contact us before proceeding.
        </p>

        {/* CONTENT */}
        <div className="space-y-10 text-gray-700 leading-relaxed text-base">

          {/* GENERAL INFORMATION */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">General Information</h2>
            <p>BuildRush is a trading name of BuildRush Ltd.</p>
            <p className="mt-1">[Your Office Address], United Kingdom</p>
            <p className="mt-1">Registered Company Number: [XXXXXXXX]</p>
            <p className="mt-1">Registered VAT Number: [XXXXXXXXX] (England & Wales)</p>
            <p className="mt-3">
              BuildRush operates an on-demand platform connecting construction professionals
              with rapid material delivery and skilled labour hire services across the UK.
            </p>
          </section>

          {/* GENERAL TERMS */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">General Terms of Use</h2>
            <p>
              By accessing or using the BuildRush platform — including our website and mobile
              app — you agree to be bound by these Terms & Conditions and all applicable laws.
              If you do not agree, please do not use our services.
            </p>
            <p className="mt-3">
              Our services are intended for businesses, sole traders and adult professionals
              operating in the construction industry. You must be aged 18 or over and authorised
              to enter into legally binding contracts on behalf of your business.
            </p>
            <p className="mt-3">
              We reserve the right to amend these terms at any time. Updated terms will be
              published on our website and, where material changes are made, you will be
              notified by email at least 14 days before the changes take effect.
            </p>
          </section>

          {/* MATERIAL DELIVERY */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">30-Minute Material Delivery</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                We aim to deliver construction materials to your site within 30 minutes of
                order confirmation. This is a target time and not a guaranteed contractual
                commitment — delivery times may vary due to traffic, weather, stock location
                or other circumstances beyond our control.
              </li>
              <li>
                All delivery address and site access information provided must be accurate
                and complete. We are not liable for failed or delayed deliveries resulting
                from incorrect information supplied by the customer.
              </li>
              <li>
                A responsible adult must be present on site to accept the delivery and sign
                proof of delivery. If no one is available, we reserve the right to return
                the goods and charge a redelivery fee.
              </li>
              <li>
                Delivery is available within our designated service areas only. Coverage
                zones are displayed on the platform and are subject to change.
              </li>
              <li>
                Risk in goods passes to you upon delivery and confirmation of receipt.
              </li>
            </ul>
          </section>

          {/* LABOUR HIRE */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Labour Hire Services</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                BuildRush provides access to vetted, skilled construction workers on a
                temporary labour hire basis. Workers are supplied to your site under your
                supervision and direction.
              </li>
              <li>
                As the hirer, you are responsible for ensuring a safe working environment,
                providing adequate site inductions, and complying with all applicable health
                and safety legislation, including the Health and Safety at Work Act 1974 and
                the Construction (Design and Management) Regulations 2015 (CDM).
              </li>
              <li>
                Workers supplied through our platform have been subject to right-to-work
                verification and relevant skills/qualification checks. However, you are
                responsible for confirming their suitability for your specific project
                requirements before work commences.
              </li>
              <li>
                Labour hire bookings must be made through the platform. Cancellations made
                less than 24 hours before the scheduled start time may incur a cancellation
                fee equivalent to 50% of the booked shift value.
              </li>
              <li>
                Workers must not be offered or accept direct employment by the hirer during
                or within 12 weeks of a placement arranged through BuildRush without our
                prior written consent, unless the applicable transfer fee is paid.
              </li>
              <li>
                Timesheets must be approved by the hirer at the end of each shift.
                Disputed timesheets must be raised within 24 hours of submission.
              </li>
            </ul>
          </section>

          {/* ORDERING */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Placing an Order</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>All information provided when placing an order must be accurate and complete.</li>
              <li>
                Orders placed through our platform constitute an offer to purchase and are
                not binding until confirmed by BuildRush via order confirmation notification.
              </li>
              <li>Please check your confirmation carefully and report any errors immediately.</li>
              <li>
                We reserve the right to refuse or cancel any order, including where goods
                are out of stock, a pricing error has occurred, or we reasonably suspect
                fraudulent activity.
              </li>
            </ul>
          </section>

          {/* PAYMENT */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Payment</h2>
            <p>
              Full payment for material deliveries is required at the time of ordering.
              Payments are processed securely through our third-party payment provider.
              We accept major debit and credit cards and other payment methods as displayed
              on the platform.
            </p>
            <p className="mt-3">
              Labour hire charges are invoiced based on confirmed and approved timesheets.
              Invoices are due within <strong>14 days</strong> of issue unless otherwise agreed
              in writing. Late payments may incur interest under the Late Payment of Commercial
              Debts (Interest) Act 1998.
            </p>
            <p className="mt-3">
              All prices are shown in GBP and are inclusive of VAT where applicable.
              BuildRush reserves the right to amend pricing at any time. Changes will not
              affect orders already confirmed.
            </p>
          </section>

          {/* PRICING */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Pricing & VAT</h2>
            <p>
              All material prices displayed on the platform are in GBP and inclusive of
              VAT at the current rate unless otherwise stated. Labour hire rates are quoted
              exclusive of VAT; VAT will be added to all invoices.
            </p>
            <p className="mt-3">
              While we take care to ensure pricing accuracy, errors may occasionally occur.
              Where a pricing error is identified before despatch or deployment, we will
              contact you with the corrected price and give you the option to proceed or cancel.
            </p>
          </section>

          {/* STOCK AVAILABILITY */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Stock & Material Availability</h2>
            <p>
              All materials are subject to availability. In the event that an ordered item
              is out of stock at the time of your order, we will notify you promptly and
              offer a suitable substitute, a revised delivery time, or a full refund.
            </p>
            <p className="mt-3">
              Product images on the platform are for illustrative purposes only. Exact
              specifications, dimensions and finishes should be verified prior to ordering
              for specialist or bespoke materials.
            </p>
          </section>

          {/* CANCELLATIONS */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Cancellations</h2>
            <p>
              <strong>Material orders:</strong> You may cancel a material delivery order at
              any time before it has been dispatched. Once dispatched, cancellations are not
              possible but you may initiate a return in accordance with our Returns policy below.
            </p>
            <p className="mt-3">
              <strong>Labour hire bookings:</strong> Cancellations must be made via the platform.
              Cancellations made with more than 24 hours' notice will not incur a charge.
              Cancellations within 24 hours of the scheduled start time may incur a fee of
              up to 50% of the shift value. No-shows will be charged in full.
            </p>
          </section>

          {/* RETURNS & REFUNDS */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Returns & Refunds</h2>
            <p>
              Materials that are unused, in their original condition and packaging, and not
              bespoke or specially ordered, may be returned within <strong>28 days</strong> of
              delivery. Please contact our team to arrange a collection or drop-off.
            </p>
            <p className="mt-3">
              Refunds will be issued to the original payment method within{' '}
              <strong>7 working days</strong> of us receiving and inspecting the returned goods.
              We reserve the right to deduct a restocking fee for items returned in a condition
              other than as supplied.
            </p>
            <p className="mt-3">
              Items damaged in transit must be reported within <strong>48 hours</strong> of
              delivery with photographic evidence. We will arrange replacement or refund at
              our discretion.
            </p>
            <p className="mt-3">
              Returns are not accepted for bespoke, cut-to-size, or specially ordered materials
              unless the items are faulty or incorrectly supplied.
            </p>
          </section>

          {/* HEALTH & SAFETY */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Health & Safety</h2>
            <p>
              BuildRush is committed to promoting safe working practices across all our
              operations. All workers placed through our platform have completed a platform
              health and safety induction.
            </p>
            <p className="mt-3">
              As the site controller and hirer, you are legally responsible under the
              Construction (Design and Management) Regulations 2015 (CDM) and the Health
              and Safety at Work Act 1974 for maintaining a safe working environment for
              all workers present on site, including those hired through BuildRush.
            </p>
            <p className="mt-3">
              Any site incidents, near misses or injuries involving BuildRush workers or
              delivery personnel must be reported to us within 24 hours via the platform
              or by contacting our operations team directly.
            </p>
          </section>

          {/* INTELLECTUAL PROPERTY */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Intellectual Property</h2>
            <p>
              All content on the BuildRush platform — including text, images, logos,
              trademarks, software and design — is the property of BuildRush Ltd or its
              licensors and is protected by applicable intellectual property laws.
            </p>
            <p className="mt-3">
              You may not reproduce, distribute or commercially exploit any content from
              our platform without our prior written permission.
            </p>
          </section>

          {/* LIMITATION OF LIABILITY */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, BuildRush's total liability to you
              for any claim arising from our services shall not exceed the value of the
              relevant order or booking giving rise to the claim.
            </p>
            <p className="mt-3">
              We are not liable for any indirect, consequential, or economic losses,
              including loss of profit, loss of contract, project delays, or site downtime
              caused by delayed delivery or unavailability of workers.
            </p>
            <p className="mt-3">
              Nothing in these terms limits our liability for death or personal injury
              caused by our negligence, fraud or fraudulent misrepresentation, or any
              other liability that cannot be excluded by law.
            </p>
          </section>

          {/* DISCLAIMER */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Disclaimer</h2>
            <p>
              While we take reasonable steps to ensure the accuracy of information on our
              platform, we make no warranties regarding the completeness, reliability or
              suitability of product information, worker profiles or delivery estimates.
            </p>
            <p className="mt-3">
              BuildRush acts as an intermediary for labour hire — we do not employ the
              workers supplied to you. Responsibility for supervising, directing and
              ensuring the safe working of hired labour rests with the hirer.
            </p>
          </section>

          {/* GOVERNING LAW */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Governing Law</h2>
            <p>
              These Terms & Conditions are governed by and construed in accordance with
              the laws of England & Wales. Any disputes arising from or in connection
              with these terms shall be subject to the exclusive jurisdiction of the
              courts of England & Wales.
            </p>
          </section>

          {/* CONTACT */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
            <p>
              If you have any questions about these Terms & Conditions, please get in touch:
            </p>
            <p className="mt-3">
              <strong>Email:</strong>{' '}
              <a href="mailto:hello@buildrush.co.uk" className="underline text-blue-600">
                hello@buildrush.co.uk
              </a>
            </p>
            <p className="mt-1">
              <strong>Address:</strong> BuildRush Ltd, [Your Office Address], United Kingdom
            </p>
            <p className="mt-1">
              <strong>Last updated:</strong> April 2026
            </p>
          </section>

        </div>
      </div>
    </section>
  )
}

export default TermsAndConditions