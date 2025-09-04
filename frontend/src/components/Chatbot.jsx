import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "👋 Hi! I'm DataPulse AI Assistant. I can help you with questions about our CRM features, pricing, integrations, or anything else you'd like to know!",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Check if Gemini API is available
  const isGeminiAvailable = () => {
    const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
    return API_KEY && API_KEY !== 'demo_mode' && API_KEY !== 'YOUR_GEMINI_API_KEY_HERE';
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Demo responses for when API key is not available
  const getDemoResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('feature') || message.includes('what') && message.includes('offer')) {
      return "DataPulse CRM offers Sales Automation, Marketing Automation, WhatsApp Business integration, Email Marketing, SMS campaigns, and Advanced Analytics. Our AI-powered platform helps automate your entire sales pipeline with drag-and-drop Kanban boards and multi-channel engagement. Would you like to know more about any specific feature?";
    }
    
    if (message.includes('price') || message.includes('cost') || message.includes('pricing')) {
      return "We offer flexible pricing plans starting from $29/month for small businesses. Enterprise plans include advanced AI features and unlimited contacts. All plans come with a 14-day free trial and no credit card required to start. Would you like me to connect you with our sales team for a custom quote?";
    }
    
    if (message.includes('free') || message.includes('trial')) {
      return "Yes! DataPulse offers a completely free 14-day trial with full access to all features. No credit card required to start. You can explore our Sales CRM, Marketing Automation, and AI-powered tools during your trial period. Ready to get started?";
    }
    
    if (message.includes('integration') || message.includes('connect')) {
      return "DataPulse integrates with 200+ popular tools including Salesforce, HubSpot, Gmail, Outlook, Slack, Zapier, and social media platforms. Our API allows custom integrations too. We also have native WhatsApp Business, SMS, and email marketing integrations built-in.";
    }
    
    if (message.includes('ai') || message.includes('automation')) {
      return "Our AI automation includes smart lead scoring, automated follow-up sequences, personalized email content generation, and predictive analytics. The system learns from your successful campaigns to optimize future outreach automatically. It can increase conversion rates by up to 300%!";
    }
    
    if (message.includes('support') || message.includes('help')) {
      return "We provide 24/7 customer support via chat, email, and phone. Plus comprehensive onboarding, training webinars, and a detailed knowledge base. Our average response time is under 2 minutes for chat support.";
    }
    
    if (message.includes('demo') || message.includes('see')) {
      return "I'd love to show you DataPulse in action! You can schedule a personalized demo with our team or start your free trial immediately. The demo covers all features including our AI automation, sales pipeline, and marketing tools. Would you prefer a live demo or to explore on your own?";
    }
    
    // Default response
    return "Thanks for your question! DataPulse is an all-in-one CRM with AI-powered automation that helps businesses manage contacts, automate outreach, and close more deals. We serve 5,000+ companies worldwide with features like multi-channel marketing, sales pipeline management, and advanced analytics. What specific aspect would you like to know more about?";
  };

  const generateBotResponse = async (userMessage) => {
    try {
      if (!isGeminiAvailable()) {
        // Demo mode - use predefined responses
        return getDemoResponse(userMessage);
      }

      const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

      // Create a context-aware prompt for CRM-related queries
      const prompt = `You are DataPulse AI Assistant, a helpful chatbot for a CRM (Customer Relationship Management) platform called DataPulse. 

Key information about DataPulse CRM:
- It's an all-in-one CRM with AI-powered automation
- Features include: Sales CRM, Marketing Automation, WhatsApp Business, Email Marketing, SMS Marketing, Analytics
- Multi-channel engagement across Email, WhatsApp, SMS, and RCS
- Drag-and-drop Kanban boards for sales pipeline management
- AI-powered outreach and personalization
- Used by 5,000+ companies worldwide
- Offers solutions for Small Business, Enterprise, E-commerce, Real Estate, Healthcare, Education
- 14-day free trial, no credit card required
- 99.9% uptime, 24/7 support

User question: "${userMessage}"

Please provide a helpful, friendly, and informative response. If the question is about CRM features, pricing, or business needs, provide specific information about DataPulse. If it's a general question, still be helpful but try to relate it back to how DataPulse might help their business when appropriate. Keep responses concise but informative (2-4 sentences max).`;

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Unexpected response format');
      }
      
    } catch (error) {
      console.error('Error generating response:', error);
      return getDemoResponse(userMessage);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const botResponse = await generateBotResponse(userMessage.content);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm sorry, I encountered an error. Please try again or contact our support team for assistance.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "What features does DataPulse CRM offer?",
    "How much does it cost?",
    "Can I try it for free?",
    "What integrations are available?",
    "How does the AI automation work?"
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-24 right-6 w-96 h-[32rem] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-purple-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">🤖</span>
                </div>
                <div>
                  <h3 className="font-semibold">DataPulse Assistant</h3>
                  <p className="text-xs opacity-90">Online • Typically replies instantly</p>
                </div>
              </div>
              <button
                onClick={onToggle}
                className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <span className="text-lg">×</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-primary-500 text-white rounded-br-md'
                      : 'bg-white text-gray-800 rounded-bl-md shadow-sm border'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-primary-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm border px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="p-4 border-t bg-white">
              <p className="text-xs text-black mb-2">Quick questions:</p>
              <div className="space-y-2">
                {quickQuestions.slice(0, 3).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="w-full text-left text-xs text-black p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 text-sm disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="text-sm">📤</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {!isGeminiAvailable() ? 'Demo Mode • ' : 'Powered by DataPulse.io • '} Press Enter to send
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Chatbot;
