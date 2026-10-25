'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Search,
  Menu,
  X,
  Flame,
  Trophy,
  HelpCircle,
  LayoutDashboard,
  Home,
  Compass,
  ArrowRight,
  Droplets,
} from 'lucide-react';
import { CommandPalette } from './CommandPalette';
import { ConnectButton } from '@/components/auth/ConnectButton';
import { robinhoodChain, isTestnet } from '@/lib/chain/config';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  highlightDot?: boolean;
}

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchPaletteOpen, setSearchPaletteOpen] = useState(false);

  // Dev-only tap debug overlay (?debug=1) - excluded from production
  const [isDebug, setIsDebug] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      const params = new URLSearchParams(window.location.search);
      setIsDebug(params.get('debug') === '1');
    }
  }, [pathname]);

  // Scroll detection for subtle navbar border shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Body scroll lock management: lock when open, strictly release on close, unmount, and route change
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Always close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchPaletteOpen(false);
  }, [pathname]);

  // Esc key closes menu and command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setSearchPaletteOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Dev-only debug touch logger
  useEffect(() => {
    if (!isDebug) return;
    const handleTouch = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        const tag = el ? el.tagName.toLowerCase() : 'null';
        const id = el?.id ? `#${el.id}` : '';
        const cls = el ? String((el as any).className?.baseVal || el.className || '').slice(0, 20) : '';
        setDebugLog((prev) => [
          `[TAP] (${Math.round(touch.clientX)}, ${Math.round(touch.clientY)}) -> ${tag}${id}.${cls}`,
          ...prev.slice(0, 4),
        ]);
      }
    };
    window.addEventListener('touchstart', handleTouch, { passive: true });
    return () => window.removeEventListener('touchstart', handleTouch);
  }, [isDebug]);

  const navItems: NavItem[] = [
    { name: 'HOME', href: '/', icon: Home },
    { name: 'GRAVES', href: '/graves', icon: Compass },
    { name: 'BURY', href: '/bury', icon: Flame, highlightDot: true },
    { name: 'LEADERBOARD', href: '/leaderboard', icon: Trophy },
    { name: 'HOW IT WORKS', href: '/how-it-works', icon: HelpCircle },
    { name: 'DASHBOARD', href: '/dashboard', icon: LayoutDashboard },
  ];

  return (
    <>
      {/* Dev-only mobile debug overlay (excluded from production builds) */}
      {isDebug && process.env.NODE_ENV !== 'production' && (
        <div className="fixed bottom-2 left-2 right-2 z-[999] bg-[#0A0A0A] text-[#5CE1FF] text-[10px] font-mono p-2 rounded-xl border-2 border-[#262626] pointer-events-none opacity-90 shadow-lg">
          <div className="font-bold text-white mb-1">MOBILE TAP DEBUGGER:</div>
          {debugLog.map((log, i) => (
            <div key={i} className="truncate">{log}</div>
          ))}
        </div>
      )}

      {/* HEADER: canonical z-[60] so navbar buttons are never obscured by below-header backdrops */}
      <header
        className={`w-full sticky top-0 z-[60] bg-[#000000] border-b-[3px] border-[#222222] transition-shadow duration-150 select-none ${
          scrolled ? 'shadow-[0_4px_16px_rgba(0,0,0,0.95)]' : ''
        }`}
      >
        {/* DESKTOP NAVBAR (1024px+) */}
        <div className="hidden lg:flex items-stretch h-[68px] w-full">
          {/* Logo Container */}
          <Link
            href="/"
            className="flex items-center gap-3 px-6 bg-white border-r-[3px] border-[#222222] hover:brightness-95 transition-all shrink-0"
          >
            <div className="w-9 h-9 relative shrink-0">
              <Image
                src="/assets/logo.png"
                alt="Graven Logo"
                width={36}
                height={36}
                priority
                className="object-contain"
              />
            </div>
            <span className="font-ui font-bold text-lg text-[#0A0F2E] uppercase tracking-wider">
              GRAVEN
            </span>
          </Link>

          {/* Center Links */}
          <nav className="flex-1 flex items-center justify-center gap-1 xl:gap-2 px-4">
            {navItems.map((item) => {
              const isActive =
                item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3.5 py-1.5 rounded-full font-ui text-[12px] font-bold uppercase tracking-wider transition-colors duration-150 touch-manipulation ${
                    isActive
                      ? 'bg-[#1237E8] text-white border-[2px] border-[#3F6EF5] shadow-[2px_2px_0_#000000]'
                      : 'text-white hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    {item.name}
                    {item.highlightDot && (
                      <span className="w-2 h-2 rounded-full bg-[#E4FF6B] inline-block border border-[#000000]" />
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Search Button */}
          <div className="flex items-center px-3 shrink-0">
            <button
              type="button"
              onClick={() => setSearchPaletteOpen(true)}
              aria-label="Search token contracts"
              className="btn-icon bg-[#111111] text-white border-[2px] border-[#262626] hover:bg-[#1A1A1A] touch-manipulation cursor-pointer"
              title="Search by contract or token (Ctrl+K)"
            >
              <Search className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Desktop Connect Wallet */}
          <div className="flex items-center bg-[#1237E8] border-l-[3px] border-[#222222] px-6 shrink-0">
            <ConnectButton variant="navbar-full" />
          </div>
        </div>

        {/* MOBILE NAVBAR (<1024px, 60px height) */}
        <div className="flex lg:hidden items-stretch h-[60px] w-full">
          {/* Logo Container */}
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex-1 flex items-center gap-2.5 px-3.5 bg-white border-r-[3px] border-[#222222] hover:brightness-95 active:bg-[#f0f0f0]"
          >
            <div className="w-8 h-8 relative shrink-0">
              <Image
                src="/assets/logo.png"
                alt="Graven Logo"
                width={32}
                height={32}
                priority
                className="object-contain"
              />
            </div>
            <span className="font-ui font-bold text-base text-[#0A0F2E] uppercase tracking-wider">
              GRAVEN
            </span>
          </Link>

          {/* Right: Compact Connect Button + Hamburger Trigger */}
          <div className="flex items-stretch h-full">
            <ConnectButton variant="navbar-compact" />

            {/* Plain Client Hamburger Button: toggles boolean, never blocked by overlay */}
            <button
              type="button"
              id="mobile-menu-trigger"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu-drawer"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              className="w-[56px] h-full flex items-center justify-center border-l-[3px] border-[#222222] bg-[#000000] text-white cursor-pointer active:bg-[#111111] touch-manipulation transition-colors select-none"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU BACKDROP & PANEL: Renders ONLY when mobileMenuOpen is true */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop starts at top-[60px] so the header and hamburger are NEVER covered */}
          <div
            className="fixed inset-x-0 bottom-0 top-[60px] z-[58] bg-black/75 backdrop-blur-[2px] lg:hidden animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
            onTouchEnd={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div
            id="mobile-menu-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
            className="fixed inset-x-2 top-[66px] z-[60] bg-[#0A0A0A] border-[3px] border-[#262626] rounded-[24px] p-4 shadow-[6px_6px_0_#000000] text-white lg:hidden max-h-[calc(100svh-76px)] overflow-y-auto animate-fade-in"
          >
            {/* Header: Network Chip & Close button */}
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-[14px] bg-[#141414] border-[2px] border-[#262626] mb-2.5 font-ui">
              <span className="text-[11px] font-bold text-[#A3A3A3] uppercase">NETWORK:</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#5CE1FF] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1DB954]" />
                  Robinhood Chain Mainnet
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-white/10 active:bg-white/20 cursor-pointer touch-manipulation ml-1 text-white"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Contract Address Status (Coming Soon) */}
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-[14px] bg-[#101010] border-[2px] border-[#222222] mb-3 font-ui">
              <span className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider">$GRAVEN CONTRACT:</span>
              <span className="text-[11px] font-mono font-bold text-[#E4FF6B] px-2.5 py-0.5 rounded-full bg-[#1A1A1A] border border-[#262626]">
                COMING SOON
              </span>
            </div>

            {/* Menu Rows: Exactly 56px rows using next/link with onClick={close} */}
            <div className="space-y-0 divide-y-[2px] divide-[#262626] border-y-[2px] border-[#262626] mb-4">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive =
                  item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`h-[56px] px-3 flex items-center justify-between text-xs font-ui font-bold uppercase tracking-wider transition-colors touch-manipulation ${
                      isActive
                        ? 'bg-[#1237E8] text-white'
                        : 'bg-[#0A0A0A] hover:bg-[#161616] active:bg-[#161616] text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-[10px] border-[2px] border-[#262626] flex items-center justify-center ${
                          isActive ? 'bg-white text-[#0A0F2E]' : 'bg-[#141414] text-white'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span>{item.name}</span>
                      {item.highlightDot && (
                        <span className="w-2 h-2 rounded-full bg-[#E4FF6B] border border-[#000000]" />
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#A3A3A3]" />
                  </Link>
                );
              })}
            </div>

            {/* Full-width Connect Wallet Button at the bottom */}
            <div className="pt-1">
              <ConnectButton variant="menu-full" />
            </div>
          </div>
        </>
      )}

      {/* Global Command Palette (Ctrl+K or search button) */}
      <CommandPalette
        isOpen={searchPaletteOpen}
        onClose={() => setSearchPaletteOpen(false)}
      />
    </>
  );
}
