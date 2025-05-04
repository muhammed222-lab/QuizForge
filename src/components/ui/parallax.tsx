import * as React from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ParallaxProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  offset?: number;
  className?: string;
  containerClassName?: string;
}

export const Parallax: React.FC<ParallaxProps> = ({
  children,
  speed = 0.5,
  direction = 'up',
  offset = 0,
  className,
  containerClassName,
  ...props
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const getTransformValue = (value: MotionValue<number>) => {
    const factor = speed * 100;
    
    switch (direction) {
      case 'up':
        return useTransform(value, [0, 1], [`${offset}%`, `${-factor + offset}%`]);
      case 'down':
        return useTransform(value, [0, 1], [`${offset}%`, `${factor + offset}%`]);
      case 'left':
        return useTransform(value, [0, 1], [`${offset}%`, `${-factor + offset}%`]);
      case 'right':
        return useTransform(value, [0, 1], [`${offset}%`, `${factor + offset}%`]);
      default:
        return useTransform(value, [0, 1], [`${offset}%`, `${-factor + offset}%`]);
    }
  };

  const y = direction === 'up' || direction === 'down' 
    ? getTransformValue(scrollYProgress) 
    : undefined;
    
  const x = direction === 'left' || direction === 'right' 
    ? getTransformValue(scrollYProgress) 
    : undefined;

  return (
    <div 
      ref={containerRef} 
      className={cn('relative overflow-hidden', containerClassName)}
      {...props}
    >
      <motion.div 
        style={{ y, x }} 
        className={cn('h-full w-full', className)}
      >
        {children}
      </motion.div>
    </div>
  );
};

export interface ParallaxLayerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  depth?: number;
  className?: string;
}

export const ParallaxLayers: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div 
      className={cn('relative overflow-hidden', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const ParallaxLayer: React.FC<ParallaxLayerProps> = ({
  children,
  depth = 0,
  className,
  ...props
}) => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', `${depth * 10}%`]);

  return (
    <motion.div 
      style={{ y }} 
      className={cn('absolute inset-0', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export interface ParallaxTextProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  speed?: number;
  direction?: 'left' | 'right';
  className?: string;
}

export const ParallaxText: React.FC<ParallaxTextProps> = ({
  children,
  speed = 20,
  direction = 'left',
  className,
  ...props
}) => {
  const { scrollYProgress } = useScroll();
  const x = useTransform(
    scrollYProgress, 
    [0, 1], 
    direction === 'left' ? ['0%', `-${speed}%`] : [`-${speed}%`, '0%']
  );

  return (
    <div className={cn('relative overflow-hidden whitespace-nowrap', className)} {...props}>
      <motion.div style={{ x }} className="inline-block">
        {children}
      </motion.div>
    </div>
  );
};
