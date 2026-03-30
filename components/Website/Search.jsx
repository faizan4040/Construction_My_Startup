"use client";
import { Input } from "@/components/ui/input";
import { WEBSITE_SHOP } from "@/routes/WebsiteRoute";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IoSearchOutline } from "react-icons/io5";

const Search = ({ isShow }) => {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim() !== "") {
      // Redirect to shop/search page with query param
      router.push(`${WEBSITE_SHOP}?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div
      className={`
        fixed top-0 left-0 w-full bg-white z-10 transition-all duration-500
        ${isShow ? "h-24 opacity-100 py-5" : "h-0 opacity-0 py-0 pointer-events-none"}
      `}
    >
      <div className="max-w-4xl mx-auto px-5 md:px-32 flex items-center relative h-full">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="w-full md:h-12 pl-12 pr-12 rounded-full border border-gray-300 focus:border-black focus:ring-1 focus:ring-black transition-all"
          placeholder="Search products, categories, pages..."
        />
        <button
          type="button"
          onClick={handleSearch}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
        >
          <IoSearchOutline size={24} />
        </button>
      </div>
    </div>
  );
};

export default Search;
