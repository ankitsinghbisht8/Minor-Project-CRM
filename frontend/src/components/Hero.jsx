import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="bg-gradient-to-br from-white to-purple-50 mt-16 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6"
            >
              The Only{' '}
              <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                CRM
              </span>{' '}
              You'll{' '}
              <span className="bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent">
                Ever Need
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed"
            >
              Stop juggling multiple tools. Centralize your contacts, automate 
              outreach, and close more deals—without the manual hassle. AI-powered, 
              multi-channel, and built for scale.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <button className="bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Start free trial →
              </button>
              <button className="border-2 border-gray-900 text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-900 hover:text-white transition-all duration-300 transform hover:scale-105">
                Schedule Demo
              </button>
            </motion.div>
          </motion.div>

          {/* Right Content - Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
              {/* Mock CRM Dashboard */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="text-sm text-gray-500">CRM Dashboard</div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3 shadow-sm border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <div>
                          <div className="font-medium text-sm">Success Rate</div>
                          <div className="text-xs text-gray-500">+12%</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-600 font-bold text-lg">100%</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3 shadow-sm border">
                      <div className="text-xs text-gray-500 mb-1">Won</div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-100 rounded flex items-center justify-center">
                          <span className="text-green-600 text-xs">✓</span>
                        </div>
                        <span className="font-medium text-sm">Microsoft</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm border">
                      <div className="text-xs text-gray-500 mb-1">Qualified</div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-yellow-100 rounded flex items-center justify-center">
                          <span className="text-yellow-600 text-xs">●</span>
                        </div>
                        <span className="font-medium text-sm">Apple</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 shadow-sm border">
                    <div className="text-xs text-gray-500 mb-2">Built for the New Age - 2025 & Beyond</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>Lily Woods - Won</span>
                        <span className="text-green-600">RCS</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>Sophie Moore - Call Scheduled</span>
                        <span className="text-blue-600">Email</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>Matt Cameron - Qualified</span>
                        <span className="text-purple-600">SMS</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating success indicator */}
              <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-3 border border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="text-xs text-gray-500">Success Rate</div>
                  <div className="text-green-600 font-bold">↗</div>
                </div>
                <div className="text-green-600 font-bold text-lg">100%</div>
              </div>
            </div>

            {/* Background decorations */}
            <div className="absolute -z-10 top-10 -right-10 w-72 h-72 bg-gradient-to-br from-primary-200 to-purple-200 rounded-full blur-3xl opacity-30"></div>
            <div className="absolute -z-10 -bottom-10 -left-10 w-72 h-72 bg-gradient-to-br from-teal-200 to-purple-200 rounded-full blur-3xl opacity-30"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
