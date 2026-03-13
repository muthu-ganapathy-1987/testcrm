// AddressCaptureOCR component
// Allows users to upload or drag-and-drop a still image of a handwritten
// address.  The image is processed by the addressOCRService and the extracted
// address fields are displayed for review before saving to the CRM.

import React, { useCallback, useRef, useState } from "react";
import {
  extractAddressFromImage,
  type OCRConfig,
  type OCRResult,
} from "../services/addressOCRService";

// ─── Sub-components ───────────────────────────────────────────────────────────

interface DropZoneProps {
  onFile: (file: File) => void;
  disabled: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ onFile, disabled }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) onFile(file);
    },
    [disabled, onFile]
  );

  return (
    <div
      style={{
        border: `2px dashed ${dragging ? "#4a90e2" : "#aaa"}`,
        borderRadius: 8,
        padding: "2rem",
        textAlign: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        background: dragging ? "#e8f0fe" : "transparent",
        transition: "border-color 0.2s, background 0.2s",
      }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      aria-label="Drop zone: click or drag an address image here"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && !disabled && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/bmp,image/tiff"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          // Reset so the same file can be re-uploaded
          e.target.value = "";
        }}
        aria-hidden="true"
      />
      <p style={{ margin: 0, color: "#555" }}>
        📷 Click or drag a <strong>still image</strong> of a handwritten address here
      </p>
      <p style={{ margin: "0.5rem 0 0", fontSize: "0.8rem", color: "#888" }}>
        Accepted: JPEG · PNG · WEBP · BMP · TIFF
      </p>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

interface AddressCaptureOCRProps {
  /** Called with the extracted raw text when the user confirms the result. */
  onAddressConfirmed?: (rawText: string) => void;
  /** Override the default OCR config (e.g. to use a cloud engine). */
  ocrConfig?: OCRConfig;
}

const AddressCaptureOCR: React.FC<AddressCaptureOCRProps> = ({
  onAddressConfirmed,
  ocrConfig,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OCRResult | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setResult(null);

      // Show preview
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);

      setProcessing(true);
      try {
        const ocrResult = await extractAddressFromImage(
          file,
          ocrConfig ?? { engine: "tesseract", language: "eng" }
        );
        setResult(ocrResult);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setProcessing(false);
      }
    },
    [ocrConfig]
  );

  const handleConfirm = () => {
    if (result?.rawText && onAddressConfirmed) {
      onAddressConfirmed(result.rawText);
    }
    // Reset for next capture
    setPreview(null);
    setResult(null);
  };

  const handleReset = () => {
    setPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <section
      aria-label="Address OCR capture"
      style={{ maxWidth: 640, margin: "0 auto", fontFamily: "sans-serif" }}
    >
      <h2 style={{ marginBottom: "1rem" }}>📮 Handwritten Address Capture</h2>

      <DropZone onFile={handleFile} disabled={processing} />

      {processing && (
        <p role="status" style={{ marginTop: "1rem", color: "#4a90e2" }}>
          ⏳ Processing image… please wait
        </p>
      )}

      {error && (
        <p role="alert" style={{ marginTop: "1rem", color: "#d32f2f" }}>
          ⚠️ {error}
        </p>
      )}

      {preview && (
        <div style={{ marginTop: "1rem" }}>
          <strong>Preview:</strong>
          <br />
          <img
            src={preview}
            alt="Uploaded address image preview"
            style={{ maxWidth: "100%", marginTop: "0.5rem", border: "1px solid #ddd", borderRadius: 4 }}
          />
        </div>
      )}

      {result && (
        <div
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            border: "1px solid #ccc",
            borderRadius: 8,
            background: "#f9f9f9",
          }}
        >
          <h3 style={{ marginTop: 0 }}>OCR Result</h3>

          <label htmlFor="ocr-raw-text" style={{ fontWeight: "bold" }}>
            Extracted Text
          </label>
          <textarea
            id="ocr-raw-text"
            rows={4}
            style={{ display: "block", width: "100%", marginTop: "0.25rem", boxSizing: "border-box" }}
            defaultValue={result.rawText}
            aria-label="Extracted address text"
          />

          <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "#555" }}>
            Confidence: <strong>{result.confidence.toFixed(1)}%</strong>
          </p>

          {result.parsedAddress && (
            <div style={{ marginTop: "0.75rem" }}>
              <strong>Parsed Fields:</strong>
              <ul style={{ marginTop: "0.25rem", paddingLeft: "1.25rem", fontSize: "0.9rem" }}>
                <li>Street: {result.parsedAddress.streetLine || "—"}</li>
                <li>City: {result.parsedAddress.city || "—"}</li>
                <li>State / Region: {result.parsedAddress.stateOrRegion || "—"}</li>
                <li>Postal Code: {result.parsedAddress.postalCode || "—"}</li>
                <li>Country: {result.parsedAddress.country || "—"}</li>
              </ul>
            </div>
          )}

          {result.matchedLocations.length > 0 && (
            <div style={{ marginTop: "0.75rem" }}>
              <strong>Matched Pre-trained Locations:</strong>
              <ul style={{ marginTop: "0.25rem", paddingLeft: "1.25rem", fontSize: "0.9rem" }}>
                {result.matchedLocations.map((loc) => (
                  <li key={loc.id}>
                    {loc.label} ({loc.region})
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div
            role="group"
            aria-label="OCR result actions"
            style={{ marginTop: "1rem", display: "flex", gap: "0.75rem" }}
          >
            <button
              type="button"
              onClick={handleConfirm}
              style={{
                padding: "0.5rem 1.25rem",
                background: "#4a90e2",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              ✅ Confirm &amp; Save
            </button>
            <button
              type="button"
              onClick={handleReset}
              style={{
                padding: "0.5rem 1.25rem",
                background: "#eee",
                border: "1px solid #bbb",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              🔄 Start Over
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default AddressCaptureOCR;
