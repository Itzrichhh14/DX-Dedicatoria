import * as THREE from "three";

export function createPhotoMemories() {
  const group = new THREE.Group();
  const textures = [];
  const interactables = [];

  for (let index = 1; index <= 16; index += 1) {
    const photoUrl = new URL(`../assets/photos/${String(index).padStart(2, "0")}.jpg`, import.meta.url);
    const texture = new THREE.TextureLoader().load(photoUrl.href);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    textures.push(texture);

    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.96 });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 3.2), material);
    plane.userData.type = "memory";
    plane.userData.index = index;

    const orbitRadius = 10 + (index % 4) * 2.6 + Math.random() * 1.2;
    const angle = (index / 16) * Math.PI * 2;
    plane.position.set(Math.cos(angle) * orbitRadius, (index % 3) - 1, Math.sin(angle) * orbitRadius);
    plane.rotation.y = Math.PI / 2 + angle;
    plane.scale.set(0.86, 0.86, 0.86);

    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(1.6, 0.03, 8, 24),
      new THREE.MeshBasicMaterial({ color: 0xffb372, transparent: true, opacity: 0.42 })
    );
    halo.rotation.x = Math.PI / 2;
    halo.position.copy(plane.position);

    group.add(plane, halo);
    interactables.push(plane);
  }

  return { group, interactables, images: textures };
}
