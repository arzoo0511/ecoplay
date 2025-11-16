import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Leaf, Bot } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const EcoChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm EcoBot 🌱 I'm here to help you with environmental questions. Ask me about climate change, recycling, renewable energy, or any eco-friendly topics!",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Environmental knowledge database
  const ecoKnowledge = {
    'climate change': {
      keywords: ['climate', 'global warming', 'greenhouse', 'carbon', 'emissions', 'temperature'],
      response: "Climate change refers to long-term shifts in global temperatures and weather patterns. Main causes include greenhouse gas emissions from burning fossil fuels. You can help by reducing energy consumption, using renewable energy, and supporting sustainable practices! 🌍"
    },
    'recycling': {
      keywords: ['recycle', 'waste', 'plastic', 'paper', 'glass', 'metal'],
      response: "Recycling helps reduce waste and conserve resources! Remember the 3 R's: Reduce, Reuse, Recycle. Different materials have different recycling processes - plastics should be clean, paper should be dry, and glass can be recycled indefinitely! ♻️"
    },
    'renewable energy': {
      keywords: ['solar', 'wind', 'renewable', 'clean energy', 'hydroelectric', 'geothermal'],
      response: "Renewable energy comes from natural sources that replenish themselves! Solar panels convert sunlight, wind turbines harness wind power, and hydroelectric uses flowing water. These sources produce clean energy without harmful emissions! ⚡"
    },
    'ocean pollution': {
      keywords: ['ocean', 'marine', 'plastic pollution', 'sea', 'fish', 'coral'],
      response: "Ocean pollution is a major threat to marine life! Plastic waste, chemical runoff, and oil spills harm ecosystems. You can help by reducing plastic use, participating in beach cleanups, and supporting ocean conservation efforts! 🌊"
    },
    'deforestation': {
      keywords: ['forest', 'trees', 'deforestation', 'logging', 'amazon'],
      response: "Forests are crucial for absorbing CO2 and providing oxygen! Deforestation contributes to climate change and habitat loss. Support sustainable forestry, plant trees, and choose products from responsible sources! 🌳"
    },
    'sustainable living': {
      keywords: ['sustainable', 'eco-friendly', 'green living', 'environment friendly'],
      response: "Sustainable living means meeting our needs without compromising future generations! Try using less water, choosing renewable energy, buying local products, reducing waste, and using public transport! 🌿"
    },
    'biodiversity': {
      keywords: ['biodiversity', 'species', 'extinction', 'wildlife', 'ecosystem'],
      response: "Biodiversity is the variety of life on Earth! It's essential for ecosystem stability. Threats include habitat loss and climate change. Support conservation efforts and create wildlife-friendly spaces! 🦋"
    },
    'water conservation': {
      keywords: ['water', 'conservation', 'drought', 'freshwater', 'save water'],
      response: "Water is precious! Simple ways to conserve: fix leaks, take shorter showers, use efficient appliances, collect rainwater, and choose drought-resistant plants for gardens! 💧"
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findBestResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    let bestMatch = '';
    let maxMatches = 0;

    for (const [topic, data] of Object.entries(ecoKnowledge)) {
      const matches = data.keywords.filter(keyword => 
        input.includes(keyword.toLowerCase())
      ).length;

      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = data.response;
      }
    }

    if (maxMatches > 0) {
      return bestMatch;
    }

    // Default responses for common questions
    if (input.includes('help') || input.includes('what can you do')) {
      return "I can help you with environmental topics like climate change, recycling, renewable energy, ocean conservation, sustainable living, and more! What would you like to know? 🌱";
    }

    if (input.includes('thank') || input.includes('thanks')) {
      return "You're welcome! Keep up the great work protecting our planet! 🌍 Is there anything else you'd like to know about environmental topics?";
    }

    // Generic environmental response
    return "That's an interesting environmental question! While I don't have specific information about that topic, I can help you with climate change, recycling, renewable energy, ocean conservation, and sustainable living practices. What would you like to explore? 🌿";
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: findBestResponse(inputText),
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
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
    <>
      {/* Chat Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all"
      >
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

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-24 right-6 z-50 w-80 h-96 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 p-4 border-b border-white/20">
              <div className="flex items-center space-x-3">
                <div className="bg-green-500 p-2 rounded-full">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">EcoBot</h3>
                  <p className="text-xs text-green-300">Environmental Assistant</p>
                </div>
                <div className="ml-auto">
                  <Leaf className="h-5 w-5 text-green-400" />
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 h-64 overflow-y-auto space-y-3">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.isUser
                        ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white'
                        : 'bg-white/20 text-white border border-white/30'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/20 text-white border border-white/30 p-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                        className="w-2 h-2 bg-green-400 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                        className="w-2 h-2 bg-green-400 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                        className="w-2 h-2 bg-green-400 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/20">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about environmental topics..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-blue-300 focus:outline-none focus:border-green-400 text-sm"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-2 rounded-xl hover:from-green-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EcoChatbot;