'use client';

import React, { useEffect, useState } from 'react';
import { getSessionsAction, deleteSessionAction } from '@/app/actions/sessions';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import {
  ClipboardCheck,
  Trash2,
  Play,
  Eye,
  MoreVertical,
  ChevronRight,
  Clock,
  User as UserIcon,
  Activity,
  Lightbulb,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadSessions = async () => {
    setIsLoading(true);
    const result = await getSessionsAction();
    if (result.success) {
      setSessions(result.sessions || []);
    } else {
      toast.error(result.error || 'Failed to load sessions');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    const result = await deleteSessionAction(deleteId);
    if (result.success) {
      toast.success('Session deleted');
      setSessions(sessions.filter((s) => s.id !== deleteId));
    } else {
      toast.error(result.error || 'Failed to delete session');
    }
    setDeleteId(null);
  };

  const getPatientName = (data: any) => {
    if (!data?.biodata?.name) return 'Anonymous Patient';
    return data.biodata.name;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge
            variant='outline'
            className='border-primary text-primary bg-primary/5'
          >
            Active
          </Badge>
        );
      case 'COMPLETED':
        return (
          <Badge
            variant='outline'
            className='border-green-500 text-green-500 bg-green-500/5'
          >
            Completed
          </Badge>
        );
      default:
        return <Badge variant='outline'>{status}</Badge>;
    }
  };

  return (
    <div className='p-6 max-w-6xl mx-auto space-y-8'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>My Sessions</h1>
          <p className='text-muted-foreground'>
            Manage and review your clinical history taking sessions.
          </p>
        </div>
        <Button
          asChild
          className='rounded-none h-11 px-6'
        >
          <Link href='/dashboard/session/new'>
            <ClipboardCheck className='mr-2 h-4 w-4' />
            New Session
          </Link>
        </Button>
      </div>

      <div className='border border-border bg-card rounded-none overflow-hidden'>
        {isLoading ? (
          <div className='p-8 space-y-4'>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className='flex items-center space-x-4'
              >
                <Skeleton className='h-12 w-12 rounded-full' />
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-[250px]' />
                  <Skeleton className='h-4 w-[200px]' />
                </div>
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className='flex flex-col items-center justify-center p-20 text-center space-y-4'>
            <div className='size-16 rounded-full bg-muted flex items-center justify-center'>
              <Activity className='size-8 text-muted-foreground' />
            </div>
            <div className='space-y-2'>
              <h3 className='text-xl font-medium'>No sessions found</h3>
              <p className='text-muted-foreground text-sm max-w-xs mx-auto'>
                You haven't created any history taking sessions yet. Start a new
                one to begin.
              </p>
            </div>
            <Button
              variant='outline'
              asChild
              className='rounded-none'
            >
              <Link href='/dashboard/session/new'>
                Create Your First Session
              </Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader className='bg-muted/50'>
              <TableRow className='hover:bg-transparent border-border'>
                <TableHead className='font-bold uppercase tracking-wider text-[11px]'>
                  Patient
                </TableHead>
                <TableHead className='font-bold uppercase tracking-wider text-[11px]'>
                  Current Stage
                </TableHead>
                <TableHead className='font-bold uppercase tracking-wider text-[11px]'>
                  Mode
                </TableHead>
                <TableHead className='font-bold uppercase tracking-wider text-[11px]'>
                  Status
                </TableHead>
                <TableHead className='font-bold uppercase tracking-wider text-[11px]'>
                  Last Updated
                </TableHead>
                <TableHead className='w-[100px] text-right font-bold uppercase tracking-wider text-[11px]'>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow
                  key={session.id}
                  className='border-border group'
                >
                  <TableCell className='py-4'>
                    <div className='flex items-center gap-3'>
                      <div className='size-8 rounded-full bg-primary/10 flex items-center justify-center'>
                        <UserIcon className='size-4 text-primary' />
                      </div>
                      <div className='flex flex-col'>
                        <span className='font-medium'>
                          {getPatientName(session.data)}
                        </span>
                        <span className='text-[11px] text-muted-foreground uppercase font-bold tracking-tighter tabular-nums'>
                          ID: {session.id.slice(-8)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-1.5'>
                      <Badge
                        variant={
                          session.status === 'COMPLETED'
                            ? 'outline'
                            : 'secondary'
                        }
                        className={`rounded-none text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 ${
                          session.status === 'COMPLETED'
                            ? 'border-green-500 text-green-500 bg-green-500/5'
                            : ''
                        }`}
                      >
                        {session.status === 'COMPLETED'
                          ? 'COMPLETED'
                          : session.currentStage.replace('_', ' ')}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className='text-xs font-medium'>{session.mode}</span>
                  </TableCell>
                  <TableCell>{getStatusBadge(session.status)}</TableCell>
                  <TableCell>
                    <div className='flex flex-col text-xs'>
                      <span className='font-medium'>
                        {format(new Date(session.updatedAt), 'MMM dd, yyyy')}
                      </span>
                      <span className='text-muted-foreground'>
                        {format(new Date(session.updatedAt), 'HH:mm')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='size-8 hover:bg-muted rounded-none'
                        >
                          <MoreVertical className='size-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align='end'
                        className='rounded-none w-56'
                      >
                        <DropdownMenuItem
                          asChild
                          className='cursor-pointer'
                        >
                          <Link
                            href={
                              session.status === 'COMPLETED'
                                ? `/dashboard/sessions/${session.id}`
                                : `/dashboard/session/start?id=${session.id}`
                            }
                            className='flex items-center'
                          >
                            <Play className='mr-2 size-4 text-primary' />
                            {session.status === 'COMPLETED'
                              ? 'Review Session'
                              : 'Resume Session'}
                          </Link>
                        </DropdownMenuItem>
                        {session.status === 'COMPLETED' && (
                          <DropdownMenuItem
                            disabled
                            className='cursor-not-allowed opacity-50 flex items-center justify-between whitespace-nowrap'
                          >
                            <div className='flex items-center'>
                              <Lightbulb className='mr-2 size-4 text-muted-foreground' />
                              <span>Brainstorm Session</span>
                            </div>
                            <Badge
                              variant='outline'
                              className='ml-2 text-[8px] h-4 px-1 rounded-none border-primary/20 text-primary uppercase font-bold'
                            >
                              Soon
                            </Badge>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className='text-destructive cursor-pointer'
                          onClick={() => setDeleteId(session.id)}
                        >
                          <Trash2 className='mr-2 size-4' />
                          Delete Session
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent className='rounded-none'>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              clinical session and all its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='rounded-none'>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className='rounded-none bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
