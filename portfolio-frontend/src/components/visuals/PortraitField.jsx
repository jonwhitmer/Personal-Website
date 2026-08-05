import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import HeroHalo from './HeroHalo';
import { useVisualEnvironment, useThemeTone, useIsRenderable } from './useVisualEnvironment';

// Dynamic import, so three.js only reaches the network for a visitor who is
// actually going to see it. React.lazy does not fetch until the component is
// rendered, and the gate below decides whether it ever is.
const PortraitFieldScene = lazy(() => import('./PortraitFieldScene'));

/**
 * Catches anything the WebGL scene throws - a lost context, a driver that says
 * yes to the probe and no to a real renderer, a chunk that failed to download -
 * and drops back to the still halo. A visitor must never see a hole where a
 * visual should be, and a hole is exactly what an uncaught render error leaves.
 */
class SceneBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFailure?.();
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * The ambient field that frames Jon's photo.
 *
 * Absolutely positioned and inset NEGATIVELY, so it spills a little past the
 * picture on every side and adds nothing to the layout: the photo does not move
 * by a pixel and nothing below the hero shifts when the 3D chunk lands.
 *
 *   webgl  - desktop, WebGL available, motion allowed: the real turning orbits
 *   static - everything else: the same assembly, drawn once and left alone
 *
 * The photo column exists twice in the hero (one for phones, one for desktop)
 * and only one is ever on screen, so the scene is only mounted once this
 * instance has actually been seen. Without that latch the hidden copy would open
 * a second WebGL context that nobody would ever look at.
 */
export default function PortraitField() {
  const host = useRef(null);
  const { allow3D } = useVisualEnvironment();
  const tone = useThemeTone();
  const renderable = useIsRenderable(host);
  const [seen, setSeen] = useState(false);
  const [sceneFailed, setSceneFailed] = useState(false);
  const onFailure = useCallback(() => setSceneFailed(true), []);

  useEffect(() => {
    if (renderable) setSeen(true);
  }, [renderable]);

  const mode = allow3D && seen && !sceneFailed ? 'webgl' : 'static';
  const frameloop = mode === 'webgl' && renderable ? 'always' : 'never';

  // The negative inset is what gives the orbits somewhere to be. It is stepped
  // rather than fixed because at 320px the photo has only ~43px of slack either
  // side before the field would reach the edge of the screen, while the desktop
  // column has the whole 48px grid gutter to play with.
  return (
    <div
      ref={host}
      data-visual="portrait-field"
      data-field-mode={mode}
      data-field-tone={tone}
      data-frameloop={frameloop}
      aria-hidden="true"
      className="absolute -inset-8 sm:-inset-10 lg:-inset-12 z-0 pointer-events-none select-none"
    >
      {mode === 'webgl' ? (
        <SceneBoundary fallback={<HeroHalo />} onFailure={onFailure}>
          <Suspense fallback={<HeroHalo />}>
            <PortraitFieldScene tone={tone} frameloop={frameloop} />
          </Suspense>
        </SceneBoundary>
      ) : (
        <HeroHalo />
      )}
    </div>
  );
}
