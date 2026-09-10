import React from 'react';
import { ArrowRight, Linkedin, Github, User } from 'lucide-react';

export default function AboutTeam() {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-20 relative z-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div className="max-w-2xl">
          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-100/80 text-blue-600 text-[10px] font-bold tracking-widest uppercase mb-4">
            The People Behind CuraMind AI
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] leading-tight tracking-tight shrink-0">
              Meet the Team
            </h2>
            <p className="text-[#475569] text-sm leading-relaxed border-l-0 md:border-l-2 border-gray-200 pl-0 md:pl-6 max-w-lg">
              We are a group of passionate builders, designers, and healthcare 
              enthusiasts working together to make health information accessible to everyone.
            </p>
          </div>
        </div>

        <button className="text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors flex items-center gap-2 shrink-0">
          Join Our Team <ArrowRight size={16} />
        </button>
      </div>

      {/* Team Cards (2 cards per user request) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full lg:max-w-4xl">
        
        {/* Team Member 1 */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8 flex flex-col sm:flex-row gap-6 items-start hover:shadow-md transition-shadow">
          <div className="w-20 h-20 rounded-full bg-blue-50 border-4 border-white shadow-sm flex items-center justify-center shrink-0 overflow-hidden relative">
            <User size={32} className="text-blue-200" />
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-indigo-50 opacity-50"></div>
          </div>
          
          <div className="flex flex-col">
            <h3 className="font-bold text-[#0F172A] text-lg leading-tight">Rakshit Katiyar</h3>
            <span className="text-blue-600 text-xs font-semibold mb-3">Co-Founder & Developer</span>
            <p className="text-[#64748B] text-xs leading-relaxed mb-4">
              Passionate about AI, data, and building solutions that make a real impact in people's lives.
            </p>
            <div className="flex gap-3 text-gray-400">
              <a href="#" className="hover:text-[#0F172A] transition-colors"><Linkedin size={16} /></a>
              <a href="#" className="hover:text-[#0F172A] transition-colors"><Github size={16} /></a>
            </div>
          </div>
        </div>

        {/* Team Member 2 */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8 flex flex-col sm:flex-row gap-6 items-start hover:shadow-md transition-shadow">
          <div className="w-20 h-20 rounded-full bg-purple-50 border-4 border-white shadow-sm flex items-center justify-center shrink-0 overflow-hidden relative">
            <User size={32} className="text-purple-200" />
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-100 to-pink-50 opacity-50"></div>
          </div>
          
          <div className="flex flex-col">
            <h3 className="font-bold text-[#0F172A] text-lg leading-tight">Aashika kumari</h3>
            <span className="text-blue-600 text-xs font-semibold mb-3">Co-Founder & Product</span>
            <p className="text-[#64748B] text-xs leading-relaxed mb-4">
              Focused on creating user-centric experiences that make healthcare simple and accessible.
            </p>
            <div className="flex gap-3 text-gray-400">
              <a href="#" className="hover:text-[#0F172A] transition-colors"><Linkedin size={16} /></a>
              <a href="#" className="hover:text-[#0F172A] transition-colors"><Github size={16} /></a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
