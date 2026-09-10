import React from 'react';
import Navbar from '@/components/Landing/Navbar';
import Hero from '@/components/Landing/Hero';
import ProblemSolution from '@/components/Landing/ProblemSolution';
import FeaturesHero from '@/components/Features/FeaturesHero';
import FeaturesBentoGrid from '@/components/Features/FeaturesBentoGrid';
import FeaturesCTA from '@/components/Features/FeaturesCTA';
import HowItWorksHero from '@/components/HowItWorks/HowItWorksHero';
import HowItWorksSteps from '@/components/HowItWorks/HowItWorksSteps';
import HowItWorksBottom from '@/components/HowItWorks/HowItWorksBottom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans overflow-x-hidden">
      <Navbar />
      <Hero />
      <ProblemSolution />
      
      {/* Features Section - Visible on scroll */}
      <div id="features" className="mt-20">
        <FeaturesHero />
        <FeaturesBentoGrid />
        <FeaturesCTA />
      </div>

      {/* How It Works Section - Visible on scroll */}
      <div id="how-it-works" className="mt-20">
        <HowItWorksHero />
        <HowItWorksSteps />
        <HowItWorksBottom />
      </div>
    </div>
  );
}
