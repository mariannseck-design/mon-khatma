import { motion } from 'framer-motion';
import { Moon, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/ui/PageTransition';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background pattern-overlay flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <PageTransition className="relative z-10 text-center max-w-md mx-auto">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative mx-auto w-28 h-28 mb-8"
        >
          <div className="absolute inset-0 bg-primary/20 rounded-3xl animate-pulse" />
          <div className="absolute inset-2 bg-gradient-spiritual rounded-2xl flex items-center justify-center shadow-2xl">
            <Moon className="h-12 w-12 text-primary-foreground" />
          </div>
          <motion.div
            className="absolute -inset-2 rounded-3xl border-2 border-primary/20"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-2 mb-6"
        >
          <h1 className="font-display text-4xl font-bold text-foreground">
            Mon Compagnon
          </h1>
          <p className="text-xl text-primary font-display">de Constance</p>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-muted-foreground text-lg mb-10 leading-relaxed"
        >
          Your spiritual companion for a journey of consistency, reflection, and growth
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="space-y-4"
        >
          <Link to="/auth" className="block">
            <Button 
              size="lg" 
              className="w-full h-14 text-lg bg-gradient-spiritual hover:opacity-90 transition-opacity shadow-lg"
            >
              Begin Your Journey
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          
          <p className="text-sm text-muted-foreground">
            Track prayers, memorize Quran, reflect daily
          </p>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-2 mt-12"
        >
          {['Hifz Tracker', 'Prayer Log', 'Ramadan Journal', 'Rewards'].map((feature, i) => (
            <motion.span
              key={feature}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm font-medium"
            >
              {feature}
            </motion.span>
          ))}
        </motion.div>
      </PageTransition>

      {/* Ramadan Mode Badge */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex items-center gap-2 bg-accent/20 text-accent px-4 py-2 rounded-full border border-accent/30">
          <Moon className="h-4 w-4" />
          <span className="text-sm font-medium">Ramadan Mode Active</span>
        </div>
      </motion.div>
    </div>
  );
}
