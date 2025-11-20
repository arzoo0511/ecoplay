import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, User, Mail, Lock, LogIn, UserPlus } from 'lucide-react';

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedEmail || !password) {
      setError('Please enter password');
      return;
    }

    const success = login(selectedEmail, password);
    if (success) {
      nav('/dashboard');
    } else {
      setError('Incorrect password');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !regPassword.trim()) {
      setError('All fields required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email format');
      return;
    }

    if (regPassword.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    const success = register(name.trim(), email.trim(), regPassword);
    if (success) {
      nav('/dashboard');
    } else {
      setError('Email already exists');
    }
  };

  const handleDelete = (userEmail: string) => {
    if (window.confirm(`Delete account ${userEmail}? This cannot be undone.`)) {
      deleteAccount(userEmail);
    }
  };

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <div className="flex items-center justify-center min-h-screen p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl"
        >
          <h1 className="text-4xl font-bold text-white mb-2 text-center bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            EcoPlay
          </h1>
          <p className="text-center text-blue-100 mb-6">Save the planet, one action at a time</p>

          <AnimatePresence mode="wait">
            {/* SELECT MODE */}
            {mode === 'select' && (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h2 className="text-2xl font-bold text-white mb-4">Select Profile</h2>

                {users.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-blue-100 mb-4">No profiles yet. Create one to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-3 mb-6">
                    {users.map((u) => (
                      <div
                        key={u.email}
                        className="bg-white/10 rounded-lg p-4 flex items-center justify-between border border-white/20 hover:bg-white/20 transition"
                      >
                        <button
                          onClick={() => {
                            setSelectedEmail(u.email);
                            setMode('login');
                          }}
                          className="flex items-center gap-3 flex-1 text-left"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{u.name}</p>
                            <p className="text-blue-200 text-sm">{u.email}</p>
                          </div>
                        </button>
                        <button
                          onClick={() => handleDelete(u.email)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition"
                        >
                          <Trash2 className="h-5 w-5 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setMode('register')}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
                >
                  <UserPlus className="h-5 w-5" />
                  Create New Profile
                </button>
              </motion.div>
            )}

            {/* LOGIN MODE */}
            {mode === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h2 className="text-2xl font-bold text-white mb-4">Welcome Back</h2>
                <p className="text-blue-100 mb-6">
                  Logging in as <strong>{users.find(u => u.email === selectedEmail)?.name}</strong>
                </p>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-blue-100 mb-2">
                      <Lock className="h-4 w-4 inline mr-1" />
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-4 py-3 rounded-lg bg-white/15 text-white placeholder-white/50 outline-none focus:ring-2 ring-blue-400"
                    />
                  </div>

                  {error && (
                    <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
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
                    className="w-full text-blue-200 hover:text-white text-sm"
                  >
                    ← Back to profiles
                  </button>
                </form>
              </motion.div>
            )}

            {/* REGISTER MODE */}
            {mode === 'register' && (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h2 className="text-2xl font-bold text-white mb-4">Create Profile</h2>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-blue-100 mb-2">
                      <User className="h-4 w-4 inline mr-1" />
                      Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 rounded-lg bg-white/15 text-white placeholder-white/50 outline-none focus:ring-2 ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-blue-100 mb-2">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-lg bg-white/15 text-white placeholder-white/50 outline-none focus:ring-2 ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-blue-100 mb-2">
                      <Lock className="h-4 w-4 inline mr-1" />
                      Password
                    </label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Create a password"
                      className="w-full px-4 py-3 rounded-lg bg-white/15 text-white placeholder-white/50 outline-none focus:ring-2 ring-blue-400"
                    />
                  </div>

                  {error && (
                    <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
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
                    className="w-full text-blue-200 hover:text-white text-sm"
                  >
                    ← Back to profiles
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;