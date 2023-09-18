import { Object3DProps } from '@react-three/fiber';

export type PositionProps = Pick<Object3DProps, 'position'>;
export type ScaleProps = Pick<Object3DProps, 'scale'>;
export type RotationProps = Pick<Object3DProps, 'rotation'>;
export type TransformProps = Pick<
  Object3DProps,
  'position' | 'scale' | 'rotation'
>;
