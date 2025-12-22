'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Activity, Wifi, WifiOff, Cpu, Thermometer, Zap, Server, Search, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PremiumButton } from '@/components/ui/premium-button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import type { FluxDevice, FluxStats } from '@/types/flux';

export default function FluxPage() {
  const t = useTranslations('Common');
  const tFlux = useTranslations('Flux');
  const [filter, setFilter] = useState('');

  const devices: FluxDevice[] = [
    { id: 'DEV-001', name: 'Ana Dağıtım Panosu', location: 'Blok A', status: 'Online', temp: 34, load: 45, uptime: '12d 4h', lastSeen: 'Just now' },
    { id: 'DEV-002', name: 'HVAC Kontrol Ünitesi', location: 'Çatı Katı', status: 'Online', temp: 28, load: 40, uptime: '45d 1h', lastSeen: '1m ago' },
    { id: 'DEV-003', name: 'UPS Sistemi', location: 'Server Odası', status: 'Warning', temp: 42, load: 85, uptime: '2d 12h', lastSeen: '30s ago' },
    { id: 'DEV-004', name: 'Aydınlatma Kontrol', location: 'Lobi', status: 'Offline', temp: 0, load: 0, uptime: '-', lastSeen: '2h ago' },
     { id: 'DEV-005', name: 'Jeneratör 1', location: 'Otopark', status: 'Online', temp: 65, load: 12, uptime: '5h 30m', lastSeen: 'Just now' },
  ];

  const statCards: (FluxStats & { icon: any })[] = [
    { title: tFlux('stats.online'), value: '18/24', icon: Wifi, color: 'text-green-500', bg: 'bg-green-500/10' } as any,
    { title: tFlux('stats.power'), value: '45.2 kW', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' } as any,
    { title: tFlux('stats.temp'), value: '32°C', icon: Thermometer, color: 'text-red-500', bg: 'bg-red-500/10' } as any,
    { title: tFlux('stats.load'), value: '%64', icon: Activity, color: 'text-cyan-500', bg: 'bg-cyan-500/10' } as any,
  ];

   const filteredDevices = devices.filter(d => 
    d.name.toLowerCase().includes(filter.toLowerCase()) || 
    d.location.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto pb-24 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
            <Activity className="w-8 h-8 text-cyan-500" />
            {tFlux('title')}
          </h1>
          <p className="text-muted-foreground mt-1">{tFlux('subtitle')}</p>
        </div>
        <div className="flex gap-2">
            <PremiumButton variant="glass">
                <RefreshCw className="w-4 h-4 mr-2" />
                {tFlux('refresh')}
            </PremiumButton>
            <PremiumButton variant="premium" className="bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
                <Server className="w-4 h-4 mr-2" />
                {tFlux('newDevice')}
            </PremiumButton>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass-panel border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

       {/* Live Monitoring Section (Mock) */}
       <div className="grid gap-8 md:grid-cols-3">
          {/* Device List */}
          <Card className="glass-panel border-white/5 md:col-span-3 bg-zinc-900/40 backdrop-blur-xl">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>{tFlux('connectedDevices')}</CardTitle>
                <CardDescription>{tFlux('connectedDevicesDesc')}</CardDescription>
              </div>
              <div className="relative w-full md:w-64">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <Input 
                        placeholder={t('searchPlaceholder')} 
                        className="pl-9 bg-black/20 border-white/10" 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                   />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
                {filteredDevices.length > 0 ? filteredDevices.map((dev, idx) => (
                  <motion.div
                    key={dev.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`
                        p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1
                        ${dev.status === 'Online' ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/40' : ''}
                        ${dev.status === 'Warning' ? 'bg-yellow-500/5 border-yellow-500/20 hover:border-yellow-500/40' : ''}
                        ${dev.status === 'Offline' ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40 opacity-70' : ''}
                    `}
                  >
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl transition-colors ${
                            dev.status === 'Online' ? 'bg-green-500/10 text-green-500 group-hover:bg-green-500/20' :
                            dev.status === 'Warning' ? 'bg-yellow-500/10 text-yellow-500 group-hover:bg-yellow-500/20' : 'bg-red-500/10 text-red-500 group-hover:bg-red-500/20'
                        }`}>
                            <Cpu className="w-6 h-6" />
                        </div>
                        <Badge variant="outline" className={`
                            ${dev.status === 'Online' ? 'text-green-500 border-green-500/20 bg-green-500/5' : ''}
                            ${dev.status === 'Warning' ? 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5' : ''}
                            ${dev.status === 'Offline' ? 'text-red-500 border-red-500/20 bg-red-500/5' : ''}
                        `}>
                            {dev.status === 'Online' ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
                            {dev.status}
                        </Badge>
                    </div>

                    <h3 className="font-bold text-lg mb-1 text-foreground">{dev.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1">
                        <Server className="w-3 h-3" /> {dev.location}
                    </p>

                    <div className="space-y-3">
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Sıcaklık</span>
                                <span className="font-mono font-bold text-foreground">{dev.temp}°C</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${
                                        dev.temp > 50 ? 'bg-red-500' : 'bg-cyan-500'
                                    }`}
                                    style={{ width: `${Math.min(dev.temp, 100)}%` }}
                                />
                            </div>
                        </div>

                         <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Yük</span>
                                <span className="font-mono font-bold text-foreground">%{dev.load}</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                                <div 
                                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${dev.load}%` }}
                                />
                            </div>
                        </div>
                    </div>
                  </motion.div>
                )) : (
                     <div className="md:col-span-2 xl:col-span-4 text-center py-12 text-muted-foreground">
                        <p>Filtreye uygun cihaz bulunamadı.</p>
                    </div>
                )}
              </div>
            </CardContent>
          </Card>
       </div>
    </div>
  );
}
