"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

const CHARACTERS = [
  { src: "/characters/char-1.png", w: 260, h: 359 },
  { src: "/characters/char-2.png", w: 268, h: 336 },
  { src: "/characters/char-3.png", w: 261, h: 313 },
  { src: "/characters/char-4.png", w: 171, h: 317 },
  { src: "/characters/char-5.png", w: 337, h: 363 },
  { src: "/characters/char-6.png", w: 347, h: 308 },
  { src: "/characters/char-7.png", w: 317, h: 336 },
  { src: "/characters/char-8.png", w: 257, h: 317 },
  { src: "/characters/char-9.png", w: 312, h: 324 },
];

// Positions around the edges, leaving center clear for text
const POSITIONS = [
  // Top-left
  { top: "3%",   left: "2%",  scale: 0.7,  delay: 0,   speed: 16, opacity: 0.85 },
  // Top-right
  { top: "5%",   left: "80%", scale: 0.9,  delay: 1.2, speed: 20, opacity: 0.9  },
  // Right upper
  { top: "25%",  left: "85%", scale: 0.65, delay: 2.5, speed: 14, opacity: 0.75 },
  // Left middle
  { top: "40%",  left: "1%",  scale: 0.75, delay: 0.5, speed: 18, opacity: 0.8  },
  // Right middle
  { top: "50%",  left: "82%", scale: 0.85, delay: 3,   speed: 22, opacity: 0.85 },
  // Bottom-left
  { top: "68%",  left: "5%",  scale: 0.6,  delay: 1.8, speed: 15, opacity: 0.7  },
  // Bottom-right
  { top: "70%",  left: "78%", scale: 0.7,  delay: 4,   speed: 17, opacity: 0.8  },
  // Top center (subtle, behind text)
  { top: "1%",   left: "45%", scale: 0.5,  delay: 3.5, speed: 13, opacity: 0.45 },
  // Bottom center
  { top: "78%",  left: "40%", scale: 0.55, delay: 2,   speed: 19, opacity: 0.5  },
];

export default function FloatingCharacters() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!mounted) return null;

  const mobileScale = 0.4; // 40% size on mobile

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      <style>{`
        @keyframes char-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-18px) rotate(3deg); }
          50% { transform: translateY(-6px) rotate(-2deg); }
          75% { transform: translateY(-22px) rotate(2deg); }
        }
        @keyframes char-drift {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(12px); }
        }
        @keyframes char-appear {
          from { opacity: 0; transform: scale(0.5) translateY(30px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {CHARACTERS.map((char, i) => {
        const pos = POSITIONS[i];
        const finalScale = isMobile ? pos.scale * mobileScale : pos.scale;
        const displayW = Math.round(char.w * finalScale);
        const displayH = Math.round(char.h * finalScale);

        return (
          <div
            key={i}
            className="absolute"
            style={{
              top: pos.top,
              left: pos.left,
              width: displayW,
              height: displayH,
              opacity: pos.opacity,
              animation: `char-appear 0.8s ease ${pos.delay + 0.3}s both`,
            }}
          >
            <div
              style={{
                animation: `char-float ${pos.speed}s ease-in-out ${pos.delay}s infinite`,
              }}
            >
              <div
                style={{
                  animation: `char-drift ${pos.speed * 1.4}s ease-in-out ${pos.delay + 1}s infinite`,
                }}
              >
                <Image
                  src={char.src}
                  alt=""
                  width={displayW}
                  height={displayH}
                  className="object-contain drop-shadow-2xl"
                  unoptimized
                  draggable={false}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
