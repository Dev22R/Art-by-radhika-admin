import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';

export const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-stone-100 antialiased transition-colors">
      <Toaster position="top-right" richColors closeButton />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <Navbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
