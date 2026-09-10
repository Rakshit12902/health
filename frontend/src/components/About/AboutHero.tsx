import React from 'react';
import { ArrowRight, Play, HeartPulse, CheckCircle2, Globe, Users, ShieldCheck, Heart } from 'lucide-react';

export default function AboutHero() {
  return (
    <div className="w-full relative overflow-hidden bg-gradient-to-b from-[#F8FAFC] to-white pt-20 pb-20">
      
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-50/60 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 z-0 pointer-events-none"></div>
      <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-indigo-50/40 rounded-full blur-3xl -translate-x-1/2 z-0 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Top Hero Section */}
        <div className="flex flex-col lg:flex-row items-center gap-16 mb-24">
          
          {/* Left Content */}
          <div className="flex-1 w-full text-center lg:text-left">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-100/80 text-blue-600 text-[10px] font-bold tracking-widest uppercase mb-6">
              Our Story
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-[52px] font-extrabold text-[#0F172A] leading-[1.15] tracking-tight mb-6">
              Building a Healthier <br className="hidden md:block" />
              Tomorrow <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]">with AI</span>
            </h1>
            
            <p className="text-[#475569] text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8">
              CuraMind AI was created with a simple belief — that everyone deserves to understand their health. 
              We combine advanced artificial intelligence with medical knowledge to make healthcare information 
              clear, accessible, and empowering for all.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 w-full sm:w-auto">
                Get Started Free <ArrowRight size={16} />
              </button>
              <button className="px-8 py-3.5 rounded-full border border-gray-200 text-[#0F172A] font-semibold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto">
                <Play size={16} className="text-[#0F172A]" /> Watch Our Story
              </button>
            </div>
          </div>

          {/* Right Visuals (Mockup) */}
          <div className="flex-1 w-full relative h-[450px] md:h-[500px] flex items-center justify-center">
            
            {/* The Main Image Placeholder */}
            <div className="w-[300px] h-[400px] md:w-[360px] md:h-[460px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-[40px] shadow-2xl relative overflow-hidden flex items-center justify-center z-10 border-4 border-white">
              {/* Optional: Once you have the real image, replace this content with an <img src="..." className="object-cover w-full h-full" /> */}
              <div className="text-gray-400 font-medium flex flex-col items-center gap-2">
                <HeartPulse size={48} className="opacity-50" />
                <span>Doctor & Patient Image</span>
              </div>
            </div>

            {/* Floating Cursive Text */}
            <div className="absolute top-4 right-0 md:-right-8 -rotate-12 font-medium text-blue-400 text-xl tracking-tight z-0" style={{ fontFamily: "'Caveat', 'Comic Sans MS', cursive" }}>
              People <br/>
              Technology <br/>
              Better Health <br/>
              Together
            </div>

            {/* Floating Card 1: Top Left */}
            <div className="absolute top-[10%] left-0 md:-left-8 bg-white p-3 rounded-2xl shadow-xl shadow-blue-900/10 z-20 flex items-center gap-3 border border-gray-100 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-[#0F172A] leading-tight">Smarter Insights</span>
                <span className="text-[10px] text-[#64748B] leading-tight">Healthier Lives</span>
              </div>
            </div>

            {/* Floating Card 2: Bottom Left */}
            <div className="absolute bottom-[20%] left-4 md:-left-12 bg-white p-4 rounded-2xl shadow-xl shadow-blue-900/10 z-30 max-w-[200px] border border-gray-100">
              <p className="text-[12px] font-bold text-[#0F172A] leading-snug mb-3">
                "Technology should bring people closer to better health."
              </p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center">
                  <Heart size={12} className="fill-purple-500" />
                </div>
                <span className="text-[10px] text-[#64748B] font-medium">— Our Belief</span>
              </div>
            </div>

            {/* Floating Card 3: Bottom Right */}
            <div className="absolute bottom-[10%] -right-4 md:-right-12 bg-white p-4 rounded-2xl shadow-xl shadow-blue-900/10 z-20 flex flex-col gap-2 max-w-[180px] border border-gray-100">
              <div className="flex items-center gap-2 text-blue-500">
                <Users size={16} />
                <div className="w-6 h-1.5 bg-blue-100 rounded-full"></div>
              </div>
              <span className="text-[11px] font-bold text-[#0F172A] leading-snug">
                For Individuals, Families and Healthcare Providers
              </span>
            </div>

          </div>
        </div>

        {/* Stats Section */}
        <div className="w-full">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-10 flex flex-col md:flex-row flex-wrap justify-between items-center gap-8 md:gap-4">
            
            {/* Stat 1 */}
            <div className="flex items-center gap-4 flex-1 justify-center md:justify-start min-w-[200px]">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                <Users size={24} />
              </div>
              <div>
                <h4 className="font-bold text-[#0F172A] text-xl">10,000+</h4>
                <p className="text-[#64748B] text-xs">Reports Analyzed</p>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-12 bg-gray-100"></div>

            {/* Stat 2 */}
            <div className="flex items-center gap-4 flex-1 justify-center md:justify-start min-w-[200px]">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-bold text-[#0F172A] text-xl">95%</h4>
                <p className="text-[#64748B] text-xs">User Satisfaction</p>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-12 bg-gray-100"></div>

            {/* Stat 3 */}
            <div className="flex items-center gap-4 flex-1 justify-center md:justify-start min-w-[200px]">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                <Globe size={24} />
              </div>
              <div>
                <h4 className="font-bold text-[#0F172A] text-xl">20+</h4>
                <p className="text-[#64748B] text-xs">Languages Supported</p>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-12 bg-gray-100"></div>

            {/* Stat 4 */}
            <div className="flex items-center gap-4 flex-1 justify-center md:justify-start min-w-[200px]">
              <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                <Heart size={24} />
              </div>
              <div>
                <h4 className="font-bold text-[#0F172A] text-base">A Healthier Tomorrow</h4>
                <p className="text-[#64748B] text-xs">Our Mission</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
