import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Leaf, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();
  const { login, register } = useAuth();

  //email validator
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateName = (name: string) => {
    return /^[a-zA-Z\s]+$/.test(name.trim());
  };

  //password strength checker
  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return 'Weak';

    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);

    if (hasUpperCase && hasNumber && hasSpecialChar) {
      return 'Strong';
    }

    return 'Medium';
  };

  const passwordStrength = useMemo(
    () => getPasswordStrength(formData.password),
    [formData.password]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

    setFieldErrors({
      ...fieldErrors,
      [name]: ''
    });

    setError('');

    if (name === 'email' && value && !validateEmail(value)) {
      setFieldErrors((prev) => ({
        ...prev,
        email: 'Please enter a valid email address.'
      }));
    }

    //name validation
    if (name === 'name' && value) {
      if (value.trim().length < 3) {
        setFieldErrors((prev) => ({
          ...prev,
          name: 'Name must be at least 3 characters'
        }));
      } else if (!validateName(value)) {
        setFieldErrors((prev) => ({
          ...prev,
          name: 'Name should contain only letters and spaces.'
        }));
      } else {
        setFieldErrors((prev) => ({
          ...prev,
          name: ''
        }));
      }
    }

    //password validation
    if (name === 'password') {
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      const hasDigit = /\d/.test(value);

      let passwordError = '';

      if (value.length < 8) {
        passwordError = 'Password must be at least 8 characters.';
      } else if (!hasUpperCase) {
        passwordError = 'Password must contain at least one uppercase letter.';
      } else if (!hasLowerCase) {
        passwordError = 'Password must contain at least one lowercase letter.';
      } else if (!hasDigit) {
        passwordError = 'Password must contain at least one number.';
      } else if (!hasSpecialChar) {
        passwordError = 'Password must contain at least one special character.';
      }
      setFieldErrors((prev) => ({
        ...prev,
        password: passwordError
      }));
    }

    if (name === 'confirmPassword') {
      if (value !== formData.password) {
        setFieldErrors((prev) => ({
          ...prev,
          confirmPassword: 'Passwords do not match.'
        }));
      } else {
        setFieldErrors((prev) => ({
          ...prev,
          confirmPassword: ''
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const result = await login(
          formData.email.trim(),
          formData.password.trim()
        );
        if (!result.success) {
          setError(result.error || 'Login failed.');
          return;
        }
        navigate('/dashboard');
      } else {
        if (!validateName(formData.name)) {
          setError('Please enter a valid name.');
          return;
        }

        if (!validateEmail(formData.email)) {
          setError('Please enter a valid email.');
          return;
        }

        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters.');
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match.');
          return;
        }
        const result = await register(
          formData.name.trim(),
          formData.email.trim(),
          formData.password.trim()
        );
        if (!result.success) {
          setError(result.error || 'Registration failed.');
          return;
        }
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.8 }}
            className="bg-green-500 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center"
          >
            <Leaf className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Welcome Back!' : 'Join EcoPlay'}
          </h1>
          <p className="text-blue-100">
            {isLogin ? 'Continue your environmental journey' : 'Start your eco-friendly adventure'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-white font-medium mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-5 w-5" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-black placeholder-blue-300 focus:outline-none focus:border-green-400"
                  placeholder="Enter your full name"
                  required={!isLogin}
                />
              </div>
              {fieldErrors.name && (
                <p className="text-red-300 text-sm mt-2">
                  {fieldErrors.name}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-white font-medium mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-5 w-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-black placeholder-blue-300 focus:outline-none focus:border-green-400"
                placeholder="Enter your email"
                required
              />
            </div>
            {fieldErrors.email && (
              <p className="text-red-300 text-sm mt-2">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-5 w-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-black placeholder-blue-300 focus:outline-none focus:border-green-400"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {!isLogin && formData.password && (
              <div className="mt-2">
                <p className="text-sm text-gray-300">
                  Password Strength:
                  <span
                    className={`ml-2 font-semibold ${
                      passwordStrength === 'Weak'
                        ? 'text-red-400'
                        : passwordStrength === 'Medium'
                        ? 'text-yellow-400'
                        : 'text-green-400'
                    }`}
                  >
                    {passwordStrength}
                  </span>
                </p>
              </div>
            )}

            {fieldErrors.password && (
              <p className="text-red-300 text-sm mt-2">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {!isLogin && (
            <div>
              <label className="block text-white font-medium mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-5 w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-black placeholder-blue-300 focus:outline-none focus:border-green-400"
                  placeholder="Confirm your password"
                  required={!isLogin}
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-red-300 text-sm mt-2">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-400/30 text-red-300 p-3 rounded-xl text-sm"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={
              loading ||
              !formData.name.trim() ||
              !formData.email.trim() ||
              !formData.password.trim() ||
              !formData.confirmPassword.trim() ||
              formData.password !== formData.confirmPassword ||
              !!fieldErrors.email ||
              !!fieldErrors.password ||
              !!fieldErrors.name
            }
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-3 px-6 rounded-xl hover:from-green-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </motion.button>
        </form>

        {/* Toggle */}
        <div className="mt-6 text-center">
          <p className="text-blue-100">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
          </p>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({ email: '', password: '', name: '', confirmPassword: '' });
            }}
            className="text-green-400 hover:text-green-300 font-medium mt-2 transition-colors"
          >
            {isLogin ? 'Sign up here' : 'Sign in here'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;