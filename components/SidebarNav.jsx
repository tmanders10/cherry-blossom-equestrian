'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Shield, Info, Menu, X } from 'lucide-react';

export default function SidebarNav({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { label: 'Schedule & Booking', href: '/schedule', icon: Calendar },
    { label: 'Head Trainer Bio', href: '/', icon: Info },
    { label: 'Admin Portal', href: '/admin', icon: Shield },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white text-zinc-900">
      {/* MOBILE STICKY HEADER */}
      <div className="md:hidden sticky top-0 z-50 flex items-center justify-between bg-black text-white px-4 py-3 shadow-md">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/dark logo square.png"
            alt="Cherry Blossom Equestrian Logo"
            className="w-7 h-7 object-contain"
          />
          <span className="font-serif text-xs font-bold tracking-wider text-amber-400">
            CHERRY BLOSSOM EQUESTRIAN
          </span>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1 focus:outline-none text-zinc-300 hover:text-white"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MOBILE SLIDE-OUT OVERLAY MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black flex flex-col pt-16 px-6 space-y-4 text-white">
          <p className="text-[10px] font-serif uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 py-3 px-3 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-zinc-800 text-amber-400 border-l-4 border-amber-500'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}

      {/* DESKTOP FIXED SIDEBAR WITH LOGO BRANDING */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 z-40 bg-black text-white p-6 justify-between border-r border-zinc-800 shadow-xl">
        <div className="space-y-6">
          {/* Logo Header */}
          <div className="space-y-2 border-b border-zinc-800/80 pb-5">
            <Link href="/" className="block">
              <img
                src="/logo.png"
                alt="Cherry Blossom Equestrian Logo"
                className="w-44 h-auto mx-auto filter invert brightness-200"
              />
            </Link>
            <p className="text-[10px] uppercase tracking-widest text-amber-500 font-serif text-center font-semibold">
              North Metro Atlanta
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <p className="text-[10px] font-serif uppercase tracking-widest text-zinc-500 px-3 mb-2">
              Menu
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-medium transition ${
                    isActive
                      ? 'bg-zinc-800 text-amber-400 border-l-2 border-amber-500 font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <footer className="text-[10px] text-zinc-600 uppercase tracking-widest text-center border-t border-zinc-900 pt-4">
          &copy; {new Date().getFullYear()} Cherry Blossom Equestrian
        </footer>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-64 w-full min-h-screen">
        {children}
      </main>
    </div>
  );
}
