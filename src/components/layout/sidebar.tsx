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

const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    color: 'text-sky-500',
  },
  {
    label: 'Projects',
    icon: FolderKanban,
    href: '/projects',
    color: 'text-violet-500',
  },
  {
    label: 'Kanban',
    icon: Columns3,
    href: '/kanban',
    color: 'text-orange-500',
  },
  {
    label: 'Analytics',
    icon: BarChart3,
    href: '/analytics',
    color: 'text-emerald-500',
  },
  {
    label: 'Inventory',
    icon: Package,
    href: '/inventory',
    color: 'text-pink-700',
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/settings',
  },
];

interface SidebarProps {
    isCollapsed?: boolean;
}

export function Sidebar({ isCollapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="space-y-4 py-4 flex flex-col h-full glass-sidebar text-white transition-all duration-300">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className={cn("flex items-center mb-14 transition-all duration-300", isCollapsed ? "pl-0 justify-center" : "pl-3")}>
           <div className="relative w-8 h-8 mr-0">
             <div className="absolute bg-gradient-to-tr from-purple-500 to-indigo-600 shadow-[0_0_15px_rgba(168,85,247,0.5)] w-full h-full rounded-lg flex items-center justify-center font-bold text-lg">
                T
             </div>
          </div>
          {!isCollapsed && (
              <h1 className="text-2xl font-bold ml-4 whitespace-nowrap opacity-100 transition-opacity duration-300 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]">
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
                    ? 'bg-primary/20 text-purple-400 border-primary/20 shadow-[0_0_15px_-5px_var(--primary)]' 
                    : 'text-zinc-400 hover:text-white hover:bg-white/5',
                isCollapsed && "justify-center px-2"
              )}
              title={isCollapsed ? route.label : undefined}
            >
              <div className={cn("flex items-center flex-1", isCollapsed && "justify-center flex-none")}>
                <route.icon className={cn('h-5 w-5 transition-all duration-300', 
                    pathname === route.href ? "text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" : route.color, 
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
             <div className="bg-white/5 rounded-xl p-4 mb-4 whitespace-nowrap overflow-hidden border border-white/5">
                <h3 className="text-sm font-semibold mb-2 text-zinc-300">Quick Actions</h3>
                <Button size="sm" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border-0 shadow-[0_0_15px_-5px_var(--primary)]">
                   <Plus className="h-4 w-4 mr-2" /> New Project
                </Button>
             </div>
         )}
         {isCollapsed && (
             <div className="flex justify-center mb-4">
                 <Button size="icon" variant="ghost" className="bg-white/5 hover:bg-white/10 rounded-xl border border-white/5" title="New Project">
                      <Plus className="h-5 w-5 text-purple-400" />
                 </Button>
             </div>
         )}

         <Button 
            onClick={() => logout()} 
            variant="ghost" 
            className={cn("w-full justify-start text-zinc-400 hover:text-white hover:bg-white/10", isCollapsed && "justify-center px-2")}
            title="Logout"
         >
            <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
            {!isCollapsed && "Logout"}
         </Button>
      </div>
    </div>
  );
}
