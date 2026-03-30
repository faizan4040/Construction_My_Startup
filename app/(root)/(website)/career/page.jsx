import React from "react"

const Career = () => {
  return (
    <section className="bg-gray-100 py-24 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-10 lg:p-14 text-center">
        
        {/* Heading */}
        <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
          Careers Opportunities
        </h1>

        <h2 className="text-xl lg:text-2xl font-semibold text-gray-600 mb-10">
          Interested in being part of the All Spikes.com team?
        </h2>

        {/* Content */}
        <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
          <p>
            We're proud of our fantastic team of enthusiastic and highly trained
            staff, and we're always looking for great people to join us in a
            variety of roles.
          </p>

          <p>
            We look for professional and motivated people with a passion for
            sport and an enthusiasm for what they do. Our focus on personal
            development makes us a great place to work and whatever your role
            with us, we'll provide you with excellent training and a friendly
            working environment.
          </p>

          <p>
            We believe that every member of staff is part of the All Spikes
            family and plays an important role in the success of the business.
            We'll reward your hard work with excellent opportunities to develop
            your career and fulfil your potential.
          </p>

          <p className="font-medium">
            If you're interested in joining us we'd love to hear from you.
          </p>
        </div>

        {/* Contact Info */}
        <div className="mt-12 border-t pt-8 space-y-3 text-lg">
          <p>
            <span className="font-semibold">Email:</span>{" "}
            <a
              href="mailto:applications@allspikes.com"
              className="text-black underline hover:text-gray-600"
            >
              applications@allspikes.com
            </a>
          </p>

          <p>
            <span className="font-semibold">Phone:</span> 01274 530 530
          </p>

          <p>
            <span className="font-semibold">Fax:</span> 01274 532 222
          </p>
        </div>
      </div>
    </section>
  )
}

export default Career
