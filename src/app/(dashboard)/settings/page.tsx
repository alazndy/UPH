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
import { Loader2, Database, Upload } from "lucide-react";

export default function SettingsPage() {
  const { profile, system, updateProfile, updateSystemSettings } = useSettingsStore();
  const [loading, setLoading] = useState(false);

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
        alert('Database seeded successfully!');
    } catch (error) {
        console.error(error);
        alert('Failed to seed database.');
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
        alert('Avatar updated successfully!');
    } catch (error) {
        console.error('Error uploading avatar:', error);
        alert('Failed to upload avatar.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your public profile and contact details.</CardDescription>
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
                                        Change Avatar
                                    </Label>
                                </Button>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Display Name</Label>
                            <Input 
                                id="name" 
                                value={profile.displayName} 
                                onChange={(e) => updateProfile({ displayName: e.target.value })} 
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                                id="email" 
                                type="email" 
                                value={profile.email} 
                                onChange={(e) => updateProfile({ email: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Job Title</Label>
                                <Input 
                                    id="title" 
                                    value={profile.jobTitle} 
                                    onChange={(e) => updateProfile({ jobTitle: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="company">Company</Label>
                                <Input 
                                    id="company" 
                                    value={profile.companyName} 
                                    onChange={(e) => updateProfile({ companyName: e.target.value })}
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button>Save Changes</Button>
                    </CardFooter>
                </Card>
            </div>
        </TabsContent>

        <TabsContent value="system">
            <Card>
                <CardHeader>
                    <CardTitle>System Preferences</CardTitle>
                    <CardDescription>Manage global application settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">Low Stock Threshold</Label>
                            <p className="text-sm text-muted-foreground">
                                Minimum stock level before triggering an alert.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Input 
                                type="number" 
                                className="w-20" 
                                value={system.lowStockThreshold}
                                onChange={(e) => updateSystemSettings({ lowStockThreshold: Number(e.target.value) })}
                            />
                            <span className="text-sm text-muted-foreground">units</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">Currency</Label>
                            <p className="text-sm text-muted-foreground">
                                Default currency for project budgets and inventory.
                            </p>
                        </div>
                        <Select 
                            value={system.currency} 
                            onValueChange={(val) => updateSystemSettings({ currency: val })}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select currency" />
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
                            <Label className="text-base">Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                                Receive alerts for low stock and assigned tasks.
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

        <TabsContent value="maintenance">
             <Card>
                <CardHeader>
                    <CardTitle>Database Maintenance</CardTitle>
                    <CardDescription>Manage database and system configs</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={seedData} disabled={loading} variant="destructive">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                        Reset & Seed Initial Data
                    </Button>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
