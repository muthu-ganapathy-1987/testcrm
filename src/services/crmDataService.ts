// CRM data service – opportunities, contacts, and address OCR records

export interface Opportunity {
  id: string;
  name: string;
  value: number;
  stage: string;
  contactId: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  /** Raw address text extracted via OCR (see addressOCRService) */
  ocrAddress?: string;
}

export interface AddressOCRRecord {
  id: string;
  contactId: string;
  capturedAt: string; // ISO-8601
  rawText: string;
  confidence: number;
  streetLine: string;
  city: string;
  stateOrRegion: string;
  postalCode: string;
  country: string;
}

// ── In-memory demo data ──────────────────────────────────────────────────────

const opportunities: Opportunity[] = [
  { id: "op-001", name: "Acme Logistics Deal", value: 15000, stage: "Proposal", contactId: "ct-001" },
  { id: "op-002", name: "Beta Corp Renewal",   value: 8500,  stage: "Closed Won", contactId: "ct-002" },
];

const contacts: Contact[] = [
  { id: "ct-001", name: "Alice Johnson", email: "alice@acme.com",
    ocrAddress: "42 Market St\nSan Francisco, CA 94102" },
  { id: "ct-002", name: "Ravi Kumar",    email: "ravi@beta.in",
    ocrAddress: "14 Anna Salai\nChennai, TN 600001" },
];

const addressOCRRecords: AddressOCRRecord[] = [];

// ── Public API ────────────────────────────────────────────────────────────────

export function getOpportunities(): Opportunity[] {
  return [...opportunities];
}

export function getContacts(): Contact[] {
  return [...contacts];
}

export function getAddressOCRRecords(): AddressOCRRecord[] {
  return [...addressOCRRecords];
}

export function saveAddressOCRRecord(record: Omit<AddressOCRRecord, "id">): AddressOCRRecord {
  const newRecord: AddressOCRRecord = {
    id: `ocr-${Date.now()}`,
    ...record,
  };
  addressOCRRecords.push(newRecord);
  return newRecord;
}