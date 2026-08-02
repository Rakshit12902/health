'use client'

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Loader2, ArrowUp, ArrowDown, Minus, Activity } from 'lucide-react';

export function HealthTrends({ profileId }: { profileId: string }) {
  const [data, setData] = useState<any[]>([]);
  const [rawMetrics, setRawMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<string>('Hemoglobin');
  const [availableMetrics, setAvailableMetrics] = useState<string[]>([]);

  useEffect(() => {
    async function loadMetrics() {
      if (!profileId) return;
      const supabase = createClient();
      
      const { data: metrics, error } = await supabase
        .from('metrics')
        .select('*')
        .eq('profile_id', profileId)
        .order('date_recorded', { ascending: true });

      if (metrics && metrics.length > 0) {
        setRawMetrics(metrics);
        const uniqueMetrics = Array.from(new Set(metrics.map(m => m.metric_name)));
        setAvailableMetrics(uniqueMetrics as string[]);
        if (uniqueMetrics.length > 0 && !uniqueMetrics.includes(selectedMetric)) {
            setSelectedMetric(uniqueMetrics[0] as string);
        }

        const groupedData: any = {};
        metrics.forEach(m => {
            const date = new Date(m.date_recorded).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            if (!groupedData[date]) {
                groupedData[date] = { date };
            }
            groupedData[date][m.metric_name] = m.metric_value;
            groupedData[date][`${m.metric_name}_unit`] = m.unit;
            groupedData[date][`${m.metric_name}_flag`] = m.flag;
        });

        setData(Object.values(groupedData));
      }
      setLoading(false);
    }
    
    loadMetrics();
  }, [profileId, selectedMetric]);

  if (loading) {
    return (
      <div className="glass-panel p-6 rounded-2xl flex justify-center items-center h-64 border border-[var(--color-accent-blue)]/30">
        <Loader2 className="animate-spin text-[var(--color-accent-cyan)]" size={32} />
      </div>
    );
  }

  if (data.length === 0) {
    return null;
  }

  return (
    <div className="glass-panel p-6 rounded-2xl border border-[var(--color-accent-blue)]/30">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="text-[var(--color-accent-cyan)]" /> Health Trends
        </h2>
        
        <select 
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
          className="mt-4 md:mt-0 bg-[var(--color-bg-secondary)] border border-white/10 text-white rounded-lg px-4 py-2 outline-none focus:border-[var(--color-accent-cyan)] transition-colors"
        >
          {availableMetrics.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      
      {/* Metric Slots Carousel */}
      <div className="flex gap-4 overflow-x-auto pb-4 mb-6 custom-scrollbar scroll-smooth">
        {availableMetrics.map(metric => {
           // Find all data points for this metric
           const points = rawMetrics.filter(m => m.metric_name === metric).sort((a, b) => new Date(a.date_recorded).getTime() - new Date(b.date_recorded).getTime());
           if (points.length === 0) return null;
           
           const latest = points[points.length - 1];
           const prev = points.length > 1 ? points[points.length - 2] : null;
           
           let trend = 'stable';
           if (prev) {
               if (latest.metric_value > prev.metric_value) trend = 'up';
               else if (latest.metric_value < prev.metric_value) trend = 'down';
           }
           
           // Determine color based on flag
           const colorClass = latest.flag === 'high' || latest.flag === 'low' 
               ? 'text-[var(--color-danger)]' 
               : 'text-[var(--color-success)]';
               
           const isActive = selectedMetric === metric;
           
           return (
             <div 
               key={metric} 
               onClick={() => setSelectedMetric(metric)}
               className={`min-w-[160px] p-4 rounded-xl cursor-pointer transition-all border ${
                 isActive 
                   ? 'bg-[var(--color-accent-blue)]/20 border-[var(--color-accent-cyan)] shadow-[0_0_15px_var(--color-accent-glow)]' 
                   : 'glass-panel border-white/10 hover:border-white/30'
               }`}
             >
               <div className="flex items-center justify-between mb-2">
                 <span className="text-sm font-medium text-[var(--color-text-muted)] truncate pr-2">{metric}</span>
                 {trend === 'up' && <ArrowUp size={16} className="text-[var(--color-warning)]" />}
                 {trend === 'down' && <ArrowDown size={16} className="text-[var(--color-accent-cyan)]" />}
                 {trend === 'stable' && <Minus size={16} className="text-[var(--color-text-muted)]" />}
               </div>
               <div className="flex items-baseline gap-1">
                 <span className={`text-2xl font-bold ${colorClass}`}>{latest.metric_value}</span>
                 <span className="text-xs text-[var(--color-text-muted)]">{latest.unit}</span>
               </div>
             </div>
           )
        })}
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
            <XAxis dataKey="date" stroke="#8892b0" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#8892b0" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#112240', border: '1px solid #233554', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#64ffda' }}
            />
            <Line 
              type="monotone" 
              dataKey={selectedMetric} 
              stroke="#64ffda" 
              strokeWidth={3}
              dot={{ r: 4, fill: '#64ffda', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#fff', stroke: '#64ffda', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
