'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const saved = localStorage.getItem('uph-sidebar-collapsed');
        if (saved) setIsCollapsed(JSON.parse(saved));
    }, []);

    const toggleSidebar = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('uph-sidebar-collapsed', JSON.stringify(newState));
    };

    if (!isMounted) {
        return (
            <div className="h-full relative">
                <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-30 bg-gray-900">
                    <Sidebar />
                </div>
                <main className="md:pl-72">
                    <Header />
                    <div className="p-8">{children}</div>
                </main>
            </div>
        );
    }

    return (
        <div className="h-full relative">
            {/* Sidebar Wrapper */}
            <div 
                className={cn(
                    "hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 z-30 bg-sidebar/90 backdrop-blur-3xl border-r border-sidebar-border transition-all duration-300 shadow-2xl shadow-primary/5",
                    isCollapsed ? "w-20" : "w-72"
                )}
            >
                <Sidebar isCollapsed={isCollapsed} />
                
                {/* Toggle Button */}
                <button 
                     onClick={toggleSidebar}
                     className="absolute -right-3 top-8 bg-zinc-800 border border-zinc-700 text-zinc-400 p-1 rounded-full shadow-md hover:text-white transition-colors z-50 hidden md:flex"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </div>

            {/* Main Content */}
            <main 
                className={cn(
                    "transition-all duration-300",
                    isCollapsed ? "md:pl-20" : "md:pl-72"
                )}
            >
                <Header />
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
