import React from 'react';
import { ArrowRight, Lightbulb, Users, BarChart3, Rocket } from 'lucide-react';

export default function AboutJourney() {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-20 relative z-10">
      <div className="flex flex-col lg:flex-row gap-16 items-start">
        
        {/* Left Column */}
        <div className="flex-1 lg:max-w-sm">
          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold tracking-widest uppercase mb-6">
            Our Journey
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-[40px] font-extrabold text-[#0F172A] leading-[1.15] tracking-tight mb-6">
            From an Idea to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]">Real Impact</span>
          </h2>
          
          <p className="text-[#475569] text-base leading-relaxed mb-8">
            A journey driven by the belief that technology can make healthcare simpler, clearer, and more human.
          </p>

          <button className="px-6 py-3 rounded-full border border-gray-200 text-blue-600 font-semibold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
            Our Journey <ArrowRight size={16} />
          </button>
        </div>

        {/* Right Column (Timeline) */}
        <div className="flex-1 w-full relative pt-10">
          
          {/* Continuous Line */}
          <div className="hidden md:block absolute top-[42px] left-10 right-10 h-px bg-gray-200 border-t border-dashed border-gray-300 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Timeline Item 1 */}
            <div className="relative z-10 flex flex-col items-start md:items-center text-left md:text-center group">
              <div className="w-12 h-12 rounded-full bg-fuchsia-50 text-fuchsia-600 border-[4px] border-white flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Lightbulb size={20} />
              </div>
              <h4 className="font-extrabold text-[#0F172A] text-lg mb-1">2023</h4>
              <h5 className="font-bold text-[#334155] text-[13px] mb-2">The Beginning</h5>
              <p className="text-[#64748B] text-xs leading-relaxed">
                An idea to simplify medical reports using AI.
              </p>
            </div>

            {/* Timeline Item 2 */}
            <div className="relative z-10 flex flex-col items-start md:items-center text-left md:text-center group">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 border-[4px] border-white flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Users size={20} />
              </div>
              <h4 className="font-extrabold text-[#0F172A] text-lg mb-1">2024</h4>
              <h5 className="font-bold text-[#334155] text-[13px] mb-2">Building & Growing</h5>
              <p className="text-[#64748B] text-xs leading-relaxed">
                Launched our platform and reached our first users.
              </p>
            </div>

            {/* Timeline Item 3 */}
            <div className="relative z-10 flex flex-col items-start md:items-center text-left md:text-center group">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 border-[4px] border-white flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <BarChart3 size={20} />
              </div>
              <h4 className="font-extrabold text-[#0F172A] text-lg mb-1">2025</h4>
              <h5 className="font-bold text-[#334155] text-[13px] mb-2">Expanding Impact</h5>
              <p className="text-[#64748B] text-xs leading-relaxed">
                Added multi-language support and advanced health insights.
              </p>
            </div>

            {/* Timeline Item 4 */}
            <div className="relative z-10 flex flex-col items-start md:items-center text-left md:text-center group">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 border-[4px] border-white flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Rocket size={20} />
              </div>
              <h4 className="font-extrabold text-[#0F172A] text-lg mb-1">Beyond</h4>
              <h5 className="font-bold text-[#334155] text-[13px] mb-2">A Healthier Tomorrow</h5>
              <p className="text-[#64748B] text-xs leading-relaxed">
                Continuing to innovate for a more informed and healthier world.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
