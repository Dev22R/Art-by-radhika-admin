import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Users as UsersIcon,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Heart,
  Film,
  Lock,
  Unlock,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import {
  fetchUsers,
  toggleUserBlock,
  deleteUser,
  setSearchQuery,
  setStatusFilter,
  setRoleFilter,
  setCurrentPage
} from '../redux/slices/usersSlice';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatCurrency, formatDate } from '../utils/formatters';
import { toast } from 'sonner';

export const Users = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    items: users,
    pagination,
    loading,
    error,
    searchQuery,
    statusFilter,
    roleFilter,
    currentPage
  } = useSelector((state) => state.users);

  // Local debounced search input state
  const [searchInput, setSearchInput] = useState(searchQuery);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null, // 'block' | 'delete'
    user: null,
    isLoading: false
  });

  // Fetch users when filters change
  useEffect(() => {
    dispatch(
      fetchUsers({
        page: currentPage,
        limit: 12,
        search: searchQuery,
        status: statusFilter,
        role: roleFilter
      })
    );
  }, [dispatch, currentPage, searchQuery, statusFilter, roleFilter]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchQuery) {
        dispatch(setSearchQuery(searchInput));
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, searchQuery, dispatch]);

  const handleOpenBlockModal = (u, e) => {
    e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      type: 'block',
      user: u,
      isLoading: false
    });
  };

  const handleOpenDeleteModal = (u, e) => {
    e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      type: 'delete',
      user: u,
      isLoading: false
    });
  };

  const handleCloseConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      type: null,
      user: null,
      isLoading: false
    });
  };

  const handleConfirmAction = async () => {
    const { type, user: targetUser } = confirmModal;
    if (!targetUser) return;

    setConfirmModal((prev) => ({ ...prev, isLoading: true }));

    try {
      if (type === 'block') {
        const targetStatus = !targetUser.isActive;
        await dispatch(
          toggleUserBlock({ userId: targetUser._id, isActive: targetStatus })
        ).unwrap();
        toast.success(
          `User "${targetUser.name}" has been ${targetStatus ? 'unblocked' : 'blocked'} successfully.`
        );
      } else if (type === 'delete') {
        await dispatch(deleteUser(targetUser._id)).unwrap();
        toast.success(`User "${targetUser.name}" has been permanently deleted.`);
      }
      handleCloseConfirmModal();
    } catch (err) {
      toast.error(err || 'Action failed. Please try again.');
      setConfirmModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleRefresh = () => {
    dispatch(
      fetchUsers({
        page: currentPage,
        limit: 12,
        search: searchQuery,
        status: statusFilter,
        role: roleFilter
      })
    );
    toast.info('Refreshing clients directory...');
  };

  const getCleanPhone = (phone) => (phone ? phone.replace(/[^0-9]/g, '') : '');

  const totalPages = pagination?.totalPages || 1;
  const totalUsers = pagination?.totalUsers ?? users.length;
  const activeCount = pagination?.activeUsersCount ?? users.filter((u) => u.isActive).length;
  const blockedCount = pagination?.blockedUsersCount ?? users.filter((u) => !u.isActive).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold font-royal text-stone-900 dark:text-white">
              User Accounts
            </h1>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800 text-stone-600 dark:text-stone-300 shadow-sm transition-all"
            title="Refresh Users"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold">
            <UsersIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Total Users</p>
            <p className="text-xl font-bold font-royal text-stone-900 dark:text-white">{totalUsers}</p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Active</p>
            <p className="text-xl font-bold font-royal text-emerald-600 dark:text-emerald-400">
              {activeCount}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 flex items-center justify-center font-bold">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Blocked</p>
            <p className="text-xl font-bold font-royal text-rose-600 dark:text-rose-400">
              {blockedCount}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Current Page</p>
            <p className="text-xl font-bold font-royal text-purple-600 dark:text-purple-400">
              {pagination?.currentPage || 1} / {totalPages}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search clients by name, email, phone number..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-stone-50 dark:bg-zinc-800 border border-stone-200/70 dark:border-zinc-700 focus:outline-none focus:border-amber-500 text-stone-900 dark:text-white transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-zinc-800 p-1 rounded-2xl text-xs font-semibold">
            {[
              { label: 'All Status', val: 'all' },
              { label: 'Active', val: 'active' },
              { label: 'Blocked', val: 'blocked' }
            ].map((st) => (
              <button
                key={st.val}
                onClick={() => dispatch(setStatusFilter(st.val))}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  statusFilter === st.val
                    ? 'bg-white dark:bg-zinc-900 text-amber-800 dark:text-amber-400 shadow-sm font-bold'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Cards Grid */}
      {loading && users.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm animate-pulse space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-stone-200 dark:bg-zinc-800" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-stone-200 dark:bg-zinc-800 rounded w-1/2" />
                  <div className="h-3 bg-stone-200 dark:bg-zinc-800 rounded w-3/4" />
                </div>
              </div>
              <div className="h-16 bg-stone-100 dark:bg-zinc-800/60 rounded-2xl" />
              <div className="h-9 bg-stone-200 dark:bg-zinc-800 rounded-xl" />
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-sm space-y-3">
          <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950/60 rounded-2xl flex items-center justify-center text-amber-800 dark:text-amber-300 mx-auto">
            <UsersIcon className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold font-royal text-stone-900 dark:text-white">
            No Client Accounts Found
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto">
            {searchQuery
              ? `No users match the search term "${searchQuery}". Try clearing your filters.`
              : 'There are currently no users in the database.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchInput('');
                dispatch(setSearchQuery(''));
                dispatch(setStatusFilter('all'));
                dispatch(setRoleFilter('all'));
              }}
              className="px-4 py-2 rounded-xl bg-amber-700 text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {users.map((u) => {
            const userId = u._id || u.id;
            return (
              <div
                key={userId}
                onClick={() => navigate(`/users/${userId}`)}
                className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-amber-500/50 dark:hover:border-amber-500/40 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5 group relative overflow-hidden"
              >
                {/* Top User Info */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="relative shrink-0">
                        {u.profileImage ? (
                          <img
                            src={u.profileImage}
                            alt={u.name}
                            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-amber-500/30 group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-500 text-white flex items-center justify-center font-royal font-bold text-xl ring-2 ring-amber-500/30 group-hover:scale-105 transition-transform">
                            {u.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        )}
                        <span
                          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-zinc-900 ${
                            u.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                          title={u.isActive ? 'Active' : 'Blocked'}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-stone-900 dark:text-white truncate font-royal group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                            {u.name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                              u.role === 'admin'
                                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                                : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400'
                            }`}
                          >
                            {u.role || 'user'}
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                              u.isActive
                                ? 'bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                : 'bg-rose-100/80 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                            }`}
                          >
                            {u.isActive ? 'Active' : 'Blocked'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* 360 View Indicator */}
                      <span className="p-2 rounded-xl bg-stone-100 dark:bg-zinc-800 text-stone-400 group-hover:text-amber-700 group-hover:bg-amber-100/50 dark:group-hover:bg-amber-950/50 transition-all">
                        <ExternalLink className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1.5 pt-1 text-xs text-stone-600 dark:text-stone-300">
                    {u.phone && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="font-semibold">{u.phone}</span>
                          {u.isPhoneVerified && (
                            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                              Verified
                            </span>
                          )}
                        </div>
                        <a
                          href={`https://wa.me/91${getCleanPhone(u.phone)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-zinc-800 transition-colors"
                          title="Chat on WhatsApp"
                        >
                          <FaWhatsapp className="w-4 h-4" />
                        </a>
                      </div>
                    )}

                    {u.email && (
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{u.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Activity / Metrics Pills Grid */}
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-stone-100 dark:border-zinc-800 text-center">
                    <div className="p-2 rounded-2xl bg-stone-50 dark:bg-zinc-800/50">
                      <span className="block text-[10px] uppercase font-bold text-stone-400">Spent</span>
                      <span className="text-xs font-bold text-amber-800 dark:text-amber-400 font-royal truncate block">
                        {formatCurrency(u.totalSpent || 0)}
                      </span>
                    </div>

                    <div className="p-2 rounded-2xl bg-stone-50 dark:bg-zinc-800/50">
                      <span className="block text-[10px] uppercase font-bold text-stone-400">Reels</span>
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center justify-center gap-0.5">
                        <Film className="w-3 h-3" /> {u.likedReelsCount ?? 0}
                      </span>
                    </div>

                    <div className="p-2 rounded-2xl bg-stone-50 dark:bg-zinc-800/50">
                      <span className="block text-[10px] uppercase font-bold text-stone-400">Designs</span>
                      <span className="text-xs font-bold text-rose-500 flex items-center justify-center gap-0.5">
                        <Heart className="w-3 h-3" /> {u.likedDesignsCount ?? 0}
                      </span>
                    </div>

                    <div className="p-2 rounded-2xl bg-stone-50 dark:bg-zinc-800/50">
                      <span className="block text-[10px] uppercase font-bold text-stone-400">Places</span>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-0.5">
                        <MapPin className="w-3 h-3" /> {u.addressesCount ?? 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls & Dates */}
                <div className="pt-3 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-stone-400 space-y-0.5">
                    <p className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Joined {formatDate(u.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {/* Toggle Block Button */}
                    <button
                      onClick={(e) => handleOpenBlockModal(u, e)}
                      title={u.isActive ? 'Block User' : 'Unblock User'}
                      className={`p-2 rounded-xl text-xs font-bold transition-colors ${
                        u.isActive
                          ? 'text-stone-400 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-zinc-800'
                          : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {u.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>

                    {/* Delete User */}
                    <button
                      onClick={(e) => handleOpenDeleteModal(u, e)}
                      title="Delete User"
                      className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* 360 Profile Button */}
                    <button
                      onClick={() => navigate(`/users/${userId}`)}
                      className="px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      360° Profile
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            Showing <span className="font-bold text-stone-900 dark:text-white">{users.length}</span> of{' '}
            <span className="font-bold text-stone-900 dark:text-white">{totalUsers}</span> users
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => dispatch(setCurrentPage(Math.max(1, currentPage - 1)))}
              disabled={currentPage <= 1}
              className="p-2 rounded-xl border border-stone-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors text-stone-700 dark:text-stone-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => dispatch(setCurrentPage(pg))}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                  currentPage === pg
                    ? 'bg-amber-700 text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-zinc-800'
                }`}
              >
                {pg}
              </button>
            ))}

            <button
              onClick={() => dispatch(setCurrentPage(Math.min(totalPages, currentPage + 1)))}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-xl border border-stone-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors text-stone-700 dark:text-stone-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Block / Unblock & Delete */}
      <ConfirmDialog
        isOpen={confirmModal.isOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmAction}
        isLoading={confirmModal.isLoading}
        loadingText={
          confirmModal.type === 'delete'
            ? 'Deleting user...'
            : confirmModal.user?.isActive
            ? 'Blocking user...'
            : 'Unblocking user...'
        }
        title={
          confirmModal.type === 'delete'
            ? 'Delete User Account'
            : confirmModal.user?.isActive
            ? 'Block User Account'
            : 'Unblock User Account'
        }
        description={
          confirmModal.type === 'delete'
            ? `Are you sure you want to permanently delete "${confirmModal.user?.name}"? All associated account profile data will be permanently removed. This action cannot be undone.`
            : confirmModal.user?.isActive
            ? `Are you sure you want to block "${confirmModal.user?.name}"? They will lose access to login and customer portal services.`
            : `Are you sure you want to unblock "${confirmModal.user?.name}"? They will regain full access to their account and services.`
        }
        confirmText={
          confirmModal.type === 'delete'
            ? 'Delete User'
            : confirmModal.user?.isActive
            ? 'Block Account'
            : 'Unblock Account'
        }
        confirmVariant={
          confirmModal.type === 'delete'
            ? 'danger'
            : confirmModal.user?.isActive
            ? 'warning'
            : 'success'
        }
        icon={
          confirmModal.type === 'delete'
            ? Trash2
            : confirmModal.user?.isActive
            ? Lock
            : Unlock
        }
      />
    </div>
  );
};

export default Users;
