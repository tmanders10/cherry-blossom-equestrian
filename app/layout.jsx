import './globals.css';
import SidebarNav from '../components/SidebarNav';
import EnvironmentBanner from '../components/EnvironmentBanner';

export const metadata = {
  title: 'Cherry Blossom Equestrian | Hunter/Jumper Center North Metro Atlanta',
  description: 'Premier Hunter/Jumper Equestrian Center in North Metro Atlanta specializing in competitive lesson programs.',
  icons: {
    icon: [
      { url: '/favicon-emblem-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-emblem-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon-emblem-192.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Favicon / Tab Icon Links (Text-Free Horseshoe Emblem) */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-emblem-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-emblem-16.png" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon-emblem-192.png" />
      </head>
      <body className="min-h-screen bg-white text-zinc-900 antialiased flex flex-col md:flex-row">
        {/* Navigation Sidebar & Mobile Header */}
        <SidebarNav />

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
