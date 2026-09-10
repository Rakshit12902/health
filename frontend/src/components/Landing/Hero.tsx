import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Brain, Globe, Play, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function Hero() {
  return (
    <div className="w-full relative max-w-7xl mx-auto px-8 pt-12 pb-24 flex flex-col lg:flex-row items-center gap-12 z-10">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-blue-200/40 via-purple-100/30 to-transparent rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute top-40 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-blue-100/40 to-transparent rounded-full blur-3xl -z-10 pointer-events-none"></div>

      {/* Left Column - Content */}
      <div className="flex-1 flex flex-col items-start pt-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 font-medium text-xs mb-6 border border-blue-100 shadow-sm">
          <Sparkles size={14} className="text-blue-500" />
          AI-Powered Healthcare Assistant
        </div>

        <h1 className="text-5xl lg:text-6xl font-extrabold text-[#0F172A] leading-[1.15] mb-6 tracking-tight">
          Your AI Healthcare <br/>
          Companion for <br/>
          Understanding <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]">
            Medical Reports
          </span>
        </h1>

        <p className="text-lg text-[#475569] mb-8 max-w-lg leading-relaxed">
          Upload your reports, get simple explanations, track your health insights, and chat with AI — all in one secure platform.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
          <Link 
            href="/signup" 
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
          >
            Try CuraMind Free &rarr;
          </Link>
          <button className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white border border-[#CBD5E1] text-[#0F172A] font-semibold hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-2 group">
            <div className="bg-[#0F172A] text-white rounded-full p-1 group-hover:bg-[#3B82F6] transition-colors">
              <Play size={14} fill="currentColor" />
            </div>
            Watch Demo
          </button>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
          <div className="flex items-start gap-3">
            <ShieldCheck className="text-[#3B82F6] mt-1 shrink-0" size={20} />
            <div>
              <p className="font-semibold text-sm text-[#0F172A]">Secure & Private</p>
              <p className="text-xs text-[#64748B] mt-0.5">Your data, your control</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Brain className="text-[#3B82F6] mt-1 shrink-0" size={20} />
            <div>
              <p className="font-semibold text-sm text-[#0F172A]">AI-Powered Insights</p>
              <p className="text-xs text-[#64748B] mt-0.5">Understand in simple words</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Globe className="text-[#3B82F6] mt-1 shrink-0" size={20} />
            <div>
              <p className="font-semibold text-sm text-[#0F172A]">Multi-language Support</p>
              <p className="text-xs text-[#64748B] mt-0.5">Healthcare for everyone</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Graphics */}
      <div className="flex-1 relative w-full h-[600px] hidden lg:block">
        {/* Placeholder for the complex laptop/phone graphic.
            The user can swap this out with the exported transparent PNG from their designer. */}
        <div className="absolute inset-0 flex items-center justify-center">
            {/* If the graphic is provided as an image: */}
            <div className="w-full h-full bg-slate-200/30 rounded-3xl border border-white/50 backdrop-blur-sm flex flex-col items-center justify-center text-slate-400 border-dashed relative overflow-hidden">
                <span className="text-sm font-medium z-10">[Hero Graphic Placeholder]</span>
                <span className="text-xs z-10">Replace with your laptop/phone image</span>
            </div>
        </div>
      </div>
    </div>
  );
}
