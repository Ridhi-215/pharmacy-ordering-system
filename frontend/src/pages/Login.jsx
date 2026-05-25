import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import API from '../services/api';
import { KeyRound, Mail, AlertCircle, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await login(email, password);
      showToast(`Welcome back, ${userData.fullName}!`, 'success');
      if (userData.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err);
      showToast(err, 'error');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-[85vh] flex items-center justify-center py-16 px-6 bg-gradient-to-tr from-slate-50 via-emerald-50/10 to-slate-100 relative overflow-hidden">
      
      {/* Background Graphic Accents */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-100/30 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-100/20 rounded-full blur-3xl -z-10"></div>

      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 sm:p-12 shadow-2xl shadow-slate-200 border border-slate-100 max-w-md w-full relative overflow-hidden">
        
        {/* Top visual border stripe */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"></div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 border border-emerald-100/50 shadow-sm animate-pulse">
            ⚕️
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Welcome Back</h2>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed">Log in to your secure account to manage your orders & prescriptions.</p>
        </div>

        {error && (
          <div className="bg-rose-50/80 border border-rose-200 text-rose-800 p-4 rounded-2xl mb-6 flex gap-2 items-start text-sm shadow-sm backdrop-blur-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="email"
                required
                className="w-full bg-slate-50/60 border border-slate-200/80 rounded-xl py-3 pl-11 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition font-semibold text-sm"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-slate-700 text-sm font-semibold">Password</label>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="password"
                required
                className="w-full bg-slate-50/60 border border-slate-200/80 rounded-xl py-3 pl-11 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition font-semibold text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-xl transition duration-250 shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/25 flex items-center justify-center text-sm tracking-wide"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : (
              'Log In'
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-6 text-sm text-slate-500">
          New to PharmaCare?{' '}
          <Link to="/register" className="text-emerald-600 hover:text-emerald-700 transition-colors font-bold">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
