const PACKETS = [
  { top: "12%", left: "8%", dx: "90px", dy: "-60px", size: 3, duration: "16s", delay: "0s", color: "#FFD208", opacity: 0.5 },
  { top: "22%", left: "68%", dx: "-70px", dy: "80px", size: 2, duration: "20s", delay: "2s", color: "#60A5FA", opacity: 0.4 },
  { top: "58%", left: "18%", dx: "60px", dy: "70px", size: 3, duration: "18s", delay: "4s", color: "#60A5FA", opacity: 0.45 },
  { top: "72%", left: "78%", dx: "-80px", dy: "-50px", size: 2, duration: "22s", delay: "1s", color: "#FFD208", opacity: 0.4 },
  { top: "38%", left: "42%", dx: "50px", dy: "-90px", size: 2, duration: "24s", delay: "6s", color: "#2F6BFF", opacity: 0.35 },
  { top: "85%", left: "48%", dx: "-60px", dy: "-70px", size: 3, duration: "19s", delay: "3s", color: "#FFD208", opacity: 0.45 },
  { top: "8%", left: "82%", dx: "-50px", dy: "90px", size: 2, duration: "21s", delay: "8s", color: "#60A5FA", opacity: 0.4 },
  { top: "50%", left: "6%", dx: "80px", dy: "40px", size: 2, duration: "17s", delay: "5s", color: "#FFD208", opacity: 0.35 },
];

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Encrypted data packets — slow drifting particles */}
      {PACKETS.map((p, i) => {
        const style = {
          top: p.top,
          left: p.left,
          width: p.size,
          height: p.size,
          background: p.color,
          boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          animation: `drift-packet ${p.duration} ease-in-out ${p.delay} infinite`,
          "--packet-dx": p.dx,
          "--packet-dy": p.dy,
          "--packet-opacity": p.opacity,
        } as React.CSSProperties;

        return <div key={i} className="absolute rounded-full" style={style} />;
      })}

      {/* Deep radial base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% -5%, #01080F 0%, #010205 45%, #010204 100%)",
        }}
      />

      {/* Faint grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
        }}
      />

      {/* Yellow glow orb — top right */}
      <div
        className="absolute rounded-full"
        style={{
          top: "-14rem",
          right: "-10rem",
          width: "56rem",
          height: "56rem",
          background: "#FFD208",
          opacity: 0.038,
          filter: "blur(140px)",
          animation: "float1 22s ease-in-out infinite",
        }}
      />

      {/* Primary blue orb — bottom left */}
      <div
        className="absolute rounded-full"
        style={{
          bottom: "-16rem",
          left: "-10rem",
          width: "64rem",
          height: "64rem",
          background: "#2F6BFF",
          opacity: 0.048,
          filter: "blur(160px)",
          animation: "float2 28s ease-in-out infinite",
        }}
      />

      {/* Secondary blue orb — center right */}
      <div
        className="absolute rounded-full"
        style={{
          top: "30%",
          right: "15%",
          width: "38rem",
          height: "38rem",
          background: "#60A5FA",
          opacity: 0.022,
          filter: "blur(120px)",
          animation: "float3 34s ease-in-out infinite",
        }}
      />

      {/* Small yellow orb — bottom right accent */}
      <div
        className="absolute rounded-full"
        style={{
          bottom: "5%",
          right: "-4rem",
          width: "28rem",
          height: "28rem",
          background: "#FFD208",
          opacity: 0.016,
          filter: "blur(110px)",
          animation: "float4 40s ease-in-out infinite",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 110% 110% at 50% 50%, transparent 28%, rgba(1,3,7,0.88) 100%)",
        }}
      />
    </div>
  );
}
