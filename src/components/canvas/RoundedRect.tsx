import { BufferGeometryNode, extend } from '@react-three/fiber';
import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events';
import { RoundedPlaneGeometry } from 'maath/geometry';
import { type ReactNode, useMemo } from 'react';

extend({ RoundedPlaneGeometry });
declare module '@react-three/fiber' {
  interface ThreeElements {
    roundedPlaneGeometry: BufferGeometryNode<
      RoundedPlaneGeometry,
      typeof RoundedPlaneGeometry
    >;
  }
}

type RoundedRectProps = {
  width?: number;
  height?: number;
  radius?: number;
  segments?: number;
  children?: ReactNode;
} & EventHandlers;

export const RoundedRect = ({
  width,
  height,
  radius,
  segments,
  children,
  ...eventHandlers
}: RoundedRectProps) => {
  const geometry = useMemo(() => {
    return new RoundedPlaneGeometry(width, height, radius, segments);
  }, [height, radius, segments, width]);

  return (
    <>
      <mesh geometry={geometry} {...eventHandlers}>
        {children}
      </mesh>
    </>
  );
};
