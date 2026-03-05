import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/AuthProvider';
import { BottomNav } from '@/components/layout/BottomNav';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Life RPG - Твоя пригода починається',
  description: 'Геймифікація реального життя: створюй квести, розвивай навички, досягай цілей',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#FAFBFC',
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
    <html lang="uk" className={inter.variable}>
      <body className="font-sans bg-background-primary text-text-primary min-h-screen antialiased">
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
