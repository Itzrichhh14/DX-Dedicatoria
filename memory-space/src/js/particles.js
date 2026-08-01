import * as THREE from "three";

export function createParticleField() {
  const group = new THREE.Group();
  const geometry = new THREE.BufferGeometry();
  const count = 1800;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    const radius = 8 + Math.random() * 18;
    const angle = (i / count) * Math.PI * 2;
    positions[i3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 1.2;
    positions[i3 + 1] = (Math.random() - 0.5) * 8;
    positions[i3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 1.2;

    const color = new THREE.Color();
    color.setHSL(0.9 + Math.random() * 0.12, 0.8, 0.7);
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.09,
    transparent: true,
    opacity: 0.95,
    vertexColors: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  group.add(points);
  return group;
}
