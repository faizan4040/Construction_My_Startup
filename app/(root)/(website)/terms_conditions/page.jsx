'use client'

import React from 'react'
import { FileText } from 'lucide-react'

const toc = [
  { id: 'general-info', label: 'General Information' },
  { id: 'general-terms', label: 'General Terms of Use' },
  { id: 'material-delivery', label: '30-Minute Material Delivery' },
  { id: 'labour-hire', label: 'Labour Hire Services' },
  { id: 'ordering', label: 'Placing an Order' },
  { id: 'payment', label: 'Payment' },
  { id: 'pricing', label: 'Pricing & VAT' },
  { id: 'stock', label: 'Stock & Material Availability' },
  { id: 'cancellations', label: 'Cancellations' },
  { id: 'returns', label: 'Returns & Refunds' },
  { id: 'health-safety', label: 'Health & Safety' },
  { id: 'ip', label: 'Intellectual Property' },
  { id: 'liability', label: 'Limitation of Liability' },
  { id: 'disclaimer', label: 'Disclaimer' },
  { id: 'governing-law', label: 'Governing Law' },
  { id: 'contact', label: 'Contact Us' },
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

/* ── Section wrapper: numbered clause with ruler divider ── */
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

const TermsAndConditions = () => {
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
            <FileText size={16} strokeWidth={2.5} />
            Legal Document
          </div>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight leading-[1.02]">
            Terms &amp; Conditions
          </h1>
          <p className="mt-4 text-[#C9CCD1] text-lg max-w-2xl">
            Please read these Terms &amp; Conditions carefully before using our platform or
            placing an order. By accessing our services — including 30-minute material
            delivery and labour hire — you agree to be bound by the terms set out below.
            If you have any questions, please contact us before proceeding.
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
              <ul className="space-y-1 max-h-[70vh] overflow-y-auto pr-2">
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

              <Clause id="general-info" index={1} title="General Information">
                <p>BuildRush is a trading name of BuildRush Ltd.</p>
                <p>[Your Office Address], United Kingdom</p>
                <p>Registered Company Number: [XXXXXXXX]</p>
                <p>Registered VAT Number: [XXXXXXXXX] (England &amp; Wales)</p>
                <p>
                  BuildRush operates an on-demand platform connecting construction professionals
                  with rapid material delivery and skilled labour hire services across the UK.
                </p>
              </Clause>

              <Clause id="general-terms" index={2} title="General Terms of Use">
                <p>
                  By accessing or using the BuildRush platform — including our website and mobile
                  app — you agree to be bound by these Terms &amp; Conditions and all applicable laws.
                  If you do not agree, please do not use our services.
                </p>
                <p>
                  Our services are intended for businesses, sole traders and adult professionals
                  operating in the construction industry. You must be aged 18 or over and authorised
                  to enter into legally binding contracts on behalf of your business.
                </p>
                <p>
                  We reserve the right to amend these terms at any time. Updated terms will be
                  published on our website and, where material changes are made, you will be
                  notified by email at least 14 days before the changes take effect.
                </p>
              </Clause>

              <Clause id="material-delivery" index={3} title="30-Minute Material Delivery">
                <ul>
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
                  <li>Risk in goods passes to you upon delivery and confirmation of receipt.</li>
                </ul>
              </Clause>

              <Clause id="labour-hire" index={4} title="Labour Hire Services">
                <ul>
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
              </Clause>

              <Clause id="ordering" index={5} title="Placing an Order">
                <ul>
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
              </Clause>

              <Clause id="payment" index={6} title="Payment">
                <p>
                  Full payment for material deliveries is required at the time of ordering.
                  Payments are processed securely through our third-party payment provider.
                  We accept major debit and credit cards and other payment methods as displayed
                  on the platform.
                </p>
                <p>
                  Labour hire charges are invoiced based on confirmed and approved timesheets.
                  Invoices are due within <strong>14 days</strong> of issue unless otherwise agreed
                  in writing. Late payments may incur interest under the Late Payment of Commercial
                  Debts (Interest) Act 1998.
                </p>
                <p>
                  All prices are shown in GBP and are inclusive of VAT where applicable.
                  BuildRush reserves the right to amend pricing at any time. Changes will not
                  affect orders already confirmed.
                </p>
              </Clause>

              <Clause id="pricing" index={7} title="Pricing & VAT">
                <p>
                  All material prices displayed on the platform are in GBP and inclusive of
                  VAT at the current rate unless otherwise stated. Labour hire rates are quoted
                  exclusive of VAT; VAT will be added to all invoices.
                </p>
                <p>
                  While we take care to ensure pricing accuracy, errors may occasionally occur.
                  Where a pricing error is identified before despatch or deployment, we will
                  contact you with the corrected price and give you the option to proceed or cancel.
                </p>
              </Clause>

              <Clause id="stock" index={8} title="Stock & Material Availability">
                <p>
                  All materials are subject to availability. In the event that an ordered item
                  is out of stock at the time of your order, we will notify you promptly and
                  offer a suitable substitute, a revised delivery time, or a full refund.
                </p>
                <p>
                  Product images on the platform are for illustrative purposes only. Exact
                  specifications, dimensions and finishes should be verified prior to ordering
                  for specialist or bespoke materials.
                </p>
              </Clause>

              <Clause id="cancellations" index={9} title="Cancellations">
                <p>
                  <strong>Material orders:</strong> You may cancel a material delivery order at
                  any time before it has been dispatched. Once dispatched, cancellations are not
                  possible but you may initiate a return in accordance with our Returns policy below.
                </p>
                <p>
                  <strong>Labour hire bookings:</strong> Cancellations must be made via the platform.
                  Cancellations made with more than 24 hours' notice will not incur a charge.
                  Cancellations within 24 hours of the scheduled start time may incur a fee of
                  up to 50% of the shift value. No-shows will be charged in full.
                </p>
              </Clause>

              <Clause id="returns" index={10} title="Returns & Refunds">
                <p>
                  Materials that are unused, in their original condition and packaging, and not
                  bespoke or specially ordered, may be returned within <strong>28 days</strong> of
                  delivery. Please contact our team to arrange a collection or drop-off.
                </p>
                <p>
                  Refunds will be issued to the original payment method within{' '}
                  <strong>7 working days</strong> of us receiving and inspecting the returned goods.
                  We reserve the right to deduct a restocking fee for items returned in a condition
                  other than as supplied.
                </p>
                <p>
                  Items damaged in transit must be reported within <strong>48 hours</strong> of
                  delivery with photographic evidence. We will arrange replacement or refund at
                  our discretion.
                </p>
                <p>
                  Returns are not accepted for bespoke, cut-to-size, or specially ordered materials
                  unless the items are faulty or incorrectly supplied.
                </p>
              </Clause>

              <Clause id="health-safety" index={11} title="Health & Safety">
                <p>
                  BuildRush is committed to promoting safe working practices across all our
                  operations. All workers placed through our platform have completed a platform
                  health and safety induction.
                </p>
                <p>
                  As the site controller and hirer, you are legally responsible under the
                  Construction (Design and Management) Regulations 2015 (CDM) and the Health
                  and Safety at Work Act 1974 for maintaining a safe working environment for
                  all workers present on site, including those hired through BuildRush.
                </p>
                <p>
                  Any site incidents, near misses or injuries involving BuildRush workers or
                  delivery personnel must be reported to us within 24 hours via the platform
                  or by contacting our operations team directly.
                </p>
              </Clause>

              <Clause id="ip" index={12} title="Intellectual Property">
                <p>
                  All content on the BuildRush platform — including text, images, logos,
                  trademarks, software and design — is the property of BuildRush Ltd or its
                  licensors and is protected by applicable intellectual property laws.
                </p>
                <p>
                  You may not reproduce, distribute or commercially exploit any content from
                  our platform without our prior written permission.
                </p>
              </Clause>

              <Clause id="liability" index={13} title="Limitation of Liability">
                <p>
                  To the fullest extent permitted by law, BuildRush's total liability to you
                  for any claim arising from our services shall not exceed the value of the
                  relevant order or booking giving rise to the claim.
                </p>
                <p>
                  We are not liable for any indirect, consequential, or economic losses,
                  including loss of profit, loss of contract, project delays, or site downtime
                  caused by delayed delivery or unavailability of workers.
                </p>
                <p>
                  Nothing in these terms limits our liability for death or personal injury
                  caused by our negligence, fraud or fraudulent misrepresentation, or any
                  other liability that cannot be excluded by law.
                </p>
              </Clause>

              <Clause id="disclaimer" index={14} title="Disclaimer">
                <p>
                  While we take reasonable steps to ensure the accuracy of information on our
                  platform, we make no warranties regarding the completeness, reliability or
                  suitability of product information, worker profiles or delivery estimates.
                </p>
                <p>
                  BuildRush acts as an intermediary for labour hire — we do not employ the
                  workers supplied to you. Responsibility for supervising, directing and
                  ensuring the safe working of hired labour rests with the hirer.
                </p>
              </Clause>

              <Clause id="governing-law" index={15} title="Governing Law">
                <p>
                  These Terms &amp; Conditions are governed by and construed in accordance with
                  the laws of England &amp; Wales. Any disputes arising from or in connection
                  with these terms shall be subject to the exclusive jurisdiction of the
                  courts of England &amp; Wales.
                </p>
              </Clause>

              <Clause id="contact" index={16} title="Contact Us">
                <p>
                  If you have any questions about these Terms &amp; Conditions, please get in touch:
                </p>
                <p>
                  <strong>Email:</strong>{' '}
                  <a href="mailto:hello@buildrush.co.uk">
                    hello@buildrush.co.uk
                  </a>
                </p>
                <p>
                  <strong>Address:</strong> BuildRush Ltd, [Your Office Address], United Kingdom
                </p>
                <p>
                  <strong>Last updated:</strong> April 2026
                </p>
              </Clause>

            </div>
          </main>
        </div>
      </section>
    </div>
  )
}

export default TermsAndConditions