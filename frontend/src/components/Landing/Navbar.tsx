import React from 'react';
import Link from 'next/link';
import { HeartPulse } from 'lucide-react';

export default function Navbar({ activeTab = 'home' }: { activeTab?: 'home' | 'features' | 'how-it-works' | 'pricing' | 'about' }) {
  return (
    <nav className="w-full flex items-center justify-between py-6 px-8 max-w-7xl mx-auto relative z-20">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <HeartPulse className="text-[#3B82F6]" size={28} />
        <span className="text-[#0F172A] font-bold text-xl tracking-tight">CuraMind AI</span>
      </div>

      {/* Center Links - Hidden on mobile */}
      <div className="hidden md:flex items-center gap-8 font-medium text-sm text-[#475569]">
        <a href="/" className={`relative transition-colors ${activeTab === 'home' ? 'text-[#0F172A]' : 'hover:text-[#0F172A]'}`}>
          Home
          {activeTab === 'home' && <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#3B82F6] rounded-full"></span>}
        </a>
        <a href="/features" className={`relative transition-colors ${activeTab === 'features' ? 'text-[#0F172A]' : 'hover:text-[#0F172A]'}`}>
          Features
          {activeTab === 'features' && <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#3B82F6] rounded-full"></span>}
        </a>
        <a href="/how-it-works" className={`relative transition-colors ${activeTab === 'how-it-works' ? 'text-[#0F172A]' : 'hover:text-[#0F172A]'}`}>
          How It Works
          {activeTab === 'how-it-works' && <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#3B82F6] rounded-full"></span>}
        </a>
        <a href="/pricing" className={`relative transition-colors ${activeTab === 'pricing' ? 'text-[#0F172A]' : 'hover:text-[#0F172A]'}`}>
          Pricing
          {activeTab === 'pricing' && <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#3B82F6] rounded-full"></span>}
        </a>
        <a href="/about" className={`relative transition-colors ${activeTab === 'about' ? 'text-[#0F172A]' : 'hover:text-[#0F172A]'}`}>
          About
          {activeTab === 'about' && <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#3B82F6] rounded-full"></span>}
        </a>
      </div>

      {/* CTA Buttons */}
      <div className="flex items-center gap-4">
        <Link 
          href="/login" 
          className="px-5 py-2.5 rounded-full border border-[#CBD5E1] text-[#0F172A] font-medium text-sm hover:bg-[#F1F5F9] transition-colors"
        >
          Login
        </Link>
        <Link 
          href="/signup" 
          className="hidden sm:inline-block px-5 py-2.5 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white font-medium text-sm hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20"
        >
          Get Started Free &rarr;
        </Link>
      </div>
    </nav>
  );
}
