'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/components/animate-ui/icons/icon';

type CalendarProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        scale: 1,
      },
      animate: {
        scale: [1, 1.05, 1],
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
    rect: {
      initial: {
        scale: 1,
      },
      animate: {
        scale: [1, 0.95, 1],
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
    path: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CalendarProps) {
  const { controls } = useAnimateIconContext();
  const variants = getVariants(animations);

  return (
    <motion.svg
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
      variants={variants.group}
      initial='initial'
      animate={controls}
      {...props}
    >
      <motion.rect
        width='18'
        height='18'
        x='3'
        y='4'
        rx='2'
        ry='2'
        variants={variants.rect}
        initial='initial'
        animate={controls}
      />
      <motion.line
        x1='16'
        x2='16'
        y1='2'
        y2='6'
        variants={variants.path}
        initial='initial'
        animate={controls}
      />
      <motion.line
        x1='8'
        x2='8'
        y1='2'
        y2='6'
        variants={variants.path}
        initial='initial'
        animate={controls}
      />
      <motion.line
        x1='3'
        x2='21'
        y1='10'
        y2='10'
        variants={variants.path}
        initial='initial'
        animate={controls}
      />
    </motion.svg>
  );
}

function Calendar(props: CalendarProps) {
  return (
    <IconWrapper
      icon={IconComponent}
      {...props}
    />
  );
}

export {
  animations,
  Calendar,
  Calendar as CalendarIcon,
  type CalendarProps,
  type CalendarProps as CalendarIconProps,
};
