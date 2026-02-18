'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/SessionContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Stethoscope,
  FileText,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { analyzePMH } from '@/lib/ai-actions';
import { toast } from 'sonner';

interface PmhCondition {
  condition: string;
  duration: string;
  managedBy: string; // GP, Specialist, etc.
}

export function PmhForm() {
  const {
    pmhData,
    setPmhData,
    nextStage,
    prevStage,
    biodata,
    presentingComplaints,
    addHint,
    setIsAnalyzing,
    saveCurrentSession,
    isAnalyzing: isAnalyzingGlobal,
  } = useSession();
  // Wait, useSession doesn't have updateAIContext. I should check how AI is triggered.
  // In ROS form, it uses analyzeROS directly.

  const [conditions, setConditions] = useState<PmhCondition[]>([]);
  const [surgicalHistory, setSurgicalHistory] = useState('');
  const [notes, setNotes] = useState('');

  // Parse pmhData string back to object if possible, or init
  useEffect(() => {
    if (pmhData) {
      try {
        const parsed = JSON.parse(pmhData);
        setConditions(parsed.conditions || []);
        setSurgicalHistory(parsed.surgicalHistory || '');
        setNotes(parsed.notes || '');
      } catch (e) {
        // Fallback if simple string
        setNotes(pmhData);
      }
    }
  }, []); // Only on mount

  // Save on change
  useEffect(() => {
    const data = JSON.stringify({ conditions, surgicalHistory, notes });
    setPmhData(data);
  }, [conditions, surgicalHistory, notes, setPmhData]);

  const addCondition = () => {
    setConditions([
      ...conditions,
      { condition: '', duration: '', managedBy: '' },
    ]);
  };

  const removeCondition = (index: number) => {
    const newConditions = [...conditions];
    newConditions.splice(index, 1);
    setConditions(newConditions);
  };

  const updateCondition = (
    index: number,
    field: keyof PmhCondition,
    value: string,
  ) => {
    const newConditions = [...conditions];
    newConditions[index][field] = value;
    setConditions(newConditions);
  };

  const handleAIAnalysis = async () => {
    if (conditions.length === 0 && !surgicalHistory && !notes) {
      toast.error('Please enter some data before analyzing.');
      return;
    }

    toast.info(
      'Analysis started. You can continue with history taking while Pal works.',
    );
    await saveCurrentSession();
    setIsAnalyzing(true);

    const dataSummary = `
      Patient Age: ${biodata?.age}, Gender: ${biodata?.gender}
      Conditions: ${conditions
        .map((c) => `${c.condition} (${c.duration})`)
        .join(', ')}
      Surgical: ${surgicalHistory}
      Notes: ${notes}
    `;

    try {
      const context = {
        biodata,
        presentingComplaints,
      };
      const result = await analyzePMH(dataSummary, context);
      addHint(result, 'PMH Analysis');
      toast.success('Analysis complete! Check the hint panel.');

      // Scroll to hint panel
      setTimeout(() => {
        document
          .getElementById('hx-pal-hint-panel')
          ?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      toast.error('Failed to analyze PMH.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className='flex flex-col h-full max-w-4xl mx-auto p-4 md:p-6 space-y-6 overflow-y-auto pb-24'>
      <div className='space-y-2'>
        <h1 className='text-xl font-bold uppercase tracking-wider text-primary flex items-center gap-2'>
          <FileText className='w-8 h-8' />
          Past Medical History
        </h1>
        <p className='text-sm text-muted-foreground'>
          Record past medical conditions and surgeries.
        </p>
      </div>

      <div className='grid gap-6 grid-cols-1'>
        <div className='space-y-6'>
          {/* Conditions List */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle>Medical Conditions</CardTitle>
              <Button
                onClick={addCondition}
                size='sm'
                variant='outline'
              >
                <Plus className='w-4 h-4 mr-2' /> Add Condition
              </Button>
            </CardHeader>
            <CardContent className='space-y-4'>
              {conditions.length === 0 && (
                <div className='text-center py-4 text-muted-foreground text-sm'>
                  No specific conditions recorded. Add one if applicable.
                </div>
              )}
              {conditions.map((item, index) => (
                <div
                  key={index}
                  className='grid gap-3 p-3 border rounded-md relative group'
                >
                  <Button
                    variant='ghost'
                    size='icon'
                    className='absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive'
                    onClick={() => removeCondition(index)}
                  >
                    <Trash2 className='w-3 h-3' />
                  </Button>
                  <div className='grid gap-2'>
                    <Label>Condition</Label>
                    <Input
                      value={item.condition}
                      onChange={(e) =>
                        updateCondition(index, 'condition', e.target.value)
                      }
                      placeholder='e.g. Hypertension, Asthma'
                    />
                  </div>
                  <div className='grid grid-cols-2 gap-3'>
                    <div className='grid gap-2'>
                      <Label>Duration/Since</Label>
                      <Input
                        value={item.duration}
                        onChange={(e) =>
                          updateCondition(index, 'duration', e.target.value)
                        }
                        placeholder='e.g. 5 years, 2018'
                      />
                    </div>
                    <div className='grid gap-2'>
                      <Label>Managed By</Label>
                      <Input
                        value={item.managedBy}
                        onChange={(e) =>
                          updateCondition(index, 'managedBy', e.target.value)
                        }
                        placeholder='e.g. GP, None'
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Surgical History */}
          <Card>
            <CardHeader>
              <CardTitle>Surgical History</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={surgicalHistory}
                onChange={(e) => setSurgicalHistory(e.target.value)}
                placeholder='List any past surgeries, dates, and complications...'
                className='min-h-[100px]'
              />
            </CardContent>
          </Card>

          {/* Extra Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder='Any other relevant history (e.g. childhood illnesses)...'
                className='min-h-[80px]'
              />
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
          Back
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
            {isAnalyzingGlobal ? 'Analyzing...' : 'Analyze PMH'}
          </Button>

          <Button
            onClick={nextStage}
            className='gap-2 shadow-sm justify-center'
          >
            Next: Drug History
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
