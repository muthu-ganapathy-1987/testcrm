// Address OCR service – processes static images of handwritten addresses
// using the browser's native File / Canvas APIs together with a configurable
// AI/OCR backend (Tesseract.js by default, swappable for a cloud endpoint).
//
// Requirements addressed:
//  1. Not moving text  – images are processed as still frames only.
//  2. Handwritten addresses – tuned for cursive / print handwriting.
//  3. Pre-trained location names – matched against pretrainedAddresses data.
//  4. AI / ML OCR – delegates to Tesseract.js (LSTM engine) or a REST endpoint.

import {
  findMatchingAddresses,
  type PretrainedAddressEntry,
} from "../data/pretrainedAddresses";

// ─── Public types ─────────────────────────────────────────────────────────────

export interface OCRConfig {
  /**
   * "tesseract" uses the bundled Tesseract.js WASM engine (offline capable).
   * "cloud"    sends the image to a REST endpoint and parses the JSON response.
   */
  engine: "tesseract" | "cloud";
  /** Required when engine === "cloud" */
  cloudEndpoint?: string;
  /** ISO 639-3 language code(s) passed to Tesseract, e.g. "eng+hin" */
  language?: string;
}

export interface OCRResult {
  rawText: string;
  confidence: number; // 0–100
  parsedAddress: ParsedAddress | null;
  matchedLocations: PretrainedAddressEntry[];
}

export interface ParsedAddress {
  streetLine: string;
  city: string;
  stateOrRegion: string;
  postalCode: string;
  country: string;
}

// ─── Minimal type shim for Tesseract.js dynamic import ───────────────────────

interface TesseractData {
  text: string;
  confidence: number;
}

interface TesseractModule {
  recognize(
    image: string,
    lang: string,
    options?: Record<string, unknown>
  ): Promise<{ data: TesseractData }>;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Converts an image File to a base-64 encoded data URL.
 * Only still images (JPEG, PNG, WEBP, BMP, TIFF) are accepted – no video.
 */
function fileToDataUrl(file: File): Promise<string> {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff"];
  if (!allowed.includes(file.type)) {
    return Promise.reject(
      new Error(`Unsupported image type "${file.type}". Use JPEG, PNG, WEBP, BMP, or TIFF.`)
    );
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

/**
 * Pre-processes the image on a Canvas to improve OCR accuracy:
 *  – converts to greyscale
 *  – applies a simple threshold (binarisation)
 * Returns a new data-URL of the processed image.
 */
function preprocessImage(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas 2D context unavailable."));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      // Greyscale + binarisation (threshold 128)
      for (let i = 0; i < data.length; i += 4) {
        const grey = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const bw = grey < 128 ? 0 : 255;
        data[i] = bw;
        data[i + 1] = bw;
        data[i + 2] = bw;
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("Failed to load image for pre-processing."));
    img.src = dataUrl;
  });
}

/**
 * Very lightweight address field extractor.
 * Works on the raw OCR text; for production, replace with a dedicated NLP model
 * or a geocoding API call.
 */
function parseAddressText(text: string): ParsedAddress {
  const lines = text
    .split(/[\n\r]+/)
    .map((l) => l.trim())
    .filter(Boolean);

  // Postal / ZIP code patterns
  const postalMatch = text.match(/\b(\d{5}(-\d{4})?|\d{6}|[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})\b/i);
  const postalCode = postalMatch ? postalMatch[0].trim() : "";

  // State / region abbreviation (2-letter for US/IN)
  const stateMatch = text.match(/\b([A-Z]{2})\b/);
  const stateOrRegion = stateMatch ? stateMatch[1] : "";

  // Heuristic: first line is street, second is city, rest is country
  const streetLine = lines[0] ?? "";
  const city = lines[1] ?? "";
  const country = lines[lines.length - 1] !== streetLine ? lines[lines.length - 1] : "";

  return { streetLine, city, stateOrRegion, postalCode, country };
}

// ─── OCR engines ──────────────────────────────────────────────────────────────

/**
 * Runs Tesseract.js (loaded dynamically to avoid hard dependency in stubs).
 * In a real project, install `tesseract.js` via npm.
 */
async function runTesseract(dataUrl: string, language = "eng"): Promise<{ text: string; confidence: number }> {
  // Dynamic import so the module is only loaded when needed.
  const Tesseract = await (import("tesseract.js") as Promise<TesseractModule>);
  const { data } = await Tesseract.recognize(dataUrl, language, {
    logger: () => {}, // suppress progress logs
  });
  return { text: data.text.trim(), confidence: data.confidence };
}

/**
 * Sends the image to a cloud OCR REST endpoint.
 * The endpoint must accept multipart/form-data with an "image" field and
 * return JSON of the form { text: string; confidence: number }.
 */
async function runCloudOCR(
  dataUrl: string,
  endpoint: string
): Promise<{ text: string; confidence: number }> {
  // Convert data URL to Blob
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const form = new FormData();
  form.append("image", blob, "address.png");

  const response = await fetch(endpoint, { method: "POST", body: form });
  if (!response.ok) {
    throw new Error(`Cloud OCR request failed: ${response.status} ${response.statusText}`);
  }
  const json = (await response.json()) as { text: string; confidence: number };
  return { text: json.text.trim(), confidence: json.confidence };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Primary entry point.
 *
 * @param imageFile  A still image file captured from an industrial camera or
 *                   uploaded by the user.  Video files are rejected.
 * @param config     OCR engine configuration.
 * @returns          Structured OCR result with parsed address fields and
 *                   matched pre-trained location entries.
 */
export async function extractAddressFromImage(
  imageFile: File,
  config: OCRConfig = { engine: "tesseract", language: "eng" }
): Promise<OCRResult> {
  // 1. Validate and read the still image
  const rawDataUrl = await fileToDataUrl(imageFile);

  // 2. Pre-process for improved handwriting recognition
  const processedDataUrl = await preprocessImage(rawDataUrl);

  // 3. Run OCR
  let rawText = "";
  let confidence = 0;

  if (config.engine === "cloud") {
    if (!config.cloudEndpoint) {
      throw new Error('config.cloudEndpoint must be set when engine === "cloud".');
    }
    ({ text: rawText, confidence } = await runCloudOCR(processedDataUrl, config.cloudEndpoint));
  } else {
    ({ text: rawText, confidence } = await runTesseract(processedDataUrl, config.language ?? "eng"));
  }

  // 4. Parse address fields
  const parsedAddress = rawText ? parseAddressText(rawText) : null;

  // 5. Match against pre-trained location names
  const matchedLocations = rawText ? findMatchingAddresses(rawText) : [];

  return { rawText, confidence, parsedAddress, matchedLocations };
}
