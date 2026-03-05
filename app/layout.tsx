import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Cinzel, Raleway } from 'next/font/google';
import { AuthProvider } from '@/components/AuthProvider';
import { BottomNav } from '@/components/layout/BottomNav';
import './globals.css';

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
});

const raleway = Raleway({
  subsets: ['latin'],
  variable: '--font-raleway',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Life RPG - Твоя пригода починається',
  description: 'Геймифікація реального життя: створюй квести, розвивай навички, досягай цілей',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#0f172a',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session');
  const isAuthenticated = !!sessionToken?.value;

  return (
    <html lang="uk" className={`${cinzel.variable} ${raleway.variable}`}>
      <body className="font-sans bg-slate-950 text-slate-100 min-h-screen antialiased">
        <AuthProvider>
          <div className={isAuthenticated ? 'pb-20' : ''}>
            {children}
          </div>
          {isAuthenticated && <BottomNav />}
        </AuthProvider>
      </body>
    </html>
  );
}
