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
