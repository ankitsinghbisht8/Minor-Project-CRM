import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ProductPreview = () => {
  const [activeTab, setActiveTab] = useState('sales');

  const tabs = [
    { id: 'sales', label: '🔥 Sales Deals', icon: '💼' },
    { id: 'leads', label: '📈 Leads', icon: '🎯' },
    { id: 'campaigns', label: '🎪 Track Candidates', icon: '👥' },
    { id: 'fundraising', label: '💚 Fundraising', icon: '💰' },
    { id: 'influencers', label: '🌟 Influencers List', icon: '✨' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'sales':
        return (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">🚀 Sales Deals</span>
                <div className="flex items-center space-x-2">
                  <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-600">⚡</span>
                  </button>
                  <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-600">⋯</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">DataPulse</h3>
                <div className="flex items-center space-x-2">
                  <input type="text" placeholder="Search" className="px-3 py-2 border rounded-lg text-sm" />
                  <button className="px-3 py-2 bg-gray-100 rounded-lg text-sm">🔧 Kanban view</button>
                  <button className="px-3 py-2 bg-gray-100 rounded-lg text-sm">🔽 Filter</button>
                  <button className="px-3 py-2 bg-gray-100 rounded-lg text-sm">📊 Sort</button>
                  <button className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm">+ Add</button>
                  <button className="px-3 py-2 bg-gray-100 rounded-lg text-sm">⚙️ View Settings</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-4">
              {/* First Reach Out */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-gray-700">First Reach Out</h4>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">3</span>
                </div>
                <div className="space-y-2">
                  <div className="bg-white border rounded-lg p-3 shadow-sm">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-xs">👤</span>
                      </div>
                      <span className="font-medium text-sm">Levia Regal</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>💼 LinkedIn</span>
                      <span>👨‍💼 Chief Operating Officer</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">100</div>
                  </div>
                </div>
              </div>

              {/* Call Scheduled */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-gray-700">Call Scheduled</h4>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">4</span>
                </div>
                <div className="space-y-2">
                  <div className="bg-white border rounded-lg p-3 shadow-sm">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs">👤</span>
                      </div>
                      <span className="font-medium text-sm">Leonora Mausum</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>🛒 Amazon</span>
                      <span>📚 Education and Enablement Ma...</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Qualified */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-gray-700">Qualified</h4>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">1</span>
                </div>
                <div className="space-y-2">
                  <div className="bg-white border rounded-lg p-3 shadow-sm">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-xs">👤</span>
                      </div>
                      <span className="font-medium text-sm">Loreen Markebiano</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>📱 Microsoft</span>
                      <span>👨‍💻 Software Engineer</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Won */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-gray-700">Won</h4>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">1</span>
                </div>
                <div className="space-y-2">
                  <div className="bg-white border rounded-lg p-3 shadow-sm">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-xs">👤</span>
                      </div>
                      <span className="font-medium text-sm">Aja Garrett</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>⚡ Tesla</span>
                      <span>📱 VP/GM Android Ecosystem</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lost */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-gray-700">Lost</h4>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">1</span>
                </div>
                <div className="space-y-2">
                  <div className="bg-white border rounded-lg p-3 shadow-sm">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-xs">👤</span>
                      </div>
                      <span className="font-medium text-sm">Carma Vanthuesen</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>🔍 Google</span>
                      <span>👨‍💻 Software Engineer I</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional deals in pipeline */}
            <div className="mt-6 grid grid-cols-5 gap-4">
              <div className="bg-white border rounded-lg p-3 shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full"></div>
                  <span className="font-medium text-sm">Jerry Dallien</span>
                </div>
                <div className="text-xs text-gray-500">🍎 Apple • Senior Data Engineer</div>
                <div className="text-xs text-gray-600 mt-1">200</div>
              </div>

              <div className="bg-white border rounded-lg p-3 shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-full"></div>
                  <span className="font-medium text-sm">Kirk Henritt</span>
                </div>
                <div className="text-xs text-gray-500">💼 Tata Consultancy Services</div>
              </div>

              <div className="bg-white border rounded-lg p-3 shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full"></div>
                  <span className="font-medium text-sm">Jutta Amyet</span>
                </div>
                <div className="text-xs text-gray-500">🔍 Google • Staff Software Engineer</div>
                <div className="text-xs text-gray-600 mt-1">10000</div>
              </div>
            </div>
          </div>
        );
      case 'campaigns':
        return (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Campaign Manager</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-purple-50 rounded-xl p-6">
                  <div className="text-purple-600 text-3xl mb-4">📊</div>
                  <h4 className="font-bold text-lg mb-2">WhatsApp Campaign</h4>
                  <p className="text-gray-600">Product launch campaign with 638,222 total audience</p>
                  <div className="mt-4 flex justify-between">
                    <span className="text-sm text-gray-500">Delivered: 582,907</span>
                    <span className="text-green-600 font-bold">99.15%</span>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-xl p-6">
                  <div className="text-blue-600 text-3xl mb-4">📱</div>
                  <h4 className="font-bold text-lg mb-2">SMS Campaign</h4>
                  <p className="text-gray-600">Remarketing campaign across all contacts</p>
                  <div className="mt-4 flex justify-between">
                    <span className="text-sm text-gray-500">Failed: 4,997</span>
                    <span className="text-red-600 font-bold">0.85%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{tabs.find(t => t.id === activeTab)?.label}</h3>
            <p className="text-gray-600">Feature preview coming soon...</p>
          </div>
        );
    }
  };

  return (
    <section id="solutions" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            One CRM for Everything—Sales, <br />
            Engagement & Growth
          </h2>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gray-900 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {renderTabContent()}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-purple-500 to-primary-500 rounded-3xl p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              CRM + AI-Powered Outreach
            </h3>
            <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
              Manage contacts and automate conversations across Email, 
              WhatsApp, SMS & more. Engage leads across multiple 
              channels directly from your CRM. AI-driven automation 
              schedules follow-ups and personalizes outreach.
            </p>
            <button className="bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
              Start free trial →
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductPreview;
