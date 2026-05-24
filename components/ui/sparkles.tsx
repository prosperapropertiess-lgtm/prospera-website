"use client";

// Sparkles component — lightweight canvas implementation (no @tsparticles dependency)
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface SparklesProps {
  className?: string;
  density?: number;
  speed?: number;
  color?: string;
  direction?: string;
  size?: number;
  opacity?: number;
  [key: string]: unknown;
}

export function Sparkles({
  className,
  density = 800,
  speed = 1,
  color = "#FFFFFF",
  size = 1,
  opacity = 1,
}: SparklesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const count = Math.floor(density / 10);
    const particles: { x: number; y: number; a: number; da: number; r: number }[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        a: Math.random(),
        da: (Math.random() * 0.02 + 0.005) * speed,
        r: Math.random() * size + 0.5,
      });
    }

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.a += p.da;
        if (p.a > 1 || p.a < 0) p.da *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = p.a * opacity;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [color, density, opacity, size, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 w-full h-full", className)}
    />
  );
}
