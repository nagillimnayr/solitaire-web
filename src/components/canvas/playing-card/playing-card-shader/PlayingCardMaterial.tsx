import { MaterialNode, extend, useFrame } from '@react-three/fiber';
import { shaderMaterial, useTexture } from '@react-three/drei';
import vertex from './playing-card-shader.vert';
import fragment from './playing-card-shader.frag';
import { Texture, ShaderMaterial, DoubleSide } from 'three';
import { forwardRef, useImperativeHandle, useRef } from 'react';

const PlayingCardShader = shaderMaterial(
  {
    frontTexture: new Texture(),
    backTexture: new Texture(),
  },
  vertex,
  fragment,
);

type PlayingCardShaderType = ShaderMaterial &
  JSX.IntrinsicElements['shaderMaterial'] & {
    frontTexture: Texture;
    backTexture: Texture;
  };

extend({ PlayingCardShader });

declare module '@react-three/fiber' {
  interface ThreeElements {
    playingCardShader: MaterialNode<
      PlayingCardShaderType,
      typeof PlayingCardShader
    >;
  }
}

export type PlayingCardMaterialProps = {
  frontTexture: Texture;
};
const PlayingCardMaterial = forwardRef<
  PlayingCardShaderType,
  PlayingCardMaterialProps
>(({ frontTexture }: PlayingCardMaterialProps, ref) => {
  const backTexture = useTexture('textures/kenney/cardBack_red2.png');

  const localRef = useRef<PlayingCardShaderType>(null!);
  useImperativeHandle(ref, () => localRef.current);

  return (
    <playingCardShader
      ref={localRef}
      key={PlayingCardShader.key}
      side={DoubleSide}
      transparent={true}
      frontTexture={frontTexture}
      backTexture={backTexture}
      attach={'material'}
    />
  );
});
PlayingCardMaterial.displayName = 'PlayingCardMaterial';
export { PlayingCardMaterial };
