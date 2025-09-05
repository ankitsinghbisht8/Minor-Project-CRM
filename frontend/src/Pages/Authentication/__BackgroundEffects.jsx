import React, { useMemo } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

const __BackgroundEffects = ({ mouseX, mouseY, allowBlur = true }) => {
  const spring = useMemo(() => ({ stiffness: 80, damping: 20, mass: 0.4 }), [])

  const x1 = useSpring(useTransform(mouseX, (v) => v * 14), spring)
  const y1 = useSpring(useTransform(mouseY, (v) => v * 14), spring)
  const x2 = useSpring(useTransform(mouseX, (v) => v * -10), spring)
  const y2 = useSpring(useTransform(mouseY, (v) => v * -10), spring)
  const x3 = useSpring(useTransform(mouseX, (v) => v * 8), spring)
  const y3 = useSpring(useTransform(mouseY, (v) => v * 8), spring)
  const x4 = useSpring(useTransform(mouseX, (v) => v * -6), spring)
  const y4 = useSpring(useTransform(mouseY, (v) => v * -6), spring)

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden will-change-transform">
      <motion.div
        className={`absolute -top-24 -left-16 h-64 w-64 rounded-full bg-gradient-to-br from-cyan-200/40 to-blue-200/40 ${allowBlur ? 'blur-3xl' : 'blur-xl'}`}
        style={{ x: x1, y: y1 }}
        animate={{ y: [null, -12, 0], x: [null, 10, 0], rotate: [0, 12, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className={`absolute -bottom-28 -right-10 h-72 w-72 rounded-full bg-gradient-to-tr from-purple-200/40 to-indigo-200/40 ${allowBlur ? 'blur-3xl' : 'blur-xl'}`}
        style={{ x: x2, y: y2 }}
        animate={{ y: [null, 10, 0], x: [null, -8, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/3 right-1/3 h-40 w-40 rounded-3xl bg-gradient-to-br from-emerald-200/30 to-teal-200/30 blur-2xl"
        style={{ x: x3, y: y3 }}
        animate={{ rotate: [0, 15, -10, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 left-1/4 h-24 w-24 rounded-full bg-white/10 backdrop-blur-sm"
        style={{ x: x4, y: y4 }}
        animate={{ y: [0, -6, 0], x: [0, 6, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

export default __BackgroundEffects


