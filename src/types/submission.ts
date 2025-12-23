export type SubmissionStatus = "pending" | "under_review" | "reviewed";

export interface Submission {
  id: string;
  user_id: string;
  title: string;
  paper: string;
  question?: string;
  notes?: string;
  file_path: string;
  file_name: string;
  file_size: number;
  marked_file_path?: string;
  marked_file_name?: string;
  status: SubmissionStatus;
  score?: number;
  marker_notes?: string;
  marker_id?: string;
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
}

export interface CreateSubmissionData {
  title: string;
  paper: string;
  question?: string;
  notes?: string;
  file: File;
}

// ACCA Paper options
export const ACCA_PAPERS = [
  { value: "PM", label: "Performance Management (PM/F5)" },
  { value: "FM", label: "Financial Management (FM/F9)" },
  { value: "FR", label: "Financial Reporting (FR/F7)" },
  { value: "AA", label: "Audit and Assurance (AA/F8)" },
  { value: "TX", label: "Taxation (TX/F6)" },
  { value: "SBL", label: "Strategic Business Leader (SBL)" },
  { value: "SBR", label: "Strategic Business Reporting (SBR)" },
  { value: "AFM", label: "Advanced Financial Management (AFM)" },
  { value: "APM", label: "Advanced Performance Management (APM)" },
  { value: "ATX", label: "Advanced Taxation (ATX)" },
  { value: "AAA", label: "Advanced Audit and Assurance (AAA)" },
] as const;

export type ACCAPaper = (typeof ACCA_PAPERS)[number]["value"];

// Helper to get paper label
export function getPaperLabel(value: string): string {
  const paper = ACCA_PAPERS.find((p) => p.value === value);
  return paper?.label || value;
}

// Helper to get paper color
export function getPaperColor(value: string): string {
  const colors: Record<string, string> = {
    PM: "blue",
    FM: "purple",
    FR: "cyan",
    AA: "orange",
    TX: "red",
    SBL: "green",
    SBR: "teal",
    AFM: "indigo",
    APM: "pink",
    ATX: "rose",
    AAA: "amber",
  };
  return colors[value] || "gray";
}
