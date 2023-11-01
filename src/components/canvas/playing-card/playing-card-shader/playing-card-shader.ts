export const playingCardVertexShader = `
  varying vec2 vUv;

  void main() 
  {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }

`;

export const playingCardFragmentShader = `
  precision highp float;

  varying vec2 vUv;

  uniform sampler2D frontTexture;
  uniform sampler2D backTexture;
  void main() 
  {
    if(gl_FrontFacing)
    {
      gl_FragColor = texture2D(frontTexture, vUv);
    }
    else 
    {
      gl_FragColor = texture2D(backTexture, vUv);
    }
  }

`;
