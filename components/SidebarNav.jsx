'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Info, Calendar, Lock } from 'lucide-react';

export default function SidebarNav({ isOpen, setIsOpen }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Head Trainer Bio', href: '/', icon: Info },
    { name: 'Schedule & Booking', href: '/schedule', icon: Calendar },
    { name: 'Admin Portal', href: '/admin', icon: Lock },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-40 w-64 h-screen bg-black text-white p-6 transition-transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 flex flex-col justify-between`}
    >
      <div>
        {/* Brand / Logo */}
        <div className="flex flex-col items-center text-center mb-8 border-b border-zinc-800 pb-6">
          <img
            src="/logo.png"
            alt="Cherry Blossom Equestrian Logo"
            className="w-32 h-auto mb-3"
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
                onClick={() => setIsOpen && setIsOpen(false)}
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

      {/* Footer */}
      <div className="text-[10px] text-zinc-500 text-center border-t border-zinc-800 pt-4 uppercase tracking-widest">
        &copy; Cherry Blossom Equestrian
      </div>
    </aside>
  );
}
