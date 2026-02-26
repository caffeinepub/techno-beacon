import React, { useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { Radio, LogIn, LogOut, User, Menu, X, Loader2 } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile } from '../hooks/useQueries';

export default function Navigation() {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isAuthenticated = !!identity;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    setMobileOpen(false);
  };

  const handleLogin = () => {
    login();
    setMobileOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Discover' },
    { to: '/artists', label: 'Artists' },
    { to: '/my-radar', label: 'My Radar' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/assets/generated/techno-beacon-logo.dim_128x128.png"
              alt="Techno Beacon"
              className="w-8 h-8 rounded-sm"
            />
            <span className="font-mono font-bold text-sm tracking-widest text-neon-amber uppercase hidden sm:block group-hover:neon-glow transition-all">
              Techno Beacon
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 text-sm font-medium rounded-sm transition-all duration-200 ${
                  isActive(link.to)
                    ? 'text-neon-amber bg-neon-amber/10 border border-neon-amber/30'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {link.label}
                {link.to === '/my-radar' && !isAuthenticated && (
                  <span className="ml-1.5 text-xs text-muted-foreground/60">🔒</span>
                )}
              </Link>
            ))}
          </nav>

          {/* Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-sm border border-border">
                  <User className="w-3.5 h-3.5 text-neon-amber" />
                  <span className="text-xs font-mono text-foreground max-w-[120px] truncate">
                    {userProfile?.name || identity.getPrincipal().toString().slice(0, 8) + '...'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground border border-border rounded-sm hover:text-foreground hover:border-foreground/30 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="flex items-center gap-2 px-4 py-2 bg-neon-amber text-background text-sm font-semibold rounded-sm hover:bg-neon-amber-dim transition-colors disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <LogIn className="w-3.5 h-3.5" />
                )}
                {isLoggingIn ? 'Connecting...' : 'Login'}
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2.5 text-sm font-medium rounded-sm transition-all ${
                  isActive(link.to)
                    ? 'text-neon-amber bg-neon-amber/10 border border-neon-amber/30'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {link.label}
                {link.to === '/my-radar' && !isAuthenticated && (
                  <span className="ml-1.5 text-xs text-muted-foreground/60">🔒</span>
                )}
              </Link>
            ))}
            <div className="pt-2 border-t border-border mt-2">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-sm">
                    <User className="w-3.5 h-3.5 text-neon-amber" />
                    <span className="text-xs font-mono text-foreground truncate">
                      {userProfile?.name || identity.getPrincipal().toString().slice(0, 12) + '...'}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-muted-foreground border border-border rounded-sm hover:text-foreground"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-neon-amber text-background text-sm font-semibold rounded-sm hover:bg-neon-amber-dim transition-colors disabled:opacity-50"
                >
                  {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  {isLoggingIn ? 'Connecting...' : 'Login'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
