'use client';

import React from 'react';
import { motion } from 'motion/react';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { Button } from '@/components/ui/button';

interface ModeSelectionCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  onClick: () => void;
  primary?: boolean;
}

export function ModeSelectionCard({
  title,
  description,
  icon: Icon,
  onClick,
  primary = false,
}: ModeSelectionCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, translateY: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative flex flex-col items-center justify-between p-6 border-2 transition-all cursor-pointer rounded-none h-full ${
        primary
          ? 'border-primary bg-primary/5 hover:bg-primary/10 shadow-[4px_4px_0px_0px_rgba(var(--primary),0.1)]'
          : 'border-border bg-background hover:border-primary/50 hover:bg-muted/50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]'
      }`}
      onClick={onClick}
    >
      <div className='flex flex-col items-center text-center space-y-4 w-full'>
        <div
          className={`p-3 rounded-none ${
            primary
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground group-hover:bg-primary/10 group-hover:text-primary'
          } transition-colors`}
        >
          <AnimateIcon animateOnHover>
            <Icon size={40} />
          </AnimateIcon>
        </div>

        <div className='space-y-2'>
          <h3 className='text-lg font-bold tracking-tight uppercase'>
            {title}
          </h3>
          <p className='text-muted-foreground text-xs leading-relaxed'>
            {description}
          </p>
        </div>
      </div>

      <Button
        variant={primary ? 'default' : 'outline'}
        size='sm'
        className='mt-4 w-full rounded-none font-semibold uppercase tracking-wider text-xs'
      >
        Select
      </Button>

      {/* Decorative corner element */}
      <div
        className={`absolute top-0 right-0 size-6 border-t-2 border-r-2 transition-colors ${
          primary
            ? 'border-primary'
            : 'border-transparent group-hover:border-primary/30'
        }`}
      />
    </motion.div>
  );
}
