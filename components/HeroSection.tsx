"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";

export default function HeroSection() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const monikerRef = useRef<HTMLParagraphElement>(null);
  const countRef = useRef<HTMLDivElement>(null);
  const [visits, setVisits] = useState<number | null>(null);

  useEffect(() => {
    // Entrance animation
    gsap.from([titleRef.current, monikerRef.current, countRef.current], {
      opacity: 0,
      y: 50,
      stagger: 0.2,
      duration: 1,
      ease: "power3.out",
    });

    // Fetch live visit/contribution count
    fetch("/api/visits")
      .then((res) => {
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        return res.json();
      })
      .then((data) => setVisits(data.count))
      .catch((err) => {
        console.error("Failed to load visits:", err);
        setVisits(0);
      });
  }, []);

  return (
    <div className="text-center max-w-xl mx-auto px-4">
      <h1
        ref={titleRef}
        className="font-medieval-sharp text-9xl md:text-9xl tracking-tight mb-4"
      >
        DylWithlt
      </h1>
      <p
        ref={monikerRef}
        className="font-caudex text-lg md:text-xl italic text-gray-300 mb-6"
      >
        Full‑Stack Wizard & Game Developer
      </p>
      <div
        ref={countRef}
        className="inline-block bg-gray-800 bg-opacity-20 text-xl py-2 px-6 rounded-full"
      >
        {visits !== null ? (
          <>
            <span className="font-cardo">{visits.toLocaleString()}</span> visits
          </>
        ) : (
          "Loading..."
        )}
      </div>
    </div>
  );
}
