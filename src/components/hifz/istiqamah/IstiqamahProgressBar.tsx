import { motion } from 'framer-motion';

interface Props {
  progress: number;
  currentStep: number;
  totalSteps: number;
  label: string;
}

export default function IstiqamahProgressBar({ progress, currentStep, totalSteps, label }: Props) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {currentStep}/{totalSteps}
        </span>
        <span className="text-xs font-medium" style={{ color: '#d4af37' }}>{label}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #d4af37, #f0d060)' }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  );
}
