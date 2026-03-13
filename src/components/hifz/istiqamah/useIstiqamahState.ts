import { useState, useCallback, useEffect, useMemo } from 'react';
import { splitIntoParts, type Part } from './partSplitter';

export type StepName =
  | 'immersion'
  | 'comprehension'
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
}

// Strict linear flow: comprehension → immersion → tikrar
const FLOW: FlowNode[] = [
  { type: 'comprehension', partIndex: -1 },
  { type: 'immersion', partIndex: -1 },
  { type: 'tikrar', partIndex: -1 },
];

// Allowed transitions map
const ALLOWED_NEXT: Record<StepName, StepName> = {
  comprehension: 'immersion',
  immersion: 'tikrar',
  tikrar: 'tikrar', // terminal
};

export function useIstiqamahState(
  surahNumber: number,
  verseStart: number,
  verseEnd: number,
): IstiqamahState {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [immersionCompleted, setImmersionCompleted] = useState(false);

  useEffect(() => {
    setLoading(true);
    splitIntoParts(surahNumber, verseStart, verseEnd).then((p) => {
      setParts(p);
      setCurrentNodeIndex(0);
      setImmersionCompleted(false);
      setLoading(false);
    });
  }, [surahNumber, verseStart, verseEnd]);

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

      // If moving to tikrar, immersion must be completed
      if (nextNode.type === 'tikrar' && !immersionCompleted) {
        // Mark immersion as completed since we're transitioning FROM immersion
        if (current.type === 'immersion') {
          // Will be set below after state update
        } else {
          console.warn(`[Istiqamah] Blocked tikrar: immersion not completed`);
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
  };
}
