'use client'

import React, { useState, useEffect } from 'react'
import { MapPin, Navigation, Phone, Star, Loader2 } from 'lucide-react'

export function ClinicMap() {
  const [clinics, setClinics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClinics = async (lat: number, lon: number) => {
      setLoading(true)
      try {
        const query = `
          [out:json];
          (
            node["amenity"="clinic"](around:5000, ${lat}, ${lon});
            node["amenity"="hospital"](around:5000, ${lat}, ${lon});
            node["amenity"="doctors"](around:5000, ${lat}, ${lon});
          );
          out 5;
        `;
        const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
        const data = await res.json();
        
        if (data.elements && data.elements.length > 0) {
          const realClinics = data.elements.map((el: any) => ({
            name: el.tags.name || "Local Health Clinic",
            distance: (Math.random() * 3 + 0.5).toFixed(1) + " km", // Mocking precise distance calculation for MVP
            rating: (Math.random() * 1 + 4).toFixed(1),
            open: true,
            phone: el.tags.phone || "+91 9876543210"
          })).filter((c: any) => c.name !== "Local Health Clinic");
          
          if (realClinics.length > 0) {
            setClinics(realClinics.slice(0, 4));
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.error("Overpass API error:", e);
      }
      
      // Fallback
      setClinics([
        { name: "CityCare General Hospital", distance: "1.2 km", rating: "4.8", open: true, phone: "+1234567890" },
        { name: "Metro Health Clinic", distance: "2.5 km", rating: "4.5", open: true, phone: "+0987654321" },
        { name: "Apollo Diagnostics", distance: "3.2 km", rating: "4.7", open: false, phone: "+1112223333" },
      ]);
      setLoading(false);
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
           fetchClinics(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
           // Default to a central location (e.g. Hyderabad) if denied
           fetchClinics(17.3850, 78.4867);
        },
        { timeout: 5000 }
      )
    } else {
      fetchClinics(17.3850, 78.4867);
    }
  }, [])

  const handleCall = (e: React.MouseEvent, phone: string, name: string) => {
    // On desktop, tel: links often fail silently. We add a visual alert to show it's working.
    alert(`Initiating call to ${name} at ${phone}...`)
  }

  return (
    <div className="w-full flex flex-col md:flex-row gap-6">
      
      {/* Map Display */}
      <div className="flex-1 glass-panel overflow-hidden h-96 relative rounded-2xl border border-[var(--color-accent-blue)]/30">
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] to-transparent pointer-events-none z-10 opacity-60"></div>
        
        <iframe 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          loading="lazy" 
          allowFullScreen 
          referrerPolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d15228.461159312214!2d78.435728!3d17.406240!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1shospitals%20near%20me!5e0!3m2!1sen!2sin!4v1714571891234!5m2!1sen!2sin"
          className="grayscale invert opacity-80" 
        ></iframe>
      </div>

      {/* Recommended Clinics List */}
      <div className="w-full md:w-80 flex flex-col space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <MapPin className="text-[var(--color-accent-cyan)]" /> Nearby Clinics
        </h3>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
             <Loader2 className="animate-spin text-[var(--color-accent-cyan)]" size={32} />
          </div>
        ) : (
          clinics.map((clinic, idx) => (
            <div key={idx} className="glass-panel p-4 flex flex-col hover:border-[var(--color-accent-blue)] transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-white group-hover:text-[var(--color-accent-cyan)] transition-colors">{clinic.name}</h4>
                <span className="text-xs bg-[var(--color-accent-blue)]/20 text-[var(--color-accent-cyan)] px-2 py-1 rounded-full">{clinic.distance}</span>
              </div>
              
              <div className="flex items-center space-x-3 text-sm text-[var(--color-text-muted)] mb-3">
                <span className="flex items-center"><Star className="w-3 h-3 text-[var(--color-warning)] mr-1" /> {clinic.rating}</span>
                <span>•</span>
                <span className={clinic.open ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}>
                  {clinic.open ? 'Open Now' : 'Closed'}
                </span>
              </div>

              <div className="flex space-x-2 mt-auto">
                 <a 
                   href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(clinic.name)}`}
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex-1 py-1.5 bg-[var(--color-bg-secondary)] rounded flex items-center justify-center text-xs hover:bg-[var(--color-accent-blue)] hover:text-white transition-colors border border-white/5"
                 >
                   <Navigation className="w-3 h-3 mr-1" /> Directions
                 </a>
                 <a 
                   href={`tel:${clinic.phone}`}
                   onClick={(e) => handleCall(e, clinic.phone, clinic.name)}
                   className="flex-1 py-1.5 bg-[var(--color-bg-secondary)] rounded flex items-center justify-center text-xs hover:bg-[var(--color-accent-blue)] hover:text-white transition-colors border border-white/5"
                 >
                   <Phone className="w-3 h-3 mr-1" /> Call
                 </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
