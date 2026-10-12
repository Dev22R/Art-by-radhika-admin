import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft,
  User as UserIcon,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Heart,
  Film,
  Sparkles,
  MessageSquare,
  CalendarCheck,
  CreditCard,
  ExternalLink,
  Trash2,
  Lock,
  Unlock,
  Copy,
  Check,
  Eye,
  Play,
  HelpCircle,
  Clock,
  Send
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import {
  fetchUserDetails,
  toggleUserBlock,
  deleteUser,
  clearUserDetails
} from '../redux/slices/usersSlice';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatCurrency, formatDate } from '../utils/formatters';
import { toast } from 'sonner';

export const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedUserDetails, detailLoading, detailError } = useSelector((state) => state.users);
  const [activeTab, setActiveTab] = useState('summary');
  const [copiedId, setCopiedId] = useState(false);
  const [videoModalUrl, setVideoModalUrl] = useState(null);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null, // 'block' | 'delete'
    isLoading: false
  });

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserDetails(userId));
    }
    return () => {
      dispatch(clearUserDetails());
    };
  }, [dispatch, userId]);

  const user = selectedUserDetails?.user;
  const summary = selectedUserDetails?.summary || {};
  const addresses = selectedUserDetails?.addresses || [];
  const likedReels = selectedUserDetails?.likedReels || [];
  const likedDesigns = selectedUserDetails?.likedDesigns || [];
  const comments = selectedUserDetails?.comments || [];
  const bookings = selectedUserDetails?.bookings || [];
  const inquiries = selectedUserDetails?.inquiries || [];

  const handleCopyId = () => {
    if (user?._id) {
      navigator.clipboard.writeText(user._id);
      setCopiedId(true);
      toast.success('User ID copied to clipboard');
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleOpenBlockModal = () => {
    setConfirmModal({
      isOpen: true,
      type: 'block',
      isLoading: false
    });
  };

  const handleOpenDeleteModal = () => {
    setConfirmModal({
      isOpen: true,
      type: 'delete',
      isLoading: false
    });
  };

  const handleCloseConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      type: null,
      isLoading: false
    });
  };

  const handleConfirmAction = async () => {
    if (!user) return;
    setConfirmModal((prev) => ({ ...prev, isLoading: true }));

    try {
      if (confirmModal.type === 'block') {
        const targetStatus = !user.isActive;
        await dispatch(toggleUserBlock({ userId: user._id, isActive: targetStatus })).unwrap();
        toast.success(`User "${user.name}" is now ${targetStatus ? 'Active' : 'Blocked'}`);
        dispatch(fetchUserDetails(userId));
      } else if (confirmModal.type === 'delete') {
        await dispatch(deleteUser(user._id)).unwrap();
        toast.success(`User "${user.name}" deleted successfully.`);
        navigate('/users');
      }
      handleCloseConfirmModal();
    } catch (err) {
      toast.error(err || 'Action failed');
      setConfirmModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const getCleanPhone = (phone) => (phone ? phone.replace(/[^0-9]/g, '') : '');

  if (detailLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-600/30 border-t-amber-600 rounded-full animate-spin" />
        <p className="text-stone-500 dark:text-stone-400 font-medium text-sm">
          Loading 360° Profile Details...
        </p>
      </div>
    );
  }

  if (detailError || !user) {
    return (
      <div className="p-8 text-center max-w-xl mx-auto space-y-4 bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-sm mt-6">
        <div className="w-14 h-14 bg-rose-100 dark:bg-rose-950/50 rounded-2xl flex items-center justify-center text-rose-600 mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold font-royal text-stone-900 dark:text-white">
          Client Profile Not Found
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {detailError || 'Unable to retrieve user information from the server.'}
        </p>
        <button
          onClick={() => navigate('/users')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Users Directory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/users')}
            className="p-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800 text-stone-600 dark:text-stone-300 transition-colors shadow-sm"
            title="Back to All Users"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                User 360° Profile
              </span>
              <span className="text-stone-300 dark:text-zinc-700">•</span>
              <span className="text-xs text-stone-400 font-mono">ID: {user._id?.slice(-8)}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-royal text-stone-900 dark:text-white">
              {user.name}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {user.phone && (
            <a
              href={`https://wa.me/91${getCleanPhone(user.phone)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <FaWhatsapp className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          )}

          <button
            onClick={handleOpenBlockModal}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all ${
              user.isActive
                ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100'
                : 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
            }`}
          >
            {user.isActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{user.isActive ? 'Block User' : 'Unblock User'}</span>
          </button>

          <button
            onClick={handleOpenDeleteModal}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-bold transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-white shadow-xl relative overflow-hidden border border-amber-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-amber-500/40 shadow-xl"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-700 to-amber-500 text-white flex items-center justify-center font-royal font-bold text-4xl ring-4 ring-amber-500/40 shadow-xl">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <span
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-stone-900 ${
                  user.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                title={user.isActive ? 'Active' : 'Blocked'}
              />
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-bold font-royal text-white">
                  {user.name}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    user.role === 'admin'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-stone-800 text-stone-300 border border-stone-700'
                  }`}
                >
                  {user.role}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    user.isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {user.isActive ? 'Active Account' : 'Blocked Account'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-stone-300">
                {user.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>{user.phone}</span>
                    {user.isPhoneVerified && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                        Verified
                      </span>
                    )}
                  </div>
                )}
                {user.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <span>{user.email}</span>
                  </div>
                )}
                <button
                  onClick={handleCopyId}
                  className="flex items-center gap-1 text-stone-400 hover:text-white transition-colors bg-stone-800/80 px-2 py-0.5 rounded-lg text-[11px] font-mono"
                  title="Copy Full User ID"
                >
                  {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{user._id}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[11px] text-stone-400 pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-stone-400" /> Joined {formatDate(user.createdAt)}
                </span>
                {user.lastLoginAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-stone-400" /> Last Active {formatDate(user.lastLoginAt)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 8-Point Summary Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Total Bookings</span>
            <CalendarCheck className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold font-royal text-stone-900 dark:text-white">
            {summary.totalBookings ?? 0}
          </p>
          <span className="text-[11px] text-stone-400">
            {summary.completedBookings ?? 0} completed
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Total Spent</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold font-royal text-amber-800 dark:text-amber-400">
            {formatCurrency(summary.totalSpent ?? 0)}
          </p>
          <span className="text-[11px] text-stone-400">
            Pending: {formatCurrency(summary.pendingPayment ?? 0)}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Saved Addresses</span>
            <MapPin className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold font-royal text-stone-900 dark:text-white">
            {summary.totalAddresses ?? addresses.length}
          </p>
          <span className="text-[11px] text-stone-400">Saved locations</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Liked Reels</span>
            <Film className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold font-royal text-stone-900 dark:text-white">
            {summary.totalLikedReels ?? likedReels.length}
          </p>
          <span className="text-[11px] text-stone-400">Video favorites</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Liked Designs</span>
            <Heart className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold font-royal text-stone-900 dark:text-white">
            {summary.totalLikedDesigns ?? likedDesigns.length}
          </p>
          <span className="text-[11px] text-stone-400">Catalog wishlists</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Reel Comments</span>
            <MessageSquare className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold font-royal text-stone-900 dark:text-white">
            {summary.totalComments ?? comments.length}
          </p>
          <span className="text-[11px] text-stone-400">Community interactions</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Direct Inquiries</span>
            <Send className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-bold font-royal text-stone-900 dark:text-white">
            {summary.totalInquiries ?? inquiries.length}
          </p>
          <span className="text-[11px] text-stone-400">Custom messages</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Profile Status</span>
            <ShieldCheck className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-lg font-bold text-stone-900 dark:text-white mt-1">
            {user.isProfileCompleted ? 'Complete' : 'Incomplete'}
          </p>
          <span className="text-[11px] text-stone-400">
            Phone: {user.isPhoneVerified ? 'Verified' : 'Pending'}
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-stone-200 dark:border-zinc-800 flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'summary', label: 'Addresses & Locations', count: addresses.length, icon: MapPin },
          { id: 'designs', label: 'Liked Designs', count: likedDesigns.length, icon: Heart },
          { id: 'reels', label: 'Liked Reels', count: likedReels.length, icon: Film },
          { id: 'comments', label: 'Comments', count: comments.length, icon: MessageSquare },
          { id: 'bookings', label: 'Bookings & Inquiries', count: bookings.length + inquiries.length, icon: CalendarCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold rounded-2xl transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-amber-700 text-white shadow-md shadow-amber-800/20'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-stone-100 dark:bg-zinc-800 text-stone-500 dark:text-stone-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {/* 1. Addresses Tab */}
      {activeTab === 'summary' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-royal text-stone-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-700" />
              Saved Client Addresses ({addresses.length})
            </h3>
          </div>

          {addresses.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200/80 dark:border-zinc-800 text-stone-400">
              No saved addresses found for this client.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {addresses.map((addr, idx) => (
                <div
                  key={addr._id || idx}
                  className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                        {addr.label || 'Address'}
                      </span>
                      {addr.isDefault && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-stone-900 dark:text-white leading-snug">
                      {addr.addressLine}
                      {addr.area ? `, ${addr.area}` : ''}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {addr.city}, {addr.state} - <span className="font-mono">{addr.pincode}</span>
                    </p>
                    {addr.landmark && (
                      <p className="text-[11px] text-amber-700 dark:text-amber-400">
                        Landmark: {addr.landmark}
                      </p>
                    )}
                  </div>

                  {addr.latitude && addr.longitude && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${addr.latitude},${addr.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-stone-50 dark:bg-zinc-800 hover:bg-amber-50 hover:text-amber-700 text-stone-600 dark:text-stone-300 text-xs font-bold transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View on Google Maps</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Liked Designs Tab */}
      {activeTab === 'designs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-royal text-stone-900 dark:text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-600" />
              Liked Mehndi Designs ({likedDesigns.length})
            </h3>
          </div>

          {likedDesigns.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200/80 dark:border-zinc-800 text-stone-400">
              No liked designs yet by this user.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {likedDesigns.map((des) => (
                <div
                  key={des._id}
                  className="rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col justify-between hover:border-amber-500/40 transition-all group"
                >
                  <div className="relative aspect-[4/3] bg-stone-100 dark:bg-zinc-800 overflow-hidden">
                    <img
                      src={des.coverImage}
                      alt={des.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-xl bg-stone-900/70 backdrop-blur-md text-white text-[10px] font-bold font-mono">
                      {des.designCode || 'BRI-001'}
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-amber-600 text-white text-[10px] font-bold uppercase">
                      {des.category || 'Bridal'}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-sm text-stone-900 dark:text-white truncate">
                      {des.title}
                    </h4>
                    {des.subCategory && (
                      <p className="text-xs text-stone-400">{des.subCategory}</p>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-zinc-800 text-xs">
                      <span className="font-bold text-amber-800 dark:text-amber-400 font-royal">
                        {formatCurrency(des.price || 0)}
                      </span>
                      <div className="flex items-center gap-2 text-stone-400 text-[11px]">
                        <span className="flex items-center gap-0.5">
                          <Heart className="w-3 h-3 text-rose-500" /> {des.likeCount || 0}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Eye className="w-3 h-3" /> {des.viewCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Liked Reels Tab */}
      {activeTab === 'reels' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-royal text-stone-900 dark:text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-purple-600" />
              Liked Video Reels ({likedReels.length})
            </h3>
          </div>

          {likedReels.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200/80 dark:border-zinc-800 text-stone-400">
              No liked reels found for this user.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {likedReels.map((reel) => (
                <div
                  key={reel._id}
                  className="rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col justify-between hover:border-amber-500/40 transition-all group"
                >
                  <div className="relative aspect-[9/16] max-h-72 bg-stone-950 overflow-hidden">
                    <img
                      src={reel.thumbnail}
                      alt={reel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-center justify-center">
                      {reel.videoUrl && (
                        <button
                          onClick={() => setVideoModalUrl(reel.videoUrl)}
                          className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md hover:bg-amber-600 text-white flex items-center justify-center transition-all shadow-lg ring-2 ring-white/50"
                        >
                          <Play className="w-5 h-5 ml-0.5 fill-current" />
                        </button>
                      )}
                    </div>
                    <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-xl bg-stone-900/80 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-500 fill-current" />
                      {reel.likeCount || 0}
                    </div>
                  </div>

                  <div className="p-4 space-y-1.5">
                    <h4 className="font-bold text-xs text-stone-900 dark:text-white line-clamp-2">
                      {reel.title}
                    </h4>
                    <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-100 dark:border-zinc-800">
                      <span>{reel.viewCount || 0} views</span>
                      <span>{reel.commentCount || 0} comments</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Comments Tab */}
      {activeTab === 'comments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-royal text-stone-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-teal-600" />
              Reel Comments Posted by Client ({comments.length})
            </h3>
          </div>

          {comments.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200/80 dark:border-zinc-800 text-stone-400">
              No comments posted by this user yet.
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((cmt, idx) => (
                <div
                  key={cmt.commentId || cmt._id || idx}
                  className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm flex items-start gap-4"
                >
                  {cmt.reelThumbnail && (
                    <img
                      src={cmt.reelThumbnail}
                      alt="Reel"
                      className="w-14 h-14 rounded-xl object-cover shrink-0 ring-1 ring-amber-500/20"
                    />
                  )}
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                        {cmt.reelTitle || 'Reel Comment'}
                      </p>
                      <span className="text-[11px] text-stone-400 font-medium">
                        {formatDate(cmt.createdAt)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-zinc-800 text-xs text-stone-800 dark:text-stone-200 font-medium">
                      "{cmt.text}"
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Bookings & Inquiries Tab */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-base font-bold font-royal text-stone-900 dark:text-white flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-amber-700" />
              Booking Orders ({bookings.length})
            </h3>
            {bookings.length === 0 ? (
              <div className="p-6 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200/80 dark:border-zinc-800 text-stone-400 text-xs">
                No active booking orders placed yet by this client.
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b, idx) => (
                  <div
                    key={b._id || idx}
                    className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-sm text-stone-900 dark:text-white">
                        {b.packageTitle || 'Bridal Mehndi Package'}
                      </p>
                      <span className="text-xs text-stone-400">Date: {formatDate(b.eventDate)}</span>
                    </div>
                    <span className="font-bold text-amber-800 dark:text-amber-400 font-royal">
                      {formatCurrency(b.amount || 0)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold font-royal text-stone-900 dark:text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-teal-600" />
              Contact Enquiries ({inquiries.length})
            </h3>
            {inquiries.length === 0 ? (
              <div className="p-6 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200/80 dark:border-zinc-800 text-stone-400 text-xs">
                No contact enquiries submitted by this user.
              </div>
            ) : (
              <div className="space-y-3">
                {inquiries.map((inq, idx) => (
                  <div
                    key={inq._id || idx}
                    className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm"
                  >
                    <p className="text-xs font-bold text-stone-900 dark:text-white">
                      {inq.subject || 'Custom Bridal Request'}
                    </p>
                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">{inq.message}</p>
                    <span className="text-[10px] text-stone-400 block mt-2">
                      {formatDate(inq.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Video Modal Player */}
      {videoModalUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setVideoModalUrl(null)}
        >
          <div
            className="relative max-w-lg w-full bg-stone-950 rounded-3xl overflow-hidden shadow-2xl border border-amber-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={videoModalUrl}
              controls
              autoPlay
              className="w-full aspect-[9/16] max-h-[80vh] object-contain"
            />
            <button
              onClick={() => setVideoModalUrl(null)}
              className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-stone-900/80 hover:bg-stone-900 text-white text-xs font-bold"
            >
              Close ✕
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {user && (
        <ConfirmDialog
          isOpen={confirmModal.isOpen}
          onClose={handleCloseConfirmModal}
          onConfirm={handleConfirmAction}
          isLoading={confirmModal.isLoading}
          loadingText={
            confirmModal.type === 'delete'
              ? 'Deleting user...'
              : user.isActive
              ? 'Blocking user...'
              : 'Unblocking user...'
          }
          title={
            confirmModal.type === 'delete'
              ? 'Delete User Account'
              : user.isActive
              ? 'Block User Account'
              : 'Unblock User Account'
          }
          description={
            confirmModal.type === 'delete'
              ? `Are you sure you want to permanently delete "${user.name}"? All associated account data will be removed. This action cannot be undone.`
              : user.isActive
              ? `Are you sure you want to block "${user.name}"? They will lose access to login and portal services.`
              : `Are you sure you want to unblock "${user.name}"? They will regain full access to their account.`
          }
          confirmText={
            confirmModal.type === 'delete'
              ? 'Delete User'
              : user.isActive
              ? 'Block Account'
              : 'Unblock Account'
          }
          confirmVariant={
            confirmModal.type === 'delete'
              ? 'danger'
              : user.isActive
              ? 'warning'
              : 'success'
          }
          icon={
            confirmModal.type === 'delete'
              ? Trash2
              : user.isActive
              ? Lock
              : Unlock
          }
        />
      )}
    </div>
  );
};

export default UserDetail;
