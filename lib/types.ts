export type AssistanceMode = 'HINT' | 'ASSISTED' | 'ASK';

export type HistoryStage =
  | 'BIODATA'
  | 'CHIEF_COMPLAINT'
  | 'HPI'
  | 'PMH'
  | 'DRUG_HISTORY'
  | 'FAMILY_HISTORY'
  | 'SOCIAL_HISTORY'
  | 'ROS'
  | 'SUMMARY';

export type MedicalSystem =
  | 'CNS'
  | 'RS'
  | 'CVS'
  | 'GIT'
  | 'UGS'
  | 'Musculoskeletal';

export interface SocratesData {
  site: string;
  onset: string;
  character: string;
  radiation: string;
  associations: string;
  timeCourse: string;
  exacerbatingRelieving: string; // Exacerbating & Relieving factors
  severity: string; // 1-10 scale
}

export interface FiveCsData {
  character: string | SocratesData; // String if no pain, SOCRATES if pain
  course: string; // Progression/Evolution
  cause: string; // Precipitating factors/Patient idea
  complications: string; // Effects on life/function
  care: string; // Previous care/medications
  extraNotes?: string; // Optional additional info
}

export interface ChiefComplaint {
  text: string;
  system?: MedicalSystem;
}

export interface PatientBiodata {
  name?: string;
  age?: number;
  gender?: string; // Sex/Gender
  tribe?: string;
  religion?: string;
  occupation?: string;
  maritalStatus?: string;
  address?: string;
}

export interface cessationDetails {
  when: string;
  why: string;
}

export interface TobaccoHistory {
  status: 'NEVER' | 'CURRENT' | 'FORMER';
  sticksPerDay?: number;
  years?: number;
  packYears?: number;
  stopped?: cessationDetails;
}

export interface AlcoholHistory {
  status: 'NEVER' | 'CURRENT' | 'FORMER';
  unitsPerWeek?: number;
  years?: number;
  stopped?: cessationDetails;
}

export interface SocialHistoryData {
  tobacco: TobaccoHistory;
  alcohol: AlcoholHistory;
  substanceAbuse: string;
  sexualHistory: string;
  livingSituation: string;
  travelHistory: string;
  extraNotes?: string;
}

export interface HistorySession {
  id: string;
  startTime: number;
  mode: AssistanceMode;
  currentStage: HistoryStage;
  data: {
    biodata: PatientBiodata;
    chiefComplaints: ChiefComplaint[]; // Limited to 5
    hpi: Record<number, FiveCsData>; // Mapped to CC index
    pmh: string;
    drugHistory: string;
    familyHistory: string;
    socialHistory: SocialHistoryData;
    ros: Partial<Record<MedicalSystem, string>>; // Systems not covered in HPI
  };
}

export const MEDICAL_SYSTEMS: MedicalSystem[] = [
  'CNS',
  'RS',
  'CVS',
  'GIT',
  'UGS',
  'Musculoskeletal',
];

export const STAGE_ORDER: HistoryStage[] = [
  'BIODATA',
  'CHIEF_COMPLAINT',
  'HPI',
  'PMH',
  'DRUG_HISTORY',
  'ROS',
  'FAMILY_HISTORY',
  'SOCIAL_HISTORY',
  'SUMMARY',
];

export const STAGE_LABELS: Record<HistoryStage, string> = {
  BIODATA: 'Patient Biodata',
  CHIEF_COMPLAINT: 'Chief Complaint',
  HPI: 'History of Present Illness',
  PMH: 'Past Medical History',
  DRUG_HISTORY: 'Drug History & Allergies',
  FAMILY_HISTORY: 'Family History',
  SOCIAL_HISTORY: 'Social History',
  ROS: 'Review of Systems',
  SUMMARY: 'Summary & Differentials',
};
