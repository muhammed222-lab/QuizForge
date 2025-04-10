/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useTheme } from "next-themes";
import HeroSection from "@/components/frontpage/HeroSection";
import FeaturesSection from "@/components/frontpage/FeaturesSection";
import HowItWorks from "@/components/frontpage/HowItWorks";
import PricingSection from "@/components/frontpage/PricingSection";
import CallToAction from "@/components/frontpage/CallToAction";

export default function Home() {
  const { theme, setTheme } = useTheme();

  return (
    <main className="flex min-h-screen flex-col items-center">
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <PricingSection />
      <CallToAction />
    </main>
  );
}
