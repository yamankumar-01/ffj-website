import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { QrCode, Search, Trees, Shield, LogOut, Menu, X, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ onOpenScanner }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-[#f7f5ee]/90 backdrop-blur-md border-b border-[#2d6a4f]/15 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Brand Logo & Title */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1b4332] to-[#2d6a4f] p-0.5 shadow-md flex items-center justify-center transform group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full bg-[#f7f5ee] flex items-center justify-center overflow-hidden border border-[#52b788]/30">
                <Leaf className="w-6 h-6 text-[#1b4332] group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-xl text-[#1b4332] tracking-tight">
                  Fruitfull Jaipur
                </span>
                <span className="bg-[#1b4332] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                  Tree Aadhar
                </span>
              </div>
              <p className="text-xs text-[#2d6a4f] font-medium tracking-wide">
                Digital Identity • JECRC Foundation
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1.5 lg:gap-3">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                isActive('/')
                  ? 'bg-[#1b4332] text-white shadow-xs'
                  : 'text-[#1b4332] hover:bg-[#2d6a4f]/10'
              }`}
            >
              Home
            </Link>
            <Link
              to="/trees"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                isActive('/trees')
                  ? 'bg-[#1b4332] text-white shadow-xs'
                  : 'text-[#1b4332] hover:bg-[#2d6a4f]/10'
              }`}
            >
              <Trees className="w-4 h-4" />
              All Trees (Directory)
            </Link>

            {/* Quick QR Lookup Modal Trigger */}
            <button
              onClick={onOpenScanner}
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-[#1b4332] bg-[#d8f3dc]/70 hover:bg-[#bbf7d0] border border-[#52b788]/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Lookup tree by Aadhar ID or simulate scan"
            >
              <QrCode className="w-4 h-4 text-[#1b4332]" />
              Scan / Lookup
            </button>
          </div>

          {/* Admin Section */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/admin"
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#2d6a4f] text-white hover:bg-[#1b4332] transition-all flex items-center gap-2 shadow-xs"
                >
                  <Shield className="w-4 h-4 text-[#74c69d]" />
                  Admin Dashboard
                </Link>
                <button
                  onClick={logout}
                  title="Log out of Admin"
                  className="p-2 rounded-lg text-[#c2410c] hover:bg-[#c2410c]/10 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/admin/login"
                className="px-4 py-2 rounded-lg text-sm font-semibold text-[#1b4332] border border-[#1b4332] hover:bg-[#1b4332] hover:text-white transition-all duration-200 shadow-xs flex items-center gap-1.5"
              >
                <Shield className="w-4 h-4" />
                Login as Admin
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenScanner}
              className="p-2 rounded-lg bg-[#d8f3dc] text-[#1b4332] border border-[#52b788]/30"
              title="Lookup tree"
            >
              <QrCode className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#1b4332] hover:bg-[#2d6a4f]/10"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#f7f5ee] border-b border-[#2d6a4f]/20 px-4 pt-3 pb-5 space-y-2 shadow-lg animate-in slide-in-from-top-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2.5 rounded-lg font-semibold text-sm ${
              isActive('/') ? 'bg-[#1b4332] text-white' : 'text-[#1b4332]'
            }`}
          >
            Home
          </Link>
          <Link
            to="/trees"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2.5 rounded-lg font-semibold text-sm ${
              isActive('/trees') ? 'bg-[#1b4332] text-white' : 'text-[#1b4332]'
            }`}
          >
            All Trees (Directory)
          </Link>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenScanner();
            }}
            className="w-full text-left px-3 py-2.5 rounded-lg font-semibold text-sm text-[#1b4332] bg-[#d8f3dc] flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            Scan / Search Tree Aadhar
          </button>
          <div className="pt-2 border-t border-[#2d6a4f]/10">
            {isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-lg font-semibold text-sm bg-[#2d6a4f] text-white"
                >
                  Admin Dashboard ({user?.name || 'Admin'})
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg font-semibold text-sm text-[#c2410c]"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg font-semibold text-sm border border-[#1b4332] text-[#1b4332] text-center"
              >
                Login as Admin
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
