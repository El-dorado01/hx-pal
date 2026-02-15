'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/components/animate-ui/icons/icon';

type BriefcaseProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, -2, 0],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    rect: {
      initial: {
        scale: 1,
      },
      animate: {
        scale: [1, 1.05, 1],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    path: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: BriefcaseProps) {
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
        width='20'
        height='14'
        x='2'
        y='7'
        rx='2'
        ry='2'
        variants={variants.rect}
        initial='initial'
        animate={controls}
      />
      <motion.path
        d='M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16'
        variants={variants.path}
        initial='initial'
        animate={controls}
      />
    </motion.svg>
  );
}

function Briefcase(props: BriefcaseProps) {
  return (
    <IconWrapper
      icon={IconComponent}
      {...props}
    />
  );
}

export {
  animations,
  Briefcase,
  Briefcase as BriefcaseIcon,
  type BriefcaseProps,
  type BriefcaseProps as BriefcaseIconProps,
};
