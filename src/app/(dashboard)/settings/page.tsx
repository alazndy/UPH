'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, writeBatch, doc } from "firebase/firestore";
import { useState } from "react";
import { Loader2, Database } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const seedData = async () => {
    setLoading(true);
    setSuccess(false);
    try {
        const batch = writeBatch(db);

        // Projects
        const projects = [
            { 
                id: 'p1', name: 'Robot Arm Prototype', description: '6-DOF robotic arm for educational purposes.', 
                status: 'Active', priority: 'High', startDate: '2024-01-15', deadline: '2024-06-30', 
                manager: 'Turhan', completionPercentage: 45, budget: 5000, spent: 1200, tags: ['Robotics', 'Arduino'] 
            },
            { 
                id: 'p2', name: 'Home Automation', description: 'IoT based home automation using ESP32.', 
                status: 'Planning', priority: 'Medium', startDate: '2024-03-01', deadline: '2024-08-15', 
                manager: 'Turhan', completionPercentage: 10, budget: 2000, spent: 0, tags: ['IoT', 'ESP32'] 
            }
        ];

        // Products
        const products = [
            { id: 'prod1', name: 'Arduino Uno R3', category: 'Stok Malzemesi', manufacturer: 'Arduino', stock: 12, price: 150.00, totalAllocated: 1 },
            { id: 'prod2', name: 'ESP32 DevKit V1', category: 'Stok Malzemesi', manufacturer: 'Espressif', stock: 5, price: 180.00, totalAllocated: 0 },
            { id: 'prod3', name: 'SG90 Micro Servo', category: 'Stok Malzemesi', manufacturer: 'Tower Pro', stock: 2, price: 50.00, totalAllocated: 0 }
        ];

        // Usages
        const usages = [
            { id: 'u1', projectId: 'p1', projectName: 'Robot Arm Prototype', productId: 'prod1', productName: 'Arduino Uno R3', quantity: 1, assignedDate: new Date().toISOString(), assignedBy: 'Admin', status: 'Active' }
        ];

        projects.forEach(p => {
             batch.set(doc(db, 'projects', p.id), p);
        });

        products.forEach(p => {
             batch.set(doc(db, 'products', p.id), p);
        });
        
        usages.forEach(u => {
             batch.set(doc(db, 'project_usages', u.id), u);
        });

        await batch.commit();
        setSuccess(true);
        alert('Database seeded successfully! Please refresh.');
    } catch (error) {
        console.error(error);
        alert('Failed to seed database.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader>
                <CardTitle>System Maintenance</CardTitle>
                <CardDescription>Manage database and system configs</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={seedData} disabled={loading} className="w-full">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                    Seed Initial Data
                </Button>
                {success && <p className="text-sm text-green-500 mt-2 text-center">Data populated successfully!</p>}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
