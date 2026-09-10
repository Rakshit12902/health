import React from 'react';
import Link from 'next/link';
import { Play, Sparkles } from 'lucide-react';

export default function FeaturesCTA() {
  return (
    <div className="w-full max-w-7xl mx-auto px-8 py-16 mb-12">
      <div className="flex flex-col lg:flex-row items-center gap-12">
        
        {/* Left Side */}
        <div className="flex-1 text-left">
          <p className="text-blue-500 font-bold text-[10px] tracking-widest uppercase mb-4">
            WHY CURAMIND AI
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-4 leading-tight tracking-tight">
            Healthcare insights, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]">
              made simple.
            </span>
          </h2>
          <p className="text-[#475569] text-base leading-relaxed max-w-md">
            From confusing medical terms to clear answers — CuraMind AI helps you understand your health, so you can take the next step with confidence.
          </p>
        </div>

        {/* Right Side - CTA Box */}
        <div className="flex-1 w-full bg-[#F8FAFC] rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 blur-3xl rounded-full"></div>
          
          <div className="flex items-start gap-3 mb-6 relative z-10">
            <div className="text-blue-500 mt-1"><Sparkles size={24}/></div>
            <div>
              <h3 className="font-bold text-[#0F172A] text-xl">Start understanding your reports today</h3>
              <p className="text-[#64748B] text-sm mt-1">Join thousands of users who are already making sense of their health reports with CuraMind AI.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 relative z-10">
            <Link 
              href="/signup" 
              className="flex-1 px-6 py-3 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              Get Started Free &rarr;
            </Link>
            <button className="flex-1 px-6 py-3 rounded-full bg-white border border-[#CBD5E1] text-[#0F172A] font-semibold text-sm hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-2 group">
              <div className="bg-[#0F172A] text-white rounded-full p-0.5 group-hover:bg-[#3B82F6] transition-colors">
                <Play size={12} fill="currentColor" />
              </div>
              Watch Demo
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
