import React from 'react';
import { motion } from 'framer-motion';

const TrustedBy = () => {
  const companies = [
    { name: 'AXIS BANK', logo: 'AXIS BANK' },
    { name: 'STAR+', logo: 'ST★R+' },
    { name: 'Sharekhan', logo: 'Sharekhan' },
    { name: 'Blackstone', logo: 'Blackstone' },
    { name: 'Indiabulls', logo: 'Indiabulls' },
    { name: 'Business Standard', logo: 'Business Standard' },
  ];

  return (
    <section className="bg-gray-900 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Trusted by 5,000+ companies around the world
          </h2>
        </motion.div>

        {/* Company Logos Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center"
        >
          {companies.map((company, index) => (
            <motion.div
              key={company.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center justify-center h-16"
            >
              <div className="text-gray-400 hover:text-white transition-colors duration-300 text-center">
                <div className="font-bold text-lg whitespace-nowrap">
                  {company.logo}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Infinite scroll animation for additional effect */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 overflow-hidden"
        >
          <motion.div
            animate={{ x: [-1000, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="flex space-x-12 items-center whitespace-nowrap"
          >
            {[...companies, ...companies].map((company, index) => (
              <div
                key={`scroll-${index}`}
                className="text-gray-500 font-semibold text-sm flex-shrink-0"
              >
                {company.logo}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustedBy;
