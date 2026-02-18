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
  Users,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { analyzeFH } from '@/lib/ai-actions';
import { toast } from 'sonner';

interface FamilyMember {
  relation: string;
  condition: string;
  ageOfOnset?: string;
  status?: 'Alive' | 'Deceased';
}

export function FamilyHistoryForm() {
  const {
    fhData,
    setFhData,
    nextStage,
    prevStage,
    biodata,
    presentingComplaints,
    pmhData,
    addHint,
    setIsAnalyzing,
    saveCurrentSession,
    isAnalyzing: isAnalyzingGlobal,
  } = useSession();

  const [relatives, setRelatives] = useState<FamilyMember[]>([]);
  const [notes, setNotes] = useState('');

  // Load data
  useEffect(() => {
    if (fhData) {
      try {
        const parsed = JSON.parse(fhData);
        setRelatives(parsed.relatives || []);
        setNotes(parsed.notes || '');
      } catch (e) {
        setNotes(fhData);
      }
    }
  }, []);

  // Save data
  useEffect(() => {
    const data = JSON.stringify({ relatives, notes });
    setFhData(data);
  }, [relatives, notes, setFhData]);

  const addRelative = () => {
    setRelatives([
      ...relatives,
      { relation: '', condition: '', status: 'Alive' },
    ]);
  };

  const removeRelative = (index: number) => {
    const newRelatives = [...relatives];
    newRelatives.splice(index, 1);
    setRelatives(newRelatives);
  };

  const updateRelative = (
    index: number,
    field: keyof FamilyMember,
    value: string,
  ) => {
    const newRelatives = [...relatives];
    // @ts-ignore
    newRelatives[index][field] = value;
    setRelatives(newRelatives);
  };

  const handleAIAnalysis = async () => {
    toast.info(
      'Analysis started. You can continue with history taking while Pal works.',
    );
    await saveCurrentSession();
    setIsAnalyzing(true);

    const context = {
      biodata,
      presentingComplaints,
      pmhData,
    };

    const dataSummary = `
       Family History:
       ${relatives.map((r) => `${r.relation} (${r.status}): ${r.condition} ${r.ageOfOnset ? `(Onset: ${r.ageOfOnset})` : ''}`).join('\n')}
       Notes: ${notes}
     `;

    try {
      const result = await analyzeFH(dataSummary, context);
      addHint(result, 'Family History Analysis');
      toast.success('Analysis complete! Check the hint panel.');

      // Scroll to hint panel
      setTimeout(() => {
        document
          .getElementById('hx-pal-hint-panel')
          ?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      toast.error('Failed to analyze Family History.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className='flex flex-col h-full max-w-4xl mx-auto p-4 md:p-6 space-y-6 overflow-y-auto pb-24'>
      <div className='space-y-2'>
        <h1 className='text-xl font-bold uppercase tracking-wider text-primary flex items-center gap-2'>
          <Users className='w-8 h-8' />
          Family History
        </h1>
        <p className='text-sm text-muted-foreground'>
          Record hereditary conditions and health status of immediate relatives.
        </p>
      </div>

      <div className='grid gap-6 grid-cols-1'>
        <div className='space-y-6'>
          {/* Relatives List */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle>Family Members</CardTitle>
              <Button
                onClick={addRelative}
                size='sm'
                variant='outline'
              >
                <Plus className='w-4 h-4 mr-2' /> Add Relative
              </Button>
            </CardHeader>
            <CardContent className='space-y-4'>
              {relatives.length === 0 && (
                <div className='text-center py-4 text-muted-foreground text-sm'>
                  No family history recorded.
                </div>
              )}
              {relatives.map((member, index) => (
                <div
                  key={index}
                  className='grid gap-3 p-3 border rounded-md relative group'
                >
                  <Button
                    variant='ghost'
                    size='icon'
                    className='absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive'
                    onClick={() => removeRelative(index)}
                  >
                    <Trash2 className='w-3 h-3' />
                  </Button>
                  <div className='grid grid-cols-2 gap-3'>
                    <div className='grid gap-2'>
                      <Label>Relation</Label>
                      <Input
                        value={member.relation}
                        onChange={(e) =>
                          updateRelative(index, 'relation', e.target.value)
                        }
                        placeholder='e.g. Father, Mother'
                      />
                    </div>
                    <div className='grid gap-2'>
                      <Label>Status</Label>
                      <select
                        className='flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                        value={member.status}
                        onChange={(e) =>
                          updateRelative(index, 'status', e.target.value)
                        }
                      >
                        <option value='Alive'>Alive</option>
                        <option value='Deceased'>Deceased</option>
                      </select>
                    </div>
                  </div>
                  <div className='grid gap-2'>
                    <Label>Conditions / Cause of Death</Label>
                    <Input
                      value={member.condition}
                      onChange={(e) =>
                        updateRelative(index, 'condition', e.target.value)
                      }
                      placeholder='e.g. Type 2 Diabetes, MI at 50'
                    />
                  </div>
                  <div className='grid gap-2'>
                    <Label>Age of Onset (if relevant)</Label>
                    <Input
                      value={member.ageOfOnset}
                      onChange={(e) =>
                        updateRelative(index, 'ageOfOnset', e.target.value)
                      }
                      placeholder='e.g. 45'
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder='Any other relevant family history or genetic conditions...'
                className='min-h-[100px]'
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
          Back to ROS
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
            {isAnalyzingGlobal ? 'Analyzing...' : 'Analyze FH'}
          </Button>

          <Button
            onClick={nextStage}
            className='gap-2 shadow-sm justify-center'
          >
            Next: Social History
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
