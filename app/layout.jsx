'use client';
import { useState } from 'react';
import './globals.css';
import SidebarNav from '../components/SidebarNav';
import EnvironmentBanner from '../components/EnvironmentBanner';

export default function RootLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <html lang="en">
      <head>
        <title>Cherry Blossom Equestrian | Hunter/Jumper Center North Metro Atlanta</title>
        <meta name="description" content="Premier Hunter/Jumper Equestrian Center in North Metro Atlanta specializing in competitive lesson programs." />
        
        {/* Favicon / Tab Icon Links */}
        <link rel="icon" type="image/png" href="/dark%20logo%20square.png" />
        <link rel="apple-touch-icon" href="/dark%20logo%20square.png" />
      </head>
      <body className="min-h-screen bg-white text-zinc-900 antialiased flex flex-col md:flex-row">
        {/* Navigation Sidebar & Mobile Header */}
        <SidebarNav isOpen={isOpen} setIsOpen={setIsOpen} />

        {/* Right Main Content Area */}
        <main className="flex-1 md:ml-64 min-h-screen bg-white">
          <div className="hidden md:block sticky top-0 z-40">
            <EnvironmentBanner />
          </div>
          {children}
        </main>
      </body>
    </html>
  );
}
