"use client";

import HeroSection from "@/components/HeroSection";
import dynamic from "next/dynamic";

// Correct: use your TSConfig “@” alias (pointing at the project root)
const WizardCanvas = dynamic(() => import("@/components/WizardCanvas"), {
  ssr: false,
});

export default function Page() {
  return (
    <main className="relative min-h-screen bg-gray-900 text-white">
      {/* 3D Wizard background */}
      <div className="fixed inset-0 -z-0">
        <WizardCanvas />
      </div>

      {/* Content wrapper with sections pinned or spaced for scroll triggers */}
      <div className="relative z-10">
        <section
          id="hero"
          className="h-screen flex flex-col items-center justify-center"
        >
          <HeroSection />
        </section>

        <section
          id="testimonials"
          className="h-screen flex items-center justify-center"
        >
          {/* <TestimonialsSection /> */}
        </section>

        <section
          id="projects"
          className="h-screen flex items-center justify-center"
        >
          {/* <ProjectsSection /> */}
        </section>

        <section
          id="about-link"
          className="h-screen flex items-center justify-center"
        >
          {/* <AboutLinkSection /> */}
        </section>
      </div>

      {/* Add additional sections as needed */}
    </main>
  );
}
