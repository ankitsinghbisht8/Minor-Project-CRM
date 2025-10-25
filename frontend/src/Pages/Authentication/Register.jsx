import React, { Suspense, lazy, useEffect, useRef, useState, startTransition } from 'react'
import { AnimatePresence, motion, useMotionValue, useReducedMotion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import RegisterForm from '../../components/AuthComponents/RegisterForm'
import LoginForm from '../../components/AuthComponents/LoginForm'
import { useNavigate } from 'react-router-dom'

const BackgroundEffects = lazy(() => import('./__BackgroundEffects'))

const Register = () => {
  const [isLogin, setIsLogin] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const reduced = useReducedMotion()
  const [showBg, setShowBg] = useState(false)
  const rafId = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const onClickSignIn=()=>{
    setIsLogin(true);
  }

  useEffect(() => {
    const onMove = (e) => {
      if (rafId.current) return
      rafId.current = requestAnimationFrame(() => {
        const nx = (e.clientX / window.innerWidth) * 2 - 1
        const ny = (e.clientY / window.innerHeight) * 2 - 1
        mouseX.set(nx)
        mouseY.set(ny)
        rafId.current = null
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    const t = setTimeout(() => setShowBg(true), 250)
    return () => { clearTimeout(t); window.removeEventListener('pointermove', onMove) }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('mode') === 'login') {
      setIsLogin(true)
    }
  }, [location.search])

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="fixed inset-0">
        <div className="h-full w-full bg-gradient-to-br from-blue-50 via-cyan-50 to-emerald-50" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={isLogin ? 'paint-login' : 'paint-register'}
          initial={reduced ? false : { clipPath: isLogin ? 'circle(0% at 100% 0%)' : 'circle(0% at 0% 100%)', rotate: isLogin ? -6 : 6, scale: 0.96, opacity: 0.9 }}
          animate={reduced ? { opacity: 1 } : { clipPath: 'circle(140% at 50% 50%)', rotate: 0, scale: 1, opacity: 1 }}
          exit={reduced ? { opacity: 0.95 } : { clipPath: isLogin ? 'circle(0% at 100% 0%)' : 'circle(0% at 0% 100%)', rotate: isLogin ? 4 : -4, scale: 0.98, opacity: 0.96 }}
          transition={reduced ? { duration: 0.2 } : { type: 'spring', stiffness: 120, damping: 22, mass: 0.9 }}
          className="fixed inset-0 will-change-transform transform-gpu"
          style={{ contain: 'paint' }}
        >
          <div className={`absolute inset-0 ${isLogin ? 'bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-100' : 'bg-gradient-to-br from-blue-50 via-cyan-50 to-emerald-100'}`} />
          {!reduced && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0.25, scale: 0.98 }}
              animate={{ opacity: 0.08, scale: 1.02 }}
              exit={{ opacity: 0.18, scale: 1 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: 'radial-gradient(60% 60% at 50% 50%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 70%)',
                mixBlendMode: 'overlay',
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden'
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {!reduced && showBg && (
        <Suspense fallback={null}>
          <BackgroundEffects mouseX={mouseX} mouseY={mouseY} allowBlur={(navigator.deviceMemory || 8) >= 4} />
        </Suspense>
      )}

      <div className="relative z-10 flex min-h-screen items-center justify-center py-12 px-4">
        <motion.div
          className="w-full max-w-md will-change-transform transform-gpu"
          initial={false}
          animate={{ rotate: isLogin ? 0.2 : -0.2, scale: [0.995, 1] }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          layout
          style={{ perspective: 1000 }}
        >
          <div className="mb-6 flex justify-center">
            <div className="inline-flex rounded-full bg-white/80 p-1 shadow backdrop-blur">
              <button
                type="button"
                onClick={() => startTransition(() => setIsLogin(false))}
                className={`px-4 py-2 text-sm font-medium rounded-full transition ${!isLogin ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Create account
              </button>
              <button
                type="button"
                onClick={() => onClickSignIn()}
                className={`px-4 py-2 text-sm font-medium rounded-full transition ${isLogin ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Sign in
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login"
                initial={reduced ? { opacity: 0 } : { y: 10, opacity: 0, rotateY: -8, scale: 0.985 }}
                animate={reduced ? { opacity: 1 } : { y: 0, opacity: 1, rotateY: 0, scale: 1 }}
                exit={reduced ? { opacity: 0 } : { y: -10, opacity: 0, rotateY: 8, scale: 0.985 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <LoginForm onToggleToRegister={() => setIsLogin(false)} />
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={reduced ? { opacity: 0 } : { y: 10, opacity: 0, rotateY: 8, scale: 0.985 }}
                animate={reduced ? { opacity: 1 } : { y: 0, opacity: 1, rotateY: 0, scale: 1 }}
                exit={reduced ? { opacity: 0 } : { y: -10, opacity: 0, rotateY: -8, scale: 0.985 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <RegisterForm onToggleToLogin={() => setIsLogin(true)} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

export default Register
