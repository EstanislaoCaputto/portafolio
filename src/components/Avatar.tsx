import { useState } from 'react';
import { safeUrl } from '../lib/url';

interface AvatarProps {
  name: string;
  src: string;
  alt: string;
  size?: 'md' | 'lg';
}

function initialsFor(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return initials || '?';
}

export function Avatar({ name, src, alt, size = 'md' }: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const url = safeUrl(src);
  const showImage = url !== '' && failedSrc !== url;

  if (showImage) {
    return (
      <img
        className={`avatar avatar--${size}`}
        src={url}
        alt={alt}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setFailedSrc(url)}
      />
    );
  }

  return (
    <span className={`avatar avatar--${size} avatar--initials`} aria-hidden="true">
      {initialsFor(name)}
    </span>
  );
}
