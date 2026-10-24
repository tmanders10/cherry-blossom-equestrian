import './globals.css';
import SidebarNav from '../components/SidebarNav';

export const metadata = {
  title: 'Cherry Blossom Equestrian',
  description: 'Hunter/Jumper Equestrian Center in North Metro Atlanta',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-zinc-900 antialiased">
        <SidebarNav>{children}</SidebarNav>
      </body>
    </html>
  );
}
