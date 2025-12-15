'use client';

import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
   DropdownMenu, 
   DropdownMenuContent, 
   DropdownMenuItem, 
   DropdownMenuLabel, 
   DropdownMenuSeparator, 
   DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/auth-store';
import { NotificationBell } from '@/components/notifications';
import { LanguageSwitcher } from '@/components/language-switcher';
import { EcosystemSwitcher } from '@/components/ecosystem-switcher';
import { ModeToggle } from '@/components/mode-toggle';
import { useState, useEffect } from 'react';

export function Header() {
   const user = useAuthStore((state) => state.user);
   const logout = useAuthStore((state) => state.logout);
   const [mounted, setMounted] = useState(false);

   useEffect(() => {
       setMounted(true);
   }, []);

  return (
    <div className="flex items-center p-4 sticky top-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/50 supports-[backdrop-filter]:bg-background/60">
      <MobileSidebar />
      <div className="flex w-full justify-end items-center gap-x-3">
         <EcosystemSwitcher />
         <ModeToggle />
         <LanguageSwitcher />
         <NotificationBell />
         
         {!mounted ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
         ) : (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                         <AvatarImage src={user?.photoURL} alt={user?.displayName} />
                         <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                   </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                   <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                         <p className="text-sm font-medium leading-none">{user?.displayName}</p>
                         <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      </div>
                   </DropdownMenuLabel>
                   <DropdownMenuSeparator />
                   <DropdownMenuItem onClick={() => logout()}>
                      Log out
                   </DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
         )}
      </div>
    </div>
  );
}
