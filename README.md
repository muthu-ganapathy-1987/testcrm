# testcrm

A CRM application with AI-powered handwritten address capture using OCR.

---

## Features

### Handwritten Address OCR

The application can process **still images** of handwritten addresses captured by industrial cameras and extract structured address data using AI/ML (OCR).

| Requirement | How it is met |
|---|---|
| Not moving text | Images are captured as still frames only; video inputs are rejected. Hardware trigger mode ensures the item is stationary before capture. |
| Handwritten addresses | Tesseract.js LSTM engine (or pluggable cloud OCR) tuned for cursive and printed handwriting. Images are pre-processed (greyscale + binarisation) before OCR. |
| Pre-trained address data | `src/data/pretrainedAddresses.ts` contains sample location tokens (streets, cities, postal codes) across US, India, and UK. The OCR result is cross-referenced against this data to improve field extraction accuracy. |
| AI / ML OCR | `src/services/addressOCRService.ts` delegates to Tesseract.js (LSTM neural net, runs in-browser via WASM) or a configurable cloud REST endpoint. |

#### Key source files

```
src/
  data/
    pretrainedAddresses.ts      – Pre-trained location name tokens
  services/
    addressOCRService.ts        – Core OCR service (image → address fields)
    crmDataService.ts           – CRM data layer (opportunities, contacts, OCR records)
  components/
    AddressCaptureOCR.tsx       – Upload / drag-drop UI for address images
    CameraRecommendations.tsx   – Industrial camera estimates & setup guidance
```

---

## Industrial Camera Estimates

The `CameraRecommendations` component (`src/components/CameraRecommendations.tsx`) provides a full comparison of cameras suitable for address OCR. A summary is reproduced below.

| Camera | Resolution | Shutter | Interface | Approx. price (USD) |
|---|---|---|---|---|
| Basler acA5320-23gc | 5 MP | Global | GigE | $800–$1,100 |
| FLIR BFS-U3-51S5C | 5.1 MP | Global | USB3 | $700–$950 |
| IDS UI-5260CP-C-HQ | 5 MP | Global | USB3 | $750–$1,000 |
| Cognex In-Sight 9902L | 12 MP | Global | GigE | $3,500–$5,500 |
| Keyence CV-X400 | 21 MP | Global | GigE | $4,000–$7,000 |
| Hikvision MV-CS050-10GC | 5 MP | Global | GigE | $300–$500 |

### Camera Selection Guidance

- **Resolution:** Target ≥ 150 DPI over the address area (~100 × 60 mm). A 5 MP camera at 500 mm working distance typically achieves this comfortably.
- **Global shutter:** Strongly preferred on conveyor or moving-belt installations to eliminate motion blur.
- **Interface:** GigE Vision is the standard for factory floors (up to 100 m cable runs); USB3 Vision suits compact/desktop setups.
- **Budget pick:** Hikvision MV-CS050-10GC – solid image quality at ~$300–$500.
- **Turnkey pick:** Cognex In-Sight 9902L – includes built-in deep-learning OCR, no separate PC needed.
- **High-detail pick:** Keyence CV-X400 – 21 MP for faint or very small handwriting.

---

## Getting Started

> The project is in early scaffolding stage. A full build setup (package.json, bundler, etc.) will be added in a future iteration.

```bash
# Install dependencies (once package.json is configured)
npm install

# Start development server
npm start
```

### Dependencies to add

```bash
npm install tesseract.js     # WASM OCR engine (offline capable)
npm install react react-dom
npm install typescript @types/react @types/react-dom
```