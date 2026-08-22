import React, { useRef, useEffect } from 'react';

export function MarsVisualization() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    let t = 0;

    const render = () => {
      t += 0.005;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      // Deep space gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, 'rgba(2, 4, 10, 0)');
      bgGrad.addColorStop(0.5, 'rgba(4, 8, 22, 0.4)');
      bgGrad.addColorStop(1, 'rgba(6, 13, 34, 0.9)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Planetary Horizon Arc Center
      const arcCenterX = w * 0.5;
      const arcCenterY = h * 1.85;
      const arcRadius = h * 1.45;

      // Atmospheric Rim Glow (electric blue / icy cyan)
      const glowGrad = ctx.createRadialGradient(arcCenterX, h * 0.42, 0, arcCenterX, h * 0.42, w * 0.55);
      glowGrad.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
      glowGrad.addColorStop(0.35, 'rgba(14, 165, 233, 0.08)');
      glowGrad.addColorStop(0.7, 'rgba(99, 102, 241, 0.03)');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, w, h);

      // Mars Horizon Arc line
      ctx.save();
      ctx.beginPath();
      ctx.arc(arcCenterX, arcCenterY, arcRadius, Math.PI * 1.22, Math.PI * 1.78);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 18;
      ctx.stroke();

      // Atmospheric outer aura
      ctx.beginPath();
      ctx.arc(arcCenterX, arcCenterY, arcRadius + 4, Math.PI * 1.22, Math.PI * 1.78);
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.25)';
      ctx.lineWidth = 6;
      ctx.shadowBlur = 30;
      ctx.stroke();
      ctx.restore();

      // Terrain Contours below horizon
      ctx.strokeStyle = 'rgba(56, 97, 140, 0.12)';
      ctx.lineWidth = 0.8;
      for (let offset = 20; offset <= 90; offset += 22) {
        ctx.beginPath();
        ctx.arc(arcCenterX, arcCenterY + offset, arcRadius - offset * 0.5, Math.PI * 1.25, Math.PI * 1.75);
        ctx.stroke();
      }

      // Subtle longitude / orbital grid lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 0.5;
      for (let angle = -0.4; angle <= 0.4; angle += 0.15) {
        const theta = Math.PI * 1.5 + angle;
        const x1 = arcCenterX + Math.cos(theta) * (arcRadius - 100);
        const y1 = arcCenterY + Math.sin(theta) * (arcRadius - 100);
        const x2 = arcCenterX + Math.cos(theta) * (arcRadius + 60);
        const y2 = arcCenterY + Math.sin(theta) * (arcRadius + 60);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Earth -> Mars Light Speed Communication Trajectory Line
      const earthX = w * 0.12;
      const earthY = h * 0.18;
      const marsRoverX = w * 0.68;
      const marsRoverY = h * 0.48;

      // Trajectory curve
      ctx.beginPath();
      ctx.moveTo(earthX, earthY);
      ctx.quadraticCurveTo(w * 0.4, h * 0.05, marsRoverX, marsRoverY);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // In-flight Packet traveling on trajectory
      const packetProgress = (t * 0.3) % 1;
      // Quadratic bezier point
      const qx = (1 - packetProgress) * (1 - packetProgress) * earthX + 2 * (1 - packetProgress) * packetProgress * (w * 0.4) + packetProgress * packetProgress * marsRoverX;
      const qy = (1 - packetProgress) * (1 - packetProgress) * earthY + 2 * (1 - packetProgress) * packetProgress * (h * 0.05) + packetProgress * packetProgress * marsRoverY;

      ctx.beginPath();
      ctx.arc(qx, qy, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Earth Origin Marker
      ctx.beginPath();
      ctx.arc(earthX, earthY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#60a5fa';
      ctx.fill();
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.4)';
      ctx.arc(earthX, earthY, 8, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px "Space Mono", monospace';
      ctx.fillText('EARTH GROUND DSN', earthX + 12, earthY + 3);

      // Mars Rover Position Marker & Silhouette
      ctx.beginPath();
      ctx.arc(marsRoverX, marsRoverY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#fb923c';
      ctx.shadowColor = '#fb923c';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Tiny Rover Target Ring
      ctx.strokeStyle = 'rgba(251, 146, 60, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(marsRoverX, marsRoverY, 12, 0, Math.PI * 2);
      ctx.stroke();

      // Heading Vector from rover
      const headingAngle = Math.PI * 1.7;
      ctx.beginPath();
      ctx.moveTo(marsRoverX, marsRoverY);
      ctx.lineTo(marsRoverX + Math.cos(headingAngle) * 16, marsRoverY + Math.sin(headingAngle) * 16);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Technical HUD Coordinate Markers
      ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.font = '9px "Space Mono", monospace';
      ctx.fillText('JEZERO SECTOR-07 (18.38°N, 77.58°E)', marsRoverX + 16, marsRoverY - 8);
      ctx.fillStyle = '#64748b';
      ctx.font = '8px "Space Mono", monospace';
      ctx.fillText('LATENCY: 12.51 MIN (NOMINAL) • DTN STORE-AND-FORWARD ACTIVE', marsRoverX + 16, marsRoverY + 5);

      // Ambient Floating Telemetry Floating Badges
      const renderHudChip = (x, y, label, val, color) => {
        ctx.fillStyle = 'rgba(6, 12, 28, 0.75)';
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x, y, 130, 36, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = '7px "Space Grotesk", sans-serif';
        ctx.fillText(label.toUpperCase(), x + 10, y + 14);

        ctx.fillStyle = color;
        ctx.font = 'bold 11px "Space Mono", monospace';
        ctx.fillText(val, x + 10, y + 28);
      };

      renderHudChip(w * 0.18, h * 0.58, 'Planetary Distance', '225,000,000 KM', '#38bdf8');
      renderHudChip(w * 0.78, h * 0.28, 'Autonomy Gatekeeper', 'OBJECTIVE 05 PASS', '#34d399');

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: 480,
      marginTop: 20,
      overflow: 'hidden',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid rgba(56, 189, 248, 0.15)',
      background: 'radial-gradient(ellipse at 50% 100%, rgba(6, 18, 48, 0.6) 0%, rgba(2, 4, 10, 0.95) 75%)'
    }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
