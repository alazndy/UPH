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
    <div className="space-y-4 py-6 flex flex-col h-full glass-sidebar text-sidebar-foreground transition-all duration-300">
      <div className="px-6 py-2 flex-1 flex flex-col">
        <Link href="/dashboard" className={cn("flex items-center mb-10 transition-all duration-300", isCollapsed ? "px-0 justify-center" : "px-0")}>
            <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 shadow-xl transition-transform hover:scale-105">
             <img src="/logo.png" alt="T-HUB Logo" className="w-6 h-6 object-contain dark:brightness-0 dark:invert" />
          </div>
          {!isCollapsed && (
              <div className="ml-3 flex flex-col">
                <h1 className="text-xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  T-HUB
                </h1>
                <span className="text-[10px] font-medium text-primary uppercase tracking-[0.2em] -mt-1">ECOSYSTEM</span>
              </div>
          )}
        </Link>
        
        <div className="space-y-2 flex-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'group relative flex items-center p-3 w-full font-medium rounded-xl transition-all duration-300',
                pathname === route.href 
                    ? 'bg-primary/10 text-primary dark:text-white' 
                    : 'text-sidebar-foreground hover:bg-black/5 dark:hover:bg-white/3 hover:text-foreground dark:hover:text-white',
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? route.label : undefined}
            >
              {/* Active Indicator Glow */}
              {pathname === route.href && (
                <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full shadow-lg dark:shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
              )}
              
              <route.icon className={cn('h-5 w-5 transition-all duration-300', 
                pathname === route.href ? "text-primary scale-110" : "text-sidebar-foreground group-hover:text-primary group-hover:scale-110", 
                !isCollapsed && "ml-2 mr-3"
              )} />
              
              {!isCollapsed && (
                <span className="text-sm transition-opacity duration-300">
                  {route.label}
                </span>
              )}

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 rounded-xl bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300" />
            </Link>
          ))}
        </div>
      </div>

      <div className="px-6 py-4 space-y-4">
         {!isCollapsed ? (
             <div className="glass-panel rounded-2xl p-4 border-sidebar-border/50">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Workspace</p>
                <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg dark:shadow-[0_0_15px_rgba(82,17,212,0.3)] border-0 transition-all hover:scale-[1.02]">
                   <Plus className="h-4 w-4 mr-2" /> {t('newProject')}
                </Button>
             </div>
         ) : (
            <Button size="icon" variant="ghost" className="w-full h-12 glass-panel rounded-xl border-sidebar-border/50" title={t('newProject')}>
              <Plus className="h-5 w-5 text-primary" />
            </Button>
         )}

         <div className="pt-4 border-t border-sidebar-border/30">
            <Button 
                onClick={() => logout()} 
                variant="ghost" 
                className={cn("w-full justify-start text-sidebar-foreground hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors", isCollapsed && "justify-center")}
                title={t('logout')}
            >
                <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                {!isCollapsed && <span className="text-sm font-medium">{t('logout')}</span>}
            </Button>
         </div>
      </div>
    </div>
  );
}
