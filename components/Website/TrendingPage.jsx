import { IMAGES } from "@/routes/AllImages";
import React from "react";
import { FaBox } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import { GrUserWorker } from "react-icons/gr";



const TrendingPage = () => {
  return (
    <div className="w-full px-4 md:px-12 py-10 bg-gray-100">
      <div className="max-w-8xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[220px]">
        
        {/* Browse Materials */}
        <div className="bg-gray-200 p-6 rounded-2xl flex flex-col justify-between hover:shadow-lg transition">
          <div>
            <div className="mb-3 text-2xl"><FaBox /></div>
            <h2 className="text-2xl font-bold mb-1">Browse Materials</h2>
            <p className="text-gray-600 text-sm">
              Access a global supply chain of high-grade construction materials.
            </p>
          </div>
          <button className="mt-4 cursor-pointer hover:bg-orange-500 font-semibold hover:text-black transition-all duration-300 bg-black text-white px-4 py-2 rounded-full w-fit text-sm">
            View Catalog
          </button>
        </div>

        {/* Image Card */}
        <div className="rounded-2xl overflow-hidden hover:shadow-lg transition">
          <img
            src={IMAGES.construction}
            alt="construction"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Hire Labor */}
        <div className="bg-orange-500 text-white p-6 rounded-2xl flex flex-col justify-between hover:shadow-lg transition">
          <div>
            <div className="mb-3 text-2xl"><GrUserWorker /></div>
            <h2 className="text-2xl font-bold mb-1">Hire Labor</h2>
            <p className="text-sm">
              Verified professionals for plumbing, electrical, and construction work.
            </p>
          </div>
          <button className="mt-4 bg-white text-orange-500 transition-all duration-300 hover:bg-black cursor-pointer font-semibold px-4 py-2 rounded-full w-fit text-sm">
            Find Experts
          </button>
        </div>

        {/* Shop Search */}
        <div className="bg-gray-200 p-6 rounded-2xl flex flex-col justify-between hover:shadow-lg transition">
          <div>
            <div className="mb-3 text-2xl"><FaSearch /></div>
            <h2 className="text-2xl font-bold mb-1">Shop Search</h2>
            <p className="text-gray-600 text-sm">
              Locate authorized distributors near your construction site.
            </p>
          </div>
          <button className="mt-4 cursor-pointer hover:text-black text-orange-500 font-semibold text-sm">
            Explore Map →
          </button>
        </div>

        {/* Live Market Trends */}
        <div className="bg-gray-200 p-6 rounded-2xl md:col-span-2 flex flex-col md:flex-row md:items-center md:justify-between hover:shadow-lg transition">
          
          {/* Left Content */}
          <div>
            <h2 className="text-2xl font-bold mb-1">Live Market Trends</h2>
            <p className="text-gray-600 text-sm">
              Real-time price tracking for construction materials.
            </p>
          </div>

          {/* Right Stats */}
          <div className="flex gap-10 mt-4 md:mt-0">
            <div>
              <p className="text-gray-500 text-xs">STEEL</p>
              <p className="text-red-500 font-semibold">↓ 1.2%</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">CEMENT</p>
              <p className="text-green-500 font-semibold">↑ 0.8%</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default TrendingPage;