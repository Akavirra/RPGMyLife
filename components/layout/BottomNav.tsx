'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Scroll, User, MapPin, Users } from 'lucide-react';

const navItems = [
  {
    href: '/quests',
    label: 'Квести',
    icon: Scroll,
  },
  {
    href: '/character',
    label: 'Персонаж',
    icon: User,
  },
  {
    href: '/locations',
    label: 'Локації',
    icon: MapPin,
  },
  {
    href: '/characters',
    label: 'Герої',
    icon: Users,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-lg border-t border-amber-700/30 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-200',
                isActive
                  ? 'text-amber-400'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <div
                className={cn(
                  'p-1.5 rounded-lg transition-all',
                  isActive
                    ? 'bg-amber-500/20'
                    : 'bg-transparent'
                )}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-xs mt-0.5">{item.label}</span>
              {isActive && (
                <div className="absolute -bottom-0.5 w-8 h-0.5 bg-amber-400 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
