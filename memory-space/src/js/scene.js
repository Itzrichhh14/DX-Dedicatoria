import * as THREE from "three";
import gsap from "gsap";
import { createGalaxy } from "./galaxy";
import { createStars } from "./stars";
import { createHeart } from "./heart";
import { createParticleField } from "./particles";
import { createPhotoMemories } from "./photos";
import { createOrbitalCamera } from "./camera";
import { createUI } from "./ui";
import { messages, reminderCopy } from "./messages";

export function createScene({ autoplayAudio = true } = {}) {
  const root = document.getElementById("app");
  const intro = document.getElementById("intro");
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.025);

  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 1.8, 26);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 1);
  renderer.domElement.style.touchAction = "none";
  root.innerHTML = "";
  root.appendChild(renderer.domElement);

  const ui = createUI();
  const orbitalCamera = createOrbitalCamera(camera, new THREE.Vector3(0, 0, 0), {
    radius: 26,
    angleX: 0.55,
    angleY: 0.8,
  });

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
  const keyLight = new THREE.DirectionalLight(0xff5b9a, 2.7);
  keyLight.position.set(10, 12, 8);

  const rimLight = new THREE.PointLight(0x3ecfff, 25, 140, 2);
  rimLight.position.set(-10, -8, -20);

  scene.add(ambientLight, keyLight, rimLight);

  const stars = createStars();
  const galaxy = createGalaxy();
  const heart = createHeart();
  const particles = createParticleField();
  const memories = createPhotoMemories();
  const blackHole = createBlackHole();
  const heartAnchor = new THREE.Vector3(0, 0.2, 0.35);
  const blackHoleAnchor = new THREE.Vector3(0, 0, 0);

  heart.position.copy(heartAnchor);
  blackHole.position.copy(blackHoleAnchor);

  scene.add(stars, galaxy, heart, particles, memories.group, blackHole);

  const interactables = [heart, ...memories.interactables];
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  const orbitLabelsGroup = new THREE.Group();
  orbitLabelsGroup.position.set(0, 0.2, 0);
  scene.add(orbitLabelsGroup);

  const orbitLabels = messages.map((message, index) => {
    const sprite = createOrbitLabelSprite(message);
    orbitLabelsGroup.add(sprite);

    const angle = (index / messages.length) * Math.PI * 2;
    sprite.position.set(Math.cos(angle) * 8.6, Math.sin(index * 0.7) * 0.6, Math.sin(angle) * 8.6);
    return sprite;
  });

  const audio = new Audio(new URL("../assets/music/DannyLux - Mi Otra Mitad [Official Video].mp3", import.meta.url).href);
  audio.loop = true;
  audio.volume = 0.32;

  let isDragging = false;
  let lastX = 0;
  let lastY = 0;
  let pinchStartDistance = 0;
  let pinchStartRadius = 0;
  let isTap = false;
  let tapTimer = 0;
  const clock = new THREE.Clock();

  function createBlackHole() {
    const group = new THREE.Group();
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(2.2, 72, 72),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    group.add(core);

    const disk = new THREE.Mesh(
      new THREE.RingGeometry(2.8, 6.4, 96, 32),
      new THREE.MeshBasicMaterial({
        color: 0xff8a1f,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    disk.rotation.x = Math.PI / 2;
    disk.rotation.z = 0.55;
    group.add(disk);

    const diskInner = new THREE.Mesh(
      new THREE.RingGeometry(2.5, 5.8, 96, 24),
      new THREE.MeshBasicMaterial({
        color: 0xffc16a,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    diskInner.rotation.x = Math.PI / 2;
    diskInner.rotation.z = 0.18;
    group.add(diskInner);

    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(7.2, 0.08, 20, 180),
      new THREE.MeshBasicMaterial({
        color: 0xffc67d,
        transparent: true,
        opacity: 0.26,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    halo.rotation.x = Math.PI / 2;
    halo.rotation.y = 0.75;
    group.add(halo);

    const glowTexture = createGlowTexture();
    const spriteMaterial = new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0xff7f3b,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.85,
    });

    const glow = new THREE.Sprite(spriteMaterial);
    glow.scale.set(24, 24, 1);
    group.add(glow);

    const corona = new THREE.Mesh(
      new THREE.TorusGeometry(4.8, 0.05, 12, 200),
      new THREE.MeshBasicMaterial({
        color: 0xffd08e,
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    corona.rotation.x = Math.PI / 2;
    corona.rotation.z = 0.8;
    group.add(corona);

    group.userData.type = "blackhole";
    group.userData.disks = [disk, diskInner, halo, corona];
    return group;
  }

  function createGlowTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.3, "rgba(255,140,190,0.9)");
    gradient.addColorStop(1, "rgba(255,140,190,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  function createOrbitLabelSprite(text) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const paddingX = 20;
    const paddingY = 10;
    const fontSize = 17;

    ctx.font = `600 ${fontSize}px Inter, Segoe UI, sans-serif`;
    const textWidth = ctx.measureText(text).width;

    const logicalWidth = Math.ceil(textWidth + paddingX * 2);
    const logicalHeight = Math.ceil(fontSize + paddingY * 2);
    canvas.width = Math.ceil(logicalWidth * dpr);
    canvas.height = Math.ceil(logicalHeight * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = `600 ${fontSize}px Inter, Segoe UI, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const radius = 12;
    ctx.clearRect(0, 0, logicalWidth, logicalHeight);
    ctx.fillStyle = "rgba(8, 10, 24, 0.86)";
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(logicalWidth - radius, 0);
    ctx.quadraticCurveTo(logicalWidth, 0, logicalWidth, radius);
    ctx.lineTo(logicalWidth, logicalHeight - radius);
    ctx.quadraticCurveTo(logicalWidth, logicalHeight, logicalWidth - radius, logicalHeight);
    ctx.lineTo(radius, logicalHeight);
    ctx.quadraticCurveTo(0, logicalHeight, 0, logicalHeight - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.96)";
    ctx.fillText(text, logicalWidth / 2, logicalHeight / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(logicalWidth / 120, logicalHeight / 120, 1);
    return sprite;
  }

  function findInteractableTarget(object) {
    let current = object;
    while (current) {
      if (current.userData?.type === "memory" || current.userData?.type === "heart" || current === heart) {
        return current;
      }
      current = current.parent;
    }
    return null;
  }

  function handleTap(clientX, clientY) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(interactables, true);

    if (!intersects.length) {
      return;
    }

    const target = findInteractableTarget(intersects[0].object);

    if (!target) {
      return;
    }

    if (target.userData?.type === "memory") {
      const index = target.userData.index;
      const memoryContent = reminderCopy.memories[index - 1] || reminderCopy.memories[0];
      ui.showMemory({
        title: memoryContent.title,
        text: memoryContent.text,
        image: memories.images[index - 1],
      });
      gsap.to(target.scale, { x: 1.08, y: 1.08, z: 1.08, duration: 0.4, yoyo: true, repeat: 1 });
      gsap.to(target.rotation, { z: target.rotation.z + 0.3, duration: 0.6 });
    } else if (target.userData?.type === "heart" || target === heart) {
      ui.showMemory({
        title: reminderCopy.heartTitle,
        text: `${reminderCopy.heartText} ${messages[Math.floor(Math.random() * messages.length)]}`,
        image: null,
      });
      gsap.to(heart.scale, { x: 1.14, y: 1.14, z: 1.14, duration: 0.35, yoyo: true, repeat: 1 });
    }
  }

  function onTouchStart(event) {
    if (event.touches.length === 1) {
      isDragging = true;
      lastX = event.touches[0].clientX;
      lastY = event.touches[0].clientY;
      isTap = true;
      tapTimer = Date.now();
    } else if (event.touches.length === 2) {
      isDragging = false;
      pinchStartDistance = getTouchDistance(event.touches[0], event.touches[1]);
      pinchStartRadius = orbitalCamera.radius;
    }
  }

  function onTouchMove(event) {
    if (event.touches.length === 2) {
      const distance = getTouchDistance(event.touches[0], event.touches[1]);
      orbitalCamera.radius = Math.max(10, Math.min(38, pinchStartRadius + (pinchStartDistance - distance) * 0.01));
      event.preventDefault();
      return;
    }

    if (!isDragging || event.touches.length !== 1) return;
    const deltaX = event.touches[0].clientX - lastX;
    const deltaY = event.touches[0].clientY - lastY;
    orbitalCamera.angleY -= deltaX * 0.007;
    orbitalCamera.angleX += deltaY * 0.007;
    lastX = event.touches[0].clientX;
    lastY = event.touches[0].clientY;
    event.preventDefault();
  }

  function onTouchEnd(event) {
    if (event.touches.length === 0) {
      isDragging = false;
      if (isTap && Date.now() - tapTimer < 220) {
        handleTap(lastX, lastY);
      }
    }
  }

  function getTouchDistance(touchA, touchB) {
    const dx = touchA.clientX - touchB.clientX;
    const dy = touchA.clientY - touchB.clientY;
    return Math.hypot(dx, dy);
  }

  renderer.domElement.addEventListener("touchstart", onTouchStart, { passive: false });
  renderer.domElement.addEventListener("touchmove", onTouchMove, { passive: false });
  renderer.domElement.addEventListener("touchend", onTouchEnd, { passive: false });

  renderer.domElement.addEventListener("mousedown", (event) => {
    isDragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
  });

  window.addEventListener("mousemove", (event) => {
    if (!isDragging) return;
    const deltaX = event.clientX - lastX;
    const deltaY = event.clientY - lastY;
    orbitalCamera.angleY -= deltaX * 0.007;
    orbitalCamera.angleX += deltaY * 0.007;
    lastX = event.clientX;
    lastY = event.clientY;
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
  });

  renderer.domElement.addEventListener("click", (event) => {
    handleTap(event.clientX, event.clientY);
  });

  window.addEventListener("wheel", (event) => {
    orbitalCamera.radius = Math.max(10, Math.min(38, orbitalCamera.radius + event.deltaY * 0.008));
    event.preventDefault();
  }, { passive: false });

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    stars.rotation.y += 0.00016;
    galaxy.rotation.y += 0.00035;
    galaxy.rotation.x = Math.sin(elapsed * 0.12) * 0.05;
    galaxy.position.set(0, 0, 0);
    heart.rotation.y += 0.003;
    heart.rotation.x = Math.sin(elapsed * 0.4) * 0.06;
    particles.rotation.y += 0.001;
    particles.rotation.x = Math.sin(elapsed * 0.2) * 0.04;
    memories.group.rotation.y += 0.0006;
    memories.group.children.forEach((child, index) => {
      child.rotation.y += 0.001 + index * 0.00005;
      child.position.y += Math.sin(elapsed * 0.9 + index) * 0.00035;
    });

    heart.position.x = heartAnchor.x + Math.sin(elapsed * 0.22) * 0.05;
    heart.position.y = heartAnchor.y + Math.sin(elapsed * 0.33) * 0.08;
    heart.position.z = heartAnchor.z + Math.cos(elapsed * 0.26) * 0.04;

    blackHole.position.copy(blackHoleAnchor);

    const pulse = 1 + Math.sin(elapsed * 2.1) * 0.04;
    heart.scale.setScalar(1.82 * pulse);
    const roll = elapsed * 0.08;
    blackHole.rotation.x = 0.16 + Math.sin(roll) * 0.02;
    blackHole.rotation.y = Math.sin(roll * 0.44) * 0.14;
    blackHole.rotation.z = 0.05 + Math.cos(roll * 0.3) * 0.03;
    blackHole.userData.disks?.forEach((disk, index) => {
      disk.rotation.z += 0.001 + index * 0.0003;
      disk.rotation.y += 0.0006;
      disk.rotation.x += 0.0002;
    });

    orbitalCamera.update();
    renderer.render(scene, camera);
  }

  intro.classList.add("hidden");
  ui.setTimer(new Date("2026-06-14T00:00:00"));

  const introTimeline = gsap.timeline({ defaults: { ease: "power2.out" } });
  introTimeline.fromTo(
    camera.position,
    { z: 70, y: 8 },
    { z: 24, y: 1.6, duration: 4.4 }
  );
  introTimeline.fromTo(
    blackHole.scale,
    { x: 0.4, y: 0.4, z: 0.4 },
    { x: 1, y: 1, z: 1, duration: 3.2 },
    "-=" + 2.4
  );
  introTimeline.fromTo(
    stars.material,
    { opacity: 0 },
    { opacity: 1, duration: 2.4 },
    0
  );
  introTimeline.fromTo(
    galaxy.scale,
    { x: 0.75, y: 0.75, z: 0.75 },
    { x: 1, y: 1, z: 1, duration: 3.2 },
    "-=" + 2.5
  );
  introTimeline.fromTo(
    heart.position,
    { y: 4.5, z: 0.2 },
    { y: 5.4, z: 0.8, duration: 3.2 },
    "-=" + 2.8
  );

  const startAudio = () => {
    window.removeEventListener("pointerdown", startAudio);
    window.removeEventListener("touchstart", startAudio);

    window.setTimeout(() => {
      audio.currentTime = 40;
      audio.play().catch(() => {});
    }, 1800);
  };

  if (autoplayAudio) {
    startAudio();
  } else {
    window.addEventListener("pointerdown", startAudio, { once: true });
    window.addEventListener("touchstart", startAudio, { once: true });
  }

  animate();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}