void main() {
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    float strength = 0.05 / distanceToCenter - 0.05 * 2.0;
    vec3 color = vec3(distanceToCenter);
    gl_FragColor = vec4(vec3(1.0),strength);
}