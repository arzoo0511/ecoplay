import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, CheckCircle2, XCircle, RefreshCw, HelpCircle, Leaf, Recycle, Globe } from 'lucide-react';

// 1. Core Data Structures & Types
interface Question {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface Category {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  badgeName: string;
  badgeIcon: string;
  questions: Question[];
}

const QUIZ_CATEGORIES: Category[] = [
  {
    id: 'climate',
    title: 'Climate Change',
    icon: <Globe className="w-6 h-6 text-cyan-500" />,
    color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30',
    badgeName: 'Climate Guardian',
    badgeIcon: '🌍',
    questions: [
      {
        id: 1,
        text: 'Which greenhouse gas is primarily released by human activities like burning fossil fuels?',
        options: ['Carbon Dioxide (CO2)', 'Methane (CH4)', 'Nitrous Oxide (N2O)', 'Ozone (O3)'],
        correctIndex: 0,
        explanation: 'While methane is highly potent, Carbon Dioxide (CO2) from fossil fuel combustion makes up the largest volume of human-induced greenhouse gas emissions.'
      }
    ]
  },
  {
    id: 'recycling',
    title: 'Smart Recycling',
    icon: <Recycle className="w-6 h-6 text-emerald-500" />,
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
    badgeName: 'Zero Waste Hero',
    badgeIcon: '♻️',
    questions: [
      {
        id: 1,
        text: 'What is the ideal first step in the waste management hierarchy before recycling?',
        options: ['Incineration', 'Reducing and Reusing', 'Composting', 'Landfilling'],
        correctIndex: 1,
        explanation: 'Reducing waste generation at the source and reusing products are much more effective at lowering resource demands than recycling alone.'
      }
    ]
  },
  {
    id: 'biodiversity',
    title: 'Biodiversity',
    icon: <Leaf className="w-6 h-6 text-green-500" />,
    color: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    badgeName: 'Ecosystem Champion',
    badgeIcon: '🦊',
    questions: [
      {
        id: 1,
        text: 'What term describes a species that has an exceptionally large effect on its ecosystem structure relative to its abundance?',
        options: ['Indicator species', 'Exotic species', 'Keystone species', 'Invasive species'],
        correctIndex: 2,
        explanation: 'Keystone species (like sea otters or wolves) hold entire ecosystems together. Without them, the ecosystem would look drastically different or fail entirely.'
      }
    ]
  }
];

export const QuizGame: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);

  const handleAnswerSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);

    if (index === selectedCategory!.questions[currentQuestionIndex].correctIndex) {
      setScore((prev) => prev + 1);
      setTotalPoints((prev) => prev + 15);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);

    if (currentQuestionIndex + 1 < selectedCategory!.questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setQuizCompleted(true);
      if (score + (selectedAnswer === selectedCategory!.questions[currentQuestionIndex].correctIndex ? 1 : 0) === selectedCategory!.questions.length) {
        if (!earnedBadges.includes(selectedCategory!.badgeName)) {
          setEarnedBadges((prev) => [...prev, selectedCategory!.badgeName]);
        }
      }
    }
  };

  const resetQuiz = () => {
    setSelectedCategory(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#0B1528] text-slate-800 dark:text-slate-100 pt-24">
      <div className="max-w-4xl mx-auto">
        
        {/* Top Header Points Panel */}
        <div className="flex justify-between items-center mb-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-md">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Eco-Learning Hub</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Test your ecological intelligence</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Total Score</span>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{totalPoints} XP</p>
            </div>
            <div className="flex gap-2">
              {earnedBadges.map((badge, idx) => (
                <span key={idx} title={badge} className="text-2xl bg-slate-100 dark:bg-slate-800 p-2 rounded-full shadow-inner animate-bounce">
                  🏆
                </span>
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!selectedCategory ? (
            /* 1. DASHBOARD CATEGORIES CHIP CHANNELS */
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-3 gap-6"
            >
              {QUIZ_CATEGORIES.map((category) => (
                <div 
                  key={category.id}
                  onClick={() => setSelectedCategory(category)}
                  className={`cursor-pointer p-6 rounded-2xl border bg-gradient-to-br ${category.color} hover:scale-105 transition-all duration-300 shadow-lg group relative overflow-hidden`}
                >
                  <div className="mb-4 bg-white dark:bg-slate-900 w-12 h-12 rounded-xl flex items-center justify-center shadow-md">
                    {category.icon}
                  </div>
                  <h2 className="text-xl font-bold mb-2 group-hover:text-emerald-500 transition-colors">{category.title}</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {category.questions.length} Assessment Challenges
                  </p>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    Reward Badge: <span className="text-sm">{category.badgeIcon}</span> {category.badgeName}
                  </div>
                </div>
              ))}
            </motion.div>
          ) : quizCompleted ? (
            /* 2. COMPLETION ARCH CARD SCREEN */
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center shadow-xl"
            >
              <Award className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-3xl font-extrabold mb-2">Quiz Completed!</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                You correctly evaluated {score} out of {selectedCategory.questions.length} core concepts.
              </p>

              {score === selectedCategory.questions.length ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 max-w-md mx-auto mb-8">
                  <p className="text-2xl mb-1">{selectedCategory.badgeIcon}</p>
                  <h3 className="font-bold text-emerald-600 dark:text-emerald-400">New Badge Unlocked!</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">You are officially recognized as a <b>{selectedCategory.badgeName}</b>.</p>
                </div>
              ) : (
                <p className="text-sm text-amber-500 mb-8 font-medium">Tip: Get a perfect score to earn the regional {selectedCategory.badgeName} title badge!</p>
              )}

              <button 
                onClick={resetQuiz}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-5 h-5" /> Return to Hub
              </button>
            </motion.div>
          ) : (
            /* 3. CORE ACTIVE ENGINE QUESTION CARD */
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl"
            >
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-6">
                <div 
                  className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / selectedCategory.questions.length) * 100}%` }}
                />
              </div>

              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">
                  {selectedCategory.title}
                </span>
                <span className="text-sm text-slate-400 font-mono">
                  Question {currentQuestionIndex + 1}/{selectedCategory.questions.length}
                </span>
              </div>

              <h3 className="text-xl font-bold mb-6">
                {selectedCategory.questions[currentQuestionIndex].text}
              </h3>

              <div className="space-y-3 mb-6">
                {selectedCategory.questions[currentQuestionIndex].options.map((option, idx) => {
                  const isCorrectAnswer = idx === selectedCategory.questions[currentQuestionIndex].correctIndex;
                  const isUserSelection = idx === selectedAnswer;

                  let optionStyle = "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50";
                  if (isAnswered) {
                    if (isCorrectAnswer) optionStyle = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold";
                    else if (isUserSelection) optionStyle = "border-red-500 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400";
                    else optionStyle = "opacity-50 border-slate-100 dark:border-slate-800";
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleAnswerSelect(idx)}
                      className={`w-full p-4 border text-left rounded-xl transition-all flex items-center justify-between ${optionStyle}`}
                    >
                      <span>{option}</span>
                      {isAnswered && isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                      {isAnswered && isUserSelection && !isCorrectAnswer && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {isAnswered && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl mb-6 flex gap-3"
                  >
                    <HelpCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      <b>Explanation:</b> {selectedCategory.questions[currentQuestionIndex].explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                <button onClick={resetQuiz} className="text-sm font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  Abandon Quiz
                </button>
                <button
                  onClick={handleNextQuestion}
                  disabled={!isAnswered}
                  className={`px-5 py-2.5 rounded-xl font-bold transition-all ${
                    isAnswered 
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:scale-105' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {currentQuestionIndex + 1 === selectedCategory.questions.length ? 'Finish Quiz' : 'Next Question'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};