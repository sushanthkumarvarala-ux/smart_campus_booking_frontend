import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const from = location.state?.from?.pathname || '/resources';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const user = await login(data.email, data.password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check credentials.');
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (email, password) => {
    setValue('email', email);
    setValue('password', password);
    setErrorMessage('');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2 text-center">Welcome Back</h2>
      <p className="text-xs text-slate-400 mb-6 text-center">
        Sign in to book facilities or review reservation requests
      </p>

      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Campus Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="email"
              autoComplete="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address',
                },
              })}
              placeholder="e.g. admin@campus.edu"
              className={`w-full pl-10 pr-4 py-2.5 bg-white/5 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.email ? 'border-rose-500' : 'border-white/10'
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-rose-400 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="password"
              autoComplete="current-password"
              {...register('password', {
                required: 'Password is required',
              })}
              placeholder="••••••••"
              className={`w-full pl-10 pr-4 py-2.5 bg-white/5 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.password ? 'border-rose-500' : 'border-white/10'
              }`}
            />
          </div>
          {errors.password && (
            <p className="text-[11px] text-rose-400 mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all duration-200"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Quick Demo Fill Buttons */}
      <div className="mt-6 pt-5 border-t border-white/10">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-2.5">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Quick Demo Logins (Click to autofill):</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickFill('admin@campus.edu', 'Admin@123')}
            className="py-1.5 px-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[11px] font-medium text-amber-300 transition-colors"
          >
            Admin Demo
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('faculty@campus.edu', 'Faculty@123')}
            className="py-1.5 px-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[11px] font-medium text-emerald-300 transition-colors"
          >
            Faculty Demo
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('student@campus.edu', 'Student@123')}
            className="py-1.5 px-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[11px] font-medium text-blue-300 transition-colors"
          >
            Student Demo
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        Don't have a campus account?{' '}
        <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
          Create Account
        </Link>
      </p>
    </div>
  );
};

export default Login;
