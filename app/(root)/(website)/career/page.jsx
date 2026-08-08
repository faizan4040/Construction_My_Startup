import React from "react"
import { Mail, Phone, MapPin, ArrowUpRight, HardHat } from "lucide-react"

/* ── Blueprint grid overlay ── */
const BlueprintGrid = ({ opacity = 0.06 }) => (
  <div
    className="pointer-events-none absolute inset-0"
    style={{
      opacity,
      backgroundImage:
        "linear-gradient(#4A7A96 1px, transparent 1px), linear-gradient(90deg, #4A7A96 1px, transparent 1px)",
      backgroundSize: "36px 36px",
    }}
  />
)

/* ── Architectural dimension-line divider ── */
const RulerLine = ({ label }) => (
  <div className="flex items-center gap-3">
    <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#9098A0] shrink-0">
      {label}
    </span>
    <span
      className="flex-1 h-px"
      style={{
        backgroundImage:
          "repeating-linear-gradient(90deg, #D8D4CC 0 6px, transparent 6px 12px)",
      }}
    />
  </div>
)

/* ── Corner-bracket frame ── */
const CornerBrackets = ({ color = "#F97316" }) => (
  <>
    <span className="absolute -top-px -left-px h-5 w-5 border-t-2 border-l-2" style={{ borderColor: color }} />
    <span className="absolute -top-px -right-px h-5 w-5 border-t-2 border-r-2" style={{ borderColor: color }} />
    <span className="absolute -bottom-px -left-px h-5 w-5 border-b-2 border-l-2" style={{ borderColor: color }} />
    <span className="absolute -bottom-px -right-px h-5 w-5 border-b-2 border-r-2" style={{ borderColor: color }} />
  </>
)

const roles = ["Engineers", "Architects", "Contractors", "Labor Experts"]

const Career = () => {
  return (
    <div className="w-full bg-[#F5F3EF] text-[#14161A]">

      {/* ---------- HEADER ---------- */}
      <section className="relative bg-[#14161A] text-white py-24 overflow-hidden">
        <BlueprintGrid />
        <div
          className="absolute bottom-0 left-0 right-0 h-1.5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, #F97316 0 14px, transparent 14px 28px)",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 text-[#F97316] text-xs font-mono uppercase tracking-[0.3em] mb-6">
            <HardHat size={16} strokeWidth={2.5} />
            Join the crew
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.02]">
            Career Opportunities
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-[#C9CCD1] max-w-2xl mx-auto">
            Interested in building your career with Constructezy?
          </p>

          {/* Role tags */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {roles.map((role) => (
              <span
                key={role}
                className="text-xs font-bold uppercase tracking-wider text-[#F97316] border border-[#F97316]/40 px-4 py-2"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CONTENT ---------- */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">

          <RulerLine label="Sec. 01 / Who We're Looking For" />

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 text-[#3A3D42] text-lg leading-relaxed">
            <p>
              At Constructezy, we are proud of our dedicated team of skilled
              professionals including engineers, architects, contractors, and
              labor experts. We are always looking for talented individuals to
              join us across various construction and infrastructure roles.
            </p>

            <p>
              We seek motivated people with a passion for construction, design,
              and project execution. Whether you're experienced in site work,
              materials management, plumbing, electrical, or project planning,
              we provide a platform to grow and succeed in your field.
            </p>

            <p>
              Our focus on learning and development makes Constructezy a great
              place to work. From on-site training to professional development
              programs, we ensure you gain the skills needed to advance your
              career in the construction industry.
            </p>

            <p>
              Every team member plays a vital role in shaping projects and
              delivering quality results. We value hard work, dedication, and
              teamwork, and we reward our employees with growth opportunities
              and a supportive work environment.
            </p>
          </div>

          <p className="mt-10 text-center text-xl font-bold tracking-tight border-t border-b border-[#14161A]/10 py-6">
            If you're ready to build your future with us, we'd love to hear from you.
          </p>

          {/* ---------- CONTACT CARD ---------- */}
          <div className="relative mt-16 bg-white border border-black/5 p-8 sm:p-10">
            <CornerBrackets />

            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#F97316]">
              Site Contact
            </span>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="flex flex-col gap-2">
                <Mail size={20} className="text-[#F97316]" />
                <span className="text-xs uppercase tracking-wider text-[#6C7278]">Email</span>
                <a
                  href="mailto:careers@constructezy.com"
                  className="text-[#14161A] font-semibold hover:text-[#F97316] transition-colors break-all"
                >
                  careers@constructezy.com
                </a>
              </div>

              <div className="flex flex-col gap-2">
                <Phone size={20} className="text-[#F97316]" />
                <span className="text-xs uppercase tracking-wider text-[#6C7278]">Phone</span>
                <span className="text-[#14161A] font-semibold">+91 6375380848</span>
              </div>

              <div className="flex flex-col gap-2">
                <MapPin size={20} className="text-[#F97316]" />
                <span className="text-xs uppercase tracking-wider text-[#6C7278]">Location</span>
                <span className="text-[#14161A] font-semibold">India</span>
              </div>
            </div>

            <a
              href="mailto:careers@constructezy.com"
              className="mt-10 inline-flex items-center gap-2 bg-[#F97316] text-[#14161A] font-bold uppercase tracking-wide text-sm px-6 py-3 hover:bg-[#14161A] hover:text-white transition-colors"
            >
              Send your application <ArrowUpRight size={16} />
            </a>
          </div>

        </div>
      </section>

    </div>
  )
}

export default Career