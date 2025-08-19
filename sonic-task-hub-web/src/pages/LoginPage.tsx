import React, { useState } from 'react';
import { Eye, EyeOff, Music, Users, Plus, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { userApi, apiHelpers } from '../services/api';
import toast from 'react-hot-toast';

interface LoginFormData {
  username: string;
  password: string;
}

interface RegisterFormData {
  username: string;
  password: string;
  confirmPassword: string;
  email?: string;
  displayName?: string;
}

export const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const loginForm = useForm<LoginFormData>();
  const registerForm = useForm<RegisterFormData>();

  const handleLogin = async (data: LoginFormData) => {
    try {
      setLoading(true);
      const response = await userApi.login(data.username, data.password);
      
      if (response.data.success && response.data.data) {
        login(response.data.data);
        toast.success('Welcome back to your productivity hub!');
      } else {
        toast.error(response.data.message || 'Authentication failed');
      }
    } catch (error) {
      toast.error(apiHelpers.handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const response = await userApi.register({
        username: data.username,
        password: data.password,
        email: data.email || undefined,
        displayName: data.displayName || data.username
      });
      
      if (response.data.success && response.data.data) {
        login(response.data.data);
        toast.success('Welcome to your new productivity hub!');
      } else {
        toast.error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      toast.error(apiHelpers.handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
           style={{ backgroundColor: '#483b85' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Sonic Task Hub</h1>
              <p className="text-white/80">Intelligent Productivity System</p>
            </div>
          </div>
          
          <div className="space-y-6 max-w-md">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-white/60 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium mb-1">Smart Organization</h3>
                <p className="text-white/70 text-sm">Automatically categorize and prioritize your tasks, habits, and life decisions</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-white/60 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium mb-1">Progress Tracking</h3>
                <p className="text-white/70 text-sm">Monitor your habits and track meaningful progress with detailed analytics</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-white/60 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium mb-1">Focus Algorithm</h3>
                <p className="text-white/70 text-sm">Smart prioritization helps you focus on what matters most</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-white/60 text-sm">
            🎵 Built for productivity enthusiasts<br />
            Simple • Intelligent • Effective
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="flex-1 flex items-center justify-center px-6 lg:px-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                   style={{ backgroundColor: '#483b85' }}>
                <Music className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Sonic Task Hub
              </h1>
            </div>
            <p className="text-gray-600">Your intelligent productivity system</p>
          </div>

          {/* Auth Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Tab Switcher */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                  isLogin 
                    ? 'text-white border-b-2' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                style={isLogin ? { 
                  backgroundColor: '#483b85',
                  borderBottomColor: '#483b85'
                } : {}}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                  !isLogin 
                    ? 'text-white border-b-2' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                style={!isLogin ? { 
                  backgroundColor: '#483b85',
                  borderBottomColor: '#483b85'
                } : {}}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Sign Up
              </button>
            </div>

            <div className="p-8">
              {isLogin ? (
                /* Login Form */
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      {...loginForm.register('username', { required: 'Username is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                      style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
                      placeholder="Enter your username"
                    />
                    {loginForm.formState.errors.username && (
                      <p className="text-red-600 text-sm mt-1">{loginForm.formState.errors.username.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...loginForm.register('password', { required: 'Password is required' })}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                        style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-red-600 text-sm mt-1">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#483b85' }}
                  >
                    {loading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    Access Your Hub
                  </button>
                </form>
              ) : (
                /* Register Form */
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username *
                    </label>
                    <input
                      type="text"
                      {...registerForm.register('username', { 
                        required: 'Username is required',
                        minLength: { value: 3, message: 'Username must be at least 3 characters' }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                      style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
                      placeholder="Choose a username"
                    />
                    {registerForm.formState.errors.username && (
                      <p className="text-red-600 text-sm mt-1">{registerForm.formState.errors.username.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      {...registerForm.register('displayName')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                      style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
                      placeholder="How should we address you?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      {...registerForm.register('email')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                      style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
                      placeholder="your.email@example.com (optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...registerForm.register('password', { 
                          required: 'Password is required',
                          minLength: { value: 6, message: 'Password must be at least 6 characters' }
                        })}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                        style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
                        placeholder="Create a secure password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {registerForm.formState.errors.password && (
                      <p className="text-red-600 text-sm mt-1">{registerForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      {...registerForm.register('confirmPassword', { required: 'Please confirm your password' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                      style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
                      placeholder="Confirm your password"
                    />
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-red-600 text-sm mt-1">{registerForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#483b85' }}
                  >
                    {loading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    Create Your Hub
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};