'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Scroll, User, MapPin, Users, Swords } from 'lucide-react';

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

export function BottomNav() {
  const pathname = usePathname();

  return (
    /* Mobile bottom navigation - hidden on desktop (lg and above) */
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-border-light safe-area-bottom lg:hidden">
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          // Use exact match to avoid /character matching /characters
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-14 rounded-lg transition-all duration-200 ease-notion',
                isActive
                  ? 'text-accent-blue'
                  : 'text-text-muted hover:text-text-secondary'
              )}
            >
              <div
                className={cn(
                  'p-1.5 rounded-lg transition-all',
                  isActive
                    ? 'bg-accent-blue/10'
                    : 'bg-transparent'
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs mt-1">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 w-6 h-0.5 bg-accent-blue rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
