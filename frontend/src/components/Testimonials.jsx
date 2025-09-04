import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      text: "DataPulse's advanced automation transformed our distribution network instantly. Simple, powerful platform with excellent support. Thousands of partners now engage seamlessly. Highly recommend!",
      company: "TATA CONSUMER PRODUCTS",
      logo: "TATA",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      id: 2,
      text: "We blindly trust DataPulse to send millions of messages to all our customers on different channels, daily. Super reliable.",
      author: "🎉",
      company: "SCGC BANK LTD",
      subtitle: "ಕನ್ನಡ ಬ್ಯಾಂಕ್",
      logo: "SCGC",
      gradient: "from-teal-500 to-blue-600"
    },
    {
      id: 3,
      text: "The AI-powered outreach has increased our conversion rates by 300%. The multi-channel approach works seamlessly across WhatsApp, SMS, and email.",
      company: "Business Standard",
      logo: "BS",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      id: 4,
      text: "Managing our entire sales pipeline through DataPulse has streamlined our operations. The Kanban board interface is intuitive and powerful.",
      company: "Sharekhan",
      logo: "SK",
      gradient: "from-green-500 to-teal-600"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Trusted by 5,000+ companies around the world
          </h2>
        </motion.div>

        <div className="relative max-w-6xl mx-auto">
          {/* Main testimonial cards */}
          <div className="flex justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-4xl"
              >
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Current testimonial */}
                  <motion.div
                    className="bg-white rounded-3xl p-8 shadow-2xl"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-r ${testimonials[currentIndex].gradient} rounded-2xl flex items-center justify-center mb-4`}>
                        <div className="text-white font-bold text-xl">
                          {testimonials[currentIndex].logo}
                        </div>
                      </div>
                      <div className="text-gray-900 font-semibold text-lg mb-2">
                        {testimonials[currentIndex].company}
                      </div>
                      {testimonials[currentIndex].subtitle && (
                        <div className="text-gray-600 text-sm">
                          {testimonials[currentIndex].subtitle}
                        </div>
                      )}
                    </div>
                    
                    <blockquote className="text-gray-700 text-lg leading-relaxed mb-6">
                      "{testimonials[currentIndex].text}"
                    </blockquote>
                    
                    <div className="flex items-center justify-between">
                      <button className="text-gray-900 font-semibold hover:text-gray-700 transition-colors duration-300 flex items-center">
                        Read case study →
                      </button>
                      {testimonials[currentIndex].author && (
                        <div className="text-2xl">
                          {testimonials[currentIndex].author}
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Next testimonial preview */}
                  <motion.div
                    className="bg-white rounded-3xl p-8 shadow-2xl opacity-75"
                    whileHover={{ scale: 1.02, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-r ${testimonials[(currentIndex + 1) % testimonials.length].gradient} rounded-2xl flex items-center justify-center mb-4`}>
                        <div className="text-white font-bold text-xl">
                          {testimonials[(currentIndex + 1) % testimonials.length].logo}
                        </div>
                      </div>
                      <div className="text-gray-900 font-semibold text-lg mb-2">
                        {testimonials[(currentIndex + 1) % testimonials.length].company}
                      </div>
                      {testimonials[(currentIndex + 1) % testimonials.length].subtitle && (
                        <div className="text-gray-600 text-sm">
                          {testimonials[(currentIndex + 1) % testimonials.length].subtitle}
                        </div>
                      )}
                    </div>
                    
                    <blockquote className="text-gray-700 text-lg leading-relaxed mb-6">
                      "{testimonials[(currentIndex + 1) % testimonials.length].text}"
                    </blockquote>
                    
                    <div className="flex items-center justify-between">
                      <button className="text-gray-900 font-semibold hover:text-gray-700 transition-colors duration-300 flex items-center">
                        Read case study →
                      </button>
                      {testimonials[(currentIndex + 1) % testimonials.length].author && (
                        <div className="text-2xl">
                          {testimonials[(currentIndex + 1) % testimonials.length].author}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation buttons */}
          <button
            onClick={prevTestimonial}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-300 z-10"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextTestimonial}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-300 z-10"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center mt-12 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white scale-125'
                  : 'bg-gray-600 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* See DataPulse in Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="bg-primary-100 rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="relative z-10">
              <div className="text-center mb-8">
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  See DataPulse in Action
                </h3>
                <button className="bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Schedule demo →
                </button>
              </div>

              {/* Dashboard Preview */}
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <div className="mb-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="text-2xl">👋</div>
                          <div>
                            <h4 className="font-bold text-lg">Hey Alex!</h4>
                            <p className="text-gray-600 text-sm">Get summary of your updates here.</p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">OTPFlow</span>
                            <span className="text-sm text-gray-600">SMS → RCS → WhatsApp</span>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-4 text-center">
                            <div>
                              <div className="text-2xl font-bold text-gray-900">587904</div>
                              <div className="text-xs text-gray-500">Total Request</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-green-600">582907</div>
                              <div className="text-xs text-gray-500">Delivered</div>
                              <div className="text-xs text-green-600">99.15%</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-red-600">4997</div>
                              <div className="text-xs text-gray-500">Failed</div>
                              <div className="text-xs text-red-600">0.85%</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-gray-900">25ms</div>
                              <div className="text-xs text-gray-500">Avg. Message Speed</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h5 className="font-semibold">Overall Delivery Rates</h5>
                        <div className="bg-purple-100 rounded-lg p-4 h-24 flex items-center">
                          <div className="w-full bg-purple-200 rounded-full h-4 relative">
                            <div className="bg-purple-500 h-4 rounded-full w-4/5"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-semibold mb-4">Delivery Success by Channel</h5>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-purple-100 rounded-lg">
                          <span className="font-medium">SMS</span>
                          <span className="font-bold">87.03%</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-yellow-100 rounded-lg">
                          <span className="font-medium">RCS</span>
                          <span className="font-bold">5.51%</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-teal-100 rounded-lg">
                          <span className="font-medium">WhatsApp</span>
                          <span className="font-bold">7.46%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Background decoration */}
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-gradient-to-br from-primary-200 to-teal-200 rounded-full blur-3xl opacity-30"></div>
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-gradient-to-br from-purple-200 to-primary-200 rounded-full blur-3xl opacity-30"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
