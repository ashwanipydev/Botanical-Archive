import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/context/AuthContext';

const menuItems = [
  { path: '/admin', icon: 'dashboard', label: 'Dashboard', exact: true, roles: ['ROLE_ADMIN'] },
  { path: '/admin/slots', icon: 'calendar_view_day', label: 'Slots', roles: ['ROLE_SLOTS', 'ROLE_ADMIN'] },
  { path: '/admin/bookings', icon: 'event_available', label: 'Bookings', roles: ['ROLE_BOOKINGS', 'ROLE_ADMIN'] },
  { path: '/admin/analytics', icon: 'monitoring', label: 'Analytics', roles: ['ROLE_ANALYTICS', 'ROLE_ADMIN'] },
  { path: '/admin/pricing', icon: 'payments', label: 'Pricing', roles: ['ROLE_PRICING', 'ROLE_ADMIN'] },
  { path: '/admin/users', icon: 'group', label: 'Users', roles: ['ROLE_ADMIN'] },
];

const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const { logout, hasRole, user } = useAuth();
  const navigate = useNavigate();

  const filteredMenu = menuItems.filter((item) => {
    if (hasRole('ROLE_ADMIN')) return true;
    return item.roles?.some((role) => hasRole(role));
  });

  const initials = user?.fullName
    ? user.fullName.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
    : 'BA';

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-45 bg-primary/40 backdrop-blur-xl transition-all duration-500 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col bg-background px-4 py-8 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="mb-10 px-4">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-container text-on-primary shadow-organic-md">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                park
              </span>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-primary">
                Botanical Archive
              </h1>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-on-surface-variant">
                Zoo Administration
              </p>
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-surface-container-low p-4">
            <p className="label mb-2">Active Curator</p>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-xs font-black text-background">
                {initials}
              </div>
              <div>
                <div className="text-sm font-black text-primary">
                  {user?.fullName || 'Archive Curator'}
                </div>
                <div className="text-xs font-medium text-on-surface-variant">
                  {user?.email || 'registry@botanical-archive.local'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {filteredMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                [
                  'flex items-center gap-4 rounded-r-full px-6 py-3.5 transition-colors duration-200',
                  isActive
                    ? 'bg-surface-container-high text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary',
                ].join(' ')
              }
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              <span className="text-sm font-bold tracking-tight">{item.label}</span>
            </NavLink>
          ))}

          {(hasRole('ROLE_GATEKEEPER') || hasRole('ROLE_ADMIN')) && (
            <NavLink
              to="/staff/gatekeeper"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                [
                  'flex items-center gap-4 rounded-r-full px-6 py-3.5 transition-colors duration-200',
                  isActive
                    ? 'bg-secondary-container/45 text-on-secondary-container'
                    : 'text-on-surface-variant hover:bg-secondary-container/35 hover:text-secondary',
                ].join(' ')
              }
            >
              <span className="material-symbols-outlined text-[22px]">door_open</span>
              <span className="text-sm font-bold tracking-tight">Gatekeeper</span>
            </NavLink>
          )}
        </nav>

        <div className="mt-auto space-y-2 px-2">
          <button
            onClick={() => {
              setIsOpen(false);
              navigate('/');
            }}
            className="flex w-full items-center gap-4 rounded-r-full px-6 py-3.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="text-sm font-semibold tracking-tight">Return to site</span>
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="flex w-full items-center gap-4 rounded-r-full px-6 py-3.5 text-on-surface-variant transition-colors hover:bg-error-container hover:text-error"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-semibold tracking-tight">Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
