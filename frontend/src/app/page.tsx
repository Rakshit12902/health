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
import PricingHero from '@/components/Pricing/PricingHero';
import PricingCards from '@/components/Pricing/PricingCards';
import PricingFeatures from '@/components/Pricing/PricingFeatures';
import PricingCTA from '@/components/Pricing/PricingCTA';
import AboutHero from '@/components/About/AboutHero';
import AboutPurpose from '@/components/About/AboutPurpose';
import AboutJourney from '@/components/About/AboutJourney';
import AboutWhy from '@/components/About/AboutWhy';
import AboutTeam from '@/components/About/AboutTeam';
import AboutCTA from '@/components/About/AboutCTA';

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

      {/* Pricing Section - Visible on scroll */}
      <div id="pricing" className="mt-20">
        <PricingHero />
        <PricingCards />
        <PricingFeatures />
        <PricingCTA />
      </div>

      {/* About Section - Visible on scroll */}
      <div id="about" className="mt-20">
        <AboutHero />
        <AboutPurpose />
        <AboutJourney />
        <AboutWhy />
        <AboutTeam />
        <AboutCTA />
      </div>
    </div>
  );
}
