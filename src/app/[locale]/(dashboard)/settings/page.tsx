'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSettingsStore } from "@/stores/settings-store";
import { db, storage } from "@/lib/firebase";
import { collection, writeBatch, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Loader2, Database, Upload, Network, Moon, Sun, Monitor, Laptop, Bell, Globe, DollarSign, Archive, Cloud } from "lucide-react";
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { GoogleDriveService } from '@/services/google-drive-service';

export default function SettingsPage() {
  const t = useTranslations('Settings');
  const { profile, system, updateProfile, updateSystemSettings } = useSettingsStore();
  const [loading, setLoading] = useState(false);
  const [integrations, setIntegrations] = useState(system.integrations || { weave: true, envInventory: true, googleDrive: false });
  const [connectingDrive, setConnectingDrive] = useState(false);
  const [driveUser, setDriveUser] = useState<string | null>(null);

  const seedData = async () => {
    setLoading(true);
    try {
        const batch = writeBatch(db);
        const projects = [
            { id: 'p1', name: 'Robot Arm Prototype', description: '6-DOF robotic arm.', status: 'Active', priority: 'High', startDate: '2024-01-15', deadline: '2024-06-30', manager: 'Turhan', completionPercentage: 45, budget: 5000, spent: 1200, tags: ['Robotics', 'Arduino'] },
            { id: 'p2', name: 'Home Automation', description: 'IoT based home automation.', status: 'Planning', priority: 'Medium', startDate: '2024-03-01', deadline: '2024-08-15', manager: 'Turhan', completionPercentage: 10, budget: 2000, spent: 0, tags: ['IoT', 'ESP32'] }
        ];
        const products = [
             { id: 'prod1', name: 'Arduino Uno R3', category: 'Stok Malzemesi', manufacturer: 'Arduino', stock: 12, price: 150.00, totalAllocated: 1 },
             { id: 'prod2', name: 'ESP32 DevKit V1', category: 'Stok Malzemesi', manufacturer: 'Espressif', stock: 5, price: 180.00, totalAllocated: 0 },
             { id: 'prod3', name: 'SG90 Micro Servo', category: 'Stok Malzemesi', manufacturer: 'Tower Pro', stock: 2, price: 50.00, totalAllocated: 0 }
        ];
        const usages = [
             { id: 'u1', projectId: 'p1', projectName: 'Robot Arm Prototype', productId: 'prod1', productName: 'Arduino Uno R3', quantity: 1, assignedDate: new Date().toISOString(), assignedBy: 'Admin', status: 'Active' }
        ];

        projects.forEach(p => batch.set(doc(db, 'projects', p.id), p));
        products.forEach(p => batch.set(doc(db, 'products', p.id), p));
        usages.forEach(u => batch.set(doc(db, 'project_usages', u.id), u));

        await batch.commit();
        alert(t('maintenance.seedSuccess'));
    } catch (error) {
        console.error(error);
        alert(t('maintenance.seedError'));
    } finally {
        setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
        const storageRef = ref(storage, `avatars/${profile.email || 'user'}_${Date.now()}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        
        updateProfile({ avatarUrl: url });
        alert(t('profile.avatarSuccess'));
    } catch (error) {
        console.error('Error uploading avatar:', error);
        alert(t('profile.avatarError'));
    } finally {
        setLoading(false);
    }
  };

  const handleGoogleDriveToggle = async (checked: boolean) => {
    setIntegrations(prev => ({ ...prev, googleDrive: checked }));
    updateSystemSettings({ integrations: { ...system.integrations, googleDrive: checked } });

    if (checked) {
        setConnectingDrive(true);
        try {
            const user = await GoogleDriveService.authorize();
            setDriveUser(user.displayName || user.emailAddress || 'Unknown User');
            toast.success(t('integrations.driveConnected', { user: user.displayName || user.emailAddress }));
        } catch (error) {
            console.error('Google Drive connection failed:', error);
            toast.error(t('integrations.driveConnectError'));
            setIntegrations(prev => ({ ...prev, googleDrive: false })); // Revert toggle on failure
            updateSystemSettings({ integrations: { ...system.integrations, googleDrive: false } });
        } finally {
            setConnectingDrive(false);
        }
    } else {
        // Disconnect logic if needed, for now just update state
        setDriveUser(null);
        toast.info(t('integrations.driveDisconnected'));
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">{t('tabs.profile')}</TabsTrigger>
          <TabsTrigger value="system">{t('tabs.system')}</TabsTrigger>
          <TabsTrigger value="integrations">{t('integrations.title')}</TabsTrigger>
          <TabsTrigger value="maintenance">{t('tabs.maintenance')}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>{t('profile.title')}</CardTitle>
                        <CardDescription>{t('profile.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={profile.avatarUrl} />
                                <AvatarFallback>{profile.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="relative">
                                <input 
                                    type="file" 
                                    id="avatar-upload" 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleAvatarUpload}
                                />
                                <Button variant="outline" size="sm" asChild disabled={loading}>
                                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                        {t('profile.changeAvatar')}
                                    </Label>
                                </Button>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="name">{t('profile.displayName')}</Label>
                            <Input 
                                id="name" 
                                value={profile.displayName} 
                                onChange={(e) => updateProfile({ displayName: e.target.value })} 
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">{t('profile.email')}</Label>
                            <Input 
                                id="email" 
                                type="email" 
                                value={profile.email} 
                                onChange={(e) => updateProfile({ email: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">{t('profile.jobTitle')}</Label>
                                <Input 
                                    id="title" 
                                    value={profile.jobTitle} 
                                    onChange={(e) => updateProfile({ jobTitle: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="company">{t('profile.company')}</Label>
                                <Input 
                                    id="company" 
                                    value={profile.companyName} 
                                    onChange={(e) => updateProfile({ companyName: e.target.value })}
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button>{t('profile.save')}</Button>
                    </CardFooter>
                </Card>
            </div>
        </TabsContent>

        <TabsContent value="system">
            <Card>
                <CardHeader>
                    <CardTitle>{t('system.title')}</CardTitle>
                    <CardDescription>{t('system.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">{t('system.lowStock')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('system.lowStockDesc')}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Input 
                                type="number" 
                                className="w-20" 
                                value={system.lowStockThreshold}
                                onChange={(e) => updateSystemSettings({ lowStockThreshold: Number(e.target.value) })}
                            />
                            <span className="text-sm text-muted-foreground">{t('system.units')}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">{t('system.currency')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('system.currencyDesc')}
                            </p>
                        </div>
                        <Select 
                            value={system.currency} 
                            onValueChange={(val) => updateSystemSettings({ currency: val })}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={t('system.selectCurrency')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TRY">Turkish Lira (₺)</SelectItem>
                                <SelectItem value="USD">US Dollar ($)</SelectItem>
                                <SelectItem value="EUR">Euro (€)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">{t('system.notifications')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('system.notificationsDesc')}
                            </p>
                        </div>
                        <Switch 
                            checked={system.enableNotifications}
                            onCheckedChange={(checked) => updateSystemSettings({ enableNotifications: checked })}
                        />
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="integrations">
            <Card>
                <CardHeader>
                    <CardTitle>{t('integrations.title')}</CardTitle>
                    <CardDescription>{t('integrations.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">{t('integrations.weave')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('integrations.weaveDesc')}
                            </p>
                        </div>
                        <Switch 
                            checked={integrations.weave ?? true}
                            onCheckedChange={(checked) => {
                                setIntegrations(prev => ({ ...prev, weave: checked }));
                                updateSystemSettings({ integrations: { ...system.integrations, weave: checked } });
                            }}
                        />
                    </div>
                    
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">{t('integrations.env')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('integrations.envDesc')}
                            </p>
                        </div>
                        <Switch 
                            checked={integrations.envInventory ?? true}
                            onCheckedChange={(checked) => {
                                setIntegrations(prev => ({ ...prev, envInventory: checked }));
                                updateSystemSettings({ integrations: { ...system.integrations, envInventory: checked } });
                            }}
                        />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">{t('integrations.googleDrive')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('integrations.googleDriveDesc')}
                                {driveUser && <span className="ml-2 text-xs text-green-600">({driveUser})</span>}
                            </p>
                        </div>
                        <Switch 
                            checked={integrations.googleDrive ?? false}
                            onCheckedChange={handleGoogleDriveToggle}
                            disabled={connectingDrive}
                        />
                    </div>

                    <div className="pt-4 border-t">
                        <h3 className="text-lg font-medium mb-4">{t('integrations.communication')}</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base">{t('integrations.slack')}</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {t('integrations.slackDesc')}
                                    </p>
                                </div>
                                <Switch 
                                    checked={integrations.slack ?? false}
                                    onCheckedChange={(checked) => {
                                        setIntegrations(prev => ({ ...prev, slack: checked }));
                                        updateSystemSettings({ integrations: { ...system.integrations, slack: checked } });
                                    }}
                                />
                            </div>
                            {integrations.slack && (
                                <div className="grid gap-2 p-4 pt-0">
                                    <Label htmlFor="slack-webhook">{t('integrations.webhookUrl')}</Label>
                                    <Input 
                                        id="slack-webhook" 
                                        value={system.slackWebhookUrl || ''}
                                        onChange={(e) => updateSystemSettings({ slackWebhookUrl: e.target.value })}
                                        placeholder="https://hooks.slack.com/services/..."
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <h3 className="text-lg font-medium mb-4">{t('integrations.development')}</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base">{t('integrations.github')}</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {t('integrations.githubDesc')}
                                    </p>
                                </div>
                                <Switch 
                                    checked={integrations.github ?? false}
                                    onCheckedChange={(checked) => {
                                        setIntegrations(prev => ({ ...prev, github: checked }));
                                        updateSystemSettings({ integrations: { ...system.integrations, github: checked } });
                                    }}
                                />
                            </div>
                            {integrations.github && (
                                <div className="grid gap-2 p-4 pt-0">
                                    <Label htmlFor="github-token">{t('integrations.githubToken')}</Label>
                                    <Input 
                                        id="github-token" 
                                        type="password"
                                        value={system.githubToken || ''}
                                        onChange={(e) => updateSystemSettings({ githubToken: e.target.value })}
                                        placeholder="ghp_..."
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="maintenance">
             <Card>
                <CardHeader>
                    <CardTitle>{t('maintenance.title')}</CardTitle>
                    <CardDescription>{t('maintenance.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={seedData} disabled={loading} variant="destructive">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                        {t('maintenance.resetData')}
                    </Button>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
