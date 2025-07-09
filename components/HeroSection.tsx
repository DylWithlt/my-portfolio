// At the top of your component file
import { gsap } from "gsap";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";
import { useEffect, useRef, useState } from "react";

gsap.registerPlugin(Physics2DPlugin);

export default function HeroSection() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [visits, setVisits] = useState<number | null>(null);

  useEffect(() => {
    const title = titleRef.current;
    if (!title) return;

    const spans = Array.from(title.children) as HTMLElement[];

    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      spans.forEach((span) => {
        const { left, top, width, height } = span.getBoundingClientRect();
        const spanCenterX = left + width / 2;
        const spanCenterY = top + height / 2;
        const deltaX = clientX - spanCenterX;
        const deltaY = clientY - spanCenterY;
        const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
        const maxDistance = 200;
        const force = Math.min(distance / maxDistance, 1);

        gsap.to(span, {
          x: deltaX * force * 0.1,
          y: deltaY * force * 0.1,
          duration: 0.3,
          ease: "power3.out",
        });
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    // Entrance animation
    gsap.from(titleRef.current?.children, {
      opacity: 0,
      y: 50,
      stagger: 0.2,
      duration: 1,
      ease: "power3.out",
    });

    // Fetch live visit/contribution count
    fetch("/api/visits")
      .then((res) => res.json())
      .then((data) => setVisits(data.count))
      .catch((err) => {
        console.error("Failed to load visits:", err);
        setVisits(0);
      });
  }, []);

  const letters = "DylWithlt".split("");
  const charsRef = useRef<HTMLElement[]>([]);
  charsRef.current = [];

  useEffect(() => {
    const elems = charsRef.current;

    const handleMove = (e: MouseEvent) => {
      elems.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = cx - e.clientX;
        const dy = cy - e.clientY;
        const dist = Math.hypot(dx, dy);
        const range = 100;

        gsap.killTweensOf(el);
        if (dist < range) {
          gsap.to(el, {
            physics2D: {
              velocity: (1 - dist / range) * 400,
              angle: (Math.atan2(dy, dx) * 180) / Math.PI,
              friction: 0,
            },
            x: 0,
            y: 0, // ensure position trackers exist
          });
        } else {
          gsap.to(el, {
            x: 0,
            y: 0,
            duration: 0.8,
            ease: "elastic.out(1, 0.4)",
          });
        }
      });
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div className="text-center max-w-xl mx-auto px-4">
      <h1 className="text-9xl md:text-9xl font-medieval-sharp tracking-tight mb-4">
        {letters.map((ch, i) => (
          <span
            key={i}
            ref={(el) => el && charsRef.current.push(el)}
            className="inline-block"
          >
            {ch}
          </span>
        ))}
      </h1>

      <p className="font-caudex text-lg md:text-xl italic text-gray-300 mb-6">
        Full‑Stack Wizard & Game Developer
      </p>
      <div className="inline-block bg-gray-800 bg-opacity-20 text-xl py-2 px-6 rounded-full">
        {visits !== null ? (
          <>
            <span className="font-mono">{visits.toLocaleString()}</span> visits
          </>
        ) : (
          "Loading..."
        )}
      </div>
    </div>
  );
}
