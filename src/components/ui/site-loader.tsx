'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useLayoutEffect, useState } from 'react';
import { cn } from '@/lib/utils'; // Keep inconsistent usage in mind

interface SiteLoaderProps {
  isLoading: boolean;
  onLoadingComplete?: () => void;
}

export function SiteLoader({ isLoading, onLoadingComplete }: SiteLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [show, setShow] = useState(true);
  const [skipExit, setSkipExit] = useState(false);

  useLayoutEffect(() => {
    const hasSeen =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('bloom_intro_seen')
        : null;

    if (hasSeen) {
      setSkipExit(true);
      setShow(false);
      onLoadingComplete?.();
      return;
    }

    // Fake progress loading for first time visit
    const duration = 2000; // 2 seconds loading
    const interval = 20;
    const steps = duration / interval;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('bloom_intro_seen', 'true');
          }
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!show) return; // Don't run logic if already hidden

    if (progress === 100 && !isLoading) {
      const exitTimer = setTimeout(() => {
        setShow(false);
        onLoadingComplete?.();
      }, 500); // Wait a bit at 100%
      return () => clearTimeout(exitTimer);
    }
  }, [progress, isLoading, onLoadingComplete, show]);

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white"
          initial={{ y: 0 }}
          exit={{
            y: '-100%',
            transition: {
              duration: skipExit ? 0 : 0.8,
              ease: [0.76, 0, 0.24, 1],
            },
          }}
        >
          <div className="relative flex flex-col items-center">
            {/* Progress Number */}
            <motion.div
              className="text-8xl font-bold font-headline mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {Math.round(progress)}%
            </motion.div>

            {/* Loading text */}
            <motion.p
              className="text-sm uppercase tracking-widest text-white/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.2 } }}
            >
              Loading Experience
            </motion.p>

            {/* Progress Bar Line */}
            <div className="mt-8 h-[2px] w-64 bg-white/10 overflow-hidden rounded-full">
              <motion.div
                className="h-full bg-white"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
