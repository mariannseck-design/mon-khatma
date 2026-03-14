import { useState, useCallback, useEffect, useMemo } from 'react';
import { splitIntoParts, type Part } from './partSplitter';

export type StepName =
  | 'immersion'
  | 'comprehension'
  | 'validation'
  | 'tikrar';

interface FlowNode {
  type: StepName;
  partIndex: number;
  fusionRange?: number[];
}

export interface IstiqamahState {
  parts: Part[];
  loading: boolean;
  currentNodeIndex: number;
  currentNode: FlowNode | null;
  totalNodes: number;
  progress: number;
  next: (fromStep?: StepName) => void;
  back: () => void;
  currentPart: Part | null;
  fusionParts: Part[];
  immersionCompleted: boolean;
  clearState: () => void;
}

// Strict linear flow: comprehension → immersion → validation → tikrar
const FLOW: FlowNode[] = [
  { type: 'comprehension', partIndex: -1 },
  { type: 'immersion', partIndex: -1 },
  { type: 'validation', partIndex: -1 },
  { type: 'tikrar', partIndex: -1 },
];

// Allowed transitions map
const ALLOWED_NEXT: Record<StepName, StepName> = {
  comprehension: 'immersion',
  immersion: 'validation',
  validation: 'tikrar',
  tikrar: 'tikrar', // terminal
};

const ISTIQAMAH_KEY = 'hifz_istiqamah_state';
const FLOW_VERSION = 2;

function fingerprint(surah: number, vStart: number, vEnd: number) {
  return `${surah}:${vStart}-${vEnd}`;
}

function saveIstiqamahState(surah: number, vStart: number, vEnd: number, nodeIndex: number, immersionDone: boolean) {
  try {
    localStorage.setItem(ISTIQAMAH_KEY, JSON.stringify({
      fp: fingerprint(surah, vStart, vEnd),
      nodeIndex,
      immersionDone,
      ts: Date.now(),
      flowVersion: FLOW_VERSION,
    }));
  } catch {}
}

function loadIstiqamahState(surah: number, vStart: number, vEnd: number): { nodeIndex: number; immersionDone: boolean } | null {
  try {
    const raw = localStorage.getItem(ISTIQAMAH_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.fp !== fingerprint(surah, vStart, vEnd)) return null;
    if (Date.now() - (data.ts || 0) > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(ISTIQAMAH_KEY);
      return null;
    }
    return { nodeIndex: data.nodeIndex ?? 0, immersionDone: data.immersionDone ?? false };
  } catch {
    return null;
  }
}

export function clearIstiqamahStorage() {
  localStorage.removeItem(ISTIQAMAH_KEY);
  localStorage.removeItem('hifz_immersion_state');
}

export function useIstiqamahState(
  surahNumber: number,
  verseStart: number,
  verseEnd: number,
): IstiqamahState {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [immersionCompleted, setImmersionCompleted] = useState(false);

  // Restore persisted state on mount
  useEffect(() => {
    setLoading(true);
    const saved = loadIstiqamahState(surahNumber, verseStart, verseEnd);
    if (saved) {
      setCurrentNodeIndex(saved.nodeIndex);
      setImmersionCompleted(saved.immersionDone);
      console.log(`[Istiqamah] Restored state: nodeIndex=${saved.nodeIndex}, immersionDone=${saved.immersionDone}`);
    } else {
      setCurrentNodeIndex(0);
      setImmersionCompleted(false);
    }
    splitIntoParts(surahNumber, verseStart, verseEnd).then((p) => {
      setParts(p);
      setLoading(false);
    });
  }, [surahNumber, verseStart, verseEnd]);

  // Persist state on changes
  useEffect(() => {
    if (!loading) {
      saveIstiqamahState(surahNumber, verseStart, verseEnd, currentNodeIndex, immersionCompleted);
    }
  }, [currentNodeIndex, immersionCompleted, loading, surahNumber, verseStart, verseEnd]);

  const flow = FLOW;
  const currentNode = flow[currentNodeIndex] ?? null;
  const totalNodes = flow.length;
  const progress = totalNodes > 0 ? ((currentNodeIndex + 1) / totalNodes) * 100 : 0;

  const currentPart = currentNode && currentNode.partIndex >= 0 ? parts[currentNode.partIndex] : null;

  const fusionParts = useMemo(() => {
    if (!currentNode?.fusionRange) return [];
    return currentNode.fusionRange.map((i) => parts[i]).filter(Boolean);
  }, [currentNode, parts]);

  const next = useCallback((fromStep?: StepName) => {
    setCurrentNodeIndex((i) => {
      const current = flow[i];
      if (!current) return i;

      // If fromStep is provided, it MUST match the current step
      if (fromStep && current.type !== fromStep) {
        console.warn(`[Istiqamah] Blocked transition: fromStep=${fromStep} but current=${current.type}`);
        return i;
      }

      // Check allowed transition
      const nextAllowed = ALLOWED_NEXT[current.type];
      const nextIndex = i + 1;
      const nextNode = flow[nextIndex];

      if (!nextNode) return i; // already at end

      if (nextNode.type !== nextAllowed) {
        console.warn(`[Istiqamah] Blocked: ${current.type} → ${nextNode.type}, expected → ${nextAllowed}`);
        return i;
      }

      // If moving to validation or tikrar, immersion must be completed
      if ((nextNode.type === 'validation' || nextNode.type === 'tikrar') && !immersionCompleted) {
        if (current.type === 'immersion') {
          // Will be set below after state update
        } else {
          console.warn(`[Istiqamah] Blocked ${nextNode.type}: immersion not completed`);
          return i;
        }
      }

      // Mark immersion as completed when leaving it
      if (current.type === 'immersion') {
        setImmersionCompleted(true);
      }

      console.log(`[Istiqamah] Transition: ${current.type} → ${nextNode.type} (index ${i} → ${nextIndex})`);
      return nextIndex;
    });
  }, [flow, immersionCompleted]);

  const back = useCallback(() => {
    setCurrentNodeIndex((i) => Math.max(i - 1, 0));
  }, []);

  const clearState = useCallback(() => {
    clearIstiqamahStorage();
  }, []);

  return {
    parts,
    loading,
    currentNodeIndex,
    currentNode,
    totalNodes,
    progress,
    next,
    back,
    currentPart,
    fusionParts,
    immersionCompleted,
    clearState,
  };
}
