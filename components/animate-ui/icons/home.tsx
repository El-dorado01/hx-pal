'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/components/animate-ui/icons/icon';

type HomeProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        scale: 1,
      },
      animate: {
        scale: [1, 1.05, 1],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    path1: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, -2, 0],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    path2: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: HomeProps) {
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
      <motion.path
        d='m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'
        variants={variants.path1}
        initial='initial'
        animate={controls}
      />
      <motion.polyline
        points='9 22 9 12 15 12 15 22'
        variants={variants.path2}
        initial='initial'
        animate={controls}
      />
    </motion.svg>
  );
}

function Home(props: HomeProps) {
  return (
    <IconWrapper
      icon={IconComponent}
      {...props}
    />
  );
}

export {
  animations,
  Home,
  Home as HomeIcon,
  type HomeProps,
  type HomeProps as HomeIconProps,
};
