import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Leaf, MessageCircle, Send, X } from 'lucide-react';
import { inputClass, modalPanel, primaryButton } from '../lib/ui';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const EcoChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPulse, setShowPulse] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowPulse(false), 4500);
    return () => clearTimeout(timer);
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm EcoBot and I'm here to help you with environmental questions. Ask me about climate change, recycling, renewable energy, or any eco-friendly topics!",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const ecoKnowledge = {
    'climate change': {
      keywords: ['climate', 'global warming', 'greenhouse', 'carbon', 'emissions', 'temperature'],
      response: "Climate change refers to long-term shifts in global temperatures and weather patterns. Main causes include greenhouse gas emissions from burning fossil fuels. You can help by reducing energy consumption, using renewable energy, and supporting sustainable practices!"
    },
    'recycling': {
      keywords: ['recycle', 'waste', 'plastic', 'paper', 'glass', 'metal'],
      response: "Recycling helps reduce waste and conserve resources. Remember the 3 R's: Reduce, Reuse, Recycle. Different materials have different recycling processes, so keep plastics clean, paper dry, and glass separated when possible."
    },
    'renewable energy': {
      keywords: ['solar', 'wind', 'renewable', 'clean energy', 'hydroelectric', 'geothermal'],
      response: 'Renewable energy comes from natural sources that replenish themselves. Solar, wind, hydroelectric, and geothermal energy all help reduce harmful emissions and support a cleaner future.'
    },
    'ocean pollution': {
      keywords: ['ocean', 'marine', 'plastic pollution', 'sea', 'fish', 'coral'],
      response: 'Ocean pollution is a major threat to marine life. Reducing single-use plastics, joining cleanups, and supporting conservation work are all meaningful ways to help.'
    },
    'deforestation': {
      keywords: ['forest', 'trees', 'deforestation', 'logging', 'amazon'],
      response: 'Forests are crucial for absorbing CO2, producing oxygen, and protecting biodiversity. Supporting sustainable forestry and planting trees are powerful steps.'
    },
    'sustainable living': {
      keywords: ['sustainable', 'eco-friendly', 'green living', 'environment friendly'],
      response: 'Sustainable living means meeting today’s needs without compromising future generations. Try reducing waste, saving water, choosing renewable energy, and buying locally when you can.'
    },
    'biodiversity': {
      keywords: ['biodiversity', 'species', 'extinction', 'wildlife', 'ecosystem'],
      response: 'Biodiversity is the variety of life on Earth, and it helps ecosystems stay resilient. Protecting habitats and supporting conservation efforts keeps ecosystems healthy.'
    },
    'water conservation': {
      keywords: ['water', 'conservation', 'drought', 'freshwater', 'save water'],
      response: 'Water is precious. Fixing leaks, taking shorter showers, collecting rainwater, and using efficient appliances are simple ways to conserve it.'
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const findBestResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    let bestMatch = '';
    let maxMatches = 0;

    for (const [, data] of Object.entries(ecoKnowledge)) {
      const matches = data.keywords.filter((keyword) => input.includes(keyword.toLowerCase())).length;

      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = data.response;
      }
    }

    if (maxMatches > 0) return bestMatch;

    if (input.includes('help') || input.includes('what can you do')) {
      return 'I can help with climate change, recycling, renewable energy, ocean conservation, sustainable living, and other environmental topics.';
    }

    if (input.includes('thank') || input.includes('thanks')) {
      return "You're welcome. Keep up the great work protecting our planet.";
    }

    return "That's an interesting question. I can best help with climate change, recycling, renewable energy, ocean conservation, biodiversity, and sustainable living practices.";
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const pendingText = inputText;
    const userMessage: Message = {
      id: Date.now().toString(),
      text: pendingText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: findBestResponse(pendingText),
        isUser: false,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1, duration: 0.5, ease: 'easeOut' }}
    >
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chatbot' : 'Open sustainability chatbot'}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 p-4 text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:shadow-xl"
      >
        {!isOpen && showPulse && (
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30" />
        )}
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
  {isOpen && (
    <>
      {/* Invisible overlay capturing clicks outside the widget */}
      <div 
        className="fixed inset-0 z-40 bg-transparent cursor-default" 
        onClick={() => setIsOpen(false)} 
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        className="fixed bottom-6 right-6 z-50 h-[450px] w-80 md:w-96 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl flex flex-col overflow-hidden"
      >
            <div className="border-b border-slate-200/70 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-4 transition-theme duration-300 dark:border-white/10">
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-emerald-500 p-2">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">EcoBot</h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-300">Environmental Assistant</p>
                </div>
                <div className="ml-auto">
                  <Leaf className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                </div>
              </div>
            </div>

            <div className="flex h-64 flex-1 flex-col space-y-3 overflow-y-auto p-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 ${
                      message.isUser
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                        : 'border border-slate-200/80 bg-white/80 text-slate-700 transition-theme duration-300 dark:border-white/10 dark:bg-white/10 dark:text-slate-100'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p className="mt-1 text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 text-slate-700 transition-theme duration-300 dark:border-white/10 dark:bg-white/10 dark:text-slate-100">
                    <div className="flex space-x-1">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                        className="h-2 w-2 rounded-full bg-emerald-400"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                        className="h-2 w-2 rounded-full bg-emerald-400"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                        className="h-2 w-2 rounded-full bg-emerald-400"
                      />
                    </div>
                  </div>
                </motion.div>
              
              )}
            

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-slate-200/70 p-4 transition-theme duration-300 dark:border-white/10">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about environmental topics..."
                  className={`${inputClass} flex-1 py-2 text-sm`}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className={`${primaryButton} px-3 py-2`}
                >
                  <Send className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EcoChatbot;
