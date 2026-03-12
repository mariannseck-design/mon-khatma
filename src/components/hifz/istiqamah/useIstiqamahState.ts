import { useState, useCallback, useEffect, useMemo } from 'react';
import { splitIntoParts, type Part } from './partSplitter';

export type StepName =
  | 'immersion'
  | 'comprehension'
  | 'tikrar';

interface FlowNode {
  type: StepName;
  partIndex: number; // -1 for global steps (immersion, comprehension, tikrar)
  fusionRange?: number[]; // indices of parts to fuse
}

export interface IstiqamahState {
  parts: Part[];
  loading: boolean;
  currentNodeIndex: number;
  currentNode: FlowNode | null;
  totalNodes: number;
  progress: number; // 0-100
  next: () => void;
  back: () => void;
  currentPart: Part | null;
  fusionParts: Part[];
}

/**
 * Simplified flow — StepImmersion handles all verse-by-verse memorization + liaison:
 *  1. Immersion (verse-by-verse listen/memory/liaison — all handled internally)
 *  2. Comprehension (global tafsir/translation)
 *  3. Tikrar Final (40 repetitions)
 */
function buildFlow(_parts: Part[]): FlowNode[] {
  return [
    { type: 'immersion', partIndex: -1 },
    { type: 'comprehension', partIndex: -1 },
    { type: 'tikrar', partIndex: -1 },
  ];
}

export function useIstiqamahState(
  surahNumber: number,
  verseStart: number,
  verseEnd: number,
): IstiqamahState {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    splitIntoParts(surahNumber, verseStart, verseEnd).then((p) => {
      setParts(p);
      setCurrentNodeIndex(0);
      setLoading(false);
    });
  }, [surahNumber, verseStart, verseEnd]);

  const flow = useMemo(() => buildFlow(parts), [parts]);

  const currentNode = flow[currentNodeIndex] ?? null;
  const totalNodes = flow.length;
  const progress = totalNodes > 0 ? ((currentNodeIndex + 1) / totalNodes) * 100 : 0;

  const currentPart = currentNode && currentNode.partIndex >= 0 ? parts[currentNode.partIndex] : null;

  const fusionParts = useMemo(() => {
    if (!currentNode?.fusionRange) return [];
    return currentNode.fusionRange.map((i) => parts[i]).filter(Boolean);
  }, [currentNode, parts]);

  const next = useCallback(() => {
    setCurrentNodeIndex((i) => Math.min(i + 1, flow.length - 1));
  }, [flow.length]);

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
  };
}
