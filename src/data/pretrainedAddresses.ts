// Pre-trained address samples with location names for improved OCR accuracy.
// These entries seed the address recogniser so that common locality names,
// postal codes, and street patterns are recognised reliably even in
// low-quality handwritten inputs.

export interface PretrainedAddressEntry {
  id: string;
  label: string; // human-readable location name
  sampleTokens: string[]; // street / city / state / zip tokens used for matching
  region: string; // e.g. "US-CA", "IN-TN"
}

export const pretrainedAddresses: PretrainedAddressEntry[] = [
  // ── United States ────────────────────────────────────────────────────────
  {
    id: "us-ca-sf-001",
    label: "San Francisco, CA",
    sampleTokens: ["Market St", "San Francisco", "SF", "CA", "94102"],
    region: "US-CA",
  },
  {
    id: "us-ny-nyc-001",
    label: "New York City, NY",
    sampleTokens: ["Broadway", "New York", "NYC", "NY", "10001"],
    region: "US-NY",
  },
  {
    id: "us-tx-hou-001",
    label: "Houston, TX",
    sampleTokens: ["Main St", "Houston", "TX", "77001"],
    region: "US-TX",
  },
  {
    id: "us-il-chi-001",
    label: "Chicago, IL",
    sampleTokens: ["Michigan Ave", "Chicago", "IL", "60601"],
    region: "US-IL",
  },
  // ── India ─────────────────────────────────────────────────────────────────
  {
    id: "in-tn-chn-001",
    label: "Chennai, Tamil Nadu",
    sampleTokens: ["Anna Salai", "Chennai", "TN", "600001"],
    region: "IN-TN",
  },
  {
    id: "in-mh-mum-001",
    label: "Mumbai, Maharashtra",
    sampleTokens: ["MG Road", "Mumbai", "MH", "400001"],
    region: "IN-MH",
  },
  {
    id: "in-ka-blr-001",
    label: "Bengaluru, Karnataka",
    sampleTokens: ["Brigade Road", "Bengaluru", "Bangalore", "KA", "560001"],
    region: "IN-KA",
  },
  {
    id: "in-dl-ndl-001",
    label: "New Delhi",
    sampleTokens: ["Connaught Place", "New Delhi", "Delhi", "DL", "110001"],
    region: "IN-DL",
  },
  // ── United Kingdom ────────────────────────────────────────────────────────
  {
    id: "gb-eng-lon-001",
    label: "London, England",
    sampleTokens: ["Oxford Street", "London", "England", "EC1A"],
    region: "GB-ENG",
  },
  {
    id: "gb-eng-man-001",
    label: "Manchester, England",
    sampleTokens: ["Deansgate", "Manchester", "M1"],
    region: "GB-ENG",
  },
];

/**
 * Returns the pre-trained entries whose tokens partially match the given raw
 * OCR text.  Results are ordered by the number of matching tokens (descending).
 */
export function findMatchingAddresses(
  rawText: string
): PretrainedAddressEntry[] {
  const normalised = rawText.toLowerCase();
  return pretrainedAddresses
    .map((entry) => ({
      entry,
      score: entry.sampleTokens.filter((t) =>
        normalised.includes(t.toLowerCase())
      ).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ entry }) => entry);
}
