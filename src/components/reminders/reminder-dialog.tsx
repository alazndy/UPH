"use client";

import React, { useState, useEffect } from "react";
import { Bell, BellOff, Clock, AlertTriangle, CheckCircle, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useReminderStore } from "@/stores/reminder-store";
import type { Reminder, ReminderSettings, ReminderType, ReminderChannel } from "@/types/reminder";
import { format, formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface ReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

const TYPE_LABELS: Record<ReminderType, { label: string; icon: any; color: string }> = {
  deadline: { label: "Deadline", icon: Clock, color: "text-blue-500" },
  overdue: { label: "Gecikmiş", icon: AlertTriangle, color: "text-red-500" },
  milestone: { label: "Kilometre Taşı", icon: CheckCircle, color: "text-green-500" },
  custom: { label: "Özel", icon: Bell, color: "text-purple-500" },
};

const CHANNEL_LABELS: Record<ReminderChannel, string> = {
  email: "E-posta",
  push: "Push Bildirim",
  inApp: "Uygulama İçi",
  sms: "SMS",
};

export function ReminderDialog({
  open,
  onOpenChange,
  userId,
}: ReminderDialogProps) {
  const {
    reminders,
    settings,
    loading,
    fetchReminders,
    fetchSettings,
    updateSettings,
    dismissReminder,
    snoozeReminder,
    markAsSent,
  } = useReminderStore();

  const [activeTab, setActiveTab] = useState<"reminders" | "settings">("reminders");

  useEffect(() => {
    if (open) {
      fetchReminders(userId);
      fetchSettings(userId);
    }
  }, [open, userId, fetchReminders, fetchSettings]);

  const pendingReminders = reminders.filter((r) => r.status === "pending");
  const sentReminders = reminders.filter((r) => r.status === "sent");

  const handleDismiss = async (id: string) => {
    await dismissReminder(id);
  };

  const handleSnooze = async (id: string) => {
    const minutes = parseInt(prompt("Kaç dakika ertelemek istersiniz?", "30") || "0");
    if (minutes > 0) {
      await snoozeReminder(id, minutes);
    }
  };

  const handleUpdateSettings = async (updates: Partial<ReminderSettings>) => {
    if (settings) {
      await updateSettings(settings.id, updates);
    }
  };

  const renderReminder = (reminder: Reminder) => {
    const typeInfo = TYPE_LABELS[reminder.type];
    const Icon = typeInfo.icon;

    return (
      <Card key={reminder.id} className="mb-3">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <Icon className={`h-5 w-5 mt-0.5 ${typeInfo.color}`} />
              <div>
                <h4 className="font-medium">{reminder.title}</h4>
                {reminder.message && (
                  <p className="text-sm text-muted-foreground mt-1">{reminder.message}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{typeInfo.label}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(reminder.scheduledFor), { 
                      addSuffix: true, 
                      locale: tr 
                    })}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSnooze(reminder.id)}
              >
                <Clock className="h-4 w-4 mr-1" />
                Ertele
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismiss(reminder.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Hatırlatıcılar
          </DialogTitle>
          <DialogDescription>
            Yaklaşan deadline'lar ve hatırlatıcılarınızı yönetin
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reminders" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Hatırlatıcılar
              {pendingReminders.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                  {pendingReminders.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Ayarlar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reminders" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <span className="text-muted-foreground">Yükleniyor...</span>
                </div>
              ) : pendingReminders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <BellOff className="h-12 w-12 opacity-30 mb-3" />
                  <p className="font-medium">Bekleyen hatırlatıcı yok</p>
                  <p className="text-sm">Tüm hatırlatıcılar tamamlandı</p>
                </div>
              ) : (
                <>
                  <h3 className="font-medium mb-3 text-sm text-muted-foreground">
                    Bekleyen ({pendingReminders.length})
                  </h3>
                  {pendingReminders.map(renderReminder)}
                  
                  {sentReminders.length > 0 && (
                    <>
                      <h3 className="font-medium mb-3 mt-6 text-sm text-muted-foreground">
                        Gönderilmiş ({sentReminders.length})
                      </h3>
                      {sentReminders.slice(0, 5).map(renderReminder)}
                    </>
                  )}
                </>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="settings" className="mt-4 space-y-6">
            {settings ? (
              <>
                {/* Enable/Disable */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Hatırlatıcıları Etkinleştir</Label>
                    <p className="text-sm text-muted-foreground">
                      Tüm otomatik hatırlatıcıları aç/kapat
                    </p>
                  </div>
                  <Switch
                    checked={settings.enabled}
                    onCheckedChange={(v) => handleUpdateSettings({ enabled: v })}
                  />
                </div>

                {/* Deadline Warning Days */}
                <div className="space-y-2">
                  <Label>Deadline Uyarı Günleri</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Deadline'dan kaç gün önce uyarı almak istersiniz?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 5, 7, 14].map((day) => (
                      <Button
                        key={day}
                        variant={settings.deadlineWarningDays.includes(day) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const current = settings.deadlineWarningDays;
                          const newDays = current.includes(day)
                            ? current.filter((d) => d !== day)
                            : [...current, day].sort((a, b) => a - b);
                          handleUpdateSettings({ deadlineWarningDays: newDays });
                        }}
                      >
                        {day} gün
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Overdue Check Interval */}
                <div className="space-y-2">
                  <Label>Gecikme Kontrol Aralığı</Label>
                  <Select
                    value={String(settings.overdueCheckInterval)}
                    onValueChange={(v) => handleUpdateSettings({ overdueCheckInterval: Number(v) })}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">Her saat</SelectItem>
                      <SelectItem value="360">Her 6 saat</SelectItem>
                      <SelectItem value="720">Her 12 saat</SelectItem>
                      <SelectItem value="1440">Günde bir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Channels */}
                <div className="space-y-2">
                  <Label>Bildirim Kanalları</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {(Object.keys(CHANNEL_LABELS) as ReminderChannel[]).map((channel) => (
                      <div key={channel} className="flex items-center justify-between p-3 border rounded-lg">
                        <Label htmlFor={channel}>{CHANNEL_LABELS[channel]}</Label>
                        <Switch
                          id={channel}
                          checked={settings.channels.includes(channel)}
                          onCheckedChange={(checked) => {
                            const current = settings.channels;
                            const newChannels = checked
                              ? [...current, channel]
                              : current.filter((c) => c !== channel);
                            handleUpdateSettings({ channels: newChannels });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quiet Hours */}
                <div className="space-y-2">
                  <Label>Sessiz Saatler</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Bu saatler arasında bildirim gönderilmez
                  </p>
                  <div className="flex items-center gap-3">
                    <Input
                      type="time"
                      value={settings.quietHoursStart || "22:00"}
                      onChange={(e) => handleUpdateSettings({ quietHoursStart: e.target.value })}
                      className="w-32"
                    />
                    <span>-</span>
                    <Input
                      type="time"
                      value={settings.quietHoursEnd || "08:00"}
                      onChange={(e) => handleUpdateSettings({ quietHoursEnd: e.target.value })}
                      className="w-32"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center py-8">
                <span className="text-muted-foreground">Ayarlar yükleniyor...</span>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Kapat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
