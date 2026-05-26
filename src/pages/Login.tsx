/**
 * @deprecated This file is preserved for reference only and is NO LONGER USED.
 *
 * It implemented a client-side localStorage-based authentication system that
 * stored hashed passwords in the browser — a critical security vulnerability.
 *
 * The active authentication entry point is now:
 *   src/pages/Auth.tsx  →  backed by Supabase Auth (server-side, secure)
 *
 * This file should be deleted once the migration is confirmed stable.
 */
 
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, LogIn, Mail, User, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { glassCard, inputClass, primaryButton, secondaryButton, subtleText } from '../lib/ui';

const Login = () => {
  const { login, register } = useAuth();
  const nav = useNavigate();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const response = await login(email, password);

    if (response.success) {
      nav('/dashboard');
    } else {
      setError(response.error || 'Login failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const response = await register(name.trim(), email.trim(), password);

    if (response.success) {
      nav('/dashboard');
    } else {
      setError(response.error || 'Registration failed');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden transition-theme duration-300 dark:bg-slate-950">
      <AnimatedBackground />
      <div className="absolute right-6 top-6 z-20">
        <ThemeToggle showLabel />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${glassCard} w-full max-w-lg p-8`}
        >
          <h1 className="mb-2 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-center text-4xl font-bold text-transparent dark:from-emerald-400 dark:to-teal-400">
            EcoPlay
          </h1>
          <p className="mb-6 text-center text-sky-950/85 dark:text-slate-300">Save the planet, one action at a time</p>

          <AnimatePresence mode="wait">
            {mode === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h2 className="mb-4 text-2xl font-bold text-sky-950 dark:text-white">Welcome Back</h2>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-sky-950 dark:text-slate-200">
                      <Mail className="mr-1 inline h-4 w-4" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-sky-950 dark:text-slate-200">
                      <Lock className="mr-1 inline h-4 w-4" />
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className={inputClass}
                      required
                    />
                  </div>

                  {error && (
                    <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500 dark:text-red-300">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    className={`${primaryButton} w-full`}
                  >
                    <LogIn className="h-5 w-5" />
                    Login
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError('');
                    }}
                    className={`${secondaryButton} w-full justify-center`}
                  >
                    Create new account
                  </button>
                </form>
              </motion.div>
            )}

            {mode === 'register' && (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h2 className="mb-4 text-2xl font-bold text-sky-950 dark:text-white">Create Profile</h2>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-sky-950 dark:text-slate-200">
                      <User className="mr-1 inline h-4 w-4" />
                      Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-sky-950 dark:text-slate-200">
                      <Mail className="mr-1 inline h-4 w-4" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-sky-950 dark:text-slate-200">
                      <Lock className="mr-1 inline h-4 w-4" />
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      className={inputClass}
                      required
                    />
                  </div>

                  {error && (
                    <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500 dark:text-red-300">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    className={`${primaryButton} w-full`}
                  >
                    <UserPlus className="h-5 w-5" />
                    Register
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                    }}
                    className={`${secondaryButton} w-full justify-center`}
                  >
                    Back to login
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <p className={`mt-6 text-center text-xs ${subtleText}`}>
            Theme preference is saved automatically on this device.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
