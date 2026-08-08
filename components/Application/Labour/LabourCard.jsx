'use client'
import React, { useState } from 'react'
import { motion } from "framer-motion"
import { ArrowRight, Calendar, Clock, IndianRupee, MapPin, Star, User as UserIcon } from 'lucide-react';

const DURATION_CONFIG = {
    day: { label: "1 Day", days: 1, discount: 0 },
    week: { label: "7 Days", days: 7, discount: 0.05 },
    month: { label: "1 Month", days: 30, discount: 0.10 },
    year: { label: "1 Year", days: 365, discount: 0.20 },
};

function LabourCard({ labour, distance, onBook }) {
    const [duration, setDuration] = useState("day");

    const calculateEstimate = () => {
        if (!labour.dailyRate) return 0;
        const { days, discount } = DURATION_CONFIG[duration];
        const rawTotal = labour.dailyRate * days;
        return Math.round(rawTotal - rawTotal * discount);
    };

    const estimated = calculateEstimate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative bg-white border border-zinc-200 rounded-3xl overflow-hidden flex flex-col group cursor-default"
            style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
        >
            <div className='relative h-40 bg-zinc-50 flex items-center justify-center overflow-hidden'>
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                    }}
                />

                {labour.avatar?.url ? (
                    <motion.img
                        src={labour.avatar.url}
                        alt={labour.name}
                        className="relative z-10 h-28 w-28 rounded-full object-cover border-4 border-white shadow-lg"
                        whileHover={{ scale: 1.06 }}
                        transition={{ duration: 0.35 }}
                    />
                ) : (
                    <div className="relative z-10 h-28 w-28 rounded-full bg-zinc-200 flex items-center justify-center border-4 border-white shadow-lg">
                        <UserIcon size={40} className="text-zinc-400" />
                    </div>
                )}

                <div className='absolute bottom-3 right-3 z-20 flex items-center gap-1.5 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-full'>
                    <span className={`w-2 h-2 rounded-full ${labour.isOnline ? "bg-green-400" : "bg-zinc-400"}`} />
                    {labour.isOnline ? "Online" : "Offline"}
                </div>
                <div className='absolute bottom-3 left-3 z-20 flex items-center gap-1 bg-white border border-zinc-200 text-zinc-700 text-[10px] font-bold px-2.5 py-1.5 rounded-full shadow-sm'>
                    <Star size={9} className="fill-zinc-900 text-zinc-900" />
                    4.8
                </div>
            </div>

            <div className='h-px bg-zinc-100' />

            <div className='flex flex-col flex-1 p-5 gap-4'>
                <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0'>
                        <h3 className='text-zinc-900 text-base font-black tracking-tight leading-tight truncate'>{labour.name}</h3>
                        {distance !== undefined && (
                            <div className='mt-1.5 inline-flex items-center gap-1 bg-zinc-100 px-2.5 py-1 rounded-lg border border-zinc-200'>
                                <MapPin size={10} className="text-zinc-500" />
                                <span className='text-zinc-500 text-xs font-bold'>{distance.toFixed(1)} km away</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className='grid grid-cols-2 gap-2'>
                    <div className='bg-zinc-50 border border-zinc-100 rounded-2xl px-3.5 py-3'>
                        <div className='flex items-center gap-1.5 mb-1'>
                            <Clock size={11} className="text-zinc-400" />
                            <p className='text-zinc-400 text-[9px] uppercase tracking-widest font-bold'>Per Hour</p>
                        </div>
                        <p className='text-zinc-900 text-sm flex items-center font-black'>
                            <IndianRupee size={11} />{labour.hourlyRate ?? "—"}
                        </p>
                    </div>

                    <div className='bg-zinc-50 border border-zinc-100 rounded-2xl px-3.5 py-3'>
                        <div className='flex items-center gap-1.5 mb-1'>
                            <Calendar size={11} className="text-zinc-400" />
                            <p className='text-zinc-400 text-[9px] uppercase tracking-widest font-bold'>Per Day</p>
                        </div>
                        <p className='text-zinc-900 text-sm flex items-center font-black'>
                            <IndianRupee size={11} />{labour.dailyRate ?? "—"}
                        </p>
                    </div>
                </div>

                <div className='flex gap-1.5 bg-zinc-50 border border-zinc-100 rounded-2xl p-1'>
                    {Object.entries(DURATION_CONFIG).map(([key, cfg]) => (
                        <button
                            key={key}
                            onClick={() => setDuration(key)}
                            className={`flex-1 text-[10px] font-bold py-2 rounded-xl transition-colors ${
                                duration === key
                                    ? "bg-zinc-900 text-white"
                                    : "text-zinc-500 hover:bg-zinc-100"
                            }`}
                        >
                            {cfg.label}
                        </button>
                    ))}
                </div>

                <div className='flex items-end justify-between pt-3 border-t border-zinc-100'>
                    <div>
                        <p className='text-zinc-400 text-[9px] uppercase tracking-widest font-bold mb-0.5'>
                            Est. for {DURATION_CONFIG[duration].label}
                        </p>
                        <motion.div
                            key={estimated}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25 }}
                            className="flex items-baseline gap-0.5"
                        >
                            <IndianRupee size={16} className="text-zinc-900 mb-0.5" strokeWidth={2.5} />
                            <span className='text-zinc-900 text-3xl font-black tracking-tight leading-none'>{estimated}</span>
                        </motion.div>
                        {DURATION_CONFIG[duration].discount > 0 && (
                            <p className='text-green-600 text-[10px] font-bold mt-1'>
                                {DURATION_CONFIG[duration].discount * 100}% off applied
                            </p>
                        )}
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.92 }}
                        whileHover={{ scale: 1.04 }}
                        onClick={() => onBook(duration, estimated, labour.dailyRate)}
                        className="flex items-center gap-2 bg-zinc-900 hover:bg-black text-white text-sm font-black px-6 py-3.5 rounded-2xl transition-colors shadow-md"
                    >
                        Book
                        <motion.div
                            initial={{ x: 0 }}
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ArrowRight size={14} />
                        </motion.div>
                    </motion.button>
                </div>
            </div>
        </motion.div>
    )
}

export default LabourCard