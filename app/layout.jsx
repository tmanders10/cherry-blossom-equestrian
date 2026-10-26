import './globals.css';
import SidebarNav from '../components/SidebarNav';

export const metadata = {
  title: {
    default: 'Cherry Blossom Equestrian | Hunter/Jumper Center North Metro Atlanta',
    template: '%s | Cherry Blossom Equestrian',
  },
  description: 'Premier Hunter/Jumper Equestrian Center in North Metro Atlanta specializing in competitive lesson programs and horse development.',
  icons: {
    icon: '/dark-logo-square.png', // or '/favicon.ico'
    shortcut: '/dark-logo-square.png',
    apple: '/dark-logo-square.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/dark-logo-square.png" sizes="any" />
      </head>
      <body className="min-h-screen bg-white text-zinc-900 antialiased">
        <SidebarNav>{children}</SidebarNav>
      </body>
    </html>
  );
}
