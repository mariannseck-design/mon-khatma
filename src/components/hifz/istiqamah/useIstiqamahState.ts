import { useState, useCallback, useEffect, useMemo } from 'react';
import { splitIntoParts, type Part } from './partSplitter';

export type StepName =
  | 'comprehension'
  | 'immersion'
  | 'impregnation'
  | 'autonomie'
  | 'gravure'
  | 'fusion'
  | 'tikrar';

interface FlowNode {
  type: StepName;
  partIndex: number; // -1 for fusion/tikrar
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

const STEPS_PER_PART: StepName[] = [
  'comprehension',
  'immersion',
  'impregnation',
  'autonomie',
  'gravure',
];

function buildFlow(parts: Part[]): FlowNode[] {
  const flow: FlowNode[] = [];

  for (let i = 0; i < parts.length; i++) {
    // 5 steps for this part
    for (const step of STEPS_PER_PART) {
      flow.push({ type: step, partIndex: i });
    }

    // Fusion after part 2+ (merge all parts seen so far)
    if (parts.length > 1 && i > 0) {
      const fusionRange = Array.from({ length: i + 1 }, (_, k) => k);
      flow.push({ type: 'fusion', partIndex: -1, fusionRange });
    }
  }

  // Final tikrar
  flow.push({ type: 'tikrar', partIndex: -1 });

  return flow;
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
