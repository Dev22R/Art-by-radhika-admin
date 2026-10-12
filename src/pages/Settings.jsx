import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Clock,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { FaInstagram, FaYoutube } from 'react-icons/fa6';
import { updateProfile, changePassword } from '../redux/slices/authSlice';
import { STUDIO_PROFILE, INITIAL_USERS, INITIAL_DESIGNS, INITIAL_PRICING_PLANS, INITIAL_REELS, INITIAL_ENQUIRIES, INITIAL_FAQS } from '../api/mockData';
import { mockApi } from '../api/axiosClient';
import { toast } from 'sonner';

export const Settings = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const changePasswordLoading = useSelector((state) => state.auth.changePasswordLoading);

  const [formData, setFormData] = useState({
    name: user?.name || 'Art By Radhika Admin',
    studioName: 'Art By Radhika Studio',
    title: 'Master Celebrity & Bridal Henna Artist',
    email: user?.email || 'admin@artbyradhika.com',
    phone: user?.phone || '+91 99999 99999',
    whatsapp: '+919999999999',
    address: 'Heritage Arts Complex, Jaipur & Delhi NCR',
    currency: 'INR (₹)',
    instagram: '@artbyradhika',
    youtube: 'ArtByRadhikaStudio',
    bio: 'Award-winning bridal henna artist styling royalty, celebrities, and global brides with bespoke botanical storytelling mehndi.',
    workingHours: '10:00 AM - 08:00 PM (IST)'
  });

  // Change Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    dispatch(updateProfile({ name: formData.name, email: formData.email, phone: formData.phone }));
    localStorage.setItem('abr_admin_profile', JSON.stringify(formData));
    toast.success('Studio settings saved successfully!');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      toast.error('Please enter a new password.');
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
      toast.success(msg || 'Password updated successfully on backend API!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err || 'Failed to update password. Please verify server connection.');
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo data to original state? (This will refresh all tables)')) {
      const { STORAGE_KEYS } = mockApi;
      mockApi.save(STORAGE_KEYS.USERS, INITIAL_USERS);
      mockApi.save(STORAGE_KEYS.DESIGNS, INITIAL_DESIGNS);
      mockApi.save(STORAGE_KEYS.PRICING, INITIAL_PRICING_PLANS);
      mockApi.save(STORAGE_KEYS.REELS, INITIAL_REELS);
      mockApi.save(STORAGE_KEYS.ENQUIRIES, INITIAL_ENQUIRIES);
      mockApi.save(STORAGE_KEYS.FAQS, INITIAL_FAQS);
      mockApi.save(STORAGE_KEYS.PROFILE, STUDIO_PROFILE);
      toast.success('Studio demo data restored! Reloading page...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-royal text-stone-900 dark:text-white">
            Studio Profile & Settings
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Configure bridal artist details, contact numbers, and security credentials.
          </p>
        </div>

        <button
          onClick={handleResetData}
          type="button"
          className="px-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-zinc-800 hover:bg-rose-50 hover:text-rose-700 text-stone-700 dark:text-stone-300 text-xs font-bold transition-colors flex items-center gap-2 border border-stone-200 dark:border-zinc-700 self-start sm:self-auto"
        >
          <RotateCcw className="w-4 h-4" /> Reset Initial Demo Data
        </button>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Studio Branding Card */}
        <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-stone-100 dark:border-zinc-800">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-zinc-800 text-amber-800 dark:text-amber-300 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-royal text-stone-900 dark:text-white">
                Artist & Studio Branding
              </h2>
              <p className="text-xs text-stone-400">Public profile displayed on booking proposals</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                Lead Artist Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                Studio Trade Name
              </label>
              <input
                type="text"
                value={formData.studioName}
                onChange={(e) => setFormData({ ...formData, studioName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                Professional Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                Working Consultation Hours
              </label>
              <input
                type="text"
                value={formData.workingHours}
                onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
              Artist Bio & Heritage Story
            </label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Contact and Social Links */}
        <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-stone-100 dark:border-zinc-800">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-zinc-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-royal text-stone-900 dark:text-white">
                Communication & Social Handles
              </h2>
              <p className="text-xs text-stone-400">Direct links for client enquiry redirects</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                Admin Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                Studio Helpline Phone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                <FaInstagram className="w-3.5 h-3.5 text-rose-500" />
                Instagram Handle
              </label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                <FaYoutube className="w-3.5 h-3.5 text-red-600" />
                YouTube Channel
              </label>
              <input
                type="text"
                value={formData.youtube}
                onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
              Studio Base Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-800 hover:to-amber-700 text-white font-bold text-sm shadow-lg shadow-amber-800/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Profile Details
          </button>
        </div>
      </form>

      {/* Security & Change Password Section */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-6 mt-8">
        <div className="flex items-center gap-3 pb-4 border-b border-stone-100 dark:border-zinc-800">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-zinc-800 text-amber-800 dark:text-amber-300 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-royal text-stone-900 dark:text-white">
              Admin Security & Password
            </h2>
            <p className="text-xs text-stone-400">
              API Endpoint: <code className="text-amber-700 dark:text-amber-400 font-mono text-[11px]">PUT /api/auth/admin/change-password</code>
            </p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
              New Password *
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="e.g. ABR@NewPassword2026"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
              Confirm New Password *
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={changePasswordLoading}
            className="px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-md shadow-amber-800/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            {changePasswordLoading ? 'Updating Password...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
