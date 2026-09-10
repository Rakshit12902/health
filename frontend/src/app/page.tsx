import React from 'react';
import Navbar from '@/components/Landing/Navbar';
import Hero from '@/components/Landing/Hero';
import ProblemSolution from '@/components/Landing/ProblemSolution';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans overflow-x-hidden">
      <Navbar />
      <Hero />
      <ProblemSolution />
    </div>
  );
}
