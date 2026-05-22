import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, LogIn, Mail, Trash2, User, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { glassCard, inputClass, primaryButton, secondaryButton, subtleText } from '../lib/ui';

const Login = () => {
  const { login, register, deleteAccount, getAllUsers } = useAuth();
  const nav = useNavigate();

  const [mode, setMode] = useState<'select' | 'login' | 'register'>('select');
  const [selectedEmail, setSelectedEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [error, setError] = useState('');

  const users = getAllUsers();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const response = await login(selectedEmail, password);

    if (response.success) {
      nav('/dashboard');
    } else {
      setError(response.error || 'Login failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const response = await register(name.trim(), email.trim(), regPassword);

    if (response.success) {
      nav('/dashboard');
    } else {
      setError(response.error || 'Registration failed');
    }
  };

  const handleDelete = (userEmail: string) => {
    if (window.confirm(`Delete account ${userEmail}? This cannot be undone.`)) {
      deleteAccount(userEmail);
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
            {mode === 'select' && (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h2 className="mb-4 text-2xl font-bold text-sky-950 dark:text-white">Select Profile</h2>

                {users.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="mb-4 text-sky-950/85 dark:text-slate-300">No profiles yet. Create one to get started!</p>
                  </div>
                ) : (
                  <div className="mb-6 space-y-3">
                    {users.map((u) => (
                      <div
                        key={u.email}
                        className="flex items-center justify-between rounded-xl border border-white/20 bg-white/10 p-4 transition-theme duration-300 hover:bg-white/20 dark:border-white/10 dark:bg-white/5 dark:hover:border-emerald-400/30 dark:hover:bg-white/10"
                      >
                        <button
                          onClick={() => {
                            setSelectedEmail(u.email);
                            setMode('login');
                          }}
                          className="flex flex-1 items-center gap-3 text-left"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-blue-500 font-bold text-white dark:from-emerald-500 dark:to-teal-500">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sky-950 dark:text-white">{u.name}</p>
                            <p className="text-sm text-sky-950/80 dark:text-slate-400">{u.email}</p>
                          </div>
                        </button>
                        <button
                          onClick={() => handleDelete(u.email)}
                          className="rounded-lg p-2 text-red-500 transition-theme duration-300 hover:bg-red-500/10 dark:text-red-400"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setMode('register')}
                  className={`${primaryButton} w-full`}
                >
                  <UserPlus className="h-5 w-5" />
                  Create New Profile
                </button>
              </motion.div>
            )}

            {mode === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h2 className="mb-4 text-2xl font-bold text-sky-950 dark:text-white">Welcome Back</h2>
                <p className="mb-6 text-sky-950/85 dark:text-slate-300">
                  Logging in as <strong>{users.find((u) => u.email === selectedEmail)?.name}</strong>
                </p>

                <form onSubmit={handleLogin} className="space-y-4">
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
                      setMode('select');
                      setPassword('');
                      setError('');
                    }}
                    className={`${secondaryButton} w-full justify-center`}
                  >
                    Back to profiles
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
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-sky-950 dark:text-slate-200">
                      <Lock className="mr-1 inline h-4 w-4" />
                      Password
                    </label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Create a password"
                      className={inputClass}
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
                      setMode('select');
                      setName('');
                      setEmail('');
                      setRegPassword('');
                      setError('');
                    }}
                    className={`${secondaryButton} w-full justify-center`}
                  >
                    Back to profiles
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
