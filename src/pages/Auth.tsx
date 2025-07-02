
import { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Sparkles } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        navigate('/');
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setError('Check your email for the confirmation link!');
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="glass-3d rounded-3xl shadow-2xl border border-white/20 p-8 w-full max-w-md backdrop-blur-xl bg-white/10 relative z-10">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2 tracking-tight">
            Hybridus
          </h1>
          <p className="text-gray-300/80 text-sm">
            {isLogin ? 'Welcome back to your productivity hub' : 'Join the future of task management'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {!isLogin && (
            <div className="animate-fade-in">
              <label className="block text-sm font-medium text-gray-200/90 mb-2">
                <User className="w-4 h-4 inline mr-2 text-purple-300" />
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={!isLogin}
                className="w-full px-4 py-3 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 shadow-sm glass-3d text-white placeholder-gray-400 text-sm transition-all duration-300 focus:scale-[1.02] bg-white/5 backdrop-blur-sm"
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-200/90 mb-2">
              <Mail className="w-4 h-4 inline mr-2 text-blue-300" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 shadow-sm glass-3d text-white placeholder-gray-400 text-sm transition-all duration-300 focus:scale-[1.02] bg-white/5 backdrop-blur-sm"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200/90 mb-2">
              <Lock className="w-4 h-4 inline mr-2 text-pink-300" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400/50 shadow-sm glass-3d text-white placeholder-gray-400 text-sm transition-all duration-300 focus:scale-[1.02] pr-12 bg-white/5 backdrop-blur-sm"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-300 text-sm text-center bg-red-900/20 border border-red-400/20 p-3 rounded-lg backdrop-blur-sm animate-fade-in">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl text-sm font-medium disabled:opacity-50 hover:scale-[1.02] glass-3d border border-white/20 backdrop-blur-sm"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Loading...
              </div>
            ) : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-300 hover:text-white text-sm transition-colors duration-200 hover:underline"
          >
            {isLogin ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
