'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Info, Award, Calendar, Lock, Menu, X, Phone, Mail } from 'lucide-react';
import EnvironmentBanner from './EnvironmentBanner';

export default function SidebarNav({ isOpen, setIsOpen }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'About Us', href: '/', icon: Info },
    { name: 'Head Trainer', href: '/trainer', icon: Award },
    { name: 'Schedule & Booking', href: '/schedule', icon: Calendar },
    { name: 'Admin Portal', href: '/admin', icon: Lock },
  ];

  return (
    <>
      {/* Mobile / Small Viewport Top Sticky Bar */}
      <header className="md:hidden sticky top-0 left-0 right-0 z-40 bg-black text-white flex flex-col border-b border-zinc-800 shadow-md">
        <EnvironmentBanner />
        <div className="px-4 py-2.5 flex items-center justify-between h-[52px]">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg bg-zinc-900 text-zinc-200 hover:text-white hover:bg-zinc-800 focus:outline-none transition border border-zinc-700"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="w-5 h-5 text-[#e8b4b8]" /> : <Menu className="w-5 h-5 text-[#e8b4b8]" />}
          </button>
          <span
            className="text-xs font-bold tracking-wider text-[#e8b4b8] uppercase"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Cherry Blossom Equestrian
          </span>
        </div>
          <img
            src="/logo.png"
            alt="CBE Logo"
            className="w-7 h-auto"
          />
        </div>
      </header>

      {/* Backdrop overlay for mobile when drawer is open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sliding Navigation Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 w-64 h-screen bg-black text-white p-6 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 flex flex-col justify-between shadow-2xl md:shadow-none`}
      >
        <div>
          {/* Brand / Logo */}
          <div className="flex flex-col items-center text-center mb-8 border-b border-zinc-800 pb-6 relative">
            {/* Mobile Close Button inside Drawer */}
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden absolute top-0 right-0 p-1 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src="/logo.png"
              alt="Cherry Blossom Equestrian Logo"
              className="w-28 h-auto mb-3"
            />
            <h2
              className="text-sm font-bold tracking-widest text-[#e8b4b8] uppercase"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Cherry Blossom
            </h2>
            <span className="text-[10px] text-zinc-400 tracking-wider uppercase mt-1">
              North Metro Atlanta
            </span>
          </div>

          {/* Menu Title */}
          <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-3 px-2">
            Menu
          </div>

          {/* Nav Links: 1. Bio (/), 2. Schedule (/schedule), 3. Admin (/admin) */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition border ${
                    isActive
                      ? 'bg-zinc-900 border-zinc-700 text-[#e8b4b8] font-bold shadow-xs'
                      : 'border-transparent text-zinc-300 hover:text-white hover:bg-zinc-900/60'
                  }`}
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#e8b4b8]' : 'text-zinc-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Contact Block in Sidebar */}
        <div className="border-t border-zinc-800 pt-4 pb-3 space-y-2">
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest px-1">
            Contact Charity
          </div>
          <a
            href="tel:7702492205"
            className="flex items-center gap-2 text-xs text-zinc-300 hover:text-[#e8b4b8] transition px-1 group"
          >
            <Phone className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#e8b4b8] shrink-0" />
            <span className="font-medium">(770) 249-2205</span>
          </a>
          <a
            href="mailto:trainer@cherryblossomequestrian.com"
            className="flex items-center gap-2 text-[11px] text-zinc-300 hover:text-[#e8b4b8] transition px-1 group truncate"
            title="trainer@cherryblossomequestrian.com"
          >
            <Mail className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#e8b4b8] shrink-0" />
            <span className="font-medium truncate">trainer@cherryblossomequestrian.com</span>
          </a>
        </div>

        {/* Footer */}
        <div className="text-[10px] text-zinc-500 text-center border-t border-zinc-800 pt-3 uppercase tracking-widest">
          &copy; Cherry Blossom Equestrian
        </div>
      </aside>
    </>
  );
}
