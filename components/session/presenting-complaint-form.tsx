'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { MessageSquare, Clock, GripVertical, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useSession } from '@/lib/SessionContext';
import { sortComplaintsByDuration } from '@/lib/duration-utils';

interface ComplaintItem {
  id: string;
  complaint: string;
  duration: string;
  order: number;
}

interface SortableComplaintProps {
  complaint: ComplaintItem;
  index: number;
  onUpdate: (
    id: string,
    field: 'complaint' | 'duration',
    value: string,
  ) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

function SortableComplaint({
  complaint,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: SortableComplaintProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: complaint.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className='bg-muted/30 border-2 border-border rounded-none p-4 space-y-4'
    >
      <div className='flex items-center gap-3'>
        {/* Drag Handle */}
        <button
          type='button'
          {...attributes}
          {...listeners}
          className='cursor-grab active:cursor-grabbing text-muted-foreground hover:text-primary transition-colors'
        >
          <GripVertical size={20} />
        </button>

        {/* Complaint Number */}
        <div className='flex items-center justify-center size-8 bg-primary/10 border border-primary/20 text-primary font-bold text-sm'>
          {index + 1}
        </div>

        {/* Title */}
        <h3 className='flex-1 text-sm font-semibold uppercase tracking-wider'>
          Presenting Complaint {index + 1}
        </h3>

        {/* Remove Button */}
        {canRemove && (
          <button
            type='button'
            onClick={() => onRemove(complaint.id)}
            className='text-destructive hover:bg-destructive/10 p-1 rounded-none transition-colors'
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Complaint Field */}
      <div className='space-y-2'>
        <Label
          htmlFor={`complaint-${complaint.id}`}
          className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wider'
        >
          <MessageSquare
            size={16}
            className='text-primary'
          />
          Complaint <span className='text-destructive'>*</span>
        </Label>
        <Textarea
          id={`complaint-${complaint.id}`}
          value={complaint.complaint}
          onChange={(e) => onUpdate(complaint.id, 'complaint', e.target.value)}
          placeholder='What is the complaint?'
          className='rounded-none border-2 min-h-[80px] resize-none'
          rows={3}
          required
        />
      </div>

      {/* Duration Field */}
      <div className='space-y-2'>
        <Label
          htmlFor={`duration-${complaint.id}`}
          className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wider'
        >
          <Clock
            size={16}
            className='text-primary'
          />
          Duration <span className='text-destructive'>*</span>
        </Label>
        <Input
          id={`duration-${complaint.id}`}
          value={complaint.duration}
          onChange={(e) => onUpdate(complaint.id, 'duration', e.target.value)}
          placeholder='e.g., "3 days", "2 weeks", "not sure"'
          className='rounded-none border-2 h-10'
          required
        />
      </div>
    </div>
  );
}

export function PresentingComplaintForm() {
  const router = useRouter();
  const {
    setPresentingComplaints,
    nextStage,
    prevStage,
    presentingComplaints: savedComplaints,
  } = useSession();

  // Initialize with saved complaints or one empty complaint
  const [complaints, setComplaints] = useState<ComplaintItem[]>(() => {
    if (savedComplaints && savedComplaints.length > 0) {
      return savedComplaints;
    }
    return [
      {
        id: `complaint-${Date.now()}`,
        complaint: '',
        duration: '',
        order: 0,
      },
    ];
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setComplaints((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        // Update order property
        return reordered.map((item, index) => ({ ...item, order: index }));
      });
    }
  };

  const handleAddComplaint = () => {
    if (complaints.length < 5) {
      const newComplaint: ComplaintItem = {
        id: `complaint-${Date.now()}`,
        complaint: '',
        duration: '',
        order: complaints.length,
      };
      setComplaints([...complaints, newComplaint]);
    }
  };

  const handleRemoveComplaint = (id: string) => {
    setComplaints((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      // Update order after removal
      return filtered.map((item, index) => ({ ...item, order: index }));
    });
  };

  const handleUpdateComplaint = (
    id: string,
    field: 'complaint' | 'duration',
    value: string,
  ) => {
    // Check for duplicates when updating complaint text
    if (field === 'complaint' && value.trim()) {
      const normalizedValue = value.trim().toLowerCase();
      const duplicate = complaints.find(
        (c) =>
          c.id !== id && c.complaint.trim().toLowerCase() === normalizedValue,
      );
      if (duplicate) {
        toast.error('This complaint has already been added', {
          description: 'Please enter a different complaint.',
        });
        return;
      }
    }

    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );
  };

  // Auto-sort by duration when duration changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setComplaints((prev) => {
        const sorted = sortComplaintsByDuration(prev);
        // Update order to match sorted position
        return sorted.map((item, index) => ({ ...item, order: index }));
      });
    }, 500); // Debounce sorting

    return () => clearTimeout(timer);
  }, [complaints.map((c) => c.duration).join(',')]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all complaints have both fields filled
    const isValid = complaints.every(
      (c) => c.complaint.trim() !== '' && c.duration.trim() !== '',
    );

    if (!isValid) {
      alert('Please fill in all complaint and duration fields');
      return;
    }

    // Save to context
    setPresentingComplaints(complaints);
    // Navigate to next stage
    nextStage();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='space-y-6 max-w-2xl mx-auto'
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={complaints.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className='space-y-4'>
            {complaints.map((complaint, index) => (
              <SortableComplaint
                key={complaint.id}
                complaint={complaint}
                index={index}
                onUpdate={handleUpdateComplaint}
                onRemove={handleRemoveComplaint}
                canRemove={complaints.length > 1}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Complaint Button */}
      {complaints.length < 5 && (
        <Button
          type='button'
          variant='outline'
          onClick={handleAddComplaint}
          className='w-full rounded-none border-2 border-dashed hover:border-primary hover:bg-primary/5'
        >
          <Plus
            size={18}
            className='mr-2'
          />
          Add Another Complaint ({complaints.length}/5)
        </Button>
      )}

      {complaints.length === 5 && (
        <p className='text-xs text-muted-foreground text-center'>
          Maximum of 5 presenting complaints reached
        </p>
      )}

      {/* Navigation Buttons */}
      <div className='pt-4 flex gap-4'>
        <Button
          type='button'
          variant='outline'
          onClick={() => {
            // Save current complaints before going back
            if (
              complaints.length > 0 &&
              complaints.some((c) => c.complaint || c.duration)
            ) {
              setPresentingComplaints(complaints);
            }
            prevStage();
          }}
          className='rounded-none flex-1'
        >
          Back
        </Button>
        <Button
          type='submit'
          className='rounded-none flex-1 font-bold uppercase tracking-wider'
        >
          Continue
        </Button>
      </div>
    </form>
  );
}
