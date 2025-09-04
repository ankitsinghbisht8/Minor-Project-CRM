import React from 'react';
import { motion } from 'framer-motion';

const Features = () => {
  const features = [
    {
      icon: '🚀',
      title: 'AI-Powered Outreach',
      description: 'Automate your entire marketing workflow across WhatsApp, SMS, RCS, and Email with intelligent AI that personalizes every message.',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      icon: '📊',
      title: 'Seamless Sales Pipelines',
      description: 'Drag-and-drop Kanban board for deals. Visual pipeline management that makes tracking opportunities effortless and intuitive.',
      gradient: 'from-primary-500 to-primary-600'
    },
    {
      icon: '📱',
      title: 'Multi-Channel Engagement',
      description: 'Run bulk campaigns across Email, SMS, WhatsApp, and RCS from one unified platform. No more switching between tools.',
      gradient: 'from-teal-500 to-teal-600'
    },
    {
      icon: '📈',
      title: 'Analytics & Insights',
      description: 'Track delivery rates, success by channel, conversion metrics, and ROI with real-time dashboards and actionable insights.',
      gradient: 'from-pink-500 to-pink-600'
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            All-in-one CRM, unlike any other
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to capture leads, nurture prospects, and close deals faster. 
            Built for modern businesses that demand efficiency.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 h-full hover:shadow-2xl transition-all duration-300 group-hover:border-gray-200">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-gray-700 transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className={`h-1 w-full bg-gradient-to-r ${feature.gradient} rounded-full`}></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feature tabs section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="bg-gray-50 rounded-3xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                How it works?
              </h3>
              <p className="text-gray-600 text-lg">
                No manual follow-ups. No juggling multiple tools. 
                DataPulse automates your entire marketing workflow 
                across WhatsApp, SMS, RCS, and Email.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-2">Capture & Organize Leads</h4>
                    <p className="text-gray-600">
                      Automatically collect leads from websites, forms, emails & 
                      WhatsApp. Smart segmentation keeps everything organized 
                      in one place.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 opacity-60">
                  <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-500 mb-2">Engage & Automate Conversations</h4>
                  </div>
                </div>

                <div className="flex items-start space-x-4 opacity-60">
                  <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-500 mb-2">Track & Close Deals Faster</h4>
                  </div>
                </div>

                <div className="flex items-start space-x-4 opacity-60">
                  <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-500 mb-2">Analyze & Scale Growth</h4>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-primary-100 rounded-2xl p-6">
                  <div className="bg-white rounded-xl p-4 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                      <span className="text-sm text-gray-500">CRM Database</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full"></div>
                          <div>
                            <div className="font-medium text-sm">Lily Woods</div>
                            <div className="text-xs text-gray-500">lily@microsoft.com</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-600 font-medium text-sm">Won</div>
                          <div className="text-xs text-gray-500">RCS</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full"></div>
                          <div>
                            <div className="font-medium text-sm">Sophie Moore</div>
                            <div className="text-xs text-gray-500">sophie@apple.com</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-blue-600 font-medium text-sm">Call Scheduled</div>
                          <div className="text-xs text-gray-500">Email</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full"></div>
                          <div>
                            <div className="font-medium text-sm">Matt Cameron</div>
                            <div className="text-xs text-gray-500">matt@amazon.com</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-yellow-600 font-medium text-sm">Qualified</div>
                          <div className="text-xs text-gray-500">SMS</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full"></div>
                          <div>
                            <div className="font-medium text-sm">John Carter</div>
                            <div className="text-xs text-gray-500">john@tesla.com</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-purple-600 font-medium text-sm">First reached out</div>
                          <div className="text-xs text-gray-500">WhatsApp</div>
                        </div>
                      </div>

                      <button className="w-full mt-4 py-2 px-4 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                        Add New Lead
                      </button>
                    </div>
                  </div>
                  
                  <div className="absolute -bottom-2 -right-2 bg-primary-500 text-white px-3 py-1 rounded-lg text-sm font-medium">
                    New Lead Captured
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
