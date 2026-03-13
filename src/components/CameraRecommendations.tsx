// CameraRecommendations component
// Displays a curated list of industrial cameras suitable for capturing
// still images of handwritten addresses for OCR processing.
//
// Selection criteria used:
//  • Resolution  ≥ 5 MP (to resolve individual handwritten characters clearly)
//  • Interface   GigE Vision or USB3 Vision (standard industrial interfaces)
//  • Global shutter preferred (eliminates motion artefacts on conveyor belts)
//  • Monochrome or colour support (monochrome reduces bandwidth & aids binarisation)

import React, { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CameraSpec {
  id: string;
  brand: string;
  model: string;
  resolution: string;   // e.g. "12 MP"
  sensor: string;       // e.g. "1/1.7\" Sony IMX304"
  shutter: "Global" | "Rolling";
  interfaces: string[]; // e.g. ["GigE", "USB3"]
  frameRate: string;    // at full resolution
  priceRange: string;   // approximate USD range
  bestFor: string;      // short use-case note
  datasheet?: string;   // URL
}

const cameras: CameraSpec[] = [
  {
    id: "basler-a2a5320",
    brand: "Basler",
    model: "acA5320-23gc",
    resolution: "5 MP (2560×1920)",
    sensor: "1/2.5\" Sony IMX250",
    shutter: "Global",
    interfaces: ["GigE"],
    frameRate: "23 fps",
    priceRange: "$800–$1,100",
    bestFor: "General-purpose address capture on production lines",
    datasheet: "https://www.baslerweb.com",
  },
  {
    id: "flir-bfs-u3-51s5c",
    brand: "FLIR / Teledyne",
    model: "BFS-U3-51S5C",
    resolution: "5.1 MP (2448×2048)",
    sensor: "1/1.5\" Sony IMX250",
    shutter: "Global",
    interfaces: ["USB3"],
    frameRate: "35 fps",
    priceRange: "$700–$950",
    bestFor: "Compact installations, close-range captures",
    datasheet: "https://www.flir.com",
  },
  {
    id: "ids-ui-5260cp",
    brand: "IDS",
    model: "UI-5260CP-C-HQ",
    resolution: "5 MP (2592×1944)",
    sensor: "1/2.5\" Sony IMX264",
    shutter: "Global",
    interfaces: ["USB3"],
    frameRate: "29 fps",
    priceRange: "$750–$1,000",
    bestFor: "High-contrast handwriting on envelopes and parcels",
    datasheet: "https://www.ids-imaging.com",
  },
  {
    id: "cognex-in-sight-9902",
    brand: "Cognex",
    model: "In-Sight 9902L",
    resolution: "12 MP (4096×3000)",
    sensor: "1/1.7\" Sony IMX304",
    shutter: "Global",
    interfaces: ["GigE", "EtherNet/IP"],
    frameRate: "10 fps",
    priceRange: "$3,500–$5,500",
    bestFor: "Turnkey smart camera with built-in OCR deep-learning tools",
    datasheet: "https://www.cognex.com",
  },
  {
    id: "keyence-cv-x400",
    brand: "Keyence",
    model: "CV-X400",
    resolution: "21 MP (5104×4092)",
    sensor: "1\" Sony IMX183",
    shutter: "Global",
    interfaces: ["GigE"],
    frameRate: "8 fps",
    priceRange: "$4,000–$7,000",
    bestFor: "Very high-detail capture of faint or small handwritten text",
    datasheet: "https://www.keyence.com",
  },
  {
    id: "hikvision-mv-cs050",
    brand: "Hikvision Machine Vision",
    model: "MV-CS050-10GC",
    resolution: "5 MP (2448×2048)",
    sensor: "1/1.8\" Sony IMX264",
    shutter: "Global",
    interfaces: ["GigE"],
    frameRate: "10 fps",
    priceRange: "$300–$500",
    bestFor: "Budget-conscious deployments needing solid image quality",
    datasheet: "https://www.hikrobotics.com",
  },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

const shutterBadge = (shutter: CameraSpec["shutter"]) => (
  <span
    style={{
      padding: "0.15rem 0.5rem",
      borderRadius: 12,
      fontSize: "0.75rem",
      fontWeight: "bold",
      background: shutter === "Global" ? "#d4edda" : "#fff3cd",
      color: shutter === "Global" ? "#155724" : "#856404",
      marginLeft: "0.4rem",
    }}
  >
    {shutter} shutter
  </span>
);

// ─── Main component ───────────────────────────────────────────────────────────

const CameraRecommendations: React.FC = () => {
  const [filter, setFilter] = useState<"all" | "GigE" | "USB3">("all");

  const visible = cameras.filter(
    (c) => filter === "all" || c.interfaces.includes(filter)
  );

  return (
    <section
      aria-label="Industrial camera recommendations"
      style={{ maxWidth: 900, margin: "0 auto", fontFamily: "sans-serif" }}
    >
      <h2>📷 Industrial Camera Recommendations for Address OCR</h2>

      <p style={{ color: "#555", lineHeight: 1.6 }}>
        The cameras below are suitable for capturing <strong>still images</strong> of
        handwritten addresses in an industrial setting (conveyor belts, post-room
        scanners, logistics hubs). All have a <strong>global shutter</strong> (where
        noted) to eliminate motion blur, and ≥ 5 MP resolution to resolve individual
        handwritten characters.
      </p>

      {/* Filter bar */}
      <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}>
        {(["all", "GigE", "USB3"] as const).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setFilter(opt)}
            style={{
              padding: "0.35rem 0.9rem",
              borderRadius: 20,
              border: "1px solid #bbb",
              cursor: "pointer",
              fontWeight: filter === opt ? "bold" : "normal",
              background: filter === opt ? "#4a90e2" : "#f5f5f5",
              color: filter === opt ? "#fff" : "#333",
            }}
          >
            {opt === "all" ? "All interfaces" : opt}
          </button>
        ))}
      </div>

      {/* Camera cards */}
      <div style={{ display: "grid", gap: "1rem" }}>
        {visible.map((cam) => (
          <div
            key={cam.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: "1rem",
              background: "#fff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <h3 style={{ margin: "0 0 0.25rem" }}>
              {cam.brand} – {cam.model}
              {shutterBadge(cam.shutter)}
            </h3>
            <p style={{ margin: "0 0 0.5rem", color: "#444", fontSize: "0.9rem" }}>
              {cam.bestFor}
            </p>
            <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "0.85rem" }}>
              <tbody>
                {[
                  ["Resolution", cam.resolution],
                  ["Sensor", cam.sensor],
                  ["Interface(s)", cam.interfaces.join(", ")],
                  ["Frame rate", cam.frameRate],
                  ["Approx. price (USD)", cam.priceRange],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td
                      style={{
                        padding: "0.2rem 0.75rem 0.2rem 0",
                        color: "#888",
                        whiteSpace: "nowrap",
                        width: "40%",
                      }}
                    >
                      {label}
                    </td>
                    <td style={{ padding: "0.2rem 0", fontWeight: 500 }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {cam.datasheet && (
              <a
                href={cam.datasheet}
                target="_blank"
                rel="noreferrer noopener"
                style={{ fontSize: "0.8rem", color: "#4a90e2", marginTop: "0.5rem", display: "inline-block" }}
              >
                Manufacturer site ↗
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Setup guidance */}
      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          background: "#f0f4ff",
          borderRadius: 8,
          border: "1px solid #c5d0f0",
        }}
      >
        <h3 style={{ marginTop: 0 }}>⚙️ Camera Setup Tips for Handwriting OCR</h3>
        <ul style={{ paddingLeft: "1.25rem", lineHeight: 1.8, color: "#333", fontSize: "0.9rem" }}>
          <li>
            <strong>Lighting:</strong> Use diffuse, even illumination (LED ring light or
            telecentric back-light) to minimise shadows from pen strokes.
          </li>
          <li>
            <strong>Fixed focal distance:</strong> Mount the camera at a fixed height above
            the address surface; avoid zoom lenses that can introduce distortion.
          </li>
          <li>
            <strong>Trigger mode:</strong> Use hardware trigger on conveyor stop signal to
            guarantee the item is stationary when the image is taken (<em>not moving text</em>).
          </li>
          <li>
            <strong>Resolution target:</strong> Aim for at least 150 DPI of the
            address area (typically 100 × 60 mm) for reliable character recognition.
          </li>
          <li>
            <strong>Lens selection:</strong> Telecentric or low-distortion lenses are
            preferred for flat address labels; C-mount lenses work for most use cases.
          </li>
          <li>
            <strong>Software integration:</strong> Connect the camera via GigE Vision SDK
            (Basler Pylon, IDS SDK, FLIR Spinnaker) to feed captured frames directly
            into the addressOCRService.
          </li>
        </ul>
      </div>
    </section>
  );
};

export default CameraRecommendations;
