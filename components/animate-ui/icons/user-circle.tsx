'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/components/animate-ui/icons/icon';

type UserCircleProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, 5, -5, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    circle1: {
      initial: {
        scale: 1,
      },
      animate: {
        scale: [1, 1.05, 1],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    circle2: {},
    path: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: UserCircleProps) {
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
      <motion.circle
        cx='12'
        cy='12'
        r='10'
        variants={variants.circle1}
        initial='initial'
        animate={controls}
      />
      <motion.circle
        cx='12'
        cy='10'
        r='3'
        variants={variants.circle2}
        initial='initial'
        animate={controls}
      />
      <motion.path
        d='M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662'
        variants={variants.path}
        initial='initial'
        animate={controls}
      />
    </motion.svg>
  );
}

function UserCircle(props: UserCircleProps) {
  return (
    <IconWrapper
      icon={IconComponent}
      {...props}
    />
  );
}

export {
  animations,
  UserCircle,
  UserCircle as UserCircleIcon,
  type UserCircleProps,
  type UserCircleProps as UserCircleIconProps,
};
