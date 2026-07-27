"use client";

import { useEffect, useRef } from "react";

interface FloatingLinesProps {
  linesGradient?: string[];
  animationSpeed?: number;
  interactive?: boolean;
  bendRadius?: number;
  bendStrength?: number;
  mouseDamping?: number;
  parallax?: boolean;
  parallaxStrength?: number;
  className?: string;
}

const FloatingLines = ({
  linesGradient = ["#E945F5", "#2F4BC0", "#E945F5", "#0cf600"],
  animationSpeed = 1,
  interactive = false,
  bendRadius = 5,
  bendStrength = -0.5,
  mouseDamping = 0.05,
  parallax = true,
  parallaxStrength = 0.2,
  className = "",
}: FloatingLinesProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const lines = linesGradient.map((color, i) => ({
      color,
      offset: i * 0.25,
      speed: 0.3 + i * 0.1,
      amplitude: 30 + i * 20,
    }));

    let time = 0;

    const animate = () => {
      time += 0.016 * animationSpeed;
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      lines.forEach((line) => {
        ctx.beginPath();
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;

        const centerY = canvas.offsetHeight / 2 + line.offset * 100;

        for (let x = 0; x < canvas.offsetWidth; x += 2) {
          const normalizedX = x / canvas.offsetWidth;
          const wave = Math.sin(normalizedX * 4 + time * line.speed + line.offset) * line.amplitude;
          const parallaxOffset = parallax ? (mouseRef.current.x / canvas.offsetWidth - 0.5) * parallaxStrength * 50 : 0;

          if (x === 0) {
            ctx.moveTo(x, centerY + wave + parallaxOffset);
          } else {
            ctx.lineTo(x, centerY + wave + parallaxOffset);
          }
        }

        ctx.stroke();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    if (interactive) {
      canvas.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (interactive) {
        canvas.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [linesGradient, animationSpeed, interactive, bendRadius, bendStrength, mouseDamping, parallax, parallaxStrength]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default FloatingLines;
