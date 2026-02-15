'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/SessionContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  Briefcase,
  Home,
  Cigarette,
  Wine,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
} from 'lucide-react';
import { analyzeSH } from '@/lib/ai-actions';
import { toast } from 'sonner';

export function SocialHistoryForm() {
  const {
    shData,
    setShData,
    nextStage,
    prevStage,
    addHint,
    biodata,
    presentingComplaints,
  } = useSession();

  // Tobacco State
  const [tobaccoStatus, setTobaccoStatus] = useState<
    'NEVER' | 'CURRENT' | 'FORMER'
  >('NEVER');
  const [sticksPerDay, setSticksPerDay] = useState<number>(0);
  const [smokingYears, setSmokingYears] = useState<number>(0);
  const [packYears, setPackYears] = useState<number>(0);

  // Alcohol State
  const [alcoholStatus, setAlcoholStatus] = useState<
    'NEVER' | 'CURRENT' | 'FORMER'
  >('NEVER');
  const [unitsPerWeek, setUnitsPerWeek] = useState<number>(0);
  const [alcoholYears, setAlcoholYears] = useState<number>(0);

  // Other State
  const [livingSituation, setLivingSituation] = useState('');
  const [substanceAbuse, setSubstanceAbuse] = useState('');
  const [sexualHistory, setSexualHistory] = useState('');
  const [travelHistory, setTravelHistory] = useState('');
  const [extraNotes, setExtraNotes] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load data
  useEffect(() => {
    if (shData) {
      try {
        const parsed = JSON.parse(shData);
        if (parsed.tobacco) {
          setTobaccoStatus(parsed.tobacco.status || 'NEVER');
          setSticksPerDay(parsed.tobacco.sticksPerDay || 0);
          setSmokingYears(parsed.tobacco.years || 0);
          setPackYears(parsed.tobacco.packYears || 0);
        }
        if (parsed.alcohol) {
          setAlcoholStatus(parsed.alcohol.status || 'NEVER');
          setUnitsPerWeek(parsed.alcohol.unitsPerWeek || 0);
          setAlcoholYears(parsed.alcohol.years || 0);
        }
        setLivingSituation(parsed.livingSituation || '');
        setSubstanceAbuse(parsed.substanceAbuse || '');
        setSexualHistory(parsed.sexualHistory || '');
        setTravelHistory(parsed.travelHistory || '');
        setExtraNotes(parsed.extraNotes || '');
      } catch (e) {
        console.error('Failed to parse SH data', e);
      }
    }
  }, []);

  // Pack Years Calculation
  useEffect(() => {
    const calculated = (sticksPerDay / 20) * smokingYears;
    setPackYears(Number(calculated.toFixed(2)));
  }, [sticksPerDay, smokingYears]);

  // Save data
  useEffect(() => {
    const data = JSON.stringify({
      tobacco: {
        status: tobaccoStatus,
        sticksPerDay,
        years: smokingYears,
        packYears,
      },
      alcohol: {
        status: alcoholStatus,
        unitsPerWeek,
        years: alcoholYears,
      },
      livingSituation,
      substanceAbuse,
      sexualHistory,
      travelHistory,
      extraNotes,
    });
    setShData(data);
  }, [
    tobaccoStatus,
    sticksPerDay,
    smokingYears,
    packYears,
    alcoholStatus,
    unitsPerWeek,
    alcoholYears,
    livingSituation,
    substanceAbuse,
    sexualHistory,
    travelHistory,
    extraNotes,
    setShData,
  ]);

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const summary = `
        Tobacco: ${tobaccoStatus} (${packYears} pack-years)
        Alcohol: ${alcoholStatus} (${unitsPerWeek} units/week)
        Living: ${livingSituation}
        Substances: ${substanceAbuse}
      `;
      const result = await analyzeSH(summary, {
        biodata,
        presentingComplaints,
      });
      addHint(result, 'Social History Analysis');
      toast.success('Analysis complete!');
    } catch {
      toast.error('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className='flex flex-col h-full max-w-4xl mx-auto p-4 md:p-6 space-y-6 overflow-y-auto pb-24'>
      <div className='space-y-2'>
        <h1 className='text-xl font-bold uppercase tracking-wider text-primary flex items-center gap-2'>
          <Briefcase className='w-8 h-8' />
          Social History
        </h1>
        <p className='text-sm text-muted-foreground'>
          Record lifestyle factors, substance use, and social support.
        </p>
      </div>

      <div className='grid gap-8 grid-cols-1'>
        {/* Tobacco Section */}
        <Card className='border-2 border-primary/10 shadow-none rounded-none'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-bold uppercase tracking-widest flex items-center gap-2'>
              <Cigarette className='w-4 h-4 text-primary' />
              Tobacco / Smoking History
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='space-y-3'>
              <Label className='text-xs uppercase text-muted-foreground'>
                Status
              </Label>
              <div className='flex flex-wrap gap-2'>
                {['NEVER', 'CURRENT', 'FORMER'].map((s) => (
                  <Button
                    key={s}
                    variant={tobaccoStatus === s ? 'default' : 'outline'}
                    size='sm'
                    className='rounded-none uppercase text-xs font-bold tracking-tighter flex-1 min-w-[80px] gap-2'
                    onClick={() => setTobaccoStatus(s as any)}
                  >
                    {tobaccoStatus === s && (
                      <CheckCircle2 className='w-3 h-3' />
                    )}
                    {s}
                  </Button>
                ))}
              </div>
            </div>

            {(tobaccoStatus === 'CURRENT' || tobaccoStatus === 'FORMER') && (
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2'>
                <div className='space-y-2'>
                  <Label className='text-[10px] uppercase'>
                    Sticks per day
                  </Label>
                  <Input
                    type='number'
                    value={sticksPerDay || ''}
                    onChange={(e) => setSticksPerDay(Number(e.target.value))}
                    placeholder='0'
                  />
                </div>
                <div className='space-y-2'>
                  <Label className='text-[10px] uppercase'>
                    Years of smoking
                  </Label>
                  <Input
                    type='number'
                    value={smokingYears || ''}
                    onChange={(e) => setSmokingYears(Number(e.target.value))}
                    placeholder='0'
                  />
                </div>
                <div className='space-y-2'>
                  <Label className='text-[10px] uppercase text-primary font-bold'>
                    Calculated Pack-Years
                  </Label>
                  <div className='h-10 flex items-center px-3 bg-primary/5 border border-primary/20 font-black text-primary'>
                    {packYears}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alcohol Section */}
        <Card className='border-2 border-primary/10 shadow-none rounded-none'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-bold uppercase tracking-widest flex items-center gap-2'>
              <Wine className='w-4 h-4 text-primary' />
              Alcohol History
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='space-y-3'>
              <Label className='text-xs uppercase text-muted-foreground'>
                Status
              </Label>
              <div className='flex flex-wrap gap-2'>
                {['NEVER', 'CURRENT', 'FORMER'].map((s) => (
                  <Button
                    key={s}
                    variant={alcoholStatus === s ? 'default' : 'outline'}
                    size='sm'
                    className='rounded-none uppercase text-xs font-bold tracking-tighter flex-1 min-w-[80px] gap-2'
                    onClick={() => setAlcoholStatus(s as any)}
                  >
                    {alcoholStatus === s && (
                      <CheckCircle2 className='w-3 h-3' />
                    )}
                    {s}
                  </Button>
                ))}
              </div>
            </div>

            {(alcoholStatus === 'CURRENT' || alcoholStatus === 'FORMER') && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2'>
                <div className='space-y-2'>
                  <Label className='text-[10px] uppercase'>
                    Units per week
                  </Label>
                  <Input
                    type='number'
                    value={unitsPerWeek || ''}
                    onChange={(e) => setUnitsPerWeek(Number(e.target.value))}
                    placeholder='0'
                  />
                </div>
                <div className='space-y-2'>
                  <Label className='text-[10px] uppercase'>
                    Years of drinking
                  </Label>
                  <Input
                    type='number'
                    value={alcoholYears || ''}
                    onChange={(e) => setAlcoholYears(Number(e.target.value))}
                    placeholder='0'
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Social Support & Other */}
        <div className='grid gap-6 md:grid-cols-2'>
          <div className='space-y-4'>
            <Label className='flex items-center gap-2'>
              <Home className='w-4 h-4' /> Living Situation
            </Label>
            <Textarea
              value={livingSituation}
              onChange={(e) => setLivingSituation(e.target.value)}
              placeholder='Describe housing, who they live with, social support/caregivers...'
              className='min-h-[100px] rounded-none'
            />
          </div>
          <div className='space-y-4'>
            <Label>Substance Abuse</Label>
            <Textarea
              value={substanceAbuse}
              onChange={(e) => setSubstanceAbuse(e.target.value)}
              placeholder='Recreational drugs, intravenous use...'
              className='min-h-[100px] rounded-none'
            />
          </div>
          <div className='space-y-4'>
            <Label>Sexual History</Label>
            <Input
              value={sexualHistory}
              onChange={(e) => setSexualHistory(e.target.value)}
              placeholder='Relationships, high-risk behavior...'
              className='rounded-none'
            />
          </div>
          <div className='space-y-4'>
            <Label>Travel History</Label>
            <Input
              value={travelHistory}
              onChange={(e) => setTravelHistory(e.target.value)}
              placeholder='Recent travel to endemic areas...'
              className='rounded-none'
            />
          </div>
        </div>

        {/* Extra Information */}
        <div className='space-y-4 pt-4 border-t border-border/10'>
          <Label className='text-primary font-bold uppercase tracking-widest text-xs'>
            Extra Information
          </Label>
          <Textarea
            value={extraNotes}
            onChange={(e) => setExtraNotes(e.target.value)}
            placeholder='Record obstetric history (G/P if female in reproductive stage), number of children, and any other relevant social contexts...'
            className='min-h-[120px] rounded-none border-2 border-primary/10 focus-visible:border-primary/30 transition-all'
          />
        </div>
      </div>

      <div className='flex items-center justify-between py-6 border-t border-border mt-8'>
        <Button
          variant='ghost'
          onClick={prevStage}
          className='gap-2'
        >
          <ChevronLeft size={16} />
          Back to Family History
        </Button>

        <div className='flex gap-3'>
          <Button
            variant='secondary'
            onClick={handleAIAnalysis}
            disabled={isAnalyzing}
            className='gap-2 shadow-sm font-semibold'
          >
            <Sparkles className='w-4 h-4 text-primary' />
            {isAnalyzing ? 'Analyzing...' : 'Analyze History'}
          </Button>

          <Button
            onClick={nextStage}
            className='gap-2'
          >
            Complete Session <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
