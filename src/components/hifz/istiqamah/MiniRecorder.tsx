import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Play, Pause, Trash2 } from 'lucide-react';

const BAR_COUNT = 12;

export default function MiniRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [flashPulse, setFlashPulse] = useState(false);
  const [levels, setLevels] = useState<number[]>(new Array(BAR_COUNT).fill(0));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const playbackRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      playbackRef.current?.pause();
      mediaRecorderRef.current?.stream?.getTracks().forEach(t => t.stop());
      audioCtxRef.current?.close();
    };
  }, [audioUrl]);

  const destroyAudio = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    playbackRef.current?.pause();
    playbackRef.current = null;
    setIsPlaying(false);
  }, [audioUrl]);

  const startLevelMetering = (stream: MediaStream) => {
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.6;
    source.connect(analyser);
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteFrequencyData(dataArray);
      const newLevels: number[] = [];
      const binSize = Math.floor(dataArray.length / BAR_COUNT);
      for (let i = 0; i < BAR_COUNT; i++) {
        let sum = 0;
        for (let j = 0; j < binSize; j++) {
          sum += dataArray[i * binSize + j];
        }
        newLevels.push(sum / binSize / 255);
      }
      setLevels(newLevels);
      animFrameRef.current = requestAnimationFrame(tick);
    };
    tick();
  };

  const stopLevelMetering = () => {
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    analyserRef.current = null;
    setLevels(new Array(BAR_COUNT).fill(0));
  };

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
      startLevelMetering(stream);
      if (navigator.vibrate) navigator.vibrate(50);
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
    stopLevelMetering();
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
        @keyframes recFlash { 0% { box-shadow: 0 0 0 0 rgba(220,50,50,0.4); } 100% { box-shadow: 0 0 0 12px rgba(220,50,50,0); } }
      `}</style>

      {!audioUrl ? (
        <div className="flex items-center justify-center gap-3">
          {isRecording && (
            <>
              <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </span>
              {/* Real-time VU meter */}
              <div className="flex items-end gap-[2px] h-6">
                {levels.map((level, i) => (
                  <div
                    key={i}
                    className="rounded-sm transition-all duration-75"
                    style={{
                      width: 3,
                      height: Math.max(3, level * 24),
                      background: level > 0.7
                        ? '#ef5350'
                        : level > 0.4
                          ? '#d4af37'
                          : 'rgba(212,175,55,0.5)',
                    }}
                  />
                ))}
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
