'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Scroll, User, MapPin, Users, Swords, LogOut } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

const navItems = [
  {
    href: '/character',
    label: 'Герой',
    icon: User,
  },
  {
    href: '/quests',
    label: 'Квести',
    icon: Scroll,
  },
  {
    href: '/guilds',
    label: 'Гільдії',
    icon: Swords,
  },
  {
    href: '/characters',
    label: 'Персонажі',
    icon: Users,
  },
  {
    href: '/locations',
    label: 'Локації',
    icon: MapPin,
  },
];

export function DesktopNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  return (
    /* Desktop sidebar navigation - visible only on lg screens and above */
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-border-light sticky top-0">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border-light">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
          <span className="text-white font-bold text-lg">RPG</span>
        </div>
        <div>
          <h2 className="font-bold text-text-primary">Life RPG</h2>
          <p className="text-xs text-text-muted">Твоя пригода</p>
        </div>
      </div>

      {/* User info */}
      {user && (
        <div className="px-6 py-4 border-b border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-purple/20 flex items-center justify-center">
              <User className="w-5 h-5 text-accent-purple" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-primary truncate">
                {user.firstName}
              </p>
              <p className="text-xs text-text-muted">
                Рівень {user.level}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          // Use exact match to avoid /character matching /characters
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-accent-blue/10 text-accent-blue'
                  : 'text-text-secondary hover:bg-background-tertiary hover:text-text-primary'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-blue" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer with logout */}
      <div className="px-3 py-4 border-t border-border-light">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-text-secondary hover:bg-background-tertiary hover:text-text-primary transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Вийти</span>
        </button>
      </div>
    </aside>
  );
}
