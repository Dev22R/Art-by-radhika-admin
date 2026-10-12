import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  Users,
  Palette,
  BadgePercent,
  Film,
  MailQuestion,
  HelpCircle,
  Settings,
  X,
  Sparkles,
  HeartHandshake,
  LogOut
} from 'lucide-react';
import clsx from 'clsx';
import { closeMobileSidebar } from '../../redux/slices/themeSlice';
import { logoutAdmin } from '../../redux/slices/authSlice';
import ConfirmDialog from './ConfirmDialog';
import { toast } from 'sonner';

export const Sidebar = () => {
  const dispatch = useDispatch();
  const mobileSidebarOpen = useSelector((state) => state.theme.mobileSidebarOpen);
  const enquiries = useSelector((state) => state.enquiries.items);
  const logoutLoading = useSelector((state) => state.auth.logoutLoading);
  const newEnquiriesCount = enquiries.filter((e) => e.status === 'New').length;
  const designs = useSelector((state) => state.designs.items);

  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const handleConfirmLogout = async () => {
    try {
      await dispatch(logoutAdmin()).unwrap();
      toast.success('Admin logged out successfully');
      setIsLogoutConfirmOpen(false);
      dispatch(closeMobileSidebar());
    } catch (err) {
      toast.error('Session cleared');
      setIsLogoutConfirmOpen(false);
      dispatch(closeMobileSidebar());
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'All Clients / Users', path: '/users', icon: Users },
    { name: 'Mehndi Designs', path: '/designs', icon: Palette, badge: designs.length },
    { name: 'Pricing Packages', path: '/pricing-plans', icon: BadgePercent },
    { name: 'Reels & Showcase', path: '/reels', icon: Film },
    {
      name: 'Contact & Enquiries',
      path: '/enquiries',
      icon: MailQuestion,
      badge: newEnquiriesCount > 0 ? `${newEnquiriesCount} New` : null,
      badgeColor: 'bg-rose-500 text-white'
    },
    { name: 'FAQ Management', path: '/faqs', icon: HelpCircle },
    { name: 'Studio Settings', path: '/settings', icon: Settings }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 border-r border-amber-900/10 dark:border-zinc-800 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-amber-900/10 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-700 via-amber-600 to-yellow-500 flex items-center justify-center text-white shadow-lg shadow-amber-800/25">
            <HeartHandshake className="w-6 h-6 text-amber-100" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-royal tracking-wide text-stone-900 dark:text-white leading-tight">
              ART BY RADHIKA
            </h1>
            <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 tracking-wider uppercase">
              ABR Admin Suite
            </p>
          </div>
        </div>
        <button
          onClick={() => dispatch(closeMobileSidebar())}
          className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-white lg:hidden cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
          Studio Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => dispatch(closeMobileSidebar())}
              className={({ isActive }) =>
                clsx(
                  'group flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md shadow-amber-800/20'
                    : 'text-stone-600 dark:text-stone-300 hover:bg-amber-100/50 dark:hover:bg-zinc-900 hover:text-amber-800 dark:hover:text-amber-300'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      className={clsx(
                        'w-5 h-5 transition-transform duration-200 group-hover:scale-110',
                        isActive ? 'text-amber-100' : 'text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400'
                      )}
                    />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={clsx(
                        'px-2 py-0.5 rounded-full text-[11px] font-bold',
                        isActive
                          ? 'bg-amber-800 text-amber-100'
                          : item.badgeColor || 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}

        {/* Sidebar Logout Button */}
        <div className="pt-4 border-t border-stone-100 dark:border-zinc-800 mt-2">
          <button
            onClick={() => setIsLogoutConfirmOpen(true)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5 text-rose-500" />
            <span>Logout Studio</span>
          </button>
        </div>
      </nav>

      {/* Promo Banner Card */}
      <div className="p-4 m-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-rose-500/10 border border-amber-500/20 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 mb-1">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-bold font-royal">Henna Season Peak</span>
        </div>
        <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
          Wedding season bookings are live! Check pending booking enquiries to confirm dates.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col shrink-0 h-screen sticky top-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={() => dispatch(closeMobileSidebar())}
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm transition-opacity"
          />
          <div className="relative w-72 max-w-[85%] h-full z-10 shadow-2xl animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Logout Confirmation"
        description="Are you sure you want to log out of Art By Radhika Admin Studio?"
        confirmText="Yes, Log Out"
        cancelText="Stay Logged In"
        confirmVariant="danger"
        isLoading={logoutLoading}
        icon={LogOut}
      />
    </>
  );
};

export default Sidebar;
