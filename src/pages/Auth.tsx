import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Leaf, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

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
  const { login, register, forgotPassword, loginWithGoogle, user } = useAuth();

  // Redirect to dashboard if already authenticated
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Capture OAuth callback errors from URL query parameters
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error_description') || params.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam).replace(/\+/g, ' '));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  //email validator
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateName = (name: string) => {
    return /^[a-zA-Z\s]+$/.test(name.trim());
  };
  
  //password strength checker
  const getPasswordStrength = (password: string) => {
    if (password.length < 8) return 'Weak';

    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (hasLowerCase && hasUpperCase && hasNumber && hasSpecialChar) {
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

    if (name === 'email') {
      const trimmedValue = value.trim();
      if (!trimmedValue) {
        setFieldErrors((prev) => ({
          ...prev,
          email: 'Email is required.'
        }));
      } else if (!validateEmail(trimmedValue)) {
        setFieldErrors((prev) => ({
          ...prev,
          email: 'Please enter a valid email address.'
        }));
      } else {
        setFieldErrors((prev) => ({
          ...prev,
          email: ''
        }));
      }
    }

    //name validation
    if (name === 'name' ) {
      const trimmedValue = value.trim();
      if (!trimmedValue) {
        setFieldErrors((prev) => ({
          ...prev,
          name: 'Name is required.'
        }));
      } else if (trimmedValue.length < 3) {
        setFieldErrors((prev) => ({
          ...prev,
          name: 'Name must be at least 3 characters'
        }));
      } else if (!validateName(trimmedValue)) {
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
    if (name === 'password' && !isLogin) {
      const errors: string[] = [];

      if (value.length < 8) {
        errors.push('At least 8 characters');
      }

      if (!/[A-Z]/.test(value)) {
        errors.push('One uppercase letter');
      }

      if (!/[a-z]/.test(value)) {
        errors.push('One lowercase letter');
      }

      if (!/\d/.test(value)) {
        errors.push('One number');
      }

      if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        errors.push('One special character');
      }

      setFieldErrors((prev) => ({
        ...prev,
        password: errors.join(', '),

        confirmPassword:
          formData.confirmPassword &&
          value !== formData.confirmPassword
            ? 'Passwords do not match.'
            : ''
      }));
    }

    //confirmation of password
    if (name === 'confirmPassword') {
      if (value && value !== formData.password) {
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

        const password = formData.password;
        if (
          password.length < 8 ||
          !/[A-Z]/.test(password) ||
          !/[a-z]/.test(password) ||
          !/\d/.test(password) ||
          !/[!@#$%^&*(),.?":{}|<>]/.test(password)
        ) {
          setError(
            'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.'
          );
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

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await loginWithGoogle();
      if (!result.success) {
        setError(result.error || 'Google Sign In failed.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during Google sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
      <div 
        className="absolute top-4 right-4 animate-fade-in"
      >
        <ThemeToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-gray-200 dark:border-slate-700 shadow-2xl p-8 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg"
          >
            <Leaf className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {isLogin ? 'Welcome Back!' : 'Join EcoPlay'}
          </h1>
          {/* ACCESSIBILITY FIX: Changed from text-blue-100 to text-gray-700 for 7.5:1 contrast ratio */}
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            {isLogin ? 'Continue your environmental journey' : 'Start your eco-friendly adventure'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-gray-800 font-semibold text-sm mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  aria-invalid={!!fieldErrors.name}
                  aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  placeholder="Enter your full name"
                  aria-label="Full Name"
                  required={!isLogin}
                />
              </div>
              {fieldErrors.name && (
                <p id="name-error" role="alert" className="text-red-600 text-sm mt-2">
                  {fieldErrors.name}
                </p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-gray-800 font-semibold text-sm mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                placeholder="Enter your email"
                aria-label="Email Address"
                required
              />
            </div>
            {fieldErrors.email && (
              <p id="email-error" role="alert" className="text-red-600 text-sm mt-2">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-800 font-semibold text-sm mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                className="w-full pl-10 pr-12 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                placeholder="Enter your password"
                aria-label="Password"
                required
              />
              <button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 rounded p-1 transition-colors"
  aria-label={showPassword ? 'Hide password' : 'Show password'}
>
  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
</button>
            </div>

            {!isLogin && formData.password && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">
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
              <p id="password-error" role="alert" className="text-red-600 text-sm mt-2">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {isLogin && (
            <div className="flex justify-end -mt-2">
              <button
                type="button"
                onClick={async () => {
                  if (!formData.email) {
                    setError('Please enter your email first.');
                    return;
                  }

                  setLoading(true);

                  const result = await forgotPassword(formData.email);

                  if (!result.success) {
                    setError(result.error || 'Failed to send reset email.');
                  } else {
                    setError('');
                    alert('Password reset email sent! Check your inbox.');
                  }

                  setLoading(false);
                }}
                className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" className="block text-gray-800 font-semibold text-sm mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  aria-invalid={!!fieldErrors.confirmPassword}
                  aria-describedby={fieldErrors.confirmPassword ? 'confirmPassword-error' : undefined}
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  placeholder="Confirm your password"
                  aria-label="Confirm Password"
                  required={!isLogin}
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p id="confirmPassword-error" role="alert" className="text-red-600 text-sm mt-2">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              aria-live="polite"
              className="bg-red-50 border-2 border-red-300 text-red-800 p-3 rounded-xl text-sm font-medium"
            >
              {error}
            </motion.div>
          )}

          {/* SMOOTH GRADIENT - Properly centered text */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={
              loading ||
              !formData.email.trim() ||
              !formData.password.trim() ||
              !!fieldErrors.email ||
              !!fieldErrors.password ||
              (!isLogin &&
                (
                  !formData.name.trim() ||
                  !formData.confirmPassword.trim() ||
                  formData.password !== formData.confirmPassword ||
                  !!fieldErrors.name ||
                  !!fieldErrors.confirmPassword
                ))
            }
            className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white font-bold py-3 px-6 rounded-xl hover:from-green-600 hover:via-emerald-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-gray-200 dark:border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white dark:bg-slate-900 text-gray-500 font-semibold uppercase tracking-wider">Or continue with</span>
          </div>
        </div>

        {/* Google Auth Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          disabled={loading}
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-gray-700 dark:text-white font-bold py-3 px-6 rounded-xl border-2 border-gray-300 dark:border-slate-700 shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </motion.button>

        {/* Toggle - HIGH CONTRAST FOOTER TEXT */}
        <div className="mt-6 pt-6 border-t-2 border-gray-200">
          <p className="text-gray-700 font-medium text-center">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
          </p>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFieldErrors({ email: '', password: '', name: '', confirmPassword: '' });//Clearing error while toggle
              setFormData({ email: '', password: '', name: '', confirmPassword: '' });  
            }}
            className="w-full text-green-600 hover:text-green-700 font-semibold mt-3 transition-colors py-2 rounded-lg hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label={isLogin ? 'Switch to sign up' : 'Switch to sign in'}
          >
            {isLogin ? 'Sign up here' : 'Sign in here'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
