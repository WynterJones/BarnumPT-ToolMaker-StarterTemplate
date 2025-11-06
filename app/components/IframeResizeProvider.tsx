'use client';

import { useIframeResize } from '../hooks/useIframeResize';

export function IframeResizeProvider() {
  useIframeResize();
  return null;
}
