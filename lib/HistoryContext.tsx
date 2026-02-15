'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import {
  HistorySession,
  HistoryStage,
  AssistanceMode,
  STAGE_ORDER,
  PatientBiodata,
  ChiefComplaint,
  FiveCsData,
  MedicalSystem,
  SocialHistoryData,
  TobaccoHistory,
  AlcoholHistory,
} from './types';

interface HistoryContextType {
  session: HistorySession;
  setMode: (mode: AssistanceMode) => void;
  nextStage: () => void;
  prevStage: () => void;
  updateBiodata: (data: Partial<PatientBiodata>) => void;
  addChiefComplaint: (cc: string) => void;
  removeChiefComplaint: (index: number) => void;
  updateCCSystem: (index: number, system: MedicalSystem) => void;
  updateFiveCs: (index: number, data: Partial<FiveCsData>) => void;
  updateROS: (system: MedicalSystem, finding: string) => void;
  updatePMH: (finding: string) => void;
  updateDrugHistory: (finding: string) => void;
  updateFamilyHistory: (finding: string) => void;
  updateSocialHistory: (data: Partial<SocialHistoryData>) => void;
  updateTobacco: (data: Partial<TobaccoHistory>) => void;
  updateAlcohol: (data: Partial<AlcoholHistory>) => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

const INITIAL_SOCIAL_HISTORY: SocialHistoryData = {
  tobacco: { status: 'NEVER' },
  alcohol: { status: 'NEVER' },
  substanceAbuse: '',
  sexualHistory: '',
  livingSituation: '',
  travelHistory: '',
};

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<HistorySession>({
    id: Math.random().toString(36).substr(2, 9),
    startTime: Date.now(),
    mode: 'HINT',
    currentStage: 'BIODATA',
    data: {
      biodata: {},
      chiefComplaints: [],
      hpi: {},
      pmh: '',
      drugHistory: '',
      familyHistory: '',
      socialHistory: INITIAL_SOCIAL_HISTORY,
      ros: {},
    },
  });

  const setMode = useCallback((mode: AssistanceMode) => {
    setSession((prev) => ({ ...prev, mode }));
  }, []);

  const nextStage = useCallback(() => {
    const currentIndex = STAGE_ORDER.indexOf(session.currentStage);
    if (currentIndex < STAGE_ORDER.length - 1) {
      setSession((prev) => ({
        ...prev,
        currentStage: STAGE_ORDER[currentIndex + 1],
      }));
    }
  }, [session.currentStage]);

  const prevStage = useCallback(() => {
    const currentIndex = STAGE_ORDER.indexOf(session.currentStage);
    if (currentIndex > 0) {
      setSession((prev) => ({
        ...prev,
        currentStage: STAGE_ORDER[currentIndex - 1],
      }));
    }
  }, [session.currentStage]);

  const updateBiodata = useCallback((data: Partial<PatientBiodata>) => {
    setSession((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        biodata: { ...prev.data.biodata, ...data },
      },
    }));
  }, []);

  const addChiefComplaint = useCallback((cc: string) => {
    setSession((prev) => {
      if (prev.data.chiefComplaints.length >= 5) return prev;
      return {
        ...prev,
        data: {
          ...prev.data,
          chiefComplaints: [...prev.data.chiefComplaints, { text: cc }],
        },
      };
    });
  }, []);

  const removeChiefComplaint = useCallback((index: number) => {
    setSession((prev) => {
      const newCCs = [...prev.data.chiefComplaints];
      newCCs.splice(index, 1);

      const newHpi = { ...prev.data.hpi };
      delete newHpi[index];

      return {
        ...prev,
        data: {
          ...prev.data,
          chiefComplaints: newCCs,
          hpi: newHpi,
        },
      };
    });
  }, []);

  const updateCCSystem = useCallback((index: number, system: MedicalSystem) => {
    setSession((prev) => {
      const newCCs = [...prev.data.chiefComplaints];
      newCCs[index] = { ...newCCs[index], system };
      return {
        ...prev,
        data: {
          ...prev.data,
          chiefComplaints: newCCs,
        },
      };
    });
  }, []);

  const updateFiveCs = useCallback(
    (index: number, data: Partial<FiveCsData>) => {
      setSession((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          hpi: {
            ...prev.data.hpi,
            [index]: { ...prev.data.hpi[index], ...data } as FiveCsData,
          },
        },
      }));
    },
    [],
  );

  const updateROS = useCallback((system: MedicalSystem, finding: string) => {
    setSession((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        ros: {
          ...prev.data.ros,
          [system]: finding,
        },
      },
    }));
  }, []);

  const updatePMH = useCallback((pmh: string) => {
    setSession((prev) => ({
      ...prev,
      data: { ...prev.data, pmh },
    }));
  }, []);

  const updateDrugHistory = useCallback((drugHistory: string) => {
    setSession((prev) => ({
      ...prev,
      data: { ...prev.data, drugHistory },
    }));
  }, []);

  const updateFamilyHistory = useCallback((familyHistory: string) => {
    setSession((prev) => ({
      ...prev,
      data: { ...prev.data, familyHistory },
    }));
  }, []);

  const updateSocialHistory = useCallback(
    (data: Partial<SocialHistoryData>) => {
      setSession((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          socialHistory: { ...prev.data.socialHistory, ...data },
        },
      }));
    },
    [],
  );

  const updateTobacco = useCallback((data: Partial<TobaccoHistory>) => {
    setSession((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        socialHistory: {
          ...prev.data.socialHistory,
          tobacco: { ...prev.data.socialHistory.tobacco, ...data },
        },
      },
    }));
  }, []);

  const updateAlcohol = useCallback((data: Partial<AlcoholHistory>) => {
    setSession((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        socialHistory: {
          ...prev.data.socialHistory,
          alcohol: { ...prev.data.socialHistory.alcohol, ...data },
        },
      },
    }));
  }, []);

  const value = useMemo(
    () => ({
      session,
      setMode,
      nextStage,
      prevStage,
      updateBiodata,
      addChiefComplaint,
      removeChiefComplaint,
      updateCCSystem,
      updateFiveCs,
      updateROS,
      updatePMH,
      updateDrugHistory,
      updateFamilyHistory,
      updateSocialHistory,
      updateTobacco,
      updateAlcohol,
    }),
    [
      session,
      setMode,
      nextStage,
      prevStage,
      updateBiodata,
      addChiefComplaint,
      removeChiefComplaint,
      updateCCSystem,
      updateFiveCs,
      updateROS,
      updatePMH,
      updateDrugHistory,
      updateFamilyHistory,
      updateSocialHistory,
      updateTobacco,
      updateAlcohol,
    ],
  );

  return (
    <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
}
