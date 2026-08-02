'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Pill, User as UserIcon, Droplets, Calendar, Activity, Lock, TrendingUp } from 'lucide-react'

export default function SharedPortalPage() {
    const params = useParams()
    const token = params.token as string
    
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    
    const [selectedMetric, setSelectedMetric] = useState<string>('')
    const [availableMetrics, setAvailableMetrics] = useState<string[]>([])
    const [chartData, setChartData] = useState<any[]>([])
    
    useEffect(() => {
        async function loadSharedData() {
            try {
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${baseUrl}/api/chat/doctor-links/${token}`);
                if (!res.ok) {
                    throw new Error("Invalid or expired link.")
                }
                const result = await res.json()
                setData(result.data)
                
                // Process chart data
                const metrics = result.data.metrics || []
                if (metrics.length > 0) {
                    const uniqueMetrics = Array.from(new Set(metrics.map((m: any) => m.metric_name)));
                    setAvailableMetrics(uniqueMetrics as string[]);
                    if (uniqueMetrics.length > 0) {
                        setSelectedMetric(uniqueMetrics[0] as string);
                    }
            
                    const groupedData: any = {};
                    metrics.forEach((m: any) => {
                        const date = new Date(m.date_recorded).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                        if (!groupedData[date]) {
                            groupedData[date] = { date };
                        }
                        groupedData[date][m.metric_name] = m.metric_value;
                    });
            
                    setChartData(Object.values(groupedData));
                }
                
            } catch (e: any) {
                setError(e.message)
            } finally {
                setLoading(false)
            }
        }
        if (token) {
            loadSharedData()
        }
    }, [token])
    
    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] flex justify-center items-center">
                <div className="w-12 h-12 border-4 border-[var(--color-accent-cyan)] border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }
    
    if (error) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] flex justify-center items-center p-4 text-center">
                <div className="glass-panel p-10 max-w-md w-full border border-[var(--color-danger)]/30 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
                    <Lock className="text-[var(--color-danger)] mx-auto mb-4" size={48} />
                    <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                    <p className="text-[var(--color-text-muted)]">{error}</p>
                </div>
            </div>
        )
    }

    const { profile, prescriptions } = data

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] text-white overflow-y-auto">
            <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
                
                {/* Header */}
                <header className="flex items-center justify-between pb-6 border-b border-white/10">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">CuraMind Doctor Portal</h1>
                        <p className="text-[var(--color-accent-cyan)] flex items-center gap-2 text-sm font-medium">
                            <Lock size={14} /> Secure Read-Only Access
                        </p>
                    </div>
                </header>
                
                {/* Patient Profile */}
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <UserIcon className="text-[var(--color-accent-blue)]" /> Patient Overview
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {profile?.age && (
                          <div className="glass-panel p-6 flex flex-col items-center justify-center border border-white/5">
                            <Calendar className="text-[var(--color-accent-blue)] mb-3" size={32} />
                            <h3 className="text-[var(--color-text-muted)] font-medium">Age</h3>
                            <p className="text-3xl font-bold mt-1">{profile.age} <span className="text-sm text-[var(--color-text-muted)]">years</span></p>
                          </div>
                        )}
                        {profile?.blood_group && (
                          <div className="glass-panel p-6 flex flex-col items-center justify-center border border-white/5">
                            <Droplets className="text-[var(--color-warning)] mb-3" size={32} />
                            <h3 className="text-[var(--color-text-muted)] font-medium">Blood Group</h3>
                            <p className="text-3xl font-bold mt-1">{profile.blood_group}</p>
                          </div>
                        )}
                        {profile?.gender && (
                          <div className="glass-panel p-6 flex flex-col items-center justify-center border border-white/5">
                             <UserIcon className="text-[var(--color-accent-cyan)] mb-3" size={32} />
                             <h3 className="text-[var(--color-text-muted)] font-medium">Gender</h3>
                             <p className="text-3xl font-bold mt-1 capitalize">{profile.gender}</p>
                          </div>
                        )}
                    </div>
                </section>
                
                {/* Health Trends */}
                {chartData.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="text-[var(--color-accent-cyan)]" /> Lab Results Trends
                    </h2>
                    <div className="glass-panel p-6 rounded-2xl border border-white/10">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                        <select 
                          value={selectedMetric}
                          onChange={(e) => setSelectedMetric(e.target.value)}
                          className="bg-[var(--color-bg-secondary)] border border-white/10 text-white rounded-lg px-4 py-2 outline-none focus:border-[var(--color-accent-cyan)] transition-colors"
                        >
                          {availableMetrics.map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>

                      <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                </section>
                )}
                
                {/* Prescriptions */}
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Pill className="text-[#a855f7]" /> Active Prescriptions
                    </h2>
                    {prescriptions?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {prescriptions.map((med: any) => (
                            <div key={med.id} className="glass-panel p-5 rounded-xl border border-white/5">
                              <h3 className="font-bold text-white mb-2">{med.medicine_name}</h3>
                              <div className="space-y-1 text-sm text-[var(--color-text-muted)]">
                                {med.dosage && <p><strong className="text-white">Dosage:</strong> {med.dosage}</p>}
                                {med.frequency && <p><strong className="text-white">Freq:</strong> {med.frequency}</p>}
                                {med.duration && <p><strong className="text-white">Duration:</strong> {med.duration}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                    ) : (
                        <p className="text-[var(--color-text-muted)] italic">No active prescriptions on file.</p>
                    )}
                </section>
                
                <footer className="text-center pt-8 border-t border-white/10 text-sm text-[var(--color-text-muted)] pb-10">
                    This portal is securely provided by CuraMind AI. Data is shared with explicit patient consent and will automatically expire.
                </footer>
            </div>
        </div>
    )
}
