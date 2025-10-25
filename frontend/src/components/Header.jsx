import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const headerEl = document.querySelector('header');
    const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 0;
    const pageOffset = window.pageYOffset || document.documentElement.scrollTop || 0;
    const y = el.getBoundingClientRect().top + pageOffset - headerHeight;
    window.scrollTo({ top: Math.max(y, 0), behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50"
    >
      <nav className="max-w-7xl mx-auto py-1 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center p-4 h-0">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-orange-300 via-pink-400 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">DataPulse</span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-10">
              <div className="relative group">
                <button onClick={() => scrollToId('products')} className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 font-medium">
                  <span>Products</span>
                  
                </button>
              </div>
              
              <div className="relative group">
                <button onClick={() => scrollToId('solutions')} className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 font-medium">
                  <span>Solutions</span>
                  
                </button>
              </div>

              <div className="relative group">
                <button onClick={() => scrollToId('resources')} className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 font-medium">
                  <span>Resources</span>
                  
                </button>
              </div>

              <button onClick={() => scrollToId('pricing')} className="text-gray-700 hover:text-gray-900 font-medium">
                Pricing
              </button>
            </div>

            <div className="flex items-center space-x-8">
              <button onClick={() => navigate('/register?mode=login')} className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 font-medium">
                <span>🔒</span>
                <span>Login</span>
              </button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-300"
                onClick={() => navigate('/register')}
              >
                Create free account
              </motion.button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden py-4"
          >
            <div className="flex flex-col space-y-4">
              <button onClick={() => scrollToId('products')} className="text-gray-700 hover:text-gray-900 font-medium text-left">Products</button>
              <button onClick={() => scrollToId('solutions')} className="text-gray-700 hover:text-gray-900 font-medium text-left">Solutions</button>
              <button onClick={() => scrollToId('resources')} className="text-gray-700 hover:text-gray-900 font-medium text-left">Resources</button>
              <button onClick={() => scrollToId('pricing')} className="text-gray-700 hover:text-gray-900 font-medium text-left">Pricing</button>
              <hr className="border-gray-200" />
              <button onClick={() => { navigate('/register?mode=login'); setIsMenuOpen(false); }} className="text-gray-700 hover:text-gray-900 font-medium text-left">Login</button>
              <button onClick={() => { navigate('/register'); setIsMenuOpen(false); }} className="bg-gray-900 text-white px-6 py-2 rounded-lg font-semibold text-left">
                Create free account
              </button>
            </div>
          </motion.div>
        )}
      </nav>
    </motion.header>
  );
};

export default Header;
