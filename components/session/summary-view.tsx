'use client';

import React, { useState } from 'react';
import { useSession } from '@/lib/SessionContext';
import { Differential } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  User,
  Stethoscope,
  History as HistoryIcon,
  Pill,
  Users,
  Briefcase,
  Download,
  RotateCcw,
  CheckCircle2,
  Save,
  LogOut,
  Activity,
  AlertCircle,
  ChevronDown,
  Loader2,
  Calendar,
  Hash,
  Sparkles,
  Presentation,
  Mic,
  BookOpen,
} from 'lucide-react';
import {
  generateClinicalSummary,
  generatePresentationReport,
  generateDifferentials,
} from '@/lib/ai-actions';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

export function SummaryView({ readOnly = false }: { readOnly?: boolean }) {
  const session = useSession();
  const { sessionId } = session;
  const [report, setReport] = useState<string | null>(null);
  const [presentationReport, setPresentationReport] = useState<string | null>(
    null,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const sessionData = {
        id: sessionId || 'current-session',
        startTime: Date.now(),
        mode: session.mode,
        currentStage: session.currentStage,
        data: {
          biodata: session.biodata || {},
          presentingComplaints: session.presentingComplaints,
          hpcData: session.hpcData,
          pmh: session.pmhData,
          drugHistory: session.dhData,
          familyHistory: session.fhData,
          socialHistory: session.shData,
          ros: session.rosData,
        },
      };

      // Generate both report and differentials in parallel
      const [reportResult, diffsResult] = await Promise.all([
        generateClinicalSummary(sessionData as any),
        generateDifferentials(sessionData as any),
      ]);

      setReport(reportResult);
      session.setDifferentials(diffsResult);

      toast.success('Clinical analysis complete!');

      // Auto-save the differentials to DB
      if (diffsResult && diffsResult.length > 0) {
        // We wait a bit for the state to settle or use the direct save
        setTimeout(() => session.saveCurrentSession(), 500);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate analysis');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOnlyGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const sessionData = {
        id: sessionId || 'current-session',
        data: {
          biodata: session.biodata || {},
          presentingComplaints: session.presentingComplaints,
          hpcData: session.hpcData,
          pmh: session.pmhData,
          drugHistory: session.dhData,
          familyHistory: session.fhData,
          socialHistory: session.shData,
          ros: session.rosData,
        },
      };

      const reportResult = await generateClinicalSummary(sessionData as any);
      setReport(reportResult);
      toast.success('Clinical report generated!');
      setTimeout(() => session.saveCurrentSession(), 500);
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateDifferentials = async () => {
    setIsGenerating(true);
    try {
      const sessionData = {
        id: sessionId || 'current-session',
        data: {
          biodata: session.biodata || {},
          presentingComplaints: session.presentingComplaints,
          hpcData: session.hpcData,
          pmh: session.pmhData,
          drugHistory: session.dhData,
          familyHistory: session.fhData,
          socialHistory: session.shData,
          ros: session.rosData,
        },
      };

      const diffsResult = await generateDifferentials(sessionData as any);
      session.setDifferentials(diffsResult);
      toast.success('Differentials analyzed!');
      if (diffsResult && diffsResult.length > 0) {
        setTimeout(() => session.saveCurrentSession(), 500);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to analyze differentials');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePresentation = async () => {
    setIsGenerating(true);
    try {
      const sessionData = {
        id: sessionId || 'current-session',
        data: {
          biodata: session.biodata || {},
          presentingComplaints: session.presentingComplaints,
          hpcData: session.hpcData,
          pmh: session.pmhData,
          drugHistory: session.dhData,
          familyHistory: session.fhData,
          socialHistory: session.shData,
          ros: session.rosData,
        },
      };

      const result = await generatePresentationReport(sessionData as any);
      setPresentationReport(result);
      toast.success('Clinical story synthesized!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate presentation');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResetSession = () => {
    if (
      confirm(
        'Are you sure you want to reset this session? All data will be cleared.',
      )
    ) {
      window.localStorage.clear();
      window.location.reload();
    }
  };

  const downloadAsDoc = () => {
    if (!report) return;

    // A simple HTML structure that Word interprets well
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Clinical Report</title></head>
      <body>
        <div style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6;">
          <h1 style="color: #000; text-transform: uppercase;">Clinical Clerkship Report</h1>
          <p style="color: #666; font-size: 12px;">Generated by HX Pal on ${new Date().toLocaleDateString()}</p>
          <hr />
          <div style="white-space: pre-wrap;">
            ${report.replace(/\n/g, '<br/>')}
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', content], {
      type: 'application/msword',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Clinical_Report_${session.biodata?.name || 'Session'}_${new Date().toISOString().split('T')[0]}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Downloading report...');
  };

  const handleFinalizeSession = async (save: boolean) => {
    setIsEnding(true);
    let finalId = session.sessionId;

    if (save) {
      session.setStatus('COMPLETED');
      // The saveCurrentSession call will use the latest statusRef.current
      const resultId = await session.saveCurrentSession();
      if (resultId) finalId = resultId;
      toast.success('Session saved to database');
    }

    // Small delay for UX and to ensure save triggers
    setTimeout(() => {
      try {
        // We clear localStorage only after a successful save or if discarding
        window.localStorage.clear();
        window.location.href = `/dashboard/sessions/${finalId}`;
      } catch (err) {
        setIsEnding(false);
      }
    }, 800);
  };

  // Render Helpers
  const renderFamilyHistory = () => {
    if (!session.fhData) return 'None recorded';
    try {
      const parsed = JSON.parse(session.fhData);
      const relatives = parsed.relatives || [];
      if (relatives.length === 0 && !parsed.notes) return 'None recorded';

      return (
        <div className='text-xs space-y-3'>
          {relatives.length > 0 && (
            <ul className='list-disc pl-4 space-y-1'>
              {relatives.map((r: any, i: number) => (
                <li key={i}>
                  <span className='font-bold'>{r.relation}</span> ({r.status}):{' '}
                  {r.condition}
                  {r.ageOfOnset && ` (Onset: ${r.ageOfOnset})`}
                </li>
              ))}
            </ul>
          )}
          {parsed.notes && (
            <div className='pt-1'>
              <p className='text-[10px] uppercase font-bold text-muted-foreground mb-1'>
                Additional Notes
              </p>
              <p className='italic'>{parsed.notes}</p>
            </div>
          )}
        </div>
      );
    } catch (e) {
      return session.fhData;
    }
  };

  const renderSocialHistory = () => {
    if (!session.shData) return 'None recorded';
    try {
      const parsed = JSON.parse(session.shData);
      return (
        <div className='text-xs space-y-3'>
          <div className='grid grid-cols-2 gap-2 text-[10px]'>
            {parsed.tobacco && (
              <div className='p-2 bg-muted/30 border border-border/50'>
                <p className='font-bold uppercase text-muted-foreground mb-1'>
                  Tobacco
                </p>
                <p className='text-xs font-medium'>{parsed.tobacco.status}</p>
                {parsed.tobacco.packYears > 0 && (
                  <p className='text-primary font-bold'>
                    {parsed.tobacco.packYears} Pack-years
                  </p>
                )}
              </div>
            )}
            {parsed.alcohol && (
              <div className='p-2 bg-muted/30 border border-border/50'>
                <p className='font-bold uppercase text-muted-foreground mb-1'>
                  Alcohol
                </p>
                <p className='text-xs font-medium'>{parsed.alcohol.status}</p>
                {parsed.alcohol.unitsPerWeek > 0 && (
                  <p className='text-primary font-bold'>
                    {parsed.alcohol.unitsPerWeek} Units/week
                  </p>
                )}
              </div>
            )}
          </div>

          <div className='space-y-2'>
            {parsed.livingSituation && (
              <div>
                <p className='text-[10px] uppercase font-bold text-muted-foreground'>
                  Living Situation
                </p>
                <p>{parsed.livingSituation}</p>
              </div>
            )}
            {parsed.extraNotes && (
              <div>
                <p className='text-[10px] uppercase font-bold text-primary'>
                  Obstetric / Extra Context
                </p>
                <p className='italic'>{parsed.extraNotes}</p>
              </div>
            )}
          </div>
        </div>
      );
    } catch (e) {
      return session.shData;
    }
  };

  const renderHpc = () => {
    const hpcEntries = Object.entries(session.hpcData);
    if (hpcEntries.length === 0) return 'None recorded';

    return (
      <div className='text-xs space-y-4'>
        {hpcEntries.map(([id, data]) => {
          const complaint = session.presentingComplaints.find(
            (c) => c.id === id,
          );
          return (
            <div
              key={id}
              className='border-l-2 border-primary/20 pl-3 space-y-1'
            >
              <p className='font-bold text-primary uppercase text-[10px] mb-1'>
                {complaint?.complaint || 'Unidentified Complaint'}
              </p>
              {typeof data.character === 'string' ? (
                <p>{data.character}</p>
              ) : (
                <div className='grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]'>
                  <p>
                    <strong>Site:</strong> {data.character.site || 'N/A'}
                  </p>
                  <p>
                    <strong>Onset:</strong> {data.character.onset || 'N/A'}
                  </p>
                  <p>
                    <strong>Severity:</strong>{' '}
                    {data.character.severity || 'N/A'}
                  </p>
                  <p>
                    <strong>Exac/Rel:</strong>{' '}
                    {data.character.exacerbatingRelieving || 'N/A'}
                  </p>
                </div>
              )}
              <div className='pt-1 text-[10px] italic text-muted-foreground'>
                <p>Course: {data.course}</p>
                <p>Cause: {data.cause}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPmh = () => {
    if (!session.pmhData) return 'None recorded';
    try {
      const parsed = JSON.parse(session.pmhData);
      const conditions = parsed.conditions || [];
      if (conditions.length === 0 && !parsed.surgicalHistory && !parsed.notes)
        return 'None recorded';

      return (
        <div className='text-xs space-y-3'>
          {conditions.length > 0 && (
            <div className='space-y-1'>
              <p className='text-[10px] uppercase font-bold text-muted-foreground'>
                Conditions
              </p>
              <ul className='list-disc pl-4'>
                {conditions.map((c: any, i: number) => (
                  <li key={i}>
                    <span className='font-bold'>{c.condition}</span>
                    {c.duration && ` (${c.duration})`}
                    {c.managedBy && ` - Managed by ${c.managedBy}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {parsed.surgicalHistory && (
            <div>
              <p className='text-[10px] uppercase font-bold text-muted-foreground'>
                Surgical History
              </p>
              <p>{parsed.surgicalHistory}</p>
            </div>
          )}
          {parsed.notes && (
            <div>
              <p className='text-[10px] uppercase font-bold text-muted-foreground'>
                Notes
              </p>
              <p className='italic'>{parsed.notes}</p>
            </div>
          )}
        </div>
      );
    } catch (e) {
      return session.pmhData;
    }
  };

  const renderDh = () => {
    if (!session.dhData) return 'None recorded';
    try {
      const parsed = JSON.parse(session.dhData);
      const medications = parsed.medications || [];
      const allergies = parsed.allergies || [];

      if (
        medications.length === 0 &&
        !parsed.nkda &&
        allergies.length === 0 &&
        !parsed.notes
      )
        return 'None recorded';

      return (
        <div className='text-xs space-y-4'>
          {medications.length > 0 && (
            <div className='space-y-1'>
              <p className='text-[10px] uppercase font-bold text-muted-foreground'>
                Current Medications
              </p>
              <ul className='list-disc pl-4'>
                {medications.map((m: any, i: number) => (
                  <li key={i}>
                    <span className='font-bold'>{m.name}</span>
                    {m.notes && `: ${m.notes}`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className='space-y-1'>
            <p className='text-[10px] uppercase font-bold text-red-500'>
              Allergies
            </p>
            {parsed.nkda ? (
              <p className='text-green-600 font-medium'>
                No Known Drug Allergies (NKDA)
              </p>
            ) : allergies.length > 0 ? (
              <ul className='list-disc pl-4 text-red-600'>
                {allergies.map((a: any, i: number) => (
                  <li key={i}>
                    <span className='font-bold'>{a.agent}</span>: {a.reaction} (
                    {a.severity})
                  </li>
                ))}
              </ul>
            ) : (
              <p className='italic text-muted-foreground'>None recorded</p>
            )}
          </div>

          {parsed.notes && (
            <div>
              <p className='text-[10px] uppercase font-bold text-muted-foreground'>
                Notes
              </p>
              <p className='italic'>{parsed.notes}</p>
            </div>
          )}
        </div>
      );
    } catch (e) {
      return session.dhData;
    }
  };

  const renderRos = () => {
    if (!session.rosData) return 'None recorded';
    const entries = Object.entries(session.rosData).filter(([_, val]) => val);
    if (entries.length === 0) return 'None recorded';

    return (
      <div className='text-xs grid grid-cols-1 gap-2'>
        {entries.map(([system, notes]) => (
          <div
            key={system}
            className='border-l-2 border-primary/10 pl-2'
          >
            <p className='text-[10px] font-bold uppercase text-muted-foreground'>
              {system}
            </p>
            <p>{notes as string}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className='flex flex-col h-full max-w-4xl mx-auto p-4 md:p-6 space-y-6 overflow-y-auto overflow-x-hidden pb-32'>
      <div className='flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/10 pb-6'>
        <div className='space-y-1'>
          <h2 className='text-2xl font-black uppercase tracking-tighter flex items-center gap-2'>
            {readOnly ? (
              'Clinical Session Record'
            ) : (
              <>
                <CheckCircle2 className='w-8 h-8 text-primary' />
                Review & Complete
              </>
            )}
          </h2>
          <p className='text-sm text-muted-foreground'>
            {readOnly
              ? 'Archived clinical findings and automated synthesis.'
              : 'Review the collected history and generate a professional clinical report.'}
          </p>
        </div>

        {readOnly && (
          <div className='flex flex-wrap gap-3 mt-2 sm:mt-0'>
            <Badge
              variant='outline'
              className='rounded-none py-1 px-3 flex items-center gap-2 bg-muted/50 border-border/50 text-[10px] font-bold uppercase tracking-widest'
            >
              <Calendar className='w-3 h-3' />
              {new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}
            </Badge>
            <Badge
              variant='outline'
              className='rounded-none py-1 px-3 flex items-center gap-2 bg-muted/50 border-border/50 text-[10px] font-bold uppercase tracking-widest'
            >
              <Hash className='w-3 h-3' />
              {sessionId?.slice(-8).toUpperCase() || '---'}
            </Badge>
            <Badge className='rounded-none py-1 px-3 bg-green-500 hover:bg-green-500 text-white border-0 text-[10px] font-bold uppercase tracking-widest'>
              COMPLETED
            </Badge>
          </div>
        )}
      </div>

      <div className='grid gap-6'>
        {/* AI Action Area */}
        {readOnly ? (
          <div className='flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-muted/30 border border-border/50'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-primary/10 rounded-full'>
                <Sparkles className='w-4 h-4 text-primary' />
              </div>
              <div>
                <p className='text-[10px] font-black uppercase tracking-widest text-muted-foreground'>
                  Clinical Analysis
                </p>
                <p className='text-xs font-medium'>
                  Regenerate or update clinical outputs
                </p>
              </div>
            </div>
            <div className='flex flex-wrap items-center gap-2 w-full sm:w-auto overflow-x-hidden pb-2 sm:pb-0'>
              <Button
                variant='ghost'
                size='sm'
                className='flex-1 sm:flex-none text-[10px] font-bold uppercase tracking-widest h-9 px-4 hover:bg-primary/5 text-primary'
                onClick={handleGeneratePresentation}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className='w-3 h-3 animate-spin mr-2' />
                ) : (
                  <BookOpen className='w-3 h-3 mr-2' />
                )}
                Case Story
              </Button>
              <Button
                variant='ghost'
                size='sm'
                className='flex-1 sm:flex-none text-[10px] font-bold uppercase tracking-widest h-9 px-4 hover:bg-primary/5 text-primary'
                onClick={handleOnlyGenerateReport}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className='w-3 h-3 animate-spin mr-2' />
                ) : (
                  <FileText className='w-3 h-3 mr-2' />
                )}
                Clerkship Report
              </Button>
              {session.differentials.length === 0 && (
                <Button
                  variant='ghost'
                  size='sm'
                  className='flex-1 sm:flex-none text-[10px] font-bold uppercase tracking-widest h-9 px-4 hover:bg-primary/5 text-primary'
                  onClick={handleGenerateDifferentials}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className='w-3 h-3 animate-spin mr-2' />
                  ) : (
                    <Activity className='w-3 h-3 mr-2' />
                  )}
                  Analyze Diffs
                </Button>
              )}
              {report && (
                <Button
                  variant='outline'
                  size='sm'
                  className='flex-1 sm:flex-none text-[10px] font-bold uppercase tracking-widest h-9 px-4 border-primary/20 bg-primary/5 text-primary'
                  onClick={downloadAsDoc}
                >
                  <Download className='w-3 h-3 mr-2' />
                  Export .doc
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className='flex flex-col gap-4 p-6 border-2 border-primary/20 bg-primary/5'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-primary/10 rounded-full'>
                <Sparkles className='w-5 h-5 text-primary' />
              </div>
              <div>
                <h3 className='font-bold uppercase tracking-tight'>
                  {session.status === 'COMPLETED'
                    ? 'Clinical Analysis'
                    : 'Synthesize Clinical Findings'}
                </h3>
                <p className='text-xs text-muted-foreground text-balance'>
                  {session.status === 'COMPLETED'
                    ? 'Review results or regenerate specific clinical outputs.'
                    : 'Let HX Pal synthesize all findings into a professional report and differentials.'}
                </p>
              </div>
            </div>
            <div className='flex flex-wrap sm:flex-row gap-3 mt-2 sm:mt-0'>
              {session.status === 'COMPLETED' ? (
                <>
                  <Button
                    className='flex-1 gap-2 font-bold uppercase tracking-wider py-2 text-xs sm:text-sm'
                    onClick={handleOnlyGenerateReport}
                    disabled={isGenerating}
                  >
                    <FileText className='w-4 h-4 shrink-0' />
                    <span>
                      {isGenerating ? (
                        'Synthesizing...'
                      ) : (
                        <>
                          <span className='hidden sm:inline'>
                            Regenerate Clerkship Report
                          </span>
                          <span className='sm:hidden'>Clerkship Report</span>
                        </>
                      )}
                    </span>
                  </Button>
                  {/* Differentials button - hidden if differentials already exist */}
                  {session.differentials.length === 0 && (
                    <Button
                      variant='outline'
                      className='flex-1 gap-2 font-bold uppercase tracking-wider border-primary text-primary hover:bg-primary/5 py-2 text-xs sm:text-sm'
                      onClick={handleGenerateDifferentials}
                      disabled={isGenerating}
                    >
                      <Activity className='w-4 h-4 shrink-0' />
                      <span>
                        {isGenerating ? (
                          'Analyzing...'
                        ) : (
                          <>
                            <span className='hidden sm:inline'>
                              Analyze Differentials
                            </span>
                            <span className='sm:hidden'>Analyze Diffs</span>
                          </>
                        )}
                      </span>
                    </Button>
                  )}
                </>
              ) : (
                <div className='flex flex-col sm:flex-row gap-3 w-full'>
                  <Button
                    className='flex-1 gap-2 font-bold uppercase tracking-wider py-2 text-xs sm:text-sm'
                    onClick={handleGenerateReport}
                    disabled={isGenerating}
                  >
                    <Sparkles className='w-4 h-4 shrink-0' />
                    <span>
                      {isGenerating ? (
                        'Synthesizing...'
                      ) : (
                        <>
                          <span className='hidden sm:inline'>
                            Synthesize Report & Differentials
                          </span>
                          <span className='sm:hidden'>Synthesize Analysis</span>
                        </>
                      )}
                    </span>
                  </Button>
                  {/* Also show separate differenials button if they don't exist yet */}
                  {session.differentials.length === 0 && (
                    <Button
                      variant='outline'
                      className='flex-1 gap-2 font-bold uppercase tracking-wider py-2 text-xs sm:text-sm'
                      onClick={handleGenerateDifferentials}
                      disabled={isGenerating}
                    >
                      <Activity className='w-4 h-4 shrink-0' />
                      <span>
                        {isGenerating ? 'Analyzing...' : 'Analyze Diffs'}
                      </span>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Presentation Output */}
        {presentationReport && (
          <Card className='border-2 border-primary/40 shadow-none overflow-hidden bg-muted/5'>
            <CardHeader className='bg-muted py-3'>
              <CardTitle className='text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-muted-foreground'>
                <Presentation className='w-3 h-3' />
                Clinical Narrative / Case Presentation
              </CardTitle>
            </CardHeader>
            <CardContent className='p-8 text-[15px] prose prose-sm max-w-none dark:prose-invert font-serif leading-loose text-zinc-800 dark:text-zinc-200'>
              <ReactMarkdown>{presentationReport}</ReactMarkdown>
            </CardContent>
          </Card>
        )}

        {/* AI Report Output */}
        {report && (
          <Card className='border-2 border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden'>
            <CardHeader className='bg-primary text-primary-foreground py-3'>
              <CardTitle className='text-sm font-bold uppercase tracking-widest flex items-center gap-2'>
                <FileText className='w-4 h-4' />
                Formal Clinical Clerkship
              </CardTitle>
            </CardHeader>
            <CardContent className='p-6 text-sm prose prose-xs max-w-none dark:prose-invert bg-white dark:bg-zinc-950 leading-relaxed'>
              <ReactMarkdown>{report}</ReactMarkdown>
            </CardContent>
          </Card>
        )}

        {/* AI Differentials Output */}
        <DifferentialSection differentials={session.differentials} />

        {/* Data Review Grid */}
        <div className='grid gap-6 md:grid-cols-1 lg:grid-cols-2 mt-8'>
          <SummaryCard
            title='Biodata'
            icon={<User className='w-4 h-4' />}
            content={
              session.biodata ? (
                <div className='text-xs space-y-1'>
                  <p>
                    <strong>Name:</strong> {session.biodata.name || '---'}
                  </p>
                  <p>
                    <strong>Age:</strong> {session.biodata.age || '---'}
                  </p>
                  <p>
                    <strong>Sex:</strong> {session.biodata.gender || '---'}
                  </p>
                  <p>
                    <strong>Occupation:</strong>{' '}
                    {session.biodata.occupation || '---'}
                  </p>
                </div>
              ) : (
                'No biodata recorded'
              )
            }
          />

          <SummaryCard
            title='HPI (History of Presenting Complaint)'
            icon={<Stethoscope className='w-4 h-4' />}
            content={renderHpc()}
          />

          <SummaryCard
            title='Past Medical History'
            icon={<HistoryIcon className='w-4 h-4' />}
            content={renderPmh()}
          />

          <SummaryCard
            title='Drug History & Allergies'
            icon={<Pill className='w-4 h-4' />}
            content={renderDh()}
          />

          <SummaryCard
            title='Family History'
            icon={<Users className='w-4 h-4' />}
            content={renderFamilyHistory()}
          />

          <SummaryCard
            title='Social History'
            icon={<Briefcase className='w-4 h-4' />}
            content={renderSocialHistory()}
          />

          <SummaryCard
            title='Review of Systems'
            icon={<Sparkles className='w-4 h-4' />}
            content={renderRos()}
          />
        </div>

        <div
          className={`pt-12 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 ${readOnly ? 'pb-12' : ''}`}
        >
          {!readOnly && (
            <Button
              variant='ghost'
              size='sm'
              className='text-destructive hover:bg-destructive/10 gap-2 justify-center sm:justify-start'
              onClick={handleResetSession}
            >
              <RotateCcw className='w-4 h-4' />
              Reset Session Data
            </Button>
          )}

          {!readOnly && (
            <div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto'>
              <Button
                variant='outline'
                className='gap-2 justify-center'
                disabled={!report}
                onClick={downloadAsDoc}
              >
                <Download className='w-4 h-4' />
                Download Report (.doc)
              </Button>
              <Button
                className='gap-2 justify-center font-bold'
                disabled={isGenerating || isEnding}
                onClick={() => handleFinalizeSession(true)}
              >
                {isEnding ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  <LogOut className='w-4 h-4' />
                )}
                {isEnding ? 'Ending Session...' : 'End Session'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DifferentialSection({
  differentials,
}: {
  differentials: Differential[];
}) {
  if (!differentials || differentials.length === 0) return null;

  return (
    <Card className='border-2 border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden'>
      <CardHeader className='bg-zinc-950 dark:bg-zinc-900 text-white py-3 border-b-2 border-primary'>
        <CardTitle className='text-sm font-bold uppercase tracking-widest flex items-center gap-2'>
          <AlertCircle className='w-4 h-4 text-primary' />
          Differential Diagnoses & Score Match
        </CardTitle>
      </CardHeader>
      <CardContent className='p-0 bg-white dark:bg-zinc-950'>
        <Accordion
          type='single'
          collapsible
          className='w-full'
        >
          {differentials.map((diff, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className='border-b last:border-0 border-border/50'
            >
              <AccordionTrigger className='hover:no-underline px-4 sm:px-6 py-4'>
                <div className='flex flex-col gap-4 w-full pr-4 text-left'>
                  <div className='flex items-start gap-3'>
                    <span className='flex shrink-0 items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-black mt-0.5'>
                      {i + 1}
                    </span>
                    <span className='font-bold tracking-tight text-sm uppercase leading-tight'>
                      {diff.diagnosis}
                    </span>
                  </div>
                  <div className='flex items-center gap-4 w-full sm:max-w-[200px]'>
                    <div className='flex-1 h-2 bg-muted rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-primary transition-all duration-1000'
                        style={{ width: `${(diff.confidence || 0.5) * 100}%` }}
                      />
                    </div>
                    <Badge
                      variant='outline'
                      className='font-black text-[10px] border-primary/20 text-primary whitespace-nowrap'
                    >
                      {Math.round((diff.confidence || 0.5) * 100)}% MATCH
                    </Badge>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className='px-4 sm:px-6 pb-6'>
                <div className='bg-muted/30 p-4 border-l-4 border-primary space-y-2'>
                  <p className='text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2'>
                    <Activity className='w-3 h-3' />
                    Clinical Reasoning
                  </p>
                  <p className='text-xs leading-relaxed italic'>
                    {diff.reasoning}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}

function SummaryCard({
  title,
  icon,
  content,
}: {
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}) {
  return (
    <Card className='h-full border-2 border-border/50 rounded-none shadow-none hover:border-primary/50 transition-colors'>
      <CardHeader className='py-4 px-5 flex flex-row items-center justify-between space-y-0 pb-3 border-b border-border/10'>
        <CardTitle className='text-[11px] font-bold uppercase tracking-widest'>
          {title}
        </CardTitle>
        <div className='text-muted-foreground/40'>{icon}</div>
      </CardHeader>
      <CardContent className='px-5 py-5'>
        <div className='text-sm leading-relaxed'>{content}</div>
      </CardContent>
    </Card>
  );
}
