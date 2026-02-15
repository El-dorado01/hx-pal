'use client';

import React, { useState } from 'react';
import { useSession } from '@/lib/SessionContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { analyzeROS } from '@/lib/ai-actions';

const SYSTEMS = [
  {
    id: 'general',
    label: 'General / Constitutional',
    hint: 'Fever, weight loss, sweat, fatigue',
  },
  {
    id: 'cvs',
    label: 'Cardiovascular',
    hint: 'Chest pain, palpitations, orthopnea, PND, ankle swelling',
  },
  {
    id: 'rs',
    label: 'Respiratory',
    hint: 'Cough, sputum, hemoptysis, wheeze, chest pain',
  },
  {
    id: 'git',
    label: 'Gastrointestinal',
    hint: 'Nausea, vomiting, dysphagia, heartburn, pain, bowel habits',
  },
  {
    id: 'ugs',
    label: 'Urogenital',
    hint: 'Dysuria, frequency, urgency, hematuria, discharge',
  },
  {
    id: 'cns',
    label: 'Neurological',
    hint: 'Headache, fits, faints, weakness, numbness, vision',
  },
  {
    id: 'msk',
    label: 'Musculoskeletal',
    hint: 'Joint pain, swelling, stiffness, back pain',
  },
  {
    id: 'skin',
    label: 'Skin & Endocrine',
    hint: 'Rashes, lumps, heat/cold intolerance, thirst',
  },
];

export function RosForm() {
  const {
    rosData,
    setRosData,
    nextStage,
    prevStage,
    biodata,
    presentingComplaints,
    hpcData,
    addHint,
    setIsAnalyzing,
    isAnalyzing: isAnalyzingGlobal,
  } = useSession();

  const [activeSystem, setActiveSystem] = useState<string>('general');

  const handleNotesChange = (systemId: string, value: string) => {
    setRosData(systemId, value);
  };

  const markAsNAD = (systemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRosData(systemId, 'No Abnormality Detected (NAD)');
    toast.success(
      `Marked ${SYSTEMS.find((s) => s.id === systemId)?.label} as NAD`,
    );
  };

  const handleAnalyzeStreamlined = async () => {
    try {
      toast.info('Analyzing Review of Systems...');
      setIsAnalyzing(true);

      const context = {
        biodata,
        presentingComplaints,
        hpcData,
      };

      const feedback = await analyzeROS(rosData, context);
      addHint(feedback, 'ROS Analysis');
      toast.success('Analysis complete! Check the hint panel.');

      // Scroll to hint panel
      setTimeout(() => {
        document
          .getElementById('hx-pal-hint-panel')
          ?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      toast.error('Failed to analyze ROS');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const completedSystemsCount = SYSTEMS.filter(
    (s) => rosData[s.id]?.trim().length > 0,
  ).length;
  const progress = (completedSystemsCount / SYSTEMS.length) * 100;

  return (
    <div className='max-w-3xl mx-auto space-y-8'>
      {/* Header & Progress */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-bold uppercase tracking-wider text-primary'>
            Systemic Review
          </h2>
          <p className='text-sm text-muted-foreground'>
            Screen for symptoms in other systems.
          </p>
        </div>
        <div className='text-right'>
          <div className='text-2xl font-black text-primary'>
            {Math.round(progress)}%
          </div>
          <div className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
            Completed
          </div>
        </div>
      </div>

      {/* Systems Accordion */}
      <div className='border-2 border-border bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]'>
        <Accordion
          type='single'
          collapsible
          value={activeSystem}
          onValueChange={setActiveSystem}
        >
          {SYSTEMS.map((system) => {
            const hasData = rosData[system.id]?.trim().length > 0;
            const isNAD =
              rosData[system.id] === 'No Abnormality Detected (NAD)';

            return (
              <AccordionItem
                key={system.id}
                value={system.id}
                className='border-b border-border last:border-0'
              >
                <AccordionTrigger className='px-6 py-4 hover:bg-muted/50 transition-colors data-[state=open]:bg-muted/30'>
                  <div className='flex items-center gap-4 w-full text-left'>
                    <div
                      className={`p-2 rounded-full ${hasData ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}
                    >
                      {hasData ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <AlertCircle size={18} />
                      )}
                    </div>
                    <div className='flex-1'>
                      <div className='font-bold uppercase tracking-wide text-sm'>
                        {system.label}
                      </div>
                      <div className='text-xs text-muted-foreground font-medium'>
                        {system.hint}
                      </div>
                    </div>
                    {hasData && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${isNAD ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'}`}
                      >
                        {isNAD ? 'NAD' : 'Recorded'}
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className='px-6 py-6 space-y-4 bg-muted/10'>
                  <div className='flex justify-between items-center mb-2'>
                    <Label className='text-xs font-bold uppercase text-muted-foreground'>
                      Notes / Findings
                    </Label>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={(e) => markAsNAD(system.id, e)}
                      className='h-7 text-xs border-primary/20 text-primary hover:bg-primary/5 hover:text-primary'
                    >
                      Mark as NAD
                    </Button>
                  </div>
                  <Textarea
                    value={rosData[system.id] || ''}
                    onChange={(e) =>
                      handleNotesChange(system.id, e.target.value)
                    }
                    placeholder={`Enter positive or negative findings for ${system.label}...`}
                    className='min-h-[120px] resize-none bg-background'
                  />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>

      {/* Actions */}
      <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between py-6 border-t border-border gap-4'>
        <Button
          variant='ghost'
          onClick={prevStage}
          className='gap-2 text-muted-foreground hover:text-foreground justify-center sm:justify-start'
        >
          <ChevronLeft size={16} />
          Back to History
        </Button>

        <div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto'>
          <Button
            variant='secondary'
            onClick={handleAnalyzeStreamlined}
            disabled={isAnalyzingGlobal}
            className='gap-2 shadow-sm font-semibold justify-center'
          >
            <Sparkles
              size={16}
              className='text-primary'
            />
            {isAnalyzingGlobal ? 'Analyzing...' : 'Analyze ROS'}
          </Button>
          <Button
            onClick={nextStage}
            className='gap-2 shadow-sm justify-center'
          >
            Next: Family History
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
