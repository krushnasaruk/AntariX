import React, { useRef, useEffect } from 'react';

const WAYPOINTS = [
  { x: 100, y: 150, label: 'ALPHA', status: 'done' },
  { x: 280, y: 320, label: 'BRAVO', status: 'done' },
  { x: 450, y: 580, label: 'CHARLIE', status: 'active' },
  { x: 800, y: 720, label: 'DELTA', status: 'pending' }
];

const HAZARDS = [
  { x: 200, y: 260, r: 30, type: 'crater' },
  { x: 520, y: 450, r: 22, type: 'boulder' },
  { x: 680, y: 600, r: 35, type: 'sand' },
  { x: 350, y: 180, r: 18, type: 'boulder' }
];

export function RadarCanvas({ position = { x: 284, y: 322, heading: 42 }, width = 480, height = 360 }) {
  const canvasRef = useRef(null);
  const sweepAngleRef = useRef(0);
  const trailRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Track breadcrumbs
    if (trailRef.current.length === 0 || trailRef.current[trailRef.current.length - 1].x !== position.x) {
      trailRef.current.push({ x: position.x, y: position.y });
      if (trailRef.current.length > 50) trailRef.current.shift();
    }

    let animId;

    const render = () => {
      const cx = width / 2;
      const cy = height / 2;

      // Clear
      ctx.clearRect(0, 0, width, height);

      // Background
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(cx, cy));
      bgGrad.addColorStop(0, '#0a1020');
      bgGrad.addColorStop(1, '#050810');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = 'rgba(56, 97, 140, 0.08)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < width; i += 30) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
      }
      for (let i = 0; i < height; i += 30) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
      }

      // Radar range circles
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.10)';
      ctx.lineWidth = 1;
      for (let r = 50; r <= 200; r += 50) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Crosshairs
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.08)';
      ctx.beginPath();
      ctx.moveTo(cx, 0); ctx.lineTo(cx, height);
      ctx.moveTo(0, cy); ctx.lineTo(width, cy);
      ctx.stroke();

      // Sweep beam
      sweepAngleRef.current = (sweepAngleRef.current + 0.012) % (Math.PI * 2);
      const sweepGrad = ctx.createConicalGradient
        ? null // not supported in all browsers
        : null;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(sweepAngleRef.current);
      const grad = ctx.createLinearGradient(0, 0, 160, 0);
      grad.addColorStop(0, 'rgba(34, 211, 238, 0.20)');
      grad.addColorStop(1, 'rgba(34, 211, 238, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 160, -0.15, 0.15);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Terrain elevation gradient (subtle)
      ctx.fillStyle = 'rgba(251, 146, 60, 0.03)';
      ctx.beginPath();
      ctx.ellipse(cx + 60, cy + 40, 120, 80, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Hazards
      HAZARDS.forEach(h => {
        const sx = (h.x / 1000) * width;
        const sy = (h.y / 1000) * height;
        ctx.fillStyle = h.type === 'crater' ? 'rgba(239, 68, 68, 0.12)' : h.type === 'sand' ? 'rgba(245, 158, 11, 0.10)' : 'rgba(168, 85, 247, 0.10)';
        ctx.strokeStyle = h.type === 'crater' ? 'rgba(239, 68, 68, 0.40)' : h.type === 'sand' ? 'rgba(245, 158, 11, 0.35)' : 'rgba(168, 85, 247, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(sx, sy, h.r * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Label
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.font = '7px "Space Mono"';
        ctx.textAlign = 'center';
        ctx.fillText(h.type.toUpperCase(), sx, sy + h.r * 0.6 + 10);
      });

      // Waypoint connections (path line)
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      WAYPOINTS.forEach((wp, i) => {
        const wx = (wp.x / 1000) * width;
        const wy = (wp.y / 1000) * height;
        if (i === 0) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      // Waypoints
      WAYPOINTS.forEach(wp => {
        const wx = (wp.x / 1000) * width;
        const wy = (wp.y / 1000) * height;
        const color = wp.status === 'done' ? 'rgba(52, 211, 153, 0.8)' : wp.status === 'active' ? 'rgba(34, 211, 238, 0.9)' : 'rgba(100, 116, 139, 0.5)';

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(wx, wy, 4, 0, Math.PI * 2);
        ctx.fill();

        if (wp.status === 'active') {
          ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(wx, wy, 8, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = 'rgba(255,255,255,0.40)';
        ctx.font = '8px "Orbitron"';
        ctx.textAlign = 'center';
        ctx.fillText(wp.label, wx, wy - 10);
      });

      // Breadcrumb trail
      trailRef.current.forEach((pt, i) => {
        const tx = (pt.x / 1000) * width;
        const ty = (pt.y / 1000) * height;
        ctx.fillStyle = `rgba(34, 211, 238, ${0.05 + (i / trailRef.current.length) * 0.2})`;
        ctx.beginPath();
        ctx.arc(tx, ty, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Rover position
      const rx = (position.x / 1000) * width;
      const ry = (position.y / 1000) * height;

      // Glow
      const rGlow = ctx.createRadialGradient(rx, ry, 0, rx, ry, 20);
      rGlow.addColorStop(0, 'rgba(34, 211, 238, 0.25)');
      rGlow.addColorStop(1, 'rgba(34, 211, 238, 0)');
      ctx.fillStyle = rGlow;
      ctx.beginPath();
      ctx.arc(rx, ry, 20, 0, Math.PI * 2);
      ctx.fill();

      // Rover dot
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.arc(rx, ry, 5, 0, Math.PI * 2);
      ctx.fill();

      // Heading arrow
      const rad = ((position.heading || 42) - 90) * (Math.PI / 180);
      const hx = rx + Math.cos(rad) * 18;
      const hy = ry + Math.sin(rad) * 18;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(hx, hy);
      ctx.stroke();

      // Corner labels
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.font = '7px "Space Mono"';
      ctx.textAlign = 'left';
      ctx.fillText('N', cx - 3, 14);
      ctx.fillText('S', cx - 3, height - 8);
      ctx.textAlign = 'left';
      ctx.fillText('W', 6, cy + 3);
      ctx.textAlign = 'right';
      ctx.fillText('E', width - 6, cy + 3);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [position, width, height]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{
          width, height,
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-cyan)',
          boxShadow: 'var(--shadow-glow-cyan)',
        }}
      />
      <div style={{
        marginTop: 'var(--space-2)',
        fontFamily: 'var(--font-hud)',
        fontSize: '0.5625rem',
        color: 'var(--text-muted)',
        letterSpacing: '0.08em'
      }}>
        TACTICAL TERRAIN RADAR • JEZERO CRATER-07 ELEVATION OVERLAY
      </div>
    </div>
  );
}
