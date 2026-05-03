import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/context/AuthContext';
import { FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show navbar on admin pages
  if (location.pathname.startsWith('/admin')) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };


  return (
    <nav className="navbar glass-morphism" id="main-navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand">
          <span className="navbar__brand-icon">🌿</span>
          <span className="navbar__brand-text font-black tracking-tighter text-secondary">Botanical Archive</span>
        </Link>

        <div className={`navbar__links ${mobileMenuOpen ? 'navbar__links--open' : ''}`}>
          <Link to="/" className="navbar__link font-bold uppercase tracking-widest text-[10px]" onClick={() => setMobileMenuOpen(false)}>Sanctuary</Link>
          <Link to="/book/date" className="navbar__link font-black uppercase tracking-widest text-[10px]" onClick={() => setMobileMenuOpen(false)}>Book Visit</Link>
          {user ? (
            <>
              <Link to="/my-bookings" className="navbar__link font-bold uppercase tracking-widest text-[10px]" onClick={() => setMobileMenuOpen(false)}>Archive</Link>
              {isAdmin() && (
                <Link to="/admin" className="navbar__link navbar__link--admin font-black uppercase tracking-widest text-[10px]" onClick={() => setMobileMenuOpen(false)}>Curator</Link>
              )}
              <div className="navbar__user flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">{user.email?.split('@')[0]}</span>
                <button className="btn btn--ghost btn--icon" onClick={handleLogout} id="logout-btn">
                  <FiLogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" className="btn btn--primary btn--sm px-6 font-black uppercase tracking-widest text-[10px]" onClick={() => setMobileMenuOpen(false)}>
              Access
            </Link>
          )}
        </div>

        <button
          className="navbar__toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
