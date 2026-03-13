import { useState } from 'react';

interface Props {
  onSkip: () => void;
  isDevMode: boolean;
}

export default function DevSkipButton({ onSkip, isDevMode }: Props) {
  const [confirming, setConfirming] = useState(false);

  if (!isDevMode) return null;

  const handleClick = () => {
    if (confirming) {
      setConfirming(false);
      onSkip();
    } else {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 2000);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-4 right-4 z-[9999] px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all"
      style={{
        background: confirming ? 'rgba(220,50,50,0.85)' : 'rgba(212,175,55,0.85)',
        color: confirming ? '#fff' : '#1a2e1a',
        border: `2px solid ${confirming ? 'rgba(220,50,50,0.6)' : 'rgba(212,175,55,0.6)'}`,
      }}
    >
      {confirming ? '⚠️ Confirmer ?' : '⏩ Skip'}
    </button>
  );
}
