'use client';

import { Canvas, CanvasProps } from '@react-three/fiber';
import { Preload, CameraControls, PerspectiveCamera } from '@react-three/drei';
import { r3f } from '@/helpers/global';
import { SolitaireGame } from '../game/SolitaireGame';

type SceneProps = Omit<CanvasProps, 'children'>;
export default function Scene({ ...props }: SceneProps) {
  // Everything defined in here will persist between route changes, only children are swapped
  return (
    <Canvas {...props}>
      {/* @ts-ignore */}
      <r3f.Out />
      <Preload all />
    </Canvas>
  );
}
