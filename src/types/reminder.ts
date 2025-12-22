// Reminder Types

export type ReminderType = 'deadline' | 'overdue' | 'milestone' | 'custom' | 'follow_up';
export type ReminderChannel = 'in_app' | 'email' | 'push' | 'slack';
export type ReminderStatus = 'pending' | 'sent' | 'dismissed' | 'snoozed';

export interface Reminder {
  id: string;
  userId: string;
  type: ReminderType;
  targetType: 'project' | 'task' | 'invoice' | 'custom';
  targetId?: string;
  targetName?: string;
  title: string;
  message: string;
  triggerDate: Date;
  repeatInterval?: 'daily' | 'weekly' | 'monthly' | 'none';
  repeatUntil?: Date;
  channels: ReminderChannel[];
  status: ReminderStatus;
  sentAt?: Date;
  snoozedUntil?: Date;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

export interface ReminderSettings {
  userId: string;
  enableDeadlineReminders: boolean;
  deadlineReminderDays: number[]; // e.g., [1, 3, 7] for 1, 3, 7 days before
  enableOverdueReminders: boolean;
  overdueReminderFrequency: 'daily' | 'every_3_days' | 'weekly';
  enableMilestoneReminders: boolean;
  defaultChannels: ReminderChannel[];
  quietHoursStart?: string; // "22:00"
  quietHoursEnd?: string; // "08:00"
}
