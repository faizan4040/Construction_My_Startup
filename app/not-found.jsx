"use client";

import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white px-6">
      <div className="text-center max-w-xl">

        {/* 404 */}
        <h1 className="text-[120px] md:text-[180px] font-extrabold leading-none text-yellow-500">
          404
        </h1>

        <h2 className="text-3xl md:text-4xl font-bold mt-4">
          Page Not Found
        </h2>

        <p className="text-gray-400 mt-4 text-lg">
          Sorry, the page you're looking for doesn't exist or may have
          been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">

          <button
            onClick={() => router.push("/")}
            className="px-7 py-3 bg-yellow-500 text-black rounded-full
                       font-semibold hover:bg-yellow-400 transition cursor-pointer"
          >
            Go Home
          </button>

          <button
            onClick={() => router.back()}
            className="px-7 py-3 border border-white rounded-full
                       hover:bg-white hover:text-black transition cursor-pointer"
          >
            Go Back
          </button>

        </div>
      </div>
    </main>
  );
}