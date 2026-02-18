'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/SessionContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  ChevronRight,
  ChevronLeft,
  Search,
  Plus,
  Trash2,
  Pill,
  ShieldAlert,
  Loader2,
  Sparkles,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { analyzeDH } from '@/lib/ai-actions';
import { toast } from 'sonner';

interface Medication {
  name: string;
  notes: string;
}

interface Allergy {
  agent: string;
  reaction: string;
  severity: string;
}

export function DrugHistoryForm() {
  const {
    dhData,
    setDhData,
    nextStage,
    prevStage,
    biodata,
    pmhData,
    presentingComplaints,
    addHint,
    setIsAnalyzing,
    saveCurrentSession,
    isAnalyzing: isAnalyzingGlobal,
  } = useSession();

  const [medications, setMedications] = useState<Medication[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [nkda, setNkda] = useState(false);
  const [notes, setNotes] = useState('');

  // Load data
  useEffect(() => {
    if (dhData) {
      try {
        const parsed = JSON.parse(dhData);
        setMedications(parsed.medications || []);
        setAllergies(parsed.allergies || []);
        setNkda(parsed.nkda || false);
        setNotes(parsed.notes || '');
      } catch (e) {
        setNotes(dhData);
      }
    }
  }, []);

  // Save data
  useEffect(() => {
    const data = JSON.stringify({ medications, allergies, nkda, notes });
    setDhData(data);
  }, [medications, allergies, nkda, notes, setDhData]);

  const addMedication = () => {
    setMedications([...medications, { name: '', notes: '' }]);
  };

  const removeMedication = (index: number) => {
    const newMeds = [...medications];
    newMeds.splice(index, 1);
    setMedications(newMeds);
  };

  const updateMedication = (
    index: number,
    field: keyof Medication,
    value: string,
  ) => {
    const newMeds = [...medications];
    newMeds[index][field] = value;
    setMedications(newMeds);
  };

  const addAllergy = () => {
    setAllergies([...allergies, { agent: '', reaction: '', severity: 'Mild' }]);
    setNkda(false); // Disable NKDA if adding an allergy
  };

  const removeAllergy = (index: number) => {
    const newAllergies = [...allergies];
    newAllergies.splice(index, 1);
    setAllergies(newAllergies);
  };

  const updateAllergy = (
    index: number,
    field: keyof Allergy,
    value: string,
  ) => {
    const newAllergies = [...allergies];
    newAllergies[index][field] = value;
    setAllergies(newAllergies);
  };

  const toggleNkda = (checked: boolean) => {
    setNkda(checked);
    if (checked) {
      setAllergies([]); // Clear allergies if NKDA is true
    }
  };

  const handleAIAnalysis = async () => {
    toast.info(
      'Analysis started. You can continue with history taking while Pal works.',
    );
    await saveCurrentSession();

    // Construct context object
    const context = {
      biodata,
      pmhData,
      presentingComplaints,
    };

    const dhDataForAI = {
      medications,
      allergies,
      nkda,
      notes,
    };

    setIsAnalyzing(true);
    try {
      const result = await analyzeDH(JSON.stringify(dhDataForAI), context);
      addHint(result, 'Interaction Check');
      toast.success('Analysis complete! Check the hint panel.');

      // Scroll to hint panel
      setTimeout(() => {
        document
          .getElementById('hx-pal-hint-panel')
          ?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      toast.error('Failed to analyze Drug History.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className='flex flex-col h-full max-w-4xl mx-auto p-4 md:p-6 space-y-6 overflow-y-auto pb-24'>
      <div className='space-y-2'>
        <h1 className='text-xl font-bold uppercase tracking-wider text-primary flex items-center gap-2'>
          <Pill className='w-8 h-8' />
          Drug History & Allergies
        </h1>
        <p className='text-sm text-muted-foreground'>
          Record current medications and allergies.
        </p>
      </div>

      <div className='grid gap-6 grid-cols-1'>
        <div className='space-y-6'>
          {/* Medications */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle>Current Medications</CardTitle>
              <Button
                onClick={addMedication}
                size='sm'
                variant='outline'
              >
                <Plus className='w-4 h-4 mr-2' /> Add Med
              </Button>
            </CardHeader>
            <CardContent className='space-y-4'>
              {medications.length === 0 && (
                <div className='text-center py-4 text-muted-foreground text-sm'>
                  No medications recorded.
                </div>
              )}
              {medications.map((med, index) => (
                <div
                  key={index}
                  className='p-3 border rounded-md relative group grid gap-3'
                >
                  <Button
                    variant='ghost'
                    size='icon'
                    className='absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive'
                    onClick={() => removeMedication(index)}
                  >
                    <Trash2 className='w-3 h-3' />
                  </Button>
                  <div className='grid gap-2'>
                    <Label>Drug Name</Label>
                    <Input
                      value={med.name}
                      onChange={(e) =>
                        updateMedication(index, 'name', e.target.value)
                      }
                      placeholder='e.g. Paracetamol'
                    />
                  </div>
                  <div className='grid gap-2'>
                    <Label>Notes / Details</Label>
                    <Input
                      value={med.notes}
                      onChange={(e) =>
                        updateMedication(index, 'notes', e.target.value)
                      }
                      placeholder='e.g. For back pain, occasional'
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Allergies */}
          <Card className='border-red-200'>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-red-700 flex items-center gap-2'>
                <AlertTriangle className='w-5 h-5' />
                Allergies
              </CardTitle>
              <div className='flex items-center space-x-2'>
                <Label
                  htmlFor='nkda'
                  className='text-xs font-semibold'
                >
                  NKDA
                </Label>
                <Switch
                  id='nkda'
                  checked={nkda}
                  onCheckedChange={toggleNkda}
                />
              </div>
            </CardHeader>
            <CardContent className='space-y-4 pt-4'>
              {nkda && (
                <div className='bg-green-50 text-green-700 p-3 rounded-md flex items-center gap-2 text-sm font-medium border border-green-200'>
                  <Check className='w-4 h-4' /> No Known Drug Allergies
                </div>
              )}
              {!nkda && (
                <>
                  {allergies.length === 0 && (
                    <div className='text-center py-2 text-muted-foreground text-sm'>
                      No allergies recorded.
                    </div>
                  )}
                  {allergies.map((allergy, index) => (
                    <div
                      key={index}
                      className='p-3 border border-red-100 bg-red-50/50 rounded-md relative grid gap-3'
                    >
                      <Button
                        variant='ghost'
                        size='icon'
                        className='absolute top-1 right-1 h-6 w-6 text-red-400 hover:text-red-600'
                        onClick={() => removeAllergy(index)}
                      >
                        <Trash2 className='w-3 h-3' />
                      </Button>
                      <div className='grid gap-2'>
                        <Label>Agent/Drug</Label>
                        <Input
                          value={allergy.agent}
                          onChange={(e) =>
                            updateAllergy(index, 'agent', e.target.value)
                          }
                          placeholder='e.g. Penicillin'
                          className='border-red-200'
                        />
                      </div>
                      <div className='grid gap-2'>
                        <Label>Reaction</Label>
                        <Input
                          value={allergy.reaction}
                          onChange={(e) =>
                            updateAllergy(index, 'reaction', e.target.value)
                          }
                          placeholder='e.g. Rash, Anaphylaxis'
                        />
                      </div>
                    </div>
                  ))}
                  <Button
                    onClick={addAllergy}
                    size='sm'
                    variant='outline'
                    className='w-full border-red-200 text-red-700 hover:bg-red-50'
                  >
                    <Plus className='w-4 h-4 mr-2' /> Add Allergy
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation & Actions */}
      <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between py-6 border-t border-border gap-4'>
        <Button
          variant='ghost'
          onClick={prevStage}
          className='gap-2 justify-center sm:justify-start'
        >
          <ChevronLeft size={16} />
          Back to PMH
        </Button>

        <div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto'>
          <Button
            variant='secondary'
            onClick={handleAIAnalysis}
            disabled={isAnalyzingGlobal}
            className='gap-2 shadow-sm font-semibold justify-center'
          >
            {isAnalyzingGlobal ? (
              <Loader2 className='w-4 h-4 animate-spin text-primary' />
            ) : (
              <Sparkles className='w-4 h-4 text-primary' />
            )}
            {isAnalyzingGlobal ? 'Checking...' : 'Check Interactions'}
          </Button>

          <Button
            onClick={nextStage}
            className='gap-2 shadow-sm justify-center'
          >
            Next: Review of Systems
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
