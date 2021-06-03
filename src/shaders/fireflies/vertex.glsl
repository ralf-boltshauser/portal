uniform float uPixelRatio;
uniform float uSize;
uniform float uTime;

attribute float aScale;
attribute float aRandomness;
void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0); 
    modelPosition.y += sin(uTime + modelPosition.x * 10.0) / 5.0 * aScale;
    vec4 viewPosition = viewMatrix * modelPosition; 
    vec4 projectionPosition = projectionMatrix * viewPosition; 

    gl_Position = projectionPosition; 
    gl_PointSize = uSize * uPixelRatio * aScale;
    gl_PointSize *= (1.0 / - viewPosition.z);
}