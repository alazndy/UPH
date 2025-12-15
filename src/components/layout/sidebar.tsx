'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FolderKanban,
  Package,
  Settings,
  LogOut,
  Plus,
  Columns3,
  BarChart3
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

// Routes moved inside Sidebar component for translations

interface SidebarProps {
    isCollapsed?: boolean;
}

import { useTranslations } from 'next-intl';

export function Sidebar({ isCollapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const t = useTranslations('Common');

  const routes = [
    {
      label: t('dashboard'),
      icon: LayoutDashboard,
      href: '/dashboard',
      color: 'text-sky-500',
    },
    {
      label: t('projects'),
      icon: FolderKanban,
      href: '/projects',
      color: 'text-violet-500',
    },
    {
      label: t('kanban'),
      icon: Columns3,
      href: '/kanban',
      color: 'text-orange-500',
    },
    {
      label: t('analytics'),
      icon: BarChart3,
      href: '/analytics',
      color: 'text-emerald-500',
    },
    {
      label: t('inventory'),
      icon: Package,
      href: '/inventory',
      color: 'text-pink-700',
    },
    {
      label: t('settings'),
      icon: Settings,
      href: '/settings',
      color: 'text-slate-500',
    },
  ];

  return (
    <div className="space-y-4 py-4 flex flex-col h-full glass-sidebar text-sidebar-foreground transition-all duration-300">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className={cn("flex items-center mb-14 transition-all duration-300", isCollapsed ? "pl-0 justify-center" : "pl-3")}>
           <div className="relative w-8 h-8 mr-0 overflow-hidden rounded-lg shrink-0">
             <img src="/logo.png" alt="T-HUB Logo" className="w-full h-full object-cover" />
          </div>
          {!isCollapsed && (
              <h1 className="text-2xl font-bold ml-4 whitespace-nowrap opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
                T-HUB
              </h1>
          )}
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-lg transition-all duration-300 border border-transparent',
                pathname === route.href 
                    ? 'bg-sidebar-accent text-primary border-primary/20 shadow-sm' 
                    : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
                isCollapsed && "justify-center px-2"
              )}
              title={isCollapsed ? route.label : undefined}
            >
              <div className={cn("flex items-center flex-1", isCollapsed && "justify-center flex-none")}>
                <route.icon className={cn('h-5 w-5 transition-all duration-300', 
                    pathname === route.href ? "text-primary drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]" : "text-muted-foreground group-hover:text-primary", 
                    !isCollapsed && "mr-3"
                )} />
                {!isCollapsed && route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-2">
         {!isCollapsed && (
             <div className="bg-sidebar-accent/50 rounded-xl p-4 mb-4 whitespace-nowrap overflow-hidden border border-sidebar-border">
                <h3 className="text-sm font-semibold mb-2 text-sidebar-foreground">Quick Actions</h3>
                <Button size="sm" className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 border-0 shadow-md text-primary-foreground">
                   <Plus className="h-4 w-4 mr-2" /> {t('newProject')}
                </Button>
             </div>
         )}
         {isCollapsed && (
             <div className="flex justify-center mb-4">
                 <Button size="icon" variant="ghost" className="bg-sidebar-accent/50 hover:bg-sidebar-accent rounded-xl border border-sidebar-border" title={t('newProject')}>
                      <Plus className="h-5 w-5 text-primary" />
                 </Button>
             </div>
         )}

         <Button 
            onClick={() => logout()} 
            variant="ghost" 
            className={cn("w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10", isCollapsed && "justify-center px-2")}
            title={t('logout')}
         >
            <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
            {!isCollapsed && t('logout')}
         </Button>
      </div>
    </div>
  );
}
