'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/SessionContext';
import { FiveCsData, SocratesData } from '@/lib/types';
import { analyzeHPC } from '@/lib/ai-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Calendar,
  Clock,
  FileText,
  MapPin,
  Stethoscope,
  TrendingUp,
  ZoomIn,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  History as HistoryIcon,
} from 'lucide-react';
import { toast } from 'sonner';

const SOCRATES_FIELDS = [
  { key: 'site', label: 'Site', placeholder: 'Where is the pain exactly?' },
  {
    key: 'onset',
    label: 'Onset',
    placeholder: 'When did it start? Sudden or gradual?',
  },
  {
    key: 'character',
    label: 'Character',
    placeholder: 'Describe the pain (e.g. sharp, dull, burning)',
  },
  {
    key: 'radiation',
    label: 'Radiation',
    placeholder: 'Does the pain move anywhere else?',
  },
  {
    key: 'associations',
    label: 'Associations',
    placeholder: 'Any other symptoms associated with it?',
  },
  {
    key: 'timeCourse',
    label: 'Time Course',
    placeholder: 'Does it come and go? Getting better or worse?',
  },
  {
    key: 'exacerbatingRelieving',
    label: 'Exacerbating/Relieving',
    placeholder: 'What makes it better or worse?',
  },
  {
    key: 'severity',
    label: 'Severity',
    placeholder: 'Score out of 10 (e.g. 7/10)',
  },
];

const FIVE_CS_FIELDS = [
  {
    key: 'course',
    label: 'Course',
    icon: Activity,
    placeholder: 'How has it progressed over time?',
  },
  {
    key: 'cause',
    label: 'Cause',
    icon: MapPin,
    placeholder: 'What do you think caused it? Any triggers?',
  },
  {
    key: 'complications',
    label: 'Complications',
    icon: Activity,
    placeholder: 'Has it affected your daily life or caused other issues?',
  },
  {
    key: 'care',
    label: 'Care',
    icon: Stethoscope,
    placeholder: 'Have you taken any medication or seen a doctor for this?',
  },
];

export function HistoryForm() {
  const {
    presentingComplaints,
    biodata,
    hpcData,
    setHpcData,
    nextStage,
    prevStage,
    addHint,
  } = useSession();

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentComplaint = presentingComplaints[currentIndex];

  // Local state for the current form to allow editing before saving
  const [formData, setFormData] = useState<FiveCsData>({
    character: '',
    course: '',
    cause: '',
    complications: '',
    care: '',
    extraNotes: '',
  });

  const isPainComplaint = React.useMemo(() => {
    if (!currentComplaint) return false;
    const text = currentComplaint.complaint.toLowerCase();
    return (
      text.includes('pain') || text.includes('ache') || text.includes('hurt')
    );
  }, [currentComplaint]);

  // Load saved data when switching complaints
  useEffect(() => {
    if (currentComplaint) {
      const savedData = hpcData[currentComplaint.id];
      if (savedData) {
        setFormData(savedData);
      } else {
        // Reset form for new complaint
        setFormData({
          character: isPainComplaint
            ? {
                site: '',
                onset: '',
                character: '',
                radiation: '',
                associations: '',
                timeCourse: '',
                exacerbatingRelieving: '',
                severity: '',
              }
            : '',
          course: '',
          cause: '',
          complications: '',
          care: '',
          extraNotes: '',
        });
      }
    }
  }, [currentComplaint, hpcData, isPainComplaint]);

  const handleInputChange = (field: keyof FiveCsData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocratesChange = (field: keyof SocratesData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      character: {
        ...(prev.character as SocratesData),
        [field]: value,
      },
    }));
  };

  const handleNext = () => {
    if (!currentComplaint) return;

    // Validate
    const characterValid =
      typeof formData.character === 'string'
        ? formData.character.trim().length > 0
        : Object.values(formData.character as SocratesData).some(
            (v) => v.trim().length > 0,
          );

    if (!characterValid) {
      toast.error('Please describe the character of the complaint');
      return;
    }

    // Save current data
    setHpcData(currentComplaint.id, formData);

    if (currentIndex < presentingComplaints.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      window.scrollTo(0, 0);
    } else {
      // Completed all complaints
      toast.success('HPC completed for all complaints!');
      nextStage();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      window.scrollTo(0, 0);
    } else {
      prevStage();
    }
  };

  const handleAnalyzeWithPal = async () => {
    if (!currentComplaint) return;

    try {
      // Save current data first
      setHpcData(currentComplaint.id, formData);

      toast.info('Analyzing HPC with Pal...');

      const context = {
        biodata,
        presentingComplaints,
        otherHpcData: hpcData,
      };

      const feedback = await analyzeHPC(
        currentComplaint.complaint,
        formData,
        context,
      );
      addHint(feedback, 'HPC Analysis');
      toast.success('Analysis complete! Check the hint panel.');
    } catch (error) {
      toast.error('Failed to analyze HPC');
      console.error(error);
    }
  };

  if (!currentComplaint) return null;

  return (
    <div className='flex flex-col h-full max-w-4xl mx-auto p-4 md:p-6 space-y-6 overflow-y-auto pb-24'>
      <div className='space-y-2'>
        <h1 className='text-xl font-bold uppercase tracking-wider text-primary flex items-center gap-2'>
          <HistoryIcon className='w-8 h-8' />
          History of Presenting Complaint
        </h1>
        <p className='text-sm text-muted-foreground'>
          Explore the details of the complaint using the 5 Cs.
        </p>
      </div>

      {/* Current Complaint Banner */}
      <div className='bg-primary/5 border-l-4 border-primary p-4 mb-6'>
        <div className='flex justify-between items-start'>
          <div>
            <h3 className='text-lg font-bold text-primary mb-1'>
              {currentComplaint.complaint}
            </h3>
            <p className='text-sm text-muted-foreground flex items-center gap-2'>
              <Clock size={14} /> Duration: {currentComplaint.duration}
            </p>
          </div>
          {isPainComplaint && (
            <span className='bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-sm uppercase tracking-wide'>
              Pain Detected - Use SOCRATES
            </span>
          )}
        </div>
      </div>

      <div className='space-y-8'>
        {/* Character / SOCRATES */}
        <section className='space-y-4'>
          <Label className='flex items-center gap-2 text-lg font-bold uppercase tracking-wider text-primary'>
            <Activity size={20} />
            Character of Complaint
          </Label>

          {typeof formData.character !== 'string' ? (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 border-2 border-border'>
              {SOCRATES_FIELDS.map((field) => (
                <div
                  key={field.key}
                  className='space-y-2'
                >
                  <Label className='text-xs font-bold uppercase text-muted-foreground'>
                    {field.label}
                  </Label>
                  <Input
                    value={(formData.character as any)[field.key] || ''}
                    onChange={(e) =>
                      handleSocratesChange(
                        field.key as keyof SocratesData,
                        e.target.value,
                      )
                    }
                    placeholder={field.placeholder}
                    className='rounded-none border-2 focus-visible:ring-primary'
                  />
                </div>
              ))}
            </div>
          ) : (
            <Textarea
              value={formData.character}
              onChange={(e) => handleInputChange('character', e.target.value)}
              placeholder='Describe the character and nature of the complaint in detail...'
              className='min-h-[120px] rounded-none border-2 resize-none'
            />
          )}
        </section>

        {/* Other 4 Cs */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {FIVE_CS_FIELDS.map((field) => (
            <div
              key={field.key}
              className='space-y-2'
            >
              <Label className='flex items-center gap-2 text-sm font-semibold uppercase tracking-wider'>
                <field.icon
                  size={16}
                  className='text-primary'
                />
                {field.label}
              </Label>
              <Textarea
                value={(formData as any)[field.key] || ''}
                onChange={(e) =>
                  handleInputChange(
                    field.key as keyof FiveCsData,
                    e.target.value,
                  )
                }
                placeholder={field.placeholder}
                className='min-h-[80px] rounded-none border-2 resize-none'
              />
            </div>
          ))}
        </div>

        {/* Extra Notes */}
        <div className='space-y-2'>
          <Label className='flex items-center gap-2 text-sm font-semibold uppercase tracking-wider'>
            <FileText
              size={16}
              className='text-primary'
            />
            Extra Notes (Optional)
          </Label>
          <Textarea
            value={formData.extraNotes || ''}
            onChange={(e) => handleInputChange('extraNotes', e.target.value)}
            placeholder='Any other relevant details...'
            className='min-h-[80px] rounded-none border-2 resize-none bg-yellow-50/50'
          />
        </div>
      </div>

      {/* Actions */}
      <div className='flex items-center gap-4 py-6 border-t'>
        <Button
          type='button'
          variant='ghost'
          onClick={handlePrevious}
          className='flex items-center gap-2'
        >
          <ArrowLeft size={16} />
          {currentIndex === 0 ? 'Back to Complaints' : 'Previous Complaint'}
        </Button>

        <div className='flex-1' />

        <Button
          type='button'
          variant='secondary'
          onClick={handleAnalyzeWithPal}
          className='flex items-center gap-2 bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200'
        >
          <BrainCircuit size={16} />
          Analyze with Pal
        </Button>

        <Button
          type='button'
          onClick={handleNext}
          className='flex items-center gap-2 rounded-none px-8 font-bold uppercase tracking-wider'
        >
          {currentIndex === presentingComplaints.length - 1
            ? 'Finish HPC'
            : 'Next Complaint'}
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}
