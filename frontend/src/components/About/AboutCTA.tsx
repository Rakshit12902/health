import React from 'react';
import { ArrowRight, Play } from 'lucide-react';

export default function AboutCTA() {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 pb-20 relative z-10">
      <div className="bg-gradient-to-br from-[#F8FAFC] to-blue-50/80 rounded-[40px] border border-blue-100/50 p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden">
        
        {/* Background wave abstraction */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl z-0"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/40 rounded-full blur-3xl z-0"></div>

        {/* Left Content */}
        <div className="flex-1 relative z-10 max-w-2xl">
          <div className="inline-flex items-center px-3 py-1.5 rounded-md bg-blue-100/80 text-blue-600 text-[10px] font-bold tracking-widest uppercase mb-6">
            Together for a healthier tomorrow
          </div>
          
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] leading-tight tracking-tight mb-4">
            Be a Part of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]">Our Journey</span>
          </h2>
          
          <p className="text-[#475569] text-sm md:text-base leading-relaxed">
            Join thousands of users who trust CuraMind AI to understand their health and make informed decisions.
          </p>
        </div>

        {/* Right Content (Buttons) */}
        <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
          <button className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 w-full sm:w-auto">
            Get Started Free <ArrowRight size={16} />
          </button>
          <button className="px-8 py-3.5 rounded-full border border-gray-200 bg-white/50 text-[#0F172A] font-semibold text-sm hover:bg-white transition-colors flex items-center justify-center gap-2 w-full sm:w-auto backdrop-blur-sm">
            <Play size={16} className="text-[#0F172A]" /> Watch Video
          </button>

          {/* Floating Cursive */}
          <div className="absolute -bottom-16 right-0 md:-right-12 rotate-[-10deg] font-medium text-blue-400 text-lg tracking-tight whitespace-nowrap hidden lg:block" style={{ fontFamily: "'Caveat', 'Comic Sans MS', cursive" }}>
            Better <br/>
            Health Insights <br/>
            Brighter Tomorrows
          </div>
        </div>

      </div>
    </div>
  );
}
