import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Menu,
  Sun,
  Moon,
  Bell,
  Search,
  Sparkles,
  LogOut,
  User,
  ShieldCheck,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { toggleTheme, toggleMobileSidebar } from '../../redux/slices/themeSlice';
import { logoutAdmin } from '../../redux/slices/authSlice';
import ConfirmDialog from './ConfirmDialog';
import { toast } from 'sonner';

export const Navbar = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.mode);
  const user = useSelector((state) => state.auth.user);
  const logoutLoading = useSelector((state) => state.auth.logoutLoading);
  const enquiries = useSelector((state) => state.enquiries.items);

  const [unreadCount, setUnreadCount] = useState(3);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const newEnquiries = enquiries.filter((e) => e.status === 'New').slice(0, 4);

  const handleConfirmLogout = async () => {
    try {
      await dispatch(logoutAdmin()).unwrap();
      toast.success('Admin logged out successfully');
      setIsLogoutConfirmOpen(false);
    } catch (err) {
      toast.error('Logged out with session cleared');
      setIsLogoutConfirmOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-18 w-full items-center justify-between border-b border-amber-900/10 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 px-4 sm:px-8 backdrop-blur-md transition-colors">
        {/* Left: Mobile Toggle & Brand Indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch(toggleMobileSidebar())}
            className="p-2.5 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-amber-100/60 dark:hover:bg-zinc-800 lg:hidden transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white shadow-md shadow-amber-900/20">
              <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
            </div>
            <div className="hidden sm:block">
              <h2 className="text-base font-bold font-royal tracking-wide text-stone-900 dark:text-white leading-none">
                ART BY RADHIKA
              </h2>
              <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                Bridal & Henna Admin Studio
              </span>
            </div>
          </div>
        </div>

        {/* Center/Search for desktop */}
        <div className="hidden md:flex items-center relative max-w-md w-full mx-6">
          <Search className="w-4 h-4 absolute left-3.5 text-stone-400" />
          <input
            type="text"
            placeholder="Search bride, booking ID, design, reels..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-full bg-stone-100/80 dark:bg-zinc-900 border border-transparent focus:border-amber-500/50 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all dark:text-white placeholder-stone-400"
          />
        </div>

        {/* Right: Actions (Notifications, Theme, Profile) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Dropdown using Radix Dropdown */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className="relative p-2.5 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-amber-100/50 dark:hover:bg-zinc-800 transition-colors focus:outline-none cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-zinc-900">
                    {unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="z-50 w-80 sm:w-96 rounded-2xl bg-white dark:bg-zinc-900 border border-amber-200/50 dark:border-zinc-800 shadow-2xl p-4 text-stone-800 dark:text-stone-100 animate-in fade-in zoom-in-95"
              >
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm font-royal">Recent Booking Enquiries</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      {newEnquiries.length} New
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => {
                        setUnreadCount(0);
                        toast.success('All notifications marked as read');
                      }}
                      className="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 font-medium cursor-pointer"
                    >
                      Mark read
                    </button>
                  )}
                </div>

                <div className="mt-2 space-y-2 max-h-72 overflow-y-auto">
                  {newEnquiries.length === 0 ? (
                    <p className="text-xs text-stone-500 text-center py-4">No new booking requests.</p>
                  ) : (
                    newEnquiries.map((enq) => (
                      <div
                        key={enq.id}
                        className="p-3 rounded-xl bg-amber-50/50 dark:bg-zinc-800/60 border border-amber-100/50 dark:border-zinc-700/50 hover:bg-amber-100/40 transition-colors"
                      >
                        <div className="flex items-center justify-between text-xs font-semibold text-stone-800 dark:text-white">
                          <span>{enq.clientName}</span>
                          <span className="text-[10px] text-amber-600 dark:text-amber-400">
                            {enq.eventType}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-1">
                          {enq.message}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {enq.eventDate}
                          </span>
                          <span className="font-semibold text-stone-700 dark:text-stone-300">
                            {enq.budget}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {/* Theme Mode Toggle */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2.5 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-amber-100/50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-stone-700" />
            )}
          </button>

          {/* User Profile Dropdown */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-2 pl-2 focus:outline-none group cursor-pointer">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt="Profile"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-500/40 group-hover:ring-amber-500 transition-all shadow"
                />
                <div className="hidden xl:block text-left">
                  <p className="text-xs font-bold text-stone-800 dark:text-white leading-tight">
                    {user?.name || 'Art By Radhika Admin'}
                  </p>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400">
                    Lead Artist & Owner
                  </p>
                </div>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="z-50 w-56 rounded-2xl bg-white dark:bg-zinc-900 border border-amber-200/50 dark:border-zinc-800 shadow-2xl p-2 text-stone-800 dark:text-stone-100 animate-in fade-in"
              >
                <div className="px-3 py-2 border-b border-stone-100 dark:border-zinc-800">
                  <p className="text-xs font-bold text-stone-900 dark:text-white">{user?.name || 'Admin'}</p>
                  <p className="text-[11px] text-stone-400 truncate">{user?.email || 'admin@artbyradhika.com'}</p>
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-3 h-3" /> Verified Studio Admin
                  </span>
                </div>
                <DropdownMenu.Item
                  onClick={() => setIsLogoutConfirmOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl cursor-pointer mt-1 transition-colors outline-none"
                >
                  <LogOut className="w-4 h-4" />
                  Logout Studio
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </header>

      {/* Logout Confirmation Popup */}
      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Logout Confirmation"
        description="Are you sure you want to end your current session and logout of Art By Radhika Admin Studio?"
        confirmText="Yes, Log Out"
        cancelText="Stay Logged In"
        confirmVariant="danger"
        isLoading={logoutLoading}
        icon={LogOut}
      />
    </>
  );
};

export default Navbar;
