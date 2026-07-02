export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Deep radial base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% -5%, #0A1628 0%, #060A18 45%, #030712 100%)",
        }}
      />

      {/* Faint grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.032) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.032) 1px, transparent 1px)
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
          opacity: 0.075,
          filter: "blur(130px)",
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
          opacity: 0.085,
          filter: "blur(150px)",
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
          opacity: 0.045,
          filter: "blur(110px)",
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
          opacity: 0.04,
          filter: "blur(100px)",
          animation: "float4 40s ease-in-out infinite",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 110% 110% at 50% 50%, transparent 35%, rgba(3,7,18,0.65) 100%)",
        }}
      />
    </div>
  );
}
