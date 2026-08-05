import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { inSphere } from 'maath/random';

/**
 * The hero's 3D element: two tilted orbits with packets running them, a drifting
 * field of points, and a slow pulse expanding outward - all of it BEHIND Jon's
 * photo, which sits on top and does not move.
 *
 * The first attempt at this was a wireframe polyhedron floating under the photo,
 * and Jon's reaction was that it looked bolted on. He was right: an object in
 * empty space belongs to nothing. Framing the portrait instead gives the 3D a
 * job - the orbits pass behind the picture and come out the other side, which is
 * the one thing a flat decoration cannot fake and the reason it reads as
 * deliberate rather than as a widget.
 *
 * Nothing here is at the centre of the frame. The middle of this scene is
 * covered by the photo, so anything drawn there is wasted; everything is sized
 * to live in the band around it.
 *
 * This module is the ONLY thing in the app that imports three.js, and it is
 * reached through a dynamic import. A visitor on a phone, with reduced motion,
 * or without WebGL never downloads a byte of it.
 */

// Two palettes, because a cyan orbit that glows on a black page is a pale smear
// on a white one. The light values are darker and less transparent so the same
// object reads at the same strength against slate-50.
const PALETTES = {
  dark: {
    ring: '#38bdf8', packet: '#22d3ee', cloud: '#93c5fd', tick: '#60a5fa', pulse: '#0ea5e9',
    ringOpacity: 0.7, cloudOpacity: 0.6, tickOpacity: 0.6, pulseOpacity: 0.45,
  },
  light: {
    ring: '#1d4ed8', packet: '#0e7490', cloud: '#3b82f6', tick: '#1d4ed8', pulse: '#2563eb',
    ringOpacity: 0.6, cloudOpacity: 0.45, tickOpacity: 0.55, pulseOpacity: 0.32,
  },
};

const CLOUD_POINTS = 320;
const PULSE_SECONDS = 6;

// Everything is sized against this. The camera below sees 3.81 units of height
// at z=0, and the photo covers the middle ~69% of the box, so its half-extent is
// about 1.31 units. Anything with a projected radius under that is invisible -
// which is exactly what went wrong the first time: the orbits were tilted 75
// degrees, collapsing them to a 0.44-unit sliver that hid behind the picture and
// showed only its two left and right tips as stray arcs. Every radius here is
// checked against 1.31 with its tilt applied.
const PHOTO_HALF_EXTENT = 1.31;

const TICK_COUNT = 44;
const TICK_RADIUS = 1.84;

// The torus stays still and only the packets travel: the spinning group sits
// INSIDE the tilt, so it turns about the ring's own axis. Spinning the tilted
// group instead makes the ring wobble, which reads as a broken orbit.
function Orbit({ palette, tilt, radius, packets, spinRef }) {
  return (
    <group rotation={tilt}>
      <mesh>
        <torusGeometry args={[radius, 0.006, 6, 72]} />
        <meshBasicMaterial color={palette.ring} transparent opacity={palette.ringOpacity} depthWrite={false} />
      </mesh>
      <group ref={spinRef}>
        {packets.map((angle) => (
          <mesh key={angle} position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}>
            <sphereGeometry args={[0.045, 10, 10]} />
            <meshBasicMaterial color={palette.packet} transparent opacity={0.95} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Field({ palette }) {
  const cloud = useRef(null);
  const ticks = useRef(null);
  const spinA = useRef(null);
  const spinB = useRef(null);
  const pulse = useRef(null);
  const pulseMaterial = useRef(null);
  const elapsed = useRef(0);

  // Generated once and kept. Rebuilding 320 positions on a theme change would
  // make the whole field visibly reshuffle when the toggle is clicked.
  const positions = useMemo(
    () => inSphere(new Float32Array(CLOUD_POINTS * 3), { radius: 2.5 }),
    []
  );

  // A face-on ring of marks around the portrait, like the bezel of an
  // instrument. This is what actually reads as a frame: the tilted orbits give
  // the motion and the depth, but a circle square-on to the camera is what makes
  // the whole thing look placed rather than scattered.
  const tickPositions = useMemo(() => {
    const buffer = new Float32Array(TICK_COUNT * 3);
    for (let i = 0; i < TICK_COUNT; i++) {
      const angle = (i / TICK_COUNT) * Math.PI * 2;
      buffer[i * 3] = Math.cos(angle) * TICK_RADIUS;
      buffer[i * 3 + 1] = Math.sin(angle) * TICK_RADIUS;
      buffer[i * 3 + 2] = 0;
    }
    return buffer;
  }, []);

  useFrame((_, delta) => {
    // A backgrounded tab hands back one enormous delta on return, which would
    // snap the whole scene to a new angle. Clamped to about three frames.
    const step = Math.min(delta, 0.05);
    elapsed.current += step;

    if (cloud.current) { cloud.current.rotation.y -= step * 0.045; cloud.current.rotation.x -= step * 0.018; }
    if (ticks.current) ticks.current.rotation.z += step * 0.055;
    if (spinA.current) spinA.current.rotation.z += step * 0.36;
    if (spinB.current) spinB.current.rotation.z -= step * 0.26;

    // One slow ping expanding out from behind the portrait, then a long wait.
    // Long enough that it registers as ambience rather than as a loop.
    if (pulse.current && pulseMaterial.current) {
      const phase = (elapsed.current % PULSE_SECONDS) / PULSE_SECONDS;
      const scale = 0.45 + phase * 1.15;
      pulse.current.scale.setScalar(scale);
      pulseMaterial.current.opacity = Math.sin(phase * Math.PI) ** 2 * palette.pulseOpacity;
    }
  });

  return (
    <group>
      <points ref={cloud} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={positions}
            count={positions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          transparent
          color={palette.cloud}
          size={0.019}
          sizeAttenuation
          depthWrite={false}
          opacity={palette.cloudOpacity}
        />
      </points>

      <points ref={ticks} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={tickPositions}
            count={TICK_COUNT}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          transparent
          color={palette.tick}
          size={0.035}
          sizeAttenuation
          depthWrite={false}
          opacity={palette.tickOpacity}
        />
      </points>

      {/* Starts just inside the bezel and expands past it, so the ping arrives
          from behind the portrait rather than appearing out of nowhere. */}
      <mesh ref={pulse} rotation={[0.3, 0.2, 0]}>
        <torusGeometry args={[1.9, 0.009, 6, 72]} />
        <meshBasicMaterial ref={pulseMaterial} color={palette.pulse} transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Both tilts are shallow enough that the minor axis clears
          PHOTO_HALF_EXTENT: 1.78*cos(0.42)=1.63 and 1.62*cos(0.38)=1.51, both
          comfortably past 1.31. So each orbit shows as four arcs - above, below
          and either side of the picture - and disappears behind it across the
          corners. That crossing is the whole effect. */}
      <Orbit palette={palette} tilt={[0.42, 0.34, 0]} radius={1.78} packets={[0, 2.4, 4.4]} spinRef={spinA} />
      <Orbit palette={palette} tilt={[-0.38, -0.3, 1.15]} radius={1.62} packets={[1.2, 3.9]} spinRef={spinB} />
    </group>
  );
}

export default function PortraitFieldScene({ tone = 'dark', frameloop = 'never' }) {
  const palette = PALETTES[tone] || PALETTES.dark;

  return (
    <Canvas
      frameloop={frameloop}
      // Capped hard. On a 2x or 3x display an uncapped canvas renders four to
      // nine times the pixels for something nobody is going to inspect.
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 4.6], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      // No tone mapping and no colour-space conversion: the palette above is
      // picked against a specific page background, so it must arrive unchanged.
      flat
      linear
      // react-use-measure listens to scroll by default and re-measures on every
      // scroll event. The hero never moves relative to the page, so that is pure
      // main-thread cost during exactly the interaction where frames matter.
      resize={{ scroll: false }}
      style={{ pointerEvents: 'none' }}
    >
      <Field palette={palette} />
    </Canvas>
  );
}
