'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

export default function BackButton({ href, className = '' }) {
  const router = useRouter()
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.88 }}
      onClick={() => (href ? router.push(href) : router.back())}
      aria-label="Go back"
      className={`w-11 h-11 rounded-full bg-white border border-zinc-200 shadow-md flex items-center justify-center hover:bg-zinc-50 transition-colors ${className}`}
    >
      <ArrowLeft size={17} className="text-zinc-900" />
    </motion.button>
  )
}