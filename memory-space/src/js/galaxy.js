import * as THREE from "three";

export function createGalaxy() {
  const galaxy = new THREE.Group();
  const armGeometry = new THREE.BufferGeometry();
  const shellGeometry = new THREE.BufferGeometry();
  const armCount = 22000;
  const shellCount = 14000;
  const armPositions = new Float32Array(armCount * 3);
  const armColors = new Float32Array(armCount * 3);
  const shellPositions = new Float32Array(shellCount * 3);
  const shellColors = new Float32Array(shellCount * 3);
  const armPalette = ["#ffd36b", "#ff6b8b", "#ff9f43", "#fff7db"];
  const shellPalette = ["#4ec7ff", "#8ec5ff", "#a8f0ff"];

  for (let i = 0; i < armCount; i += 1) {
    const i3 = i * 3;
    const branchIndex = i % 5;
    const radius = 0.4 + Math.random() * 15;
    const spin = radius * 1.65;
    const branchAngle = (branchIndex / 5) * Math.PI * 2;
    const spiralAngle = branchAngle + spin * 0.34 + (i % 2) * 0.18;
    const jitter = (Math.random() - 0.5) * 0.32;

    armPositions[i3] = Math.cos(spiralAngle) * radius + jitter;
    armPositions[i3 + 1] = (Math.random() - 0.5) * 0.28;
    armPositions[i3 + 2] = Math.sin(spiralAngle) * radius + jitter;

    const colorIndex = (Math.floor(radius / 3) + branchIndex + (i % 3)) % armPalette.length;
    const color = new THREE.Color(armPalette[colorIndex]);
    const secondary = new THREE.Color(armPalette[(colorIndex + 1) % armPalette.length]);
    const blend = (Math.sin(spiralAngle * 1.25 + radius * 0.18) + 1) * 0.5;
    color.lerp(secondary, blend * 0.6);
    armColors[i3] = color.r;
    armColors[i3 + 1] = color.g;
    armColors[i3 + 2] = color.b;
  }

  for (let i = 0; i < shellCount; i += 1) {
    const i3 = i * 3;
    const radius = 10 + Math.random() * 7;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const x = Math.sin(phi) * Math.cos(theta) * radius;
    const y = Math.cos(phi) * radius * 0.18;
    const z = Math.sin(phi) * Math.sin(theta) * radius;

    shellPositions[i3] = x;
    shellPositions[i3 + 1] = y;
    shellPositions[i3 + 2] = z;

    const colorIndex = i % shellPalette.length;
    const color = new THREE.Color(shellPalette[colorIndex]);
    shellColors[i3] = color.r;
    shellColors[i3 + 1] = color.g;
    shellColors[i3 + 2] = color.b;
  }

  armGeometry.setAttribute("position", new THREE.BufferAttribute(armPositions, 3));
  armGeometry.setAttribute("color", new THREE.BufferAttribute(armColors, 3));
  shellGeometry.setAttribute("position", new THREE.BufferAttribute(shellPositions, 3));
  shellGeometry.setAttribute("color", new THREE.BufferAttribute(shellColors, 3));

  const armMaterial = new THREE.PointsMaterial({
    size: 0.09,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const shellMaterial = new THREE.PointsMaterial({
    size: 0.07,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    opacity: 0.95,
    transparent: true,
  });

  galaxy.add(new THREE.Points(armGeometry, armMaterial), new THREE.Points(shellGeometry, shellMaterial));
  return galaxy;
}