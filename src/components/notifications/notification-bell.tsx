'use client';

import { useState } from 'react';
import { Bell, CheckCheck, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotificationStore, Notification } from '@/stores/notification-store';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const typeStyles = {
  info: 'bg-blue-500/20 text-blue-400',
  warning: 'bg-yellow-500/20 text-yellow-400',
  success: 'bg-green-500/20 text-green-400',
  error: 'bg-red-500/20 text-red-400',
};

function NotificationItem({ notification }: { notification: Notification }) {
  const { markAsRead, removeNotification } = useNotificationStore();
  const [now] = useState(() => Date.now()); // Capture time once

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((now - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const content = (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg transition-colors',
        !notification.read && 'bg-zinc-800/50'
      )}
      onClick={() => markAsRead(notification.id)}
    >
      <div className={cn('p-2 rounded-full', typeStyles[notification.type])}>
        <Bell className="h-3 w-3" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium truncate">{notification.title}</p>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              removeNotification(notification.id);
            }}
            className="text-zinc-500 hover:text-zinc-300"
            aria-label="Remove notification"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
        <p className="text-xs text-zinc-500 truncate">{notification.message}</p>
        <p className="text-[10px] text-zinc-600 mt-1">{timeAgo(notification.createdAt)}</p>
      </div>
      {!notification.read && (
        <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-2" />
      )}
    </div>
  );

  if (notification.link) {
    return (
      <Link href={notification.link} className="block hover:bg-zinc-800/30 rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
}

export function NotificationBell() {
  const { notifications, unreadCount, markAllAsRead, clearAll } = useNotificationStore();
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-zinc-900 border-zinc-800">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={markAllAsRead}
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-800" />
        
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-zinc-500 text-sm">
              No notifications
            </div>
          ) : (
            notifications.map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))
          )}
        </div>
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem
              onClick={clearAll}
              className="text-center justify-center text-zinc-500 hover:text-zinc-300"
            >
              <Trash2 className="h-3 w-3 mr-2" />
              Clear all
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
