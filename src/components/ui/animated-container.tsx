import * as React from 'react';
import { motion, MotionProps, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface AnimatedContainerProps extends React.HTMLAttributes<HTMLDivElement>, MotionProps {
  children: React.ReactNode;
  animation?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale' | 'bounce' | 'none';
  delay?: number;
  duration?: number;
  staggerChildren?: boolean;
  staggerDelay?: number;
  viewport?: boolean;
  once?: boolean;
  amount?: 'some' | 'all' | number;
  as?: React.ElementType;
}

const animations: Record<string, Variants> = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  'slide-up': {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
  'slide-down': {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  },
  'slide-left': {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
  },
  'slide-right': {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
  bounce: {
    hidden: { opacity: 0, scale: 0.3 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }
    },
  },
  none: {
    hidden: {},
    visible: {},
  },
};

const childVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const AnimatedContainer = React.forwardRef<HTMLDivElement, AnimatedContainerProps>(
  ({ 
    children, 
    className, 
    animation = 'fade', 
    delay = 0, 
    duration = 0.5, 
    staggerChildren = false,
    staggerDelay = 0.1,
    viewport = false,
    once = true,
    amount = 0.3,
    as = 'div',
    ...props 
  }, ref) => {
    const Component = motion[as as keyof typeof motion] || motion.div;
    const variants = animations[animation] || animations.fade;
    
    const viewportOptions = viewport ? {
      once,
      amount,
    } : undefined;

    return (
      <Component
        ref={ref}
        className={cn(className)}
        initial="hidden"
        animate={viewport ? undefined : "visible"}
        whileInView={viewport ? "visible" : undefined}
        viewport={viewportOptions}
        variants={variants}
        transition={{ 
          duration, 
          delay,
          staggerChildren: staggerChildren ? staggerDelay : 0,
        }}
        {...props}
      >
        {staggerChildren 
          ? React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return (
                  <motion.div
                    variants={childVariants}
                    transition={{ duration: duration * 0.8 }}
                  >
                    {child}
                  </motion.div>
                );
              }
              return child;
            })
          : children}
      </Component>
    );
  }
);

AnimatedContainer.displayName = 'AnimatedContainer';

export { AnimatedContainer };
