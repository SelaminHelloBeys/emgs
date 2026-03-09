import React from 'react';
import { motion, type Variants, type HTMLMotionProps } from 'framer-motion';

// Apple-grade spring configs
export const appleSpring = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

export const appleSoftSpring = {
  type: 'spring' as const,
  stiffness: 200,
  damping: 25,
  mass: 1,
};

export const appleSnappy = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 35,
  mass: 0.5,
};

// ── Child variants (used inside stagger containers) ──
export const fadeUpItem: Variants = {
  initial: { opacity: 0, y: 12, filter: 'blur(3px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: appleSpring,
  },
};

export const scaleItem: Variants = {
  initial: { opacity: 0, scale: 0.92, filter: 'blur(4px)' },
  animate: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: appleSpring,
  },
};

export const slideRightItem: Variants = {
  initial: { opacity: 0, x: -16, filter: 'blur(2px)' },
  animate: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: appleSpring,
  },
};

// ── Container with stagger ──
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
};

// ── Stagger container component ──
interface StaggerProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}

export const Stagger: React.FC<StaggerProps> = ({
  children,
  className,
  delay = 0.02,
  staggerDelay = 0.06,
  ...props
}) => (
  <motion.div
    variants={{
      initial: {},
      animate: {
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: delay,
        },
      },
    }}
    initial="initial"
    animate="animate"
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

// ── Motion item (fade up by default) ──
interface MotionItemProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  variant?: 'fadeUp' | 'scale' | 'slideRight';
}

const variantMap = {
  fadeUp: fadeUpItem,
  scale: scaleItem,
  slideRight: slideRightItem,
};

export const MotionItem: React.FC<MotionItemProps> = ({
  children,
  className,
  variant = 'fadeUp',
  ...props
}) => (
  <motion.div
    variants={variantMap[variant]}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

// ── Hover card with Apple-style lift + press ──
interface HoverCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  liftAmount?: number;
}

export const HoverLift: React.FC<HoverCardProps> = ({
  children,
  className,
  liftAmount = -2,
  ...props
}) => (
  <motion.div
    className={className}
    whileHover={{
      y: liftAmount,
      scale: 1.01,
      transition: appleSoftSpring,
    }}
    whileTap={{
      scale: 0.98,
      y: 0,
      transition: { ...appleSnappy, duration: 0.1 },
    }}
    {...props}
  >
    {children}
  </motion.div>
);

// ── Press button wrapper ──
export const PressFeedback: React.FC<HoverCardProps> = ({
  children,
  className,
  ...props
}) => (
  <motion.div
    className={className}
    whileHover={{ scale: 1.02, transition: appleSoftSpring }}
    whileTap={{ scale: 0.96, transition: { ...appleSnappy, duration: 0.08 } }}
    {...props}
  >
    {children}
  </motion.div>
);

// ── Fade in on scroll (viewport) ──
interface FadeInViewProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
}

export const FadeInView: React.FC<FadeInViewProps> = ({
  children,
  className,
  ...props
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
    whileInView={{
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: appleSpring,
    }}
    viewport={{ once: true, margin: '-40px' }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);
