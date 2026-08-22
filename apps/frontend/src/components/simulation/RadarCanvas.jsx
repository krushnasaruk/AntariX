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

// Strict CSS color hexes to use inside canvas
const COLOR_BG = '#0B0D10';
const COLOR_INK = '#334155';
const COLOR_INK_LIGHT = '#475569';
const COLOR_NOMINAL = '#22C55E';
const COLOR_CAUTION = '#F59E0B';
const COLOR_CRITICAL = '#EF4444';

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

      // Solid Background
      ctx.fillStyle = COLOR_BG;
      ctx.fillRect(0, 0, width, height);

      // Strict Grid lines
      ctx.strokeStyle = COLOR_INK;
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
      }
      for (let i = 0; i < height; i += 40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
      }

      // Radar range circles (Hairline)
      ctx.strokeStyle = COLOR_INK;
      ctx.lineWidth = 1;
      for (let r = 50; r <= 200; r += 50) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Crosshairs (Center)
      ctx.strokeStyle = COLOR_INK_LIGHT;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 10); ctx.lineTo(cx, cy + 10);
      ctx.moveTo(cx - 10, cy); ctx.lineTo(cx + 10, cy);
      ctx.stroke();

      // Scanline (Sharp edge, trailing fade)
      sweepAngleRef.current = (sweepAngleRef.current + 0.02) % (Math.PI * 2);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(sweepAngleRef.current);
      ctx.fillStyle = 'rgba(71, 85, 105, 0.15)'; // Muted trailing fade
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, Math.max(width, height), -0.2, 0);
      ctx.closePath();
      ctx.fill();
      // Leading edge
      ctx.strokeStyle = COLOR_INK_LIGHT;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.max(width, height), 0);
      ctx.stroke();
      ctx.restore();

      // Hazards (Strict wireframe)
      HAZARDS.forEach(h => {
        const sx = (h.x / 1000) * width;
        const sy = (h.y / 1000) * height;
        const color = h.type === 'crater' ? COLOR_CRITICAL : COLOR_CAUTION;
        
        // Hazard boundaries
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.arc(sx, sy, h.r * 0.6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label
        ctx.fillStyle = color;
        ctx.font = '9px "Space Mono"';
        ctx.textAlign = 'center';
        ctx.fillText(`[${h.type.substring(0,3).toUpperCase()}]`, sx, sy + h.r * 0.6 + 12);
      });

      // Waypoint connections (path line)
      ctx.strokeStyle = COLOR_INK_LIGHT;
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

      // Waypoints (Sharp geometry)
      WAYPOINTS.forEach(wp => {
        const wx = (wp.x / 1000) * width;
        const wy = (wp.y / 1000) * height;
        const color = wp.status === 'done' ? COLOR_INK_LIGHT : wp.status === 'active' ? COLOR_NOMINAL : COLOR_INK;

        ctx.fillStyle = COLOR_BG;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(wx - 3, wy - 3, 6, 6);
        ctx.fill();
        ctx.stroke();

        if (wp.status === 'active') {
          ctx.beginPath();
          ctx.rect(wx - 6, wy - 6, 12, 12);
          ctx.stroke();
        }

        ctx.fillStyle = color;
        ctx.font = '9px "Space Mono"';
        ctx.textAlign = 'center';
        ctx.fillText(wp.label, wx, wy - 10);
      });

      // Breadcrumb trail
      trailRef.current.forEach((pt, i) => {
        const tx = (pt.x / 1000) * width;
        const ty = (pt.y / 1000) * height;
        ctx.fillStyle = COLOR_INK_LIGHT;
        ctx.beginPath();
        ctx.rect(tx - 1, ty - 1, 2, 2);
        ctx.fill();
      });

      // Rover position
      const rx = (position.x / 1000) * width;
      const ry = (position.y / 1000) * height;

      // Rover marker (Triangle)
      const rad = ((position.heading || 42) - 90) * (Math.PI / 180);
      ctx.save();
      ctx.translate(rx, ry);
      ctx.rotate(rad);
      ctx.strokeStyle = COLOR_NOMINAL;
      ctx.fillStyle = COLOR_BG;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(4, 4);
      ctx.lineTo(-4, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Heading vector line
      const hx = rx + Math.cos(rad) * 20;
      const hy = ry + Math.sin(rad) * 20;
      ctx.strokeStyle = COLOR_NOMINAL;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(hx, hy);
      ctx.stroke();

      // Corner labels
      ctx.fillStyle = COLOR_INK_LIGHT;
      ctx.font = '10px "Space Mono"';
      ctx.textAlign = 'left';
      ctx.fillText('N', cx + 4, 14);
      ctx.fillText('S', cx + 4, height - 6);
      ctx.textAlign = 'left';
      ctx.fillText('W', 6, cy - 4);
      ctx.textAlign = 'right';
      ctx.fillText('E', width - 6, cy - 4);

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
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--structure-ink)'
        }}
      />
      <div style={{
        marginTop: '8px',
        fontFamily: 'var(--font-main)',
        fontSize: '0.65rem',
        fontWeight: 600,
        color: '#94A3B8',
        letterSpacing: '0.1em'
      }}>
        TACTICAL TERRAIN RADAR • JEZERO CRATER-07 ELEVATION OVERLAY
      </div>
    </div>
  );
}
