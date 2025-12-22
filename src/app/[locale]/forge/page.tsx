'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Hammer, ClipboardList, Timer, AlertTriangle, CheckCircle2, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PremiumButton } from '@/components/ui/premium-button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import type { ForgeJob, ForgeStats } from '@/types/forge';

export default function ForgePage() {
  const t = useTranslations('Common');
  const tForge = useTranslations('Forge');
  const [filter, setFilter] = useState('');

  // Mock Production Jobs using new Interface
  const jobs: ForgeJob[] = [
    { id: 'JOB-2023-001', projectId: 'p1', project: 'Fabrika Otomasyon', status: 'In Progress', progress: 65, step: 'Montaj', priority: 'High', technician: 'Ahmet Y.', add_date: '2023-12-01' },
    { id: 'JOB-2023-002', projectId: 'p2', project: 'Pano Taslağı v4', status: 'Pending', progress: 0, step: 'Hazırlık', priority: 'Medium', technician: '-', add_date: '2023-12-05' },
    { id: 'JOB-2023-003', projectId: 'p3', project: 'Saha Dağıtım Kutusu', status: 'Completed', progress: 100, step: 'Test', priority: 'High', technician: 'Mehmet K.', add_date: '2023-11-20' },
    { id: 'JOB-2023-004', projectId: 'p4', project: 'MCC Panosu', status: 'In Progress', progress: 30, step: 'Kablolama', priority: 'Low', technician: 'Ayşe D.', add_date: '2023-12-10' },
    { id: 'JOB-2023-005', projectId: 'p5', project: 'PLC Revizyon', status: 'Delayed', progress: 45, step: 'Malzeme Bekleniyor', priority: 'Critical', technician: 'Caner B.', add_date: '2023-12-12' },
  ];

  const stats: (ForgeStats & { icon: any })[] = [
    { activeJobs: 12, efficiency: 87, delays: 2, completedThisMonth: 34 } as any
  ];
  
  // Flatten for UI
  const statCards = [
    { title: tForge('stats.active'), value: '12', icon: ClipboardList, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: tForge('stats.efficiency'), value: '%87', icon: Timer, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: tForge('stats.delays'), value: '2', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
    { title: tForge('stats.completed'), value: '34', icon: Hammer, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  const filteredJobs = jobs.filter(j => 
    j.project.toLowerCase().includes(filter.toLowerCase()) || 
    j.id.toLowerCase().includes(filter.toLowerCase()) ||
    j.technician?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto pb-24 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-orange-400 to-amber-600 bg-clip-text text-transparent flex items-center gap-3">
            <Hammer className="w-8 h-8 text-orange-500" />
            {tForge('title')}
          </h1>
          <p className="text-muted-foreground mt-1">{tForge('subtitle')}</p>
        </div>
        <div className="flex gap-2">
            <PremiumButton variant="glass">
                <Filter className="w-4 h-4 mr-2" />
                Filtrele
            </PremiumButton>
            <PremiumButton variant="premium" className="bg-gradient-to-r from-orange-500 to-amber-600 shadow-lg shadow-orange-500/20">
            <ClipboardList className="w-4 h-4 mr-2" />
            {tForge('newJob')}
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

      {/* Active Jobs List */}
      <Card className="glass-panel border-white/5 bg-zinc-900/40 backdrop-blur-xl">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>{tForge('activeJobs')}</CardTitle>
            <CardDescription>{tForge('activeJobsDesc')}</CardDescription>
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
          <div className="space-y-3">
            {filteredJobs.length > 0 ? filteredJobs.map((job, idx) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                   <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center border border-white/10 shadow-sm group-hover:scale-105 transition-transform">
                      <Hammer className="w-6 h-6 text-zinc-400 group-hover:text-orange-400 transition-colors" />
                   </div>
                   <div>
                      <h4 className="font-bold text-foreground group-hover:text-orange-100 transition-colors">{job.project}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded">{job.id}</span>
                        <span>•</span>
                        <span>{job.add_date || 'Bugün'}</span>
                        {job.technician && (
                            <>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Badge variant="outline" className="text-[10px] h-4 px-1 py-0">{job.technician}</Badge></span>
                            </>
                        )}
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-6 flex-1 justify-end">
                   <div className="hidden lg:block w-48">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground font-medium">{job.step}</span>
                        <span className="font-bold">{job.progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                        <div 
                           className={`h-full rounded-full transition-all duration-500 ${
                               job.status === 'Delayed' ? 'bg-red-500' : 'bg-gradient-to-r from-orange-600 to-amber-500'
                           }`}
                           style={{ width: `${job.progress}%` }}
                        />
                      </div>
                   </div>

                   <div className="flex items-center gap-2 min-w-[140px] justify-end">
                      <Badge variant={
                          job.priority === 'Critical' ? 'destructive' : 
                          job.priority === 'High' ? 'default' : 'secondary'
                      } className="uppercase text-[10px] bg-opacity-80">
                        {job.priority}
                      </Badge>
                      <Badge variant="outline" className={`
                        ${job.status === 'Completed' ? 'text-green-500 border-green-500/20 bg-green-500/10' : ''}
                        ${job.status === 'In Progress' ? 'text-blue-500 border-blue-500/20 bg-blue-500/10' : ''}
                        ${job.status === 'Pending' ? 'text-zinc-500 border-zinc-500/20' : ''}
                        ${job.status === 'Delayed' ? 'text-red-500 border-red-500/20 bg-red-500/10' : ''}
                      `}>
                        {job.status === 'Completed' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {job.status}
                      </Badge>
                   </div>
                </div>
              </motion.div>
            )) : (
                <div className="text-center py-12 text-muted-foreground">
                    <p>Filtreye uygun iş emri bulunamadı.</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
