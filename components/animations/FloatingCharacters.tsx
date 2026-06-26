"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

const CHARACTERS = [
  { src: "/characters/char-1.png", label: "Electrician" },
  { src: "/characters/char-2.png", label: "Accountant" },
  { src: "/characters/char-3.png", label: "Cleaner" },
  { src: "/characters/char-4.png", label: "Landscaper" },
  { src: "/characters/char-5.png", label: "Contractor" },
  { src: "/characters/char-6.png", label: "Painter" },
  { src: "/characters/char-7.png", label: "Handyman" },
  { src: "/characters/char-8.png", label: "Plumber" },
  { src: "/characters/char-9.png", label: "Roofer" },
];

// The PNGs have the character in the top-left ~25% of a large canvas
// So we need massive sizes for the container, the character renders at ~25% of this
const POSITIONS = [
  { top: "-15%", left: "-10%", size: 1400, delay: 0,    speed: 18, opacity: 0.8  },
  { top: "-10%", left: "60%",  size: 1600, delay: 1.5,  speed: 22, opacity: 0.75 },
  { top: "15%",  left: "75%",  size: 1300, delay: 3,    speed: 16, opacity: 0.7  },
  { top: "30%",  left: "-12%", size: 1400, delay: 0.8,  speed: 20, opacity: 0.75 },
  { top: "45%",  left: "65%",  size: 1500, delay: 2.5,  speed: 24, opacity: 0.8  },
  { top: "-5%",  left: "80%",  size: 1100, delay: 4,    speed: 14, opacity: 0.6  },
  { top: "35%",  left: "-5%",  size: 1200, delay: 2,    speed: 19, opacity: 0.7  },
  { top: "-20%", left: "30%",  size: 1000, delay: 5,    speed: 15, opacity: 0.55 },
  { top: "55%",  left: "35%",  size: 1400, delay: 1,    speed: 21, opacity: 0.75 },
];

export default function FloatingCharacters() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      <style>{`
        @keyframes float-y {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-20px) rotate(2deg); }
          50% { transform: translateY(-8px) rotate(-1deg); }
          75% { transform: translateY(-25px) rotate(1.5deg); }
        }
        @keyframes float-x {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(15px); }
        }
        @keyframes fade-in-char {
          from { opacity: 0; transform: scale(0.7); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {CHARACTERS.map((char, i) => {
        const pos = POSITIONS[i];
        return (
          <div
            key={i}
            className="absolute"
            style={{
              top: pos.top,
              left: pos.left,
              width: pos.size,
              height: pos.size,
              opacity: pos.opacity,
              animation: `fade-in-char 0.8s ease ${pos.delay + 0.5}s both`,
            }}
          >
            <div
              style={{
                animation: `float-y ${pos.speed}s ease-in-out ${pos.delay}s infinite, float-x ${pos.speed * 1.3}s ease-in-out ${pos.delay + 1}s infinite`,
              }}
            >
              <Image
                src={char.src}
                alt={char.label}
                width={pos.size}
                height={pos.size}
                className="object-contain"
                unoptimized
                draggable={false}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
