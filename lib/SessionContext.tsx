'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';

import {
  PatientBiodata,
  AssistanceMode,
  FiveCsData,
  Differential,
} from './types';
import { getCurrentUser } from '@/app/actions/auth';
import {
  getUserPreferences,
  updateUserPreferences,
} from '@/app/actions/preferences';
import {
  getSessionByIdAction,
  saveSessionAction,
} from '@/app/actions/sessions';
import { useTheme } from 'next-themes';
import { useSearchParams } from 'next/navigation';

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
  user: { id: string; email: string; name?: string | null } | null;
  mode: AssistanceMode;
  theme: string;
  status: 'ACTIVE' | 'COMPLETED';
  currentStage: SessionStage;
  biodata: PatientBiodata | null;
  presentingComplaints: PresentingComplaint[];
  hpcData: Record<string, FiveCsData>;
  pmhData: string;
  dhData: string;
  fhData: string; // Family History data
  shData: string; // Social History data
  rosData: Record<string, string>;
  differentials: Differential[];
  currentHint: Hint | null;
  hintHistory: Hint[];
  maxStageIndex: number;
  isAnalyzing: boolean;
  sessionId: string | null;
  setSessionId: (id: string | null) => void;
  loadSessionFromDb: (id: string) => Promise<void>;
  saveCurrentSession: () => Promise<string | null>;
  setBiodata: (data: PatientBiodata) => void;
  setPresentingComplaints: (complaints: PresentingComplaint[]) => void;
  setHpcData: (complaintId: string, data: FiveCsData) => void;
  setPmhData: (data: string) => void;
  setDhData: (data: string) => void;
  setFhData: (data: string) => void;
  setShData: (data: string) => void;
  setRosData: (system: string, notes: string) => void;
  setDifferentials: (data: Differential[]) => void;
  setStatus: (status: 'ACTIVE' | 'COMPLETED') => void;
  addHint: (message: string, stage?: string) => void;
  setMode: (mode: AssistanceMode) => void;
  setTheme: (theme: string) => void;
  nextStage: () => void;
  prevStage: () => void;
  goToStage: (stage: SessionStage) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  isSaving: boolean;
  refreshUser: () => Promise<void>;
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
  MODE: 'hx-pal-mode',
  HINTS: 'hx-pal-hints',
  MAX_STAGE: 'hx-pal-max-stage',
  DIFFERENTIALS: 'hx-pal-differentials',
  STATUS: 'hx-pal-status',
  SESSION_ID: 'hx-pal-session-id',
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
    if (value === null || value === undefined) {
      // Don't save null/undefined, effectively clearing it if it was there
      // but only if we explicitly want to clear.
      // For lazy persistence, we just skip writing the key if it's null.
      return;
    }

    // Check for empty objects/arrays
    if (Array.isArray(value) && value.length === 0) return;
    if (typeof value === 'object' && Object.keys(value).length === 0) return;
    if (typeof value === 'string' && value.trim() === '') return;

    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{
    id: string;
    email: string;
    name?: string | null;
  } | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(() =>
    loadFromStorage<string | null>(STORAGE_KEYS.SESSION_ID, null),
  );
  const searchParams = useSearchParams();
  const urlSessionId = searchParams.get('id');
  const { theme: nextTheme, setTheme: setNextTheme } = useTheme();
  const [mode, setModeState] = useState<AssistanceMode>(() =>
    loadFromStorage<AssistanceMode>(STORAGE_KEYS.MODE, 'ASK'),
  );
  // Track theme locally as well to avoid hydration issues and provide to context
  const [currentTheme, setCurrentTheme] = useState<string>('system');
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
  const [status, setStatusState] = useState<'ACTIVE' | 'COMPLETED'>(() =>
    loadFromStorage<'ACTIVE' | 'COMPLETED'>(STORAGE_KEYS.STATUS, 'ACTIVE'),
  );
  const [dhData, setDhDataState] = useState<string>(() =>
    loadFromStorage(STORAGE_KEYS.DH_DATA, ''),
  );
  const [differentials, setDifferentialsState] = useState<Differential[]>(() =>
    loadFromStorage<Differential[]>(STORAGE_KEYS.DIFFERENTIALS, []),
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [maxStageIndex, setMaxStageIndex] = useState<number>(() =>
    loadFromStorage<number>(STORAGE_KEYS.MAX_STAGE, 0),
  );
  const [hintHistory, setHintHistory] = useState<Hint[]>(() => {
    const saved = loadFromStorage<Hint[] | null>(STORAGE_KEYS.HINTS, null);
    if (saved && saved.length > 0) return saved;
    return [
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
        stage: 'BIODATA_GUIDANCE',
      },
    ];
  });

  // Use refs to store the latest state for the save function to avoid frequent recreations
  const biodataRef = useRef(biodata);
  const presentingComplaintsRef = useRef(presentingComplaints);
  const hpcDataRef = useRef(hpcData);
  const pmhDataRef = useRef(pmhData);
  const dhDataRef = useRef(dhData);
  const fhDataRef = useRef(fhData);
  const shDataRef = useRef(shData);
  const rosDataRef = useRef(rosData);
  const differentialsRef = useRef(differentials);
  const currentStageRef = useRef(currentStage);
  const statusRef = useRef(status);
  const modeRef = useRef(mode);
  const isSavingRef = useRef(false);

  // Keep refs in sync
  useEffect(() => {
    biodataRef.current = biodata;
    presentingComplaintsRef.current = presentingComplaints;
    hpcDataRef.current = hpcData;
    pmhDataRef.current = pmhData;
    dhDataRef.current = dhData;
    fhDataRef.current = fhData;
    shDataRef.current = shData;
    rosDataRef.current = rosData;
    differentialsRef.current = differentials;
    currentStageRef.current = currentStage;
    statusRef.current = status;
    modeRef.current = mode;
  }, [
    biodata,
    presentingComplaints,
    hpcData,
    pmhData,
    dhData,
    fhData,
    shData,
    rosData,
    differentials,
    currentStage,
    status,
    mode,
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
    saveToStorage(STORAGE_KEYS.MAX_STAGE, maxStageIndex);
  }, [maxStageIndex]);

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
    saveToStorage(STORAGE_KEYS.MODE, mode);
  }, [mode]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.DIFFERENTIALS, differentials);
  }, [differentials]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.STATUS, status);
  }, [status]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.STAGE, currentStage);
  }, [currentStage]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.HINTS, hintHistory);
  }, [hintHistory]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SESSION_ID, sessionId);
  }, [sessionId]);

  const refreshUser = useCallback(async () => {
    const freshUser = await getCurrentUser();
    setUser(freshUser);
  }, []);

  // Load user on mount
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Sync local theme state with next-themes
  useEffect(() => {
    if (nextTheme) setCurrentTheme(nextTheme);
  }, [nextTheme]);

  // Load preferences from DB when user is available
  useEffect(() => {
    if (user) {
      getUserPreferences().then((prefs) => {
        if (prefs && mode === 'ASK') {
          setModeState(prefs.assistanceMode as AssistanceMode);
          if (prefs.theme) setNextTheme(prefs.theme);
        }
      });
    }
  }, [user, setNextTheme, mode]);

  const loadSessionFromDb = useCallback(async (id: string) => {
    const result = await getSessionByIdAction(id);
    if (result.success && result.session) {
      const { session } = result;
      setSessionId(session.id);
      setCurrentStage(session.currentStage as SessionStage);
      setModeState(session.mode as AssistanceMode);
      setStatusState(session.status as any);

      const data = session.data as any;
      if (data) {
        if (data.biodata) setBiodataState(data.biodata);
        if (data.complaints) setPresentingComplaintsState(data.complaints);
        if (data.hpc) setHpcDataState(data.hpc);
        if (data.pmh) setPmhDataState(data.pmh);
        if (data.dh) setDhDataState(data.dh);
        if (data.fh) setFhDataState(data.fh);
        if (data.sh) setShDataState(data.sh);
        if (data.ros) setRosDataState(data.ros);
        if (data.differentials) setDifferentialsState(data.differentials);
      }
    }
  }, []);

  const saveCurrentSession = useCallback(async () => {
    const hasMeaningfulData = () => {
      const bd = biodataRef.current;
      const pc = presentingComplaintsRef.current;
      const hpc = hpcDataRef.current;
      const ros = rosDataRef.current;

      if (bd && (bd.name || bd.age)) return true;
      if (pc && pc.length > 0) return true;
      if (hpc && Object.keys(hpc).length > 0) return true;
      if (
        pmhDataRef.current ||
        dhDataRef.current ||
        fhDataRef.current ||
        shDataRef.current ||
        (ros && Object.keys(ros).length > 0)
      )
        return true;
      return false;
    };

    if (
      !user ||
      !hasMeaningfulData() ||
      isSavingRef.current ||
      statusRef.current === 'COMPLETED'
    )
      return sessionId;

    isSavingRef.current = true;
    setIsSaving(true);
    try {
      const data = {
        biodata: biodataRef.current,
        complaints: presentingComplaintsRef.current,
        hpc: hpcDataRef.current,
        pmh: pmhDataRef.current,
        dh: dhDataRef.current,
        fh: fhDataRef.current,
        sh: shDataRef.current,
        ros: rosDataRef.current,
        differentials: differentialsRef.current,
      };

      const result = await saveSessionAction({
        id: sessionId || undefined,
        currentStage: currentStageRef.current,
        status: statusRef.current,
        mode: modeRef.current,
        data,
      });

      if (result.success && result.session) {
        setSessionId(result.session.id);
        return result.session.id;
      }
      return sessionId;
    } catch (error) {
      console.error('Auto-save failed:', error);
      return sessionId;
    } finally {
      isSavingRef.current = false;
      // Small delay to make the "Saved" state visible/smooth
      setTimeout(() => setIsSaving(false), 1000);
    }
  }, [user, sessionId]);

  // Sync mode from URL if present
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlMode = searchParams.get('mode');
    if (urlMode && urlMode !== mode) {
      setModeState(urlMode as AssistanceMode);
    }
  }, [searchParams, mode]);

  // Load session if ID is in URL
  useEffect(() => {
    if (urlSessionId && urlSessionId !== sessionId) {
      loadSessionFromDb(urlSessionId);
    }
  }, [urlSessionId, sessionId, loadSessionFromDb]);

  // Auto-save to DB on stage change
  useEffect(() => {
    saveCurrentSession();
  }, [currentStage, saveCurrentSession]);

  const setMode = useCallback(async (newMode: AssistanceMode) => {
    setModeState(newMode);
    await updateUserPreferences({ assistanceMode: newMode });
  }, []);

  const setTheme = useCallback(
    async (newTheme: string) => {
      setNextTheme(newTheme);
      await updateUserPreferences({ theme: newTheme });
    },
    [setNextTheme],
  );

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

  const setDifferentials = useCallback((data: Differential[]) => {
    setDifferentialsState(data);
    differentialsRef.current = data;
  }, []);

  const setStatus = useCallback((s: 'ACTIVE' | 'COMPLETED') => {
    setStatusState(s);
    statusRef.current = s;
  }, []);

  // Automatically add stage-specific hints when currentStage changes
  useEffect(() => {
    // Check if we already have a guidance hint for this stage in the entire history
    // We use a specific suffix '_GUIDANCE' to distinguish from AI hints or previous attempts
    const guidanceTag = `${currentStage}_GUIDANCE`;
    const alreadyHasGuidance = hintHistory.some((h) => h.stage === guidanceTag);

    if (alreadyHasGuidance) return;

    if (currentStage === 'PRESENTING_COMPLAINT') {
      addHint(
        'Now, ask the patient about their main complaint. What brought them to seek medical attention? How long have they been experiencing this?',
        'PRESENTING_COMPLAINT_GUIDANCE',
      );
    } else if (currentStage === 'HISTORY') {
      addHint(
        'Time to explore the history of the presenting complaint. Use the 5 Cs framework: Character, Course, Cause, Complications, and Care. If the patient has pain, strictly use SOCRATES to elaborate on the Character.',
        'HISTORY_GUIDANCE',
      );
    } else if (currentStage === 'ROS') {
      addHint(
        'Now, perform a systemic review (ROS) to catch any other symptoms. Focus on systems related to the chief complaint, but briefly screen major systems (CVS, RS, GI, GU, CNS) for any missed red flags.',
        'ROS_GUIDANCE',
      );
    } else if (currentStage === 'PMH') {
      addHint(
        'Collect the Past Medical History. Ask about Chronic Conditions (HTN, Diabetes, Asthama, Epilepsy), previous Hospitalizations, and Surgeries. Use the "MJ THREADS" mnemonic if you need a comprehensive screen.',
        'PMH_GUIDANCE',
      );
    } else if (currentStage === 'DRUG_HISTORY') {
      addHint(
        'Review all current medications: Prescribed, Over-the-counter (OTC), and Herbal supplements. Crucially, ask about Drug Allergies and the nature of the reaction.',
        'DRUG_HISTORY_GUIDANCE',
      );
    } else if (currentStage === 'FAMILY_HISTORY') {
      addHint(
        'Ask about hereditary conditions in first-degree relatives (Parents, Siblings). Focus on conditions relevant to the presenting complaint (e.g. IHD, Diabetes, Cancer).',
        'FAMILY_HISTORY_GUIDANCE',
      );
    } else if (currentStage === 'SOCIAL_HISTORY') {
      addHint(
        'Query lifestyle factors: Smoking (pack-years), Alcohol (units/week), Recreational Drugs. Also ask about Occupation and Living Situation (Social Support).',
        'SOCIAL_HISTORY_GUIDANCE',
      );
    } else if (currentStage === 'SUMMARY') {
      addHint(
        'You have completed the session. Review the summary of your findings below.',
        'SUMMARY_GUIDANCE',
      );
    }
  }, [currentStage, addHint, hintHistory]);

  const nextStage = useCallback(() => {
    const currentIndex = STAGE_ORDER.indexOf(currentStage);
    if (currentIndex < STAGE_ORDER.length - 1) {
      const newStage = STAGE_ORDER[currentIndex + 1];
      setCurrentStage(newStage);
      if (currentIndex + 1 > maxStageIndex) {
        setMaxStageIndex(currentIndex + 1);
      }
    }
  }, [currentStage, maxStageIndex]);

  const prevStage = useCallback(() => {
    const currentIndex = STAGE_ORDER.indexOf(currentStage);
    if (currentIndex > 0) {
      setCurrentStage(STAGE_ORDER[currentIndex - 1]);
    }
  }, [currentStage]);

  const goToStage = useCallback(
    (stage: SessionStage) => {
      const targetIndex = STAGE_ORDER.indexOf(stage);
      // Allow navigation if stage is already reached or is the immediate next one
      if (targetIndex <= maxStageIndex + 1) {
        setCurrentStage(stage);
        if (targetIndex > maxStageIndex) {
          setMaxStageIndex(targetIndex);
        }
      }
    },
    [maxStageIndex],
  );

  const currentHint = useMemo(() => {
    return hintHistory.length > 0 ? hintHistory[hintHistory.length - 1] : null;
  }, [hintHistory]);

  const value = useMemo(
    () => ({
      user,
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
      setDifferentials,
      setStatus,
      addHint,
      setMode,
      maxStageIndex,
      theme: currentTheme,
      setTheme,
      nextStage,
      prevStage,
      goToStage,
      isAnalyzing,
      setIsAnalyzing,
      isSaving,
      refreshUser,
      sessionId,
      setSessionId,
      loadSessionFromDb,
      saveCurrentSession,
      differentials,
      status,
    }),
    [
      user,
      mode,
      currentTheme,
      setTheme,
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
      maxStageIndex,
      setBiodata,
      setPresentingComplaints,
      setHpcData,
      setPmhData,
      setDhData,
      setFhData,
      setShData,
      setRosData,
      setDifferentials,
      addHint,
      setMode,
      nextStage,
      prevStage,
      goToStage,
      isAnalyzing,
      isSaving,
      refreshUser,
      sessionId,
      loadSessionFromDb,
      saveCurrentSession,
      differentials,
      status,
      setStatus,
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
