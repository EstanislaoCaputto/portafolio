import { useCallback, useEffect, useRef, useState } from 'react';

export function useCopy(resetAfterMs = 2000) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        return false;
      }

      setCopied(true);
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), resetAfterMs);
      return true;
    },
    [resetAfterMs],
  );

  return { copied, copy };
}
