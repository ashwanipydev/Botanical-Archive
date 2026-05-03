import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../../core/context/AuthContext';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const initials = user?.fullName
    ? user.fullName.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
    : 'BA';

  return (
    <div className="min-h-screen bg-background text-on-surface antialiased">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="relative min-h-screen md:ml-72">
        <header className="fixed left-0 right-0 top-0 z-40 h-20 bg-background/85 backdrop-blur-xl md:left-72">
          <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 md:px-12">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-container-low text-primary md:hidden"
              >
                <span className="material-symbols-outlined">
                  {isSidebarOpen ? 'close' : 'menu'}
                </span>
              </button>

              <div>
                <p className="label mb-1">Status Dashboard</p>
                <h2 className="text-sm font-black tracking-tight text-primary md:text-xl">
                  Civic Naturalist Archive
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              <button className="hidden items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant lg:flex">
                Overview
              </button>
              <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-container-low text-primary">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </button>
              <button className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-container-low text-primary">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-error" />
              </button>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-xs font-black text-background shadow-organic-sm">
                {initials}
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 pt-24 md:px-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
