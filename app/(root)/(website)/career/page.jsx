import React from "react"

const Career = () => {
  return (
    <section className="bg-gray-100 py-24 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-10 lg:p-14 text-center">
        
        {/* Heading */}
        <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
          Career Opportunities
        </h1>

        <h2 className="text-xl lg:text-2xl font-semibold text-gray-600 mb-10">
          Interested in building your career with Constructezy?
        </h2>

        {/* Content */}
        <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
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

          <p className="font-medium">
            If you're ready to build your future with us, we’d love to hear from you.
          </p>
        </div>

        {/* Contact Info */}
        <div className="mt-12 border-t pt-8 space-y-3 text-lg">
          <p>
            <span className="font-semibold">Email:</span>{" "}
            <a
              href="mailto:careers@constructezy.com"
              className="text-black underline hover:text-gray-600"
            >
              careers@constructezy.com
            </a>
          </p>

          <p>
            <span className="font-semibold">Phone:</span> +91 6375380848
          </p>

          <p>
            <span className="font-semibold">Location:</span> India
          </p>
        </div>
      </div>
    </section>
  )
}

export default Career