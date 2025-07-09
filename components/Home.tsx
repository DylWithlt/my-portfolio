import { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

import WizardCanvas from "./WizardCanvas";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  useEffect(() => {
    // Hero reveal
    gsap.from(".hero-text", {
      opacity: 0,
      y: 50,
      scrollTrigger: {
        trigger: ".hero",
        start: "top center",
      },
    });

    // At certain scroll points, animate your wizard: raise staff, shoot particles, etc.
    ScrollTrigger.create({
      trigger: ".section-2",
      start: "top center",
      onEnter: () => {
        // call a function exported from WizardCanvas to trigger an animation
      },
    });
  }, []);
  return (
    <>
      <WizardCanvas />
      <section className="hero">…</section>
      <section className="section-2">…</section>
      {/* etc */}
    </>
  );
}
