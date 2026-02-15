'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';

import { PatientBiodata, AssistanceMode, FiveCsData } from './types';

interface Hint {
  id: string;
  message: string;
  timestamp: Date;
  stage?: string;
}

interface PresentingComplaint {
  id: string;
  complaint: string;
  duration: string;
  order: number; // For maintaining manual order
}

type SessionStage =
  | 'BIODATA'
  | 'PRESENTING_COMPLAINT'
  | 'HISTORY'
  | 'PMH'
  | 'DRUG_HISTORY'
  | 'ROS'
  | 'FAMILY_HISTORY'
  | 'SOCIAL_HISTORY'
  | 'SUMMARY';

interface SessionContextType {
  mode: AssistanceMode;
  currentStage: SessionStage;
  biodata: PatientBiodata | null;
  presentingComplaints: PresentingComplaint[];
  hpcData: Record<string, FiveCsData>;
  pmhData: string;
  dhData: string;
  fhData: string; // Family History data
  shData: string; // Social History data
  rosData: Record<string, string>;
  currentHint: Hint | null;
  hintHistory: Hint[];
  isAnalyzing: boolean;
  setBiodata: (data: PatientBiodata) => void;
  setPresentingComplaints: (complaints: PresentingComplaint[]) => void;
  setHpcData: (complaintId: string, data: FiveCsData) => void;
  setPmhData: (data: string) => void;
  setDhData: (data: string) => void;
  setFhData: (data: string) => void;
  setShData: (data: string) => void;
  setRosData: (system: string, notes: string) => void;
  addHint: (message: string, stage?: string) => void;
  setMode: (mode: AssistanceMode) => void;
  nextStage: () => void;
  prevStage: () => void;
  goToStage: (stage: SessionStage) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const STAGE_ORDER: SessionStage[] = [
  'BIODATA',
  'PRESENTING_COMPLAINT',
  'HISTORY',
  'PMH',
  'DRUG_HISTORY',
  'ROS',
  'FAMILY_HISTORY',
  'SOCIAL_HISTORY',
  'SUMMARY',
];

const STORAGE_KEYS = {
  BIODATA: 'hx-pal-biodata',
  COMPLAINTS: 'hx-pal-complaints',
  HPC_DATA: 'hx-pal-hpc',
  PMH_DATA: 'hx-pal-pmh',
  DH_DATA: 'hx-pal-dh',
  FH_DATA: 'hx-pal-fh',
  SH_DATA: 'hx-pal-sh',
  ROS_DATA: 'hx-pal-ros',
  STAGE: 'hx-pal-stage',
};

// Helper functions for localStorage
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToStorage = <T,>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AssistanceMode>('HINT');
  const [currentStage, setCurrentStage] = useState<SessionStage>(() => {
    const stage = loadFromStorage(STORAGE_KEYS.STAGE, 'BIODATA') as any;
    if (stage === 'EXAMINATION') return 'SUMMARY';
    return stage;
  });
  const [biodata, setBiodataState] = useState<PatientBiodata | null>(() =>
    loadFromStorage<PatientBiodata | null>(STORAGE_KEYS.BIODATA, null),
  );
  const [presentingComplaints, setPresentingComplaintsState] = useState<
    PresentingComplaint[]
  >(() => loadFromStorage<PresentingComplaint[]>(STORAGE_KEYS.COMPLAINTS, []));
  const [hpcData, setHpcDataState] = useState<Record<string, FiveCsData>>(() =>
    loadFromStorage<Record<string, FiveCsData>>(STORAGE_KEYS.HPC_DATA, {}),
  );
  const [rosData, setRosDataState] = useState<Record<string, string>>(() =>
    loadFromStorage<Record<string, string>>(STORAGE_KEYS.ROS_DATA, {}),
  );
  const [pmhData, setPmhDataState] = useState<string>(() =>
    loadFromStorage(STORAGE_KEYS.PMH_DATA, ''),
  );
  const [fhData, setFhDataState] = useState<string>(() =>
    loadFromStorage(STORAGE_KEYS.FH_DATA, ''),
  );
  const [shData, setShDataState] = useState<string>(() =>
    loadFromStorage(STORAGE_KEYS.SH_DATA, ''),
  );
  const [dhData, setDhDataState] = useState<string>(() =>
    loadFromStorage(STORAGE_KEYS.DH_DATA, ''),
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  // currentHint is derived from hintHistory, so no state needed
  const [hintHistory, setHintHistory] = useState<Hint[]>([
    {
      id: '0',
      message:
        "Welcome to HX Pal! I'll guide you through this clinical clerkship session with helpful hints and suggestions.",
      timestamp: new Date(Date.now() - 60000), // 1 minute ago
      stage: 'Session Start',
    },
    {
      id: '1',
      message:
        "Start by collecting the patient's full name, age, and sex. These are essential demographic details for any clinical assessment.",
      timestamp: new Date(),
      stage: 'Biodata Collection',
    },
  ]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.BIODATA, biodata);
  }, [biodata]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.COMPLAINTS, presentingComplaints);
  }, [presentingComplaints]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.HPC_DATA, hpcData);
  }, [hpcData]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ROS_DATA, rosData);
  }, [rosData]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PMH_DATA, pmhData);
  }, [pmhData]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.DH_DATA, dhData);
  }, [dhData]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.FH_DATA, fhData);
  }, [fhData]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SH_DATA, shData);
  }, [shData]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.STAGE, currentStage);
  }, [currentStage]);

  const addHint = useCallback((message: string, stage?: string) => {
    const newHint: Hint = {
      id: Date.now().toString(),
      message,
      timestamp: new Date(),
      stage,
    };
    setHintHistory((prev) => [...prev, newHint]);
  }, []);

  const setBiodata = useCallback(
    (data: PatientBiodata) => {
      setBiodataState(data);
      // Add a custom HX Pal response when biodata is completed
      addHint(
        `Excellent! I've recorded ${data.name}'s biodata. ${data.age} year old ${data.gender?.toLowerCase()} patient. Now we can proceed to collect the presenting complaint and history.`,
        'Biodata Collection',
      );
    },
    [addHint],
  );

  const setPresentingComplaints = useCallback(
    (complaints: PresentingComplaint[]) => {
      setPresentingComplaintsState(complaints);
      // Add a custom HX Pal response based on number of complaints
      if (complaints.length === 1) {
        addHint(
          `Got it! The patient presents with "${complaints[0].complaint}" for ${complaints[0].duration}. Let's now explore the history of this complaint in detail.`,
          'Presenting Complaint',
        );
      } else if (complaints.length > 1) {
        const complaintsList = complaints
          .map((c, i) => `${i + 1}. ${c.complaint} (${c.duration})`)
          .join(', ');
        addHint(
          `Excellent! I've recorded ${complaints.length} presenting complaints: ${complaintsList}. Let's now explore the history of these complaints.`,
          'Presenting Complaint',
        );
      }
    },
    [addHint],
  );

  const setHpcData = useCallback((complaintId: string, data: FiveCsData) => {
    setHpcDataState((prev) => ({
      ...prev,
      [complaintId]: data,
    }));
  }, []);

  const setRosData = useCallback((system: string, notes: string) => {
    setRosDataState((prev) => ({
      ...prev,
      [system]: notes,
    }));
  }, []);

  const setPmhData = useCallback((data: string) => {
    setPmhDataState(data);
  }, []);

  const setFhData = useCallback((data: string) => {
    setFhDataState(data);
  }, []);

  const setShData = useCallback((data: string) => {
    setShDataState(data);
  }, []);

  const setDhData = useCallback((data: string) => {
    setDhDataState(data);
  }, []);

  const nextStage = useCallback(() => {
    const currentIndex = STAGE_ORDER.indexOf(currentStage);
    if (currentIndex < STAGE_ORDER.length - 1) {
      const newStage = STAGE_ORDER[currentIndex + 1];
      setCurrentStage(newStage);

      // Add stage-specific hints
      if (newStage === 'PRESENTING_COMPLAINT') {
        addHint(
          'Now, ask the patient about their main complaint. What brought them to seek medical attention? How long have they been experiencing this?',
          'Presenting Complaint',
        );
      } else if (newStage === 'HISTORY') {
        addHint(
          'Time to explore the history of the presenting complaint. Use the 5 Cs framework: Character, Course, Cause, Complications, and Care. If the patient has pain, strictly use SOCRATES to elaborate on the Character.',
          'History Taking',
        );
      } else if (newStage === 'ROS') {
        addHint(
          'Now, perform a systemic review (ROS) to catch any other symptoms. Focus on systems related to the chief complaint, but briefly screen major systems (CVS, RS, GI, GU, CNS) for any missed red flags.',
          'Review of Systems',
        );
      } else if (newStage === 'FAMILY_HISTORY') {
        addHint(
          'Ask about hereditary conditions in first-degree relatives (Parents, Siblings). Focus on conditions relevant to the presenting complaint (e.g. IHD, Diabetes, Cancer).',
          'Family History',
        );
      } else if (newStage === 'SOCIAL_HISTORY') {
        addHint(
          'Query lifestyle factors: Smoking (pack-years), Alcohol (units/week), Recreational Drugs. Also ask about Occupation and Living Situation (Social Support).',
          'Social History',
        );
      } else if (newStage === 'SUMMARY') {
        addHint(
          'You have completed the session. Review the summary of your findings below.',
          'Session Complete',
        );
      }
    }
  }, [currentStage, addHint]);

  const prevStage = useCallback(() => {
    const currentIndex = STAGE_ORDER.indexOf(currentStage);
    if (currentIndex > 0) {
      setCurrentStage(STAGE_ORDER[currentIndex - 1]);
    }
  }, [currentStage]);

  const goToStage = useCallback((stage: SessionStage) => {
    setCurrentStage(stage);
  }, []);

  const currentHint = useMemo(() => {
    return hintHistory.length > 0 ? hintHistory[hintHistory.length - 1] : null;
  }, [hintHistory]);

  const value = useMemo(
    () => ({
      mode,
      currentStage,
      biodata,
      presentingComplaints,
      hpcData,
      pmhData,
      dhData,
      fhData,
      shData,
      rosData,
      currentHint,
      hintHistory,
      setBiodata,
      setPresentingComplaints,
      setHpcData,
      setPmhData,
      setDhData,
      setFhData,
      setShData,
      setRosData,
      addHint,
      setMode,
      nextStage,
      prevStage,
      goToStage,
      isAnalyzing,
      setIsAnalyzing,
    }),
    [
      mode,
      currentStage,
      biodata,
      presentingComplaints,
      hpcData,
      pmhData,
      dhData,
      fhData,
      shData,
      rosData,
      currentHint,
      hintHistory,
      setBiodata,
      setPresentingComplaints,
      setHpcData,
      setPmhData,
      setDhData,
      setFhData,
      setShData,
      setRosData,
      addHint,
      setMode,
      nextStage,
      prevStage,
      goToStage,
      isAnalyzing,
    ],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
