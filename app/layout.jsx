'use client';
import { useState } from 'react';
import './globals.css';
import SidebarNav from '../components/SidebarNav';

export default function RootLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-zinc-900 antialiased flex flex-col md:flex-row">
        {/* Navigation Sidebar & Mobile Header */}
        <SidebarNav isOpen={isOpen} setIsOpen={setIsOpen} />

        {/* Right Main Content Area */}
        <main className="flex-1 md:ml-64 min-h-screen bg-white pt-[52px] md:pt-0">
          {children}
        </main>
      </body>
    </html>
  );
}
