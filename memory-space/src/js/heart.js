import * as THREE from "three";

export function createHeart() {
  const group = new THREE.Group();
  const count = 2600;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const baseColor = new THREE.Color("#ff8f39");
    const glowColor = new THREE.Color("#ffd6a5");
  for (let index = 0; index < count; index += 1) {
    const i3 = index * 3;
    const t = (index / count) * Math.PI * 2;
    const jitter = (Math.random() - 0.5) * 0.12;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    const z = (Math.random() - 0.5) * 0.35;

    positions[i3] = x * 0.025 + jitter;
    positions[i3 + 1] = y * 0.025 + (Math.random() - 0.5) * 0.08;
    positions[i3 + 2] = z * 1.5;

    const color = baseColor.clone();
    color.lerp(glowColor, Math.random() * 0.7);
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.1,
    transparent: true,
    opacity: 0.95,
    vertexColors: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const particles = new THREE.Points(geometry, material);
  group.add(particles);

  const collider = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.3, 2),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
  );
  collider.userData.type = "heart";
  group.add(collider);

  group.userData.type = "heart";
  group.scale.set(1.9, 1.9, 1.9);
  return group;
}

