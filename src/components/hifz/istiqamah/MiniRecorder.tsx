import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Play, Pause, Trash2 } from 'lucide-react';

const waveBarStyle = (i: number): React.CSSProperties => ({
  width: 3,
  borderRadius: 2,
  background: '#d4af37',
  animation: `miniWaveAnim 0.8s ease-in-out ${i * 0.12}s infinite alternate`,
});

export default function MiniRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const playbackRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (timerRef.current) clearInterval(timerRef.current);
      playbackRef.current?.pause();
      mediaRecorderRef.current?.stream?.getTracks().forEach(t => t.stop());
    };
  }, [audioUrl]);

  const destroyAudio = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    playbackRef.current?.pause();
    playbackRef.current = null;
    setIsPlaying(false);
  }, [audioUrl]);

  const [flashPulse, setFlashPulse] = useState(false);

  const startRecording = async () => {
    destroyAudio();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      chunksRef.current = [];
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000);
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(50);
      // Visual flash
      setFlashPulse(true);
      setTimeout(() => setFlashPulse(false), 600);
    } catch { /* permission denied */ }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      setAudioUrl(URL.createObjectURL(blob));
      mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop());
    };
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const togglePlayback = () => {
    if (isPlaying) { playbackRef.current?.pause(); setIsPlaying(false); return; }
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    playbackRef.current = audio;
    audio.onended = () => setIsPlaying(false);
    audio.play();
    setIsPlaying(true);
  };

  const mins = Math.floor(recordingTime / 60);
  const secs = recordingTime % 60;

  return (
    <div className="rounded-xl px-3 py-2.5 transition-all duration-300" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.15)', animation: flashPulse ? 'recFlash 0.6s ease-out' : 'none' }}>
      <style>{`
        @keyframes miniWaveAnim { 0% { height: 6px; } 100% { height: 18px; } }
        @keyframes recFlash { 0% { box-shadow: 0 0 0 0 rgba(220,50,50,0.4); } 100% { box-shadow: 0 0 0 12px rgba(220,50,50,0); } }
      `}</style>

      {!audioUrl ? (
        <div className="flex items-center justify-center gap-3">
          {isRecording && (
            <>
              <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </span>
              <div className="flex items-center gap-1 h-5">
                {[0, 1, 2, 3].map(i => <div key={i} style={waveBarStyle(i)} />)}
              </div>
            </>
          )}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={isRecording ? stopRecording : startRecording}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              touchAction: 'manipulation',
              background: isRecording ? 'rgba(220,50,50,0.15)' : 'rgba(212,175,55,0.12)',
              border: `2px solid ${isRecording ? '#dc3232' : 'rgba(212,175,55,0.4)'}`,
            }}
          >
            {isRecording
              ? <Square className="h-4 w-4 text-red-400" />
              : <Mic className="h-4 w-4" style={{ color: '#d4af37' }} />
            }
          </motion.button>
          {!isRecording && (
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
              S'enregistrer pour se réécouter
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={togglePlayback}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {isPlaying ? 'Pause' : 'Réécouter'}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={destroyAudio}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.2)' }}
          >
            <Trash2 className="h-3.5 w-3.5" style={{ color: '#dc6464' }} />
          </motion.button>
        </div>
      )}
    </div>
  );
}
