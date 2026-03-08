interface Props {
  onSkip: () => void;
  isDevMode: boolean;
}

export default function DevSkipButton({ onSkip, isDevMode }: Props) {
  if (!isDevMode) return null;

  return (
    <button
      onClick={onSkip}
      className="fixed bottom-4 right-4 z-[9999] px-4 py-2 rounded-xl text-sm font-bold shadow-lg"
      style={{
        background: 'rgba(212,175,55,0.85)',
        color: '#1a2e1a',
        border: '2px solid rgba(212,175,55,0.6)',
      }}
    >
      ⏩ Skip
    </button>
  );
}
