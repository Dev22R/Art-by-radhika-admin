import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Mail,
  Lock,
  HeartHandshake,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { loginAdmin, changePassword, clearAuthError } from '../redux/slices/authSlice';
import Modal from '../components/common/Modal';
import { toast } from 'sonner';

export const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, changePasswordLoading } = useSelector((state) => state.auth);

  // Form State
  const [email, setEmail] = useState('admin@artbyradhika.com');
  const [password, setPassword] = useState('ABR@123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot / Change Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    try {
      const result = await dispatch(
        loginAdmin({ email: email.trim(), password })
      ).unwrap();

      if (result) {
        toast.success(result.message || `Welcome back, ${result.user?.name || 'Admin'}!`);
        navigate('/');
      }
    } catch (err) {
      toast.error(err || 'Authentication failed. Please check credentials or API server.');
    }
  };

  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    dispatch(clearAuthError());
    toast.info('Credentials loaded!');
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      toast.error('Please enter the new password.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match.');
      return;
    }

    try {
      const msg = await dispatch(changePassword({ newPassword })).unwrap();
      toast.success(msg || 'Password updated successfully! You can now login.');
      setPassword(newPassword);
      setIsForgotModalOpen(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err || 'Failed to change password. Please login first if token is required.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-stone-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-stone-950 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-rose-500/15 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-3xl border border-amber-200/60 dark:border-zinc-800 shadow-2xl p-6 sm:p-9">
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-700 via-amber-600 to-yellow-500 flex items-center justify-center text-white shadow-xl shadow-amber-800/30">
            <HeartHandshake className="w-8 h-8 text-amber-100" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300/50">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Official Admin Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-royal text-stone-900 dark:text-white">
            ART BY RADHIKA
          </h1>

        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) dispatch(clearAuthError());
                }}
                placeholder="admin@artbyradhika.com"
                required
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200 dark:border-zinc-700 text-stone-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) dispatch(clearAuthError());
                }}
                placeholder="••••••••••••"
                required
                className="w-full pl-11 pr-11 py-3 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200 dark:border-zinc-700 text-stone-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-white transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-stone-600 dark:text-stone-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span>Remember studio session</span>
            </label>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-600 hover:from-amber-800 hover:to-yellow-700 text-white font-bold text-sm shadow-lg shadow-amber-800/30 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in via API...
              </span>
            ) : (
              <>
                <span>Sign In to Admin Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>


      </div>

      {/* Forgot / Change Password Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Admin Change / Reset Password"
        subtitle="Update your admin master password securely via API"
      >
        <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-zinc-800/50 border border-amber-200/60 dark:border-zinc-700 text-xs text-stone-600 dark:text-stone-300">
            <span className="font-bold text-amber-800 dark:text-amber-300 block mb-1">
              🔑 Endpoint: PUT /api/auth/admin/change-password
            </span>
            Enter your new secure password below. It will update the admin password on the server.
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
              New Password *
            </label>
            <div className="relative">
              <KeyRound className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="e.g. ABR@NewPassword2026"
                className="w-full pl-11 pr-11 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-white"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
              Confirm New Password *
            </label>
            <div className="relative">
              <KeyRound className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-stone-500 hover:bg-stone-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={changePasswordLoading}
              className="px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-md shadow-amber-800/20 disabled:opacity-50"
            >
              {changePasswordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Login;
