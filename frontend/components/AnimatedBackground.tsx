export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
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
