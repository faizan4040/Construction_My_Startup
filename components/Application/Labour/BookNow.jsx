"use client";
import React from "react";
import { motion } from "framer-motion";
import { HardHat, Hammer, Wrench, Drill, ArrowRight } from "lucide-react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

const trades = [
  { icon: Hammer, label: "Masons" },
  { icon: Drill, label: "Electricians" },
  { icon: Wrench, label: "Plumbers" },
  { icon: HardHat, label: "Engineers" },
];

function HireLabour({ onAuthRequired }) {
  const auth = useSelector((state) => state.authStore.auth);
  const router = useRouter();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/heroImage.jpg')" }}
      />
      {/* Layered overlay: dark base + amber-tinted glow at bottom */}
      <div className="absolute inset-0 bg-linear-to-b from-black/90 via-black/80 to-black" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-linear-to-t from-amber-500/10 to-transparent" />
      {/* Subtle dot-grid texture */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 text-center">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 text-amber-400 font-mono text-xs tracking-[0.3em] uppercase mb-6"
        >
          <span className="h-px w-6 bg-amber-400/60" />
          Skilled Labour · On Demand
          <span className="h-px w-6 bg-amber-400/60" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-white font-black uppercase leading-[0.95] tracking-tight text-5xl sm:text-6xl md:text-8xl"
        >
          Hire Skilled
          <br />
          <span className="text-amber-400">Labour</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-6 max-w-xl text-gray-400 text-base sm:text-lg"
        >
          (In 30 Minutes at Home)
        </motion.p>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-6 max-w-xl text-gray-400 text-base sm:text-lg"
        >
          Masons, electricians, plumbers & more — verified workers, on your
          site, on your schedule.
        </motion.p>

        {/* Trade strip — signature element */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="relative mt-14 w-full max-w-md"
        >
          {/* connecting line */}
          <div className="absolute top-3.75 left-0 right-0 h-px bg-white/15" />
          <div
            className="absolute top-3.75 left-0 right-0 h-px"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(251,191,36,0.6) 0 6px, transparent 6px 12px)",
            }}
          />
          {/* traveling glow */}
          <motion.div
            className="absolute top-3.75 h-1.5 w-1.5 -mt-0.75 rounded-full bg-amber-400 shadow-[0_0_12px_2px_rgba(251,191,36,0.8)]"
            animate={{ left: ["0%", "100%"] }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "reverse",
            }}
          />

          <div className="relative flex justify-between">
            {trades.map(({ icon: Icon, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.9 + i * 0.1,
                  type: "spring",
                  stiffness: 200,
                }}
                whileHover={{ y: -4 }}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="h-8 w-8 rounded-full bg-black border border-white/20 flex items-center justify-center text-gray-400 group-hover:text-amber-400 group-hover:border-amber-400/50 transition-colors">
                  <Icon size={16} />
                </div>
                <span className="font-mono text-[10px] tracking-widest uppercase text-gray-500 group-hover:text-gray-300 transition-colors">
                  {label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          whileHover="hover"
          whileTap={{ scale: 0.96 }}
          className="mt-14 group flex items-center gap-2 px-10 py-4 bg-amber-400 text-black rounded-full font-bold uppercase tracking-wide text-sm shadow-[0_8px_30px_rgba(251,191,36,0.25)] hover:shadow-[0_8px_40px_rgba(251,191,36,0.4)] transition-shadow"
        >
          Coming Soon
          <motion.span variants={{ hover: { x: 4 } }} className="inline-flex">
            <ArrowRight size={18} />
          </motion.span>
        </motion.button>



        {/* <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          whileHover="hover"
          whileTap={{ scale: 0.96 }}
          className="mt-14 group flex items-center gap-2 px-10 py-4 bg-amber-400 text-black rounded-full font-bold uppercase tracking-wide text-sm shadow-[0_8px_30px_rgba(251,191,36,0.25)] hover:shadow-[0_8px_40px_rgba(251,191,36,0.4)] transition-shadow"
          onClick={() => (!auth ? onAuthRequired() : router.push("/user/book"))}
        >
          Hire Now
          <motion.span variants={{ hover: { x: 4 } }} className="inline-flex">
            <ArrowRight size={18} />
          </motion.span>
        </motion.button> */}
      </div>
    </div>
  );
}

export default HireLabour;