"use client";

import { useEffect, useRef } from "react";

export default function TaoistFlowBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Config
    const GOLD = "255, 215, 0"; // Gold
    const STAR_COLOR = "246, 211, 139";
    
    // Constellation Data: Big Dipper (Beidou) normalized coords
    // Points: Dubhe, Merak, Phecda, Megrez, Alioth, Mizar, Alkaid
    const BEIDOU_POINTS = [
      { x: 0.75, y: 0.25 }, // Tianshu (Dubhe)
      { x: 0.65, y: 0.28 }, // Tianxuan (Merak)
      { x: 0.62, y: 0.38 }, // Tianji (Phecda)
      { x: 0.52, y: 0.35 }, // Tianquan (Megrez)
      { x: 0.42, y: 0.45 }, // Yuheng (Alioth)
      { x: 0.35, y: 0.55 }, // Kaiyang (Mizar)
      { x: 0.20, y: 0.65 }, // Yaoguang (Alkaid)
    ];

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      targetX: number | null;
      targetY: number | null;
      mode: "wandering" | "forming_star" | "tracing_rune";
      radius: number;
      alpha: number;
      history: {x: number, y: number}[];

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.targetX = null;
        this.targetY = null;
        this.mode = "wandering";
        this.radius = Math.random() * 1.5 + 0.5;
        this.alpha = Math.random() * 0.5 + 0.2;
        this.history = [];
      }

      update(t: number) {
        if (this.mode === "wandering") {
          // Flow field movement
          const angle = Math.sin(this.x * 0.001 + t * 0.001) + Math.cos(this.y * 0.001);
          this.vx += Math.cos(angle) * 0.01;
          this.vy += Math.sin(angle) * 0.01;
          this.vx *= 0.98;
          this.vy *= 0.98;
          this.x += this.vx;
          this.y += this.vy;
        } else if (this.mode === "forming_star" && this.targetX !== null && this.targetY !== null) {
          // Move to target
          const dx = this.targetX - this.x;
          const dy = this.targetY - this.y;
          this.x += dx * 0.05; // Ease in
          this.y += dy * 0.05;
          
          // Jitter
          this.x += (Math.random() - 0.5) * 0.5;
          this.y += (Math.random() - 0.5) * 0.5;
        } else if (this.mode === "tracing_rune" && this.targetX !== null && this.targetY !== null) {
           // Direct trace
           const dx = this.targetX - this.x;
           const dy = this.targetY - this.y;
           this.x += dx * 0.1;
           this.y += dy * 0.1;
        }

        // Trail history
        this.history.push({ x: this.x, y: this.y });
        if (this.history.length > 20) this.history.shift();

        // Wrap around (only wandering)
        if (this.mode === "wandering") {
           if (this.x < 0) this.x = width;
           if (this.x > width) this.x = 0;
           if (this.y < 0) this.y = height;
           if (this.y > height) this.y = 0;
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
         const color = this.mode === "forming_star" ? STAR_COLOR : GOLD;
         
         // Draw Trail
         if (this.history.length > 2) {
            ctx.beginPath();
            ctx.moveTo(this.history[0].x, this.history[0].y);
            for (let i = 1; i < this.history.length; i++) {
               ctx.lineTo(this.history[i].x, this.history[i].y);
            }
            ctx.strokeStyle = `rgba(${color}, ${this.alpha * 0.5})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
         }

         // Draw Head
         ctx.fillStyle = `rgba(${color}, ${this.alpha})`;
         ctx.beginPath();
         ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
         ctx.fill();

         // Glow
         if (this.mode === "forming_star") {
            ctx.shadowBlur = 10;
            ctx.shadowColor = `rgba(${color}, 0.8)`;
         } else {
            ctx.shadowBlur = 0;
         }
      }
    }

    const particles: Particle[] = [];
    for (let i = 0; i < 100; i++) particles.push(new Particle());

    // Rune Tracer Logic
    let runePhase = 0;
    let runeTarget: { x: number, y: number }[] = [];
    
    // Generate a complex curve (Lissajous / Rose curve)
    function generateRunePath(cx: number, cy: number, scale: number) {
       const path = [];
       const steps = 200;
       // Rose curve: r = cos(k * theta)
       const k = 4; // 4 petals
       for (let i = 0; i <= steps; i++) {
          const theta = (i / steps) * Math.PI * 2;
          const r = Math.cos(k * theta) * scale;
          path.push({
             x: cx + r * Math.cos(theta),
             y: cy + r * Math.sin(theta)
          });
       }
       return path;
    }

    // State Machine
    let globalState: "chaos" | "constellation" | "rune" = "chaos";
    let stateTimer = 0;

    const animate = () => {
      stateTimer++;
      const t = Date.now();

      // State Transitions
      if (globalState === "chaos" && stateTimer > 300) {
         // Switch to Constellation
         globalState = "constellation";
         stateTimer = 0;
         
         // Assign particles to Beidou stars
         // We have 7 stars, distribute particles
         particles.forEach((p, i) => {
            if (i < 30) {
               p.mode = "forming_star";
               const starIdx = i % BEIDOU_POINTS.length;
               const star = BEIDOU_POINTS[starIdx];
               // Scale to screen
               // Keep aspect ratio roughly or just map to right side
               const scale = Math.min(width, height);
               p.targetX = star.x * width;
               p.targetY = star.y * height;
               p.alpha = 1;
            } else {
               p.mode = "wandering";
            }
         });
      } else if (globalState === "constellation" && stateTimer > 400) {
         // Switch to Rune
         globalState = "rune";
         stateTimer = 0;
         
         // Generate a rune path in center
         runeTarget = generateRunePath(width / 2, height / 2, Math.min(width, height) * 0.3);
         
         particles.forEach((p, i) => {
            p.mode = "wandering"; // Default
            if (i < runeTarget.length && i < 80) { // Use particles to trace path
               // Actually, let's make particles FOLLOW the path
               // But for simplicity, let's just arrange them into the shape
            }
         });
      } else if (globalState === "rune" && stateTimer > 400) {
         globalState = "chaos";
         stateTimer = 0;
         particles.forEach(p => p.mode = "wandering");
      }

      // Special Drawing for Rune Mode: Use a "Pen" instead of just particles
      // Or make particles trace it.
      
      ctx.clearRect(0, 0, width, height);

      // Draw Constellation Lines if formed
      if (globalState === "constellation" && stateTimer > 100) {
         ctx.beginPath();
         // Connect stars 0->1->2->3->4->5->6
         const scale = Math.min(width, height); // Need consistent scale matching particles?
         // Actually particles are moving to `star.x * width`, `star.y * height`.
         // Let's use those coords.
         ctx.moveTo(BEIDOU_POINTS[0].x * width, BEIDOU_POINTS[0].y * height);
         for(let i=1; i<BEIDOU_POINTS.length; i++) {
            ctx.lineTo(BEIDOU_POINTS[i].x * width, BEIDOU_POINTS[i].y * height);
         }
         ctx.strokeStyle = `rgba(${STAR_COLOR}, ${Math.min((stateTimer-100)*0.01, 0.4)})`;
         ctx.lineWidth = 1;
         ctx.stroke();
      }

      // Draw Rune Lines if active
      if (globalState === "rune") {
         runePhase += 0.02; // progress
         ctx.beginPath();
         const drawLimit = Math.min(runeTarget.length, Math.floor(runePhase * 50));
         if (runeTarget.length > 0) {
            ctx.moveTo(runeTarget[0].x, runeTarget[0].y);
            for(let i=1; i<drawLimit; i++) {
               ctx.lineTo(runeTarget[i].x, runeTarget[i].y);
            }
         }
         ctx.strokeStyle = `rgba(${GOLD}, 0.8)`;
         ctx.lineWidth = 1.5;
         ctx.shadowBlur = 8;
         ctx.shadowColor = `rgba(${GOLD}, 0.8)`;
         ctx.stroke();
         ctx.shadowBlur = 0;
      }

      particles.forEach(p => {
         p.update(t);
         p.draw(ctx);
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10"
    />
  );
}
