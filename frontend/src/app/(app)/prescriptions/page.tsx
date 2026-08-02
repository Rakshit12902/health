'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Pill, Clock, Calendar, CheckCircle, Circle, AlertCircle, X } from 'lucide-react'

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [reminders, setReminders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMed, setSelectedMed] = useState<any>(null)
  const [reminderTime, setReminderTime] = useState('morning')

  useEffect(() => {
    async function fetchPrescriptions() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data, error } = await supabase
          .from('prescriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          
        if (data) {
          setPrescriptions(data)
        }
        
        const { data: remData } = await supabase
          .from('pill_reminders')
          .select('*, prescriptions(*)')
          
        if (remData) {
          // Filter out ones that don't belong to our user's prescriptions
          const userReminders = remData.filter(r => r.prescriptions?.user_id === user.id)
          setReminders(userReminders)
        }
      }
      setLoading(false)
    }
    
    fetchPrescriptions()
  }, [])
  
  const handleSaveReminder = async () => {
    if (!selectedMed) return;
    const supabase = createClient();
    const { data, error } = await supabase.from('pill_reminders').insert({
        prescription_id: selectedMed.id,
        time_of_day: reminderTime,
        taken_status: false
    }).select();
    
    if (data) {
        setReminders([...reminders, ...data]);
        setSelectedMed(null);
    } else {
        alert("Failed to save reminder.");
    }
  }

  const toggleReminder = async (id: string, currentStatus: boolean) => {
    const supabase = createClient();
    const { error } = await supabase.from('pill_reminders').update({
        taken_status: !currentStatus
    }).eq('id', id);
    
    if (!error) {
        setReminders(reminders.map(r => r.id === id ? {...r, taken_status: !currentStatus} : r))
    }
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-6">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Pill className="text-[var(--color-accent-cyan)]" size={32} />
          My Prescriptions
        </h1>
      </header>
      
      {/* Reminders Section */}
      {reminders.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="text-[var(--color-warning)]" size={24} /> Today's Reminders
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reminders.map(rem => (
               <div key={rem.id} className={`glass-panel p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${rem.taken_status ? 'border-[var(--color-success)]/30 bg-[var(--color-success)]/5' : 'border-[var(--color-warning)]/30 hover:border-[var(--color-warning)]/60'}`} onClick={() => toggleReminder(rem.id, rem.taken_status)}>
                 <div className="flex items-center gap-3">
                    {rem.taken_status ? <CheckCircle className="text-[var(--color-success)]" /> : <Circle className="text-[var(--color-warning)]" />}
                    <div>
                        <h4 className={`font-bold ${rem.taken_status ? 'text-[var(--color-text-muted)] line-through' : 'text-white'}`}>{rem.prescriptions?.medicine_name}</h4>
                        <p className="text-xs text-[var(--color-text-muted)] capitalize">{rem.time_of_day}</p>
                    </div>
                 </div>
               </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <AlertCircle className="text-[var(--color-accent-blue)]" size={24} /> Active Medications
      </h2>

      {loading ? (
        <div className="glass-panel p-10 flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-[var(--color-accent-cyan)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : prescriptions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prescriptions.map((med) => (
            <div key={med.id} className="glass-panel p-6 rounded-2xl border border-[var(--color-accent-cyan)]/30 hover:border-[var(--color-accent-cyan)]/60 transition-all relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-accent-cyan)]/5 rounded-full -mr-12 -mt-12 blur-xl group-hover:bg-[var(--color-accent-cyan)]/15 transition-all"></div>
              
              <h3 className="text-xl font-bold text-white mb-4">{med.medicine_name}</h3>
              
              <div className="space-y-3">
                {med.dosage && (
                  <div className="flex items-center text-sm">
                    <span className="w-24 text-[var(--color-text-muted)] flex items-center gap-2"><Pill size={16} /> Dosage:</span>
                    <span className="text-white font-medium">{med.dosage}</span>
                  </div>
                )}
                {med.frequency && (
                  <div className="flex items-center text-sm">
                    <span className="w-24 text-[var(--color-text-muted)] flex items-center gap-2"><Clock size={16} /> Frequency:</span>
                    <span className="text-white font-medium">{med.frequency}</span>
                  </div>
                )}
                {med.duration && (
                  <div className="flex items-center text-sm">
                    <span className="w-24 text-[var(--color-text-muted)] flex items-center gap-2"><Calendar size={16} /> Duration:</span>
                    <span className="text-white font-medium">{med.duration}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                 <span className="text-xs text-[var(--color-text-muted)]">Added: {new Date(med.created_at).toLocaleDateString()}</span>
                 <button onClick={() => setSelectedMed(med)} className="text-[var(--color-accent-cyan)] hover:text-white text-sm font-medium transition-colors bg-[var(--color-accent-cyan)]/10 px-3 py-1.5 rounded-lg">
                   + Reminder
                 </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-10 text-center border-dashed border-2 border-white/10 flex flex-col items-center">
          <Pill className="text-[var(--color-text-muted)] mb-4" size={48} />
          <h3 className="text-xl font-bold text-white mb-2">No Prescriptions Found</h3>
          <p className="text-[var(--color-text-muted)] max-w-md mx-auto mb-6">
            When you upload a medical prescription in the Dashboard or Chat, CuraMind AI will automatically extract your medicines and list them here.
          </p>
        </div>
      )}
      
      {/* Modal for setting reminder */}
      {selectedMed && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="glass-panel w-full max-w-md rounded-2xl border border-[var(--color-accent-cyan)]/30 overflow-hidden shadow-2xl shadow-[var(--color-accent-cyan)]/20 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Set Reminder</h2>
                    <button onClick={() => setSelectedMed(null)} className="text-[var(--color-text-muted)] hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <p className="text-sm text-[var(--color-text-muted)] mb-1">Medication</p>
                        <p className="text-lg font-bold text-white">{selectedMed.medicine_name}</p>
                        {selectedMed.dosage && <p className="text-sm text-[var(--color-text-muted)]">{selectedMed.dosage}</p>}
                    </div>
                    
                    <div>
                        <label className="block text-sm text-[var(--color-text-muted)] mb-3">Time of Day</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['morning', 'afternoon', 'night'].map(time => (
                                <button 
                                    key={time}
                                    onClick={() => setReminderTime(time)}
                                    className={`py-3 rounded-xl border capitalize font-medium transition-all ${reminderTime === time ? 'bg-[var(--color-accent-cyan)]/20 border-[var(--color-accent-cyan)] text-white' : 'border-white/10 text-[var(--color-text-muted)] hover:border-white/30'}`}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <button onClick={handleSaveReminder} className="w-full py-3 bg-[var(--color-accent-cyan)] text-black font-bold rounded-xl hover:bg-[#4be6c1] transition-colors mt-4">
                        Save Reminder
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}
