import React, { useState } from 'react';
import { LogIn, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { adminLogin } from '../services/api';

const AdminLogin = ({ onLoginSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await adminLogin({ email, password });
      // Store token and admin info in localStorage so it persists across refreshes
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminName', data.name);
      onLoginSuccess(data);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8">

        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </button>

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8 text-on-primary" />
          </div>
          <h1 className="text-3xl font-headline font-bold text-primary">Admin Login</h1>
          <p className="text-on-surface-variant text-sm">Sign in to manage products and orders</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-xl border border-outline-variant/10 space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-outline-variant/20 bg-surface-container-low text-primary text-sm font-medium outline-none focus:ring-2 focus:ring-primary-fixed-dim transition-shadow"
              placeholder="admin@vijaymedical.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-outline-variant/20 bg-surface-container-low text-primary text-sm font-medium outline-none focus:ring-2 focus:ring-primary-fixed-dim transition-shadow"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm font-medium text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d1a154] text-primary py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#f1be6e] transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Signing in...</>
            ) : (
              <><LogIn className="w-5 h-5" /> Sign In</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
