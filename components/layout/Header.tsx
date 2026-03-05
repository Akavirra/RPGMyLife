'use client';

import { cn } from '@/lib/utils';
import { ChevronLeft, Menu, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showMenu?: boolean;
  rightContent?: React.ReactNode;
  className?: string;
}

export function Header({
  title,
  showBack = false,
  showMenu = false,
  rightContent,
  className,
}: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-border-light',
        className
      )}
    >
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        {/* Left section */}
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 text-text-secondary hover:text-accent-blue transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {showMenu && (
            <button className="p-2 -ml-2 text-text-secondary hover:text-accent-blue transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          )}
          <h1 className="text-xl font-bold text-text-primary">
            {title}
          </h1>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {user && (
            <button
              onClick={handleLogout}
              className="p-2 text-text-secondary hover:text-accent-blue transition-colors"
              title="Вийти"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
          {rightContent && <div className="flex items-center">{rightContent}</div>}
        </div>
      </div>
    </header>
  );
}
