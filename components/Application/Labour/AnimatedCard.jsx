'use client'
import React from 'react'
import { motion } from "framer-motion"

function AnimatedCard({ title, icon, children }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-4xl p-8 shadow-xl space-y-6"
    >
      <div className='flex items-center gap-2 font-semibold'>
        {icon}
        {title}
      </div>
      {children}
    </motion.div>
  )
}

export default AnimatedCard